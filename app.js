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
    const bcrypt = require("bcryptjs");
    require('dotenv').config();



var coverRoute   = require("./routes/cover");
var productRoute = require("./routes/auth");
var dynamicRoute = require("./routes/allproduct");
var commentRoute = require("./routes/comment");
var flash = require("connect-flash");
const helmet = require("helmet");

// const onlineData = process.env.DATABASE;
// const offlineData = "mongodb://localhost/Product"
// const connectDB = onlineData || offlineData;
// mongoose.connect(connectDB);

// mongoose.connect("mongodb://localhost/Product");
// const onlineData = process.env.DATABASE;
// const offlineData = "mongodb://localhost/Product"

mongoose.connect(process.env.DATABASE);
// mongoose.connect("mongodb://localhost/Product");

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

const LocalStrategy = require("passport-local").Strategy;

passport.use(
  new LocalStrategy(
    { usernameField: "username", passwordField: "password" },
    async (username, password, done) => {
      try {
        // Determine if input is email or username
        const query = username.includes("@")
          ? { email: username.toLowerCase() }
          : { username: username.toLowerCase() };

        const user = await User.findOne(query);

        if (!user) {
          return done(null, false, { message: "User not found" });
        }

        // Use passport-local-mongoose's authenticate method
        User.authenticate()(user.username, password, (err, authenticatedUser, info) => {
          if (err) return done(err);
          if (!authenticatedUser) return done(null, false, { message: "Incorrect password" });
          return done(null, authenticatedUser);
        });
      } catch (err) {
        return done(err);
      }
    }
  )
);


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
        "https://www.googletagmanager.com",
        "https://connect.facebook.net",
        "https://www.googleadservices.com",
        "https://googleads.g.doubleclick.net",
        "'unsafe-inline'",
        "'unsafe-eval'",
      ],
      styleSrc: [
        "'self'",
        "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/",
        "'unsafe-inline'",
      ],
      imgSrc: [
        "'self'",
        "https://farmgate.com.ng", // Allows images from your production domain
        "https://res.cloudinary.com",
        "https://*.cloudinary.com",
        "https://www.facebook.com",
        "https://*.facebook.com",
        "https://*.fbcdn.net",
        "https://platform.twitter.com",
        "https://www.linkedin.com",
        "https://www.google.com",
        "https://www.google.com.ng", // Explicitly allow the Nigerian domain
        "https://www.google-analytics.com",
        "https://googleads.g.doubleclick.net",
        "https://*.googleusercontent.com",
        "data:",
        "blob:",
      ],
      connectSrc: [
        "'self'",
        "https://www.google-analytics.com",
        "https://*.facebook.com",
        "https://graph.facebook.com",
        "https://www.google.com",
        "https://*.cloudinary.com",
        "wss://*.facebook.com",
      ],
      frameSrc: [
        "https://www.googletagmanager.com",
        "https://www.facebook.com",
        "https://*.facebook.com",
      ],
      childSrc: [
        "https://www.facebook.com",
        "https://*.facebook.com",
      ],
      fontSrc: [
        "'self'",
        "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/",
        "https://fonts.gstatic.com",
        "data:",
      ],
      mediaSrc: ["'self'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
    },
    reportOnly: false,
  })
);

  // FIXED: Configure helmet WITHOUT crossOriginEmbedderPolicy for now
  // Or use unsafe-none if you need it
  app.use(helmet({
    // Don't set crossOriginEmbedderPolicy at all for compatibility
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false,
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: false, // Already configured above
  }));

  // Add other security headers individually
  app.use(helmet.dnsPrefetchControl());
  app.use(helmet.frameguard({ action: 'deny' }));
  app.use(helmet.hidePoweredBy());
  app.use(helmet.hsts({ maxAge: 31536000 }));
  app.use(helmet.ieNoOpen());
  app.use(helmet.noSniff());
  app.use(helmet.referrerPolicy({ policy: 'strict-origin-when-cross-origin' }));
  app.use(helmet.xssFilter());

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

// Enhanced user tracking
const userSockets = new Map(); // userId => Set(socketId)
const activeChats = new Map(); // userId => { chattingWith: userId, socketId: string }

io.on("connection", (socket) => {
    console.log("A user connected");

    // ✅ KEEP THIS - for initial chat registration and history loading
    socket.on("register user", async ({ userId, recipientId }) => {
        userId = String(userId);
        recipientId = String(recipientId);
        socket.userId = userId;

        if (!userSockets.has(userId)) {
            userSockets.set(userId, new Set());
        }
        userSockets.get(userId).add(socket.id);

        // Set active chat
        activeChats.set(userId, {
            chattingWith: recipientId,
            socketId: socket.id,
            timestamp: new Date()
        });

        console.log(`✅ ${userId} is now actively chatting with ${recipientId}`);

        try {
            // ✅ KEEP THIS - load chat history
            const messages = await ChatMessage.find({
                $or: [
                    { from: userId, to: recipientId },
                    { from: recipientId, to: userId }
                ]
            })
            .sort({ timestamp: 1 })
            .populate('from', 'username')
            .populate('to', 'username');

            const messagesWithUsernames = messages.map(msg => ({
                ...msg.toObject(),
                fromUsername: msg.from.username,
                toUsername: msg.to.username
            }));

            socket.emit("chat history", messagesWithUsernames);
        } catch (err) {
            console.error("Failed to load chat history:", err);
        }
    });

    // ✅ KEEP THIS - for when users switch between chats without page reload
    socket.on("user in chat with", ({ userId, chattingWith }) => {
        userId = String(userId);
        chattingWith = String(chattingWith);
        
        activeChats.set(userId, {
            chattingWith: chattingWith,
            socketId: socket.id,
            timestamp: new Date()
        });
        console.log(`✅ ${userId} switched to chat with ${chattingWith}`);
    });

    // ✅ KEEP THIS - handling message sending with proper filtering
socket.on("private message", async (msg) => {
    const from = String(socket.userId);
    const to = String(msg.to);

    if (!from || !to || !msg.message) return;

    try {
        const senderUser = await User.findById(from).select("username");
        const senderUsername = senderUser ? senderUser.username : 'Unknown User';

        const newMessage = new ChatMessage({
            from,
            to,
            message: msg.message,
            isRead: false,
        });

        await newMessage.save();

        // Always emit to sender
        socket.emit("private message", {
            ...newMessage.toObject(),
            fromUsername: senderUsername
        });

        const recipientSockets = userSockets.get(to);
        const recipientActiveChat = activeChats.get(to);

        // Check if recipient is online
        if (recipientSockets && recipientSockets.size > 0) {
            const isRecipientChattingWithSender = recipientActiveChat && 
                String(recipientActiveChat.chattingWith) === String(from);

            // Always deliver message if recipient is chatting with sender
            if (isRecipientChattingWithSender) {
                console.log(`💬 Delivering message to ${to}`);
                for (const sid of recipientSockets) {
                    io.to(sid).emit("private message", {
                        ...newMessage.toObject(),
                        fromUsername: senderUsername
                    });
                }
            }
            
            // ✅ Send notification if recipient is online but NOT chatting with sender
            if (!isRecipientChattingWithSender) {
                console.log(`📬 Sending notification to ${to} (not in active chat)`);
                for (const sid of recipientSockets) {
                    io.to(sid).emit("new inbox notification", {
                        from: from,
                        fromUsername: senderUsername,
                        message: msg.message,
                        timestamp: newMessage.timestamp,
                        messageId: newMessage._id
                    });
                }
                // Save notification to DB for persistence
                await saveNotification(from, to);
            }
        } else {
            // ✅ CRITICAL FIX: Save notification for OFFLINE users
            console.log(`💾 User ${to} is offline - saving notification to DB`);
            await saveNotification(from, to);
        }
    } catch (err) {
        console.error("❌ Error handling private message:", err);
    }
});

    socket.on("disconnect", () => {
        const userId = socket.userId;
        if (userId) {
            const sockets = userSockets.get(userId);
            if (sockets) {
                sockets.delete(socket.id);
                if (sockets.size === 0) {
                    userSockets.delete(userId);
                    activeChats.delete(userId);
                }
            }
            console.log(`❌ User disconnected: ${userId}`);
        }
    });
});

// Helper function to save notifications
async function saveNotification(from, to) {
    try {
        const sender = await User.findById(from).select("username");
        const recipientUser = await User.findById(to);

        if (!sender || !recipientUser) {
            console.warn("⚠️ Could not find sender or recipient in DB.");
            return;
        }

        const newNotif = new Notification({
            chat: {
                username: sender.username,
                userID: from, // Fixed: should be the sender's ID, not recipient's
            },
            isRead: false,
        });

        await newNotif.save();

        recipientUser.notifications.push(newNotif._id);
        await recipientUser.save();

        console.log("📥 Notification saved for user:", recipientUser.username);
    } catch (notifErr) {
        console.error("❌ Error saving notification:", notifErr);
    }
}