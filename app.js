var express = require("express"),
    app = express(),
    Product = require("./models/produce"),
    Comment = require("./models/comment"),
    User = require("./models/user"),
    Notification = require("./models/notification"),
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

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],

        scriptSrc: [
          "'self'",
          "'unsafe-inline'", // Required by GTM (optional if you use nonces)
          "www.googletagmanager.com",
          "www.google-analytics.com"
        ],

        styleSrc: [
          "'self'",
          "'unsafe-inline'"
        ],

        imgSrc: [
          "'self'",
          "data:",
          "https://res.cloudinary.com",
          "https://www.facebook.com",
          "https://platform.twitter.com",
          "https://www.linkedin.com",
          "www.google-analytics.com",
          "www.googletagmanager.com",
          "stats.g.doubleclick.net"
        ],

        connectSrc: [
          "'self'",
          "www.google-analytics.com",
          "www.googletagmanager.com",
          "https://*.doubleclick.net"
        ],

        frameSrc: [
          "www.googletagmanager.com",
          "www.google.com"
        ],

        objectSrc: ["'none'"],
        baseUri: ["'self'"]
      }
    },
    frameguard: {
      action: "deny"
    },
    referrerPolicy: {
      policy: "no-referrer"
    },
    xssFilter: true,
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true
    }
  })
);

// robots.txt route
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

app.listen(process.env.PORT, process.env.IP);
console.log("application is now running");
