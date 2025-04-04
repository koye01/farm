var express = require("express");
var router = express.Router();
var Product = require("../models/produce");
var Comment = require("../models/comment");
var User    = require("../models/user");
var Notification = require("../models/notification");
const nodemailer = require('nodemailer');

require('dotenv').config();
var multer = require("multer");
var path = require("path");
middleware = require("../middleware/index");
// var storage = multer.diskStorage({
//     destination: function(req, file, cb){
//         cb(null)
//     },
//     filename: function(req, file, cb){
//         // console.log(file),
//         cb(null, Date.now() + path.extname(file.originalname));
//     }
// });
// var upload = multer({storage: storage});
const cloudinary = require('cloudinary').v2;
const fs = require('fs');




cloudinary.config({ 
    cloud_name: "djt5dffbq", 
    api_key: process.env.cloudinary_api_key, 
    api_secret: process.env.cloudinary_api_secret 
  });

var storage = multer.diskStorage({
    filename: function(req, file, callback){
     callback(null, Date.now() + file.originalname);
    }
 });
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
const multiUpload = multer({ storage: storage });
//listing of all product page
router.get("/allproduct", async function(req, res){
    try{
        var product = await Product.find({});
        const keywords = product.map(pro => pro.name).join(", ");
        res.render("homepage", {product, title: 'overall database', description: "farm produce gallery", 
            keywords,
            image: "/pics/logo.png"});
    }catch(err){
        console.log(err)
    }
});

router.get("/addnew", middleware.isLoggedIn, async function(req, res){
    try{
        res.render("addnew", {title: 'add new product', description: "add new product", 
            keywords: "add new product",
            image: "/pics/logo.png"});
    }catch(err){
        console.log(err)
    }
});

// Function to upload images to Cloudinary
function uploadImages(req, res) {
    var images = [];
    let completed = 0;
    let hasError = false;
  
    req.files.forEach(function(file, index) {
      cloudinary.uploader.upload(file.path, async function(error, result) {
        if (error) {
            if(!hasError){
                hasError = true;
                //flag to prevent multiple responses
          res.status(500).json({ message: 'Error uploading image', error });
            }
        }else{
            images.push({
                url: result.secure_url,
                public_id: result.public_id,
              });
            completed += 1;
        
        }
        
        // Delete the file from local storage after upload
        fs.unlinkSync(file.path);
  
        // Check if all files are uploaded
        if (completed === req.files.length && !hasError) {
            // Save the image set to MongoDB
            try {
                var category = req.body.category;
                var name = req.body.name;
                var price = req.body.price;
                var image = images;
                var description = req.body.description;
                var author ={
                    id: req.user._id,
                    username: req.user.username,
                    phone: req.user.phone,
                    email: req.user.email
                }
                var allproduct = {category: category, name: name, price: price, image: images, description: description, author: author};
                var newProduce = Product.create(allproduct);
                var dataid = (await newProduce).id;
                var user = await User.findById(req.user._id).populate('followers').exec();
                var newNotification = {
                    post: {
                        username: req.user.username,
                        productId: dataid
                    }
                }
                    for(var follower of user.followers) {
                        var notification = await Notification.create(newNotification);
                        follower.notifications.push(notification);
                        follower.save();
                    }
                    //redirect back to allproducts page
                    req.flash("success", "your request was succesful and is being processed");
            res.redirect("/"); // Redirect to the picture gallery URL
          } catch (dbError) {
            if (!hasError) {
              hasError = true;
              res.status(500).json({ message: 'Error saving images to MongoDB', error: dbError });
            }
          }
        }
      });
    });
}

//Adding new post (post request)
router.post("/", multiUpload.array('image', 10), uploadImages);
// Set up the email transport using the default SMTP transport
const transporter = nodemailer.createTransport({
    service: 'gmail',  // Example: using Gmail as the email service
    auth: {
        user: 'koyegarden@gmail.com',   // Replace with your email
        pass: process.env.password     // Replace with your email password
// the show page
router.get("/:id", async function(req, res){
    try{
        var detailed =  await Product.findById(req.params.id).populate({
            path: 'comments',
            populate: { path: 'replies' }
          });
         if(detailed.category == 'Agricultural talk') {
            res.render("details", {detailed, title: 'Open discussion on ' + detailed.name, description: detailed.description, 
            keywords: detailed.name,
            image: detailed.image});
         }else{
            res.render("details", {detailed, title: detailed.name + 'for sales ', description: detailed.description, 
                keywords: detailed.name,
                image: detailed.image});
         }
        
    }catch(err){
        console.log(err)
    }
});


// the show page
router.get("/:id", async function(req, res) {
    try {
        var detailed = await Product.findById(req.params.id).populate({
            path: 'comments',
            populate: { path: 'replies' }
        });

        if (detailed.category == 'Agricultural talk') {
            res.render("details", {
                detailed,
                title: 'Open discussion on ' + detailed.name,
                description: detailed.description,
                keywords: detailed.name,
                image: detailed.image
            });
        } else {
            res.render("details", {
                detailed,
                title: detailed.name + ' for sales',
                description: detailed.description,
                keywords: detailed.name,
                image: detailed.image
            });
        }
    } catch (err) {
        console.log(err);
    }
});

// POST route for handling inquiries
router.post("/:id", async function(req, res) {
    try {
        const { name, telephone, enquiry } = req.body;
        const postId = req.params.id;  // Retrieve the detailed product data (the product post)

        // Find the product details by ID to get the author's email
        const detailed = await Product.findById(postId);

        // Ensure that the author and email exist
        if (!detailed || !detailed.author || !detailed.author.email) {
            return res.status(400).send('Author email is missing');
        }

        // Retrieve the author's email
        const authorEmail = detailed.author.email;

        // Set up the email options
        const mailOptions = {
            from: process.env.EMAIL_USER,  // Replace with your email
            to: authorEmail,  // Send email to the author of the post
            subject: `Inquiry about ${detailed.name}`,  // Correct subject string
            text: `You have received an inquiry about your post titled: ${detailed.name}\n\n
                   Name: ${name}\n
                   Telephone: ${telephone}\n
                   Enquiry: ${enquiry}`
        };

        // Send the email
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log('Error sending email:', error);
                return res.status(500).send('Error sending inquiry');
            }
            req.flash("success", "Your enquiry has been received");
            console.log('Email sent:', info.response);
            res.redirect("/"+ req.params.id);  // Redirect back to the post page
        });
    } catch (err) {
        console.log(err);
        res.status(500).send("An error occurred while handling your request.");
    }
});


//edit page
router.get("/:id/edit", middleware.isOwner, async function(req, res){
    try{
        var edit = await Product.findById(req.params.id);
        res.render("edit", {edit, title: 'edit page', description: edit.description, 
            keywords: edit.name,
            image: "/pics/logo.png"});
    }catch(err){
        console.log(err)
    }
});


//Post Update route
router.put("/:id", middleware.isOwner, multiUpload.array('image', 10), async function(req, res){
    try{
        const { id } = req.params;
        // Find the existing image set in MongoDB
        const newEdit = await Product.findById(id);
        if (!newEdit) return res.status(404).json({ message: 'Image set not found' });

        // Delete old images from Cloudinary
        const deletePromises = newEdit.image.map(img => cloudinary.uploader.destroy(img.public_id));
        await Promise.all(deletePromises);

        // Upload new images to Cloudinary
        const newImages = [];
        let hasError = false;

        for (const file of req.files) {
        try {
            const result = await cloudinary.uploader.upload(file.path);
            newImages.push({ url: result.secure_url, public_id: result.public_id });

            // Delete the file from local storage after upload
            fs.unlinkSync(file.path);
        } catch (error) {
            hasError = true;
            console.error('Error uploading image:', error);
            res.status(500).json({ message: 'Error uploading image', error });
            break;
        }
        }

        if (hasError) return;

        // Update MongoDB record with new data
        var image = newImages;
        var {name, price, description} = req.body.update;
        var update = {image: image, name: name, price: price, description: description};
        var edit = await Product.findByIdAndUpdate(req.params.id, update);
        req.flash("success", "your status was successfully updated")
        res.redirect("/" + req.params.id);
    }catch(err){
        console.log(err)
    }
});


//Post delete route
router.post("/:id", middleware.isOwner, async function(req, res){
    const { id } = req.params;
    try{
        const deletePic = await Product.findById(id);
            if (!deletePic) {
                return res.status(404).json({ message: 'Image set not found' });
            }
        
            // Delete each image from Cloudinary using its public_id
            const deletePromises = deletePic.image.map(img => cloudinary.uploader.destroy(img.public_id));
            await Promise.all(deletePromises);
            await Product.findByIdAndRemove(req.params.id);
        res.redirect("/");
    }catch(err){
        req.flash("error", err.message);
        res.redirect("/"+ req.params.id)
    }
});



// Route to handle the form submission for inquiries
// router.post('/:id', async (req, res) => {
//     const { name, telephone, enquiry } = req.body;
//     const postId = req.params.id;

//     try {
//         // Retrieve the detailed product data (the product post)
//         const detailed = await Product.findById(postId);
        
//         // Ensure that the author and email exist
//         if (!detailed || !detailed.author || !detailed.author.email) {
//             return res.status(400).send('Author email is missing');
//         }
//         // Retrieve the author's email
//         const authorEmail = detailed.author.email;
//         console.log(authorEmail);
//         // Set up the email options
//         const mailOptions = {
//             from: process.env.EMAIL_USER,  // Replace with your email
//             to: authorEmail,  // Send email to the author of the post
//             subject: `Inquiry about ${detailed.name}`,  // Correct subject string
//             text: `
//                 You have received an inquiry about your post titled: ${detailed.name}\n\n
//                 Name: ${name}\n
//                 Telephone: ${telephone}\n
//                 Enquiry: ${enquiry}
//             ` 
//         };

//         // Send the email
//         transporter.sendMail(mailOptions, (error, info) => {
//             if (error) {
//                 console.log('Error sending email:', error);
//                 return res.status(500).send('Error sending inquiry');
//             }
//             console.log('Email sent:', info.response);
//             res.redirect(`/${postId}`);  // Redirect back to the post page
//         });

//     } catch (error) {
//         console.log('Error finding product:', error);
//         res.status(500).send('Error processing inquiry');
//     }
// });


module.exports = router;