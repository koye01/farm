var express = require("express"),
    app = express(),
    Product = require("./models/produce"),
    Comment = require("./models/comment"),
    User = require("./models/user"),
    Notification = require("./models/notification"),
    ChatMessage = require("./models/ChatMessage"),
    multer = require("multer"),
    bodyParser = require("body-parser"),
    methodOverride = require("method-override"),
    mongoose = require("mongoose"),
    path = require("path"),
    passport = require("passport"),
    localStrategy = require("passport-local"),
    passportLocalMongoose = require("passport-local-mongoose"),
    expressSession = require("express-session");

var coverRoute   = require("./routes/cover");
var productRoute = require("./routes/auth");
var dynamicRoute = require("./routes/allproduct");
var commentRoute = require("./routes/comment");
var flash = require("connect-flash");
const helmet = require("helmet");

mongoose.connect("mongodb://localhost/Product");
// mongoose.connect(process.env.DATABASE);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));  // Serving static files from the "public" directory
app.set("view engine", "ejs");
app.use(methodOverride("_method"));
app.use(
  expressSession({
    secret: "Rusty is my best dog",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(async function (req, res, next) {
  if (req.user) {
    try {
      var user = await User.findById(req.user._id)
        .populate("notifications", null, { isRead: false })
        .exec();
      res.locals.notifications = user.notifications.reverse();
    } catch (err) {
      console.log(err.message);
    }
  }
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currentUser = req.user;
  next();
});

//codes to disallow all my post pages from being indexed
app.use((req, res, next) => {
  if (req.method === 'POST') {
    res.set('X-Robots-Tag', 'noindex, nofollow');
  }
  next();
});

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "https://www.googletagmanager.com", // Allow external GA script
        "'unsafe-inline'", // Optional: Use this ONLY if needed; better to use nonce or hash
      ],
      imgSrc: [
        "'self'",
        "https://res.cloudinary.com",
        "https://www.facebook.com",
        "https://platform.twitter.com",
        "https://www.linkedin.com",
        "data:",
      ],
      connectSrc: ["'self'", "https://www.google-analytics.com"], // For GA tracking requests
    },
  })
);
// Serve robots.txt
app.get("/robots.txt", function (req, res) {
  res.type("text/plain");
  res.send(
    `User-agent: *
Disallow: /adminpost/
Disallow: /redirect
Disallow: /api/
Allow: /`
  );
});

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/pics");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

var upload = multer({ storage: storage });
var multiUpload = upload.fields([{ name: "image", maxCount: 5 }]);

// essential route
// Product.create({
//     name: "Obasanjo chicks",
//     image: "pics\chicks.jpg",
//     description: "These are the early day old chicks that i use to sell"
// });
app.use(coverRoute);
app.use(productRoute);
app.use(dynamicRoute);
app.use(commentRoute);


const http = require("http");
const socketio = require("socket.io");

const server = http.createServer(app);
const io = socketio(server);

const PORT = process.env.PORT || 3000;
const IP = process.env.IP || "0.0.0.0";

server.listen(PORT, IP, () => {
    console.log(`Application is now running on ${IP}:${PORT}`);
});

// User socket tracking
const userSockets = new Map();
// Track current open chat
const activeChatMap = new Map(); // userId => chattingWithUserId

io.on("connection", (socket) => {
    console.log("A user connected");


socket.on("register user", async ({ userId, recipientId }) => {
    socket.userId = userId;

    if (!userSockets.has(userId)) {
        userSockets.set(userId, new Set());
    }
    userSockets.get(userId).add(socket.id);

    try {
        const messages = await ChatMessage.find({
            $or: [
                { from: userId, to: recipientId },
                { from: recipientId, to: userId }
            ]
        }).sort({ timestamp: 1 });

        socket.emit("chat history", messages);

        // ✅ Move this emit here, where userId and recipientId are available
        socket.emit("user in chat with", {
            userId: userId,
            chattingWith: recipientId
        });

    } catch (err) {
        console.error("Failed to load chat history:", err);
    }
});



    socket.on("user in chat with", ({ userId, chattingWith }) => {
      activeChatMap.set(userId, chattingWith);
    });

    socket.on("private message", async (msg) => {
    const from = socket.userId;
    const to = msg.to;

    if (!from || !to || !msg.message) return;

    try {
        const newMessage = new ChatMessage({
            from,
            to,
            message: msg.message,
            isRead: false
        });

        await newMessage.save();

        // Emit to sender
        socket.emit("private message", newMessage);

        // Emit to recipient(s)
        const recipientSockets = userSockets.get(to);
        if (recipientSockets) {
            for (const sid of recipientSockets) {
                io.to(sid).emit("private message", newMessage);
            }

            // Check if recipient is actively chatting with sender
            const currentlyChattingWith = activeChatMap.get(to);

            if (String(currentlyChattingWith) !== String(from)) {
                // Not actively chatting, send inbox notification
                for (const sid of recipientSockets) {
                    io.to(sid).emit("new inbox notification", {
                        from,
                        message: msg.message,
                        timestamp: newMessage.timestamp,
                    });
                }

                // Fetch sender username for DB notification
                const sender = await User.findById(from).select("username");

              const newNotif = new Notification({
                  chat: {
                      username: sender.username,
                      userID: to
                  },
                  isRead: false
              });
              await newNotif.save();
              const recipientUser = await User.findById(to);
              recipientUser.notifications.push(newNotif._id);
              await recipientUser.save(); 
            }
        }
    } catch (err) {
        console.error("Error saving message:", err);
    }
});





  socket.on("disconnect", () => {
      const userId = socket.userId;
      if (userId) {
          userSockets.get(userId)?.delete(socket.id);
          if (userSockets.get(userId)?.size === 0) {
              userSockets.delete(userId);
              activeChatMap.delete(userId);
          }
      }
  });


});
