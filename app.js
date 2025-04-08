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
    var coverRoute   = require("./routes/cover");
    var productRoute = require("./routes/auth");
    var dynamicRoute = require("./routes/allproduct");
    var commentRoute = require("./routes/comment");
    var flash = require("connect-flash");
const helmet = require("helmet");

// mongoose.connect("mongodb://localhost/Product");
mongoose.connect(process.env.database);

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
    helmet.contentSecurityPolicy({
      directives: {
        defaultSrc: ["'self'"], // Allow self
        imgSrc: [
          "'self'", // Allow images from the same domain
          'https://res.cloudinary.com', // Allow Cloudinary images
          'https://www.facebook.com', // Allow Facebook's scraper bot
          'https://platform.twitter.com', // Allow Twitter's scraper bot
          'https://www.linkedin.com', // Allow LinkedIn's scraper bot
          'data:', // Allow data URIs (for inline images)
        ],
        // Allow other directives for social media bots, adjust as needed
      },
    })
  
  
  app.use(
      helmet({
          contentSecurityPolicy: false, //Disable if using third party scripts
          frameguard: {
              action: "deny"
          }, //prevent clickjacking
          referrerPolicy: {
              policy: 'no-referrer'
          }, // manage referer info
          xssFilter: true, //Prevent xss attacks
          hsts: {
              maxAge: 31536000,
              includeSubDomains: true
          }, //Enforce HTTPS
      })
  );

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"], // Allow self
      imgSrc: [
        "'self'", // Allow images from the same domain
        "https://res.cloudinary.com", // Allow Cloudinary images
        "https://www.facebook.com", // Allow Facebook's scraper bot
        "https://platform.twitter.com", // Allow Twitter's scraper bot
        "https://www.linkedin.com", // Allow LinkedIn's scraper bot
        "data:", // Allow data URIs (for inline images)
      ],
      // Allow other directives for social media bots, adjust as needed
    },
  })
);

app.use(
  helmet({
    contentSecurityPolicy: false, // Disable if using third-party scripts
    frameguard: {
      action: "deny",
    }, // Prevent clickjacking
    referrerPolicy: {
      policy: "no-referrer",
    }, // Manage referrer info
    xssFilter: true, // Prevent XSS attacks
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
    }, // Enforce HTTPS
  })
);

// Serve robots.txt
app.get("/robots.txt", function (req, res) {
  res.type("text/plain");
  res.send(
    `User-agent: *
Disallow: /admin/
Disallow: /redirect
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


// app.listen("3000", function(){
//     console.log("Your app is loading")
// });


// User socket tracking
const userSockets = new Map();

io.on("connection", (socket) => {
    console.log("A user connected");

    socket.on("register user", (userId) => {
        userSockets.set(userId, socket.id);
        socket.userId = userId;
    });

    socket.on("private message", async (msg) => {
        if (!msg.from || !msg.to || !msg.message) {
            console.warn("Invalid message format:", msg);
            return;
        }

        try {
            const newMessage = new ChatMessage({
                from: msg.from,
                to: msg.to,
                message: msg.message
            });

            await newMessage.save();

            // Send to sender
            socket.emit("private message", newMessage);

            // Send to recipient if online
            const recipientSocketId = userSockets.get(msg.to);
            if (recipientSocketId) {
                io.to(recipientSocketId).emit("private message", newMessage);
            }
        } catch (err) {
            console.error("Error saving message:", err);
        }
    });

    socket.on("register user", async (userId) => {
        socket.userId = userId;

        try {
            // Load all messages sent to or from this user
            const messages = await ChatMessage.find({
                $or: [{ from: userId }, { to: userId }]
            }).sort({ timestamp: 1 });

            socket.emit("chat history", messages);
        } catch (err) {
            console.error("Failed to load chat history:", err);
        }
    });

    socket.on("disconnect", () => {
        if (socket.userId) {
            userSockets.delete(socket.userId);
        }
        console.log("User disconnected");
    });
});

app.listen(process.env.PORT, process.env.IP);
console.log("application is now running");
