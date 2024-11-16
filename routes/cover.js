var express = require("express");
var router = express.Router();
var Product = require("../models/produce");
var Comment = require("../models/comment");
var User    = require("../models/user");
var Notification = require("../models/notification");

//livestock page
router.get("/livestocks", async function(req, res){
    try{
        var livestocks = await Product.find({"category": "Livestocks", "adminpost": "true"});
        res.render("categories/livestocks", {livestocks});
    }catch(err){
        console.log(err)
    }
});
//vegetable page
router.get("/vegetables", async function(req, res){
    try{
        var veggies = await Product.find({"category": "Vegetables", "adminpost": "true"});
        res.render("categories/vegetables", {veggies});
    }catch(err){
        console.log(err)
    }
});
//seedling page
router.get("/seedlings", async function(req, res){
    try{
        var seedlings = await Product.find({"category": "Seedlings", "adminpost": "true"});
        res.render("categories/seedlings", {seedlings});
    }catch(err){
        console.log(err)
    }
});
//food page
router.get("/food", async function(req, res){
    try{
        var food = await Product.find({"category": "Food", "adminpost": "true"});
        res.render("categories/food", {food});
    }catch(err){
        console.log(err)
    }
});
//farmequipment page
router.get("/farmequips", async function(req, res){
    try{
        var farmequips = await Product.find({"category": "Farm equipments", "adminpost": "true"});
        res.render("categories/farmequips", {farmequips});
    }catch(err){
        console.log(err)
    }
});
//Others
router.get("/others", async function(req, res){
    try{
        var others = await Product.find({"category": "Others", "adminpost": "true"});
        res.render("categories/others", {others});
    }catch(err){
        console.log(err)
    }
});

//admin page
router.get("/adminpost", async function(req, res){
    try{
        var post = await Product.find({"adminpost": "false"});
        res.render("categories/post", {post});
    }catch(err){
        console.log(err)
    }
});

//delete post from the admin server
router.post("/adminpost", async function(req, res){
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
        res.redirect("/"+ req.params.id)
    }
});

router.get("/approvepost", async function(req, res){
    try{
        var approve = await Product.find({"adminpost": false});
        approve[0].adminpost = true;
        approve[0].save();
        res.redirect("/");
    }catch(err){
        res.redirect("/"+ req.params.id)
    }
});

//index page
router.get("/", async function(req, res){
    try{
        var product = await Product.find({});
        var user = await User.find({});
        res.render("index",{product, user});
    }catch(err){
        console.log(err)
    }
});
router.post("/search", async function(req, res){
    try{
        var regex = new RegExp(["", req.body.productSearch, "$"].join(""), "i");
        var product = await Product.find({name: regex});
        res.render("productsearch", {product});
    }catch(err){
        res.redirect("/");
    }
});

router.post("/usersearch", async function(req, res){
    try{
        var regex = new RegExp(["", req.body.userSearch, "$"].join(""), "i");
        var findUser = await User.find({username: regex});
        res.render("usersearch", {findUser});
    }catch(err){
        res.redirect("/");
    }
});

module.exports = router;