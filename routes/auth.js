var express = require("express");
var router = express.Router();
var middleware = require("../middleware/index");
var Product = require("../models/produce");
var Comment = require("../models/comment");
var User = require("../models/user");
var Review = require("../models/review");
var passport = require("passport");
var Notification = require("../models/notification");
var middleware = require("../middleware/index");
var path = require("path");
var multer = require("multer");

require('dotenv').config();
var async = require("async");
var nodemailer = require("nodemailer");
var crypto = require("crypto");
require('dotenv').config();
var google = require("googleapis");

var storage = multer.diskStorage({
    filename: function(req, file, callback){
     callback(null, Date.now() + file.originalname);
    }
 });

//  var storage = multer.diskStorage({
//     destination: function(req, file, cb){
//         cb(null, "public/profile")
//     },
//     filename: function(req, file, cb){
//         //console.log(file),
//         cb(null, Date.now() + path.extname(file.originalname))
//     }
// });
var upload = multer({storage: storage});
var cloudinary = require("cloudinary");
const review = require("../models/review");
cloudinary.config({ 
    cloud_name: "djt5dffbq", 
    api_key: process.env.cloudinary_api_key, 
    api_secret: process.env.cloudinary_api_secret 
  });

//essential route
// Product.create({
//     name: "Obasanjo chicks",
//     image: "pics\chicks.jpg",
//     description: "These are the early day old chicks that i use to sell"
// });


router.get("/register", function(req, res){
    const canonicalUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
    res.render("form/register", {title: 'register new user', description: "user sign-up page", 
        keywords: 'sign-up page',
        image: "/pics/logo.png", canonicalUrl, noindex: true});
});


router.post("/register", upload.single("image"), async function(req, res){
    var result = await cloudinary.v2.uploader.upload(req.file.path);
        var image = {
            url: result.secure_url,
            imageId: result.public_id
        }
            
            try{
            var username = req.body.username;
            var email = req.body.email;
            var phone = req.body.phone;
            var description = req.body.description;
            var fullname = req.body.fullname;
            var secretCode = req.body.secretCode;
            var newUser = {image: image, username: username, email: email, secretCode: secretCode, 
                description: description, fullname: fullname, phone: phone};
            var secretCode = req.body.secretCode;
            if(secretCode === "1980"){
                newUser.isAdmin = true;
            }
            var user = await User.register(newUser, req.body.password);
            req.flash("success", user.username + "! "+ " Your registration was successful")
                res.redirect("/login");
            } catch(err){
            req.flash("error", err.message);
            res.redirect("back");
        }
    
});

router.get("/login", function(req, res){
    const canonicalUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
    res.render("form/login", {title: 'user login',description: "user login page", keywords: 'login page',
        image: "/pics/logo.png", canonicalUrl, noindex: true});
});
router.post("/login", passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login"
}), function(req, res){});

router.get("/logout", function(req, res){
    req.logOut(function(err, out){
        if(err){
            console.log(err)
        }
    req.flash("success", "successfully logged out");
        res.redirect("/");
    });
});


//forgot password
router.get("/forgot", function(req, res){
    const canonicalUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
    res.render("users/forgot", {
        title: 'password reset',
        description: "password reset link", 
        keywords: 'forgot password',
        image: "/pics/logo.png",
        canonicalUrl,
        noindex: true
    })
    });

router.post("/forgot", async function(req, res, next) {
    try {
        // Step 1: Generate a token using crypto.randomBytes
        const token = await new Promise((resolve, reject) => {
            crypto.randomBytes(20, (err, buf) => {
                if (err) reject(err);
                resolve(buf.toString('hex'));
            });
        });

        // Step 2: Find user and update password reset fields
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            req.flash("error", "No account with that email address exists");
            return res.redirect("/forgot");
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 6600000; // 1 hour

        await user.save();

        // Step 3: Send the password reset email
        const smtpTransport = nodemailer.createTransport({
            service: "Gmail",
            auth: {
                user: "koyegarden@gmail.com",
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            to: user.email,
            from: "koyegarden@gmail.com",
            subject: "Farmgate Nigerian mobile App's password reset",
            text: `You are receiving this because you or someone else have requested a password reset.\n\n` +
                  `Please click on this link or copy the code to your browser to complete the process:\n\n` +
                  `http://${req.headers.host}/reset/${token}\n\n` +
                  `If you did not request this, please ignore this email and your password will remain unchanged.`
        };

        await smtpTransport.sendMail(mailOptions);
        
        req.flash("success", `An e-mail has been sent to ${user.email} with further instructions.`);

        res.redirect("/forgot");
    } catch (err) {
        next(err);
    }
});


router.get("/reset/:token", async function(req, res){
    var user = await User.findOne({resetPasswordToken: req.params.token, resetPasswordExpires: {$gt: Date.now()}})
    const canonicalUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
    if(!user) {
        req.flash("error", "password reset token has been expired.");
        return res.redirect("/forgot");
    }
    res.render("users/reset", {
        token: req.params.token, title: 'reset token',
        description: "password reset link", 
        keywords: 'forgot password',
        image: "/pics/logo.png",
        canonicalUrl,
        noindex: true
    });
});


//forgot password
router.post("/reset/:token", async function(req, res) {
    try {
        // Step 1: Find user by reset token and check token expiration
        const user = await User.findOne({
            resetPasswordToken: req.params.token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            req.flash("error", "Password reset token is invalid or has expired");
            return res.redirect("/back");
        }

        // Step 2: Check if passwords match
        if (req.body.password === req.body.confirm) {
            // Set new password
            await new Promise((resolve, reject) => {
                user.setPassword(req.body.password, (err) => {
                    if (err) reject(err);
                    resolve();
                });
            });

            // Clear reset token and expiration
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            // Save the user with the new password
            await user.save();

            // Step 3: Log in the user after password change
            await new Promise((resolve, reject) => {
                req.logIn(user, (err) => {
                    if (err) reject(err);
                    resolve();
                });
            });

        } else {
            req.flash("error", "Passwords do not match");
            return res.redirect("/back");
        }

        // Step 4: Send confirmation email
        const smtpTransport = nodemailer.createTransport({
            service: "Gmail",
            auth: {
                user: "koyegarden@gmail.com",
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            to: user.email,
            from: "oyelekejubril@gmail.com",
            subject: "Your password has been changed",
            text: `Hello,\n\nThis is a confirmation message that the password for your account ${user.email} has just been changed`
        };

        await smtpTransport.sendMail(mailOptions);

        console.log("Mail sent");
        req.flash("success", "Your password has been changed.");
        res.redirect("/");

    } catch (err) {
        res.redirect('back');
        next(err);  // Pass the error to the next middleware for handling
    }
});



// Profile page route
// router.get("/user/:id", async function(req, res){
//     try {
//         var product = await Product.find({});
//         var user = await User.findById(req.params.id).populate('followers following').exec();  // Populate 'following' field as well
//         var unique = user.followers.filter((value, index) => {
//             return user.followers.indexOf(value) === index;
//         });
//         const keywords = product.map(pro => pro.name).join(", ");
//         res.render('profile', {
//             user, product, unique, title: user.username + ' profile',
//             description: user.description, 
//             keywords,
//             image: user.image
//             });
//     } catch (err) {
//         console.log(err);
//         return res.redirect('back');
//     }
// });

//Profile page
router.get("/user/:id", async function(req, res) {
    try {
        var product = await Product.find({});
        var user = await User.findById(req.params.id).populate('followers following')
        .populate({
                path: 'reviews',
                populate: { path: 'author.id', model: 'User' }
            })
        .exec();  // Populate 'following' field as well
        var unique = user.followers.filter((value, index) => {
            return user.followers.indexOf(value) === index;
        });
        let avgRating = 0;
        if (user.reviews.length > 0) {
            const total = user.reviews.reduce((sum, r) => sum + (r.rating || 0), 0);
            avgRating = (total / user.reviews.length).toFixed(1);
        }
        // Create a comma-separated list of product names
        // const keywords = product.map(pro => pro.name).join(", ");
        
        // Include 'user.username' in the keywords
        const allKeywords = ` ${user.username}`;
        const canonicalUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
        res.render('profile', {
            user, product, avgRating, unique, title: user.username + ' profile',
            description: user.description, 
            keywords: allKeywords,  // Use the updated 'allKeywords' here
            image: user.image,
            canonicalUrl
        });
    } catch (err) {
        return res.redirect('back');
    }
});




//Profile edit page
router.get("/user/:id/edit", middlewareObj.userAuthor, async function(req, res){
    try{
        var editProf = await User.findById(req.params.id);
        const canonicalUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
        res.render("profileedit", {
            editProf, title: 'edit profile',
            description: "edit profile", 
            keywords: "edit profile",
            image: editProf.image,
            canonicalUrl,
            noindex: true
        });
    }catch(err){
        res.redirect('back');
    }
});


//Profile post edit page
router.put("/user/:id", upload.single("image"), middlewareObj.userAuthor, async function(req, res){
    try{
        var image =[];
    var update = await User.findById(req.params.id);
            if(req.file){
                try{
                    await cloudinary.v2.uploader.destroy(update.image[0].imageId);
                    var result = await cloudinary.v2.uploader.upload(req.file.path);
                    
                    image.push({ url: result.secure_url, imageId: result.public_id });
                }catch(err) {
                    req.flash("error", err.message);
                    return res.redirect("back");
                }
            }
            var username = req.body.username;
            var fullname = req.body.fullname;
            var description = req.body.description;
            var phone = req.body.phone;
            var newUpdate = {username: username, image: image, fullname: fullname, description: description, phone: phone};
            var user = await User.findByIdAndUpdate(req.params.id, newUpdate);
            req.flash('success', 'profile successfully updated');
            res.redirect("/user/"+ req.params.id);
            }catch(err){
                req.flash("error", err.message);
            }
        });
    
//follow user
router.get('/follow/:id', middleware.isLoggedIn, async function(req, res) {
    try {
        var user = await User.findById(req.params.id)
        var follow = await User.findById(req.user._id);
        user.followers.push(req.user._id);
        follow.following.push(user);
        var unique = user.followers.filter((value, index)=>{
            return user.followers.indexOf(value) === index;
        });
        var followingUnique =follow.following.filter((value, index)=>{
            return follow.following.indexOf(value) === index;
        })
        user.followers = unique;
        follow.following = followingUnique;
        user.save();
        follow.save();
        req.flash("success", unique.username, "started following you");
        res.redirect('/user/' + req.params.id);
    } catch(err) {
        res.redirect('back');
    }
});

// loading followers list in a separate file
router.get('/user/:id/followers', async function(req, res) {
    try{
       const userId = req.params.id; 
       var user = await User.findById(userId).populate('followers').exec();
       const keywords = user.followers.map(user => user.username).join(", ");
       var listfollowers = user.followers;
       const canonicalUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
       res.render("followerspage", {
            listfollowers, title: 'follower-list',
            description: "followers", 
            keywords,
            image: "/pics/logo.png",
            canonicalUrl,
            noindex: true
        }
    );
    }catch(err){
        res.redirect('back');
    }
    
});

// loading following list in a separate file
router.get('/user/:id/following', async function(req, res) {
    try{
       const userId = req.params.id; 
       var user = await User.findById(userId).populate('following').exec();
       const keywords = user.following.map(user => user.username).join(", ");
       var listfollowing = user.following;
       const canonicalUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
       res.render("followingpage", {
            listfollowing, title: 'following-list',
            description: "following list", 
            keywords,
            image: "/pics/logo.png",
            canonicalUrl,
            noindex: true
        });
    }catch(err){
        res.redirect('back');
    }
    
});


//Unfollow user
router.get('/unfollow/:id', middleware.isLoggedIn, async function(req, res) {
    try {
        var user = await User.findById(req.params.id);
        var remove = user.followers.indexOf(req.user._id);
        user.followers.splice(remove, 1);
        user.save();
        req.flash("success", "you successfully unfollowed", user.username);
        res.redirect('/user/' + req.params.id);
    } catch(err) {
        res.redirect('back');
    }
});
//notification routes
router.get("/notifications", middleware.isLoggedIn, async function(req, res){
    try{
        var user = await User.findById(req.user._id).populate({
            path: "notifications",
            options: {sort: {"_id": -1}}
        }).exec();
        const canonicalUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
        var allNotification = user.notifications;
        res.render("notification", {
            allNotification, title: 'notification page',
            description: "Notification page", 
            keywords: "notifications",
            image: user.image,
            canonicalUrl,
            noindex: true   // <--- ADD THIS
        });
    }catch(error){
        res.redirect('back');
    }
});


//Product notification address
router.get('/notifications/:id', middleware.isLoggedIn, async function(req, res) {
    try {
        var user = await User.findById(req.params.id);
        var notification = await Notification.findById(req.params.id);
        notification.isRead = true;
        notification.save();
        res.redirect("/" +notification.post.productId);
    } catch(err) {
        res.redirect('back');
    }
});

// remove product upload's notification
router.delete("/notifications/:id", middleware.isLoggedIn, async function(req, res){
    try{
        var removeNotif = await Notification.findByIdAndRemove(req.params.id);
        req.flash("success", "notification link deleted successfully");
        res.redirect("/notifications")
    }catch(error){
        res.redirect('back');
    }
})

//comment notification address
router.get('/notifications/com/:id', middleware.isLoggedIn, async function(req, res) {
    try {
        var user = await User.findById(req.params.id);
        var notification = await Notification.findById(req.params.id);
        notification.isRead = true;
        notification.save();
        res.redirect("/" +notification.comment.productId);
    } catch(err) {
        res.redirect('back');
    }
});

// remove comment notification
router.delete("/notifications/com/:id", middleware.isLoggedIn, async function(req, res){
    try{
        var removeNotif = await Notification.findByIdAndRemove(req.params.id);
        req.flash("success", "notification link deleted successfully");
        res.redirect("/notifications")
    }catch(error){
        res.redirect('back');
    }
})

//reply notification address
router.get('/notifications/reply/:id', middleware.isLoggedIn, async function(req, res) {
    try {
        var user = await User.findById(req.params.id);
        var notification = await Notification.findById(req.params.id);
        notification.isRead = true;
        notification.save();
        res.redirect("/" +notification.reply.productId);
    } catch(err) {
        res.redirect("back");
    }
});
// remove reply notification
router.delete("/notifications/reply/:id", middleware.isLoggedIn, async function(req, res){
    try{
        var removeNotif = await Notification.findByIdAndRemove(req.params.id);
        req.flash("success", "notification link deleted successfully");
        res.redirect("/notifications")
    }catch(error){
        res.redirect('back');
    }
})

//chat notification address
router.get('/notifications/chat/:id', middleware.isLoggedIn, async function(req, res) {
    try {
        var user = await User.findById(req.params.id);
        var notification = await Notification.findById(req.params.id);
        notification.isRead = true;
        notification.save();
        res.redirect("/chat" +"/" +notification.chat.userID);
    } catch(err) {
        res.redirect('back');
    }
});

//remove chat notification
router.delete("/notifications/chat/:id", middleware.isLoggedIn, async function(req, res){
    try{
        var removeNotif = await Notification.findByIdAndRemove(req.params.id);
        req.flash("success", "notification link deleted successfully");
        res.redirect("/notifications")
    }catch(error){
        res.redirect('back');
    }
})


//review line
router.post("/user/:id/reviews", middleware.isLoggedIn, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).populate("reviews");

        // Check if this reviewer already reviewed the seller
        const existingReview = user.reviews.find(r => r.author.id.equals(req.user._id));

        if (existingReview) {
            req.flash("error", "You have already reviewed this seller.");
            return res.redirect("/user/" + user._id);
        }

        // Create a new review
        const review = await Review.create({
            message: req.body.review.message,
            rating: req.body.review.rating,
            author: {
                id: req.user._id,
                username: req.user.username
            }
        });

        // Push review to seller
        user.reviews.push(review._id);
        await user.save();

        res.redirect("/user/" + user._id);

    } catch (err) {
        res.redirect("back");
    }
});



module.exports = router;