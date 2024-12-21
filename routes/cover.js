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
        res.render("categories/livestocks", {livestocks, title: 'Livestock session'});
    }catch(err){
        console.log(err)
    }
});
//vegetable page
router.get("/vegetables", async function(req, res){
    try{
        var veggies = await Product.find({"category": "Vegetables", "adminpost": "true"});
        res.render("categories/vegetables", {veggies, title: 'vegetables'});
    }catch(err){
        console.log(err)
    }
});
//seedling page
router.get("/seedlings", async function(req, res){
    try{
        var seedlings = await Product.find({"category": "Seedlings", "adminpost": "true"});
        res.render("categories/seedlings", {seedlings, title: 'Floricultural and Environment'});
    }catch(err){
        console.log(err)
    }
});
//food page
router.get("/food", async function(req, res){
    try{
        var food = await Product.find({"category": "Food", "adminpost": "true"});
        res.render("categories/food", {food, title: 'feed ingredients'});
    }catch(err){
        console.log(err)
    }
});
//farmequipment page
router.get("/farmequips", async function(req, res){
    try{
        var farmequips = await Product.find({"category": "Farm equipments", "adminpost": "true"});
        res.render("categories/farmequips", {farmequips, title: 'farm equipments'});
    }catch(err){
        console.log(err)
    }
});
//chef page
router.get("/chef", async function(req, res){
    try{
        var chef = await Product.find({"category": "chef", "adminpost": "true"});
        res.render("categories/chef", {chef, title: 'chef'});
    }catch(err){
        console.log(err)
    }
});
//bakery page
router.get("/bakeries", async function(req, res){
    try{
        var bakeries = await Product.find({"category": "bakeries", "adminpost": "true"});
        res.render("categories/bakeries", {bakeries, title: 'baked products'});
    }catch(err){
        console.log(err)
    }
});
//Others
router.get("/others", async function(req, res){
    try{
        var others = await Product.find({"category": "Others", "adminpost": "true"});
        res.render("categories/others", {others, title: 'Other commodity'});
    }catch(err){
        console.log(err)
    }
});

//Agricultural talk
router.get("/talk", async function(req, res){
    try{
        var Agricultural_talk = await Product.find({"category": "Agricultural talk", "adminpost": "true"});
        res.render("categories/talk", {Agricultural_talk, title: 'Agricultural talk'});
    }catch(err){
        console.log(err)
    }
});

//admin page
router.get("/adminpost", async function(req, res){
    try{
        var post = await Product.find({"adminpost": "false"});
        res.render("categories/post", {post, title: 'Administrative post'});
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
        res.render("index",{product, user, title: 'homepage'});
    }catch(err){
        console.log(err)
    }
});
router.post("/search", async function(req, res){
    try{
        var regex = new RegExp(["", req.body.productSearch, "$"].join(""), "i");
        var product = await Product.find({name: regex});
        res.render("productsearch", {product, title: "find product"});
    }catch(err){
        res.redirect("/");
    }
});

router.post("/usersearch", async function(req, res){
    try{
        var regex = new RegExp(["", req.body.userSearch, "$"].join(""), "i");
        var findUser = await User.find({username: regex});
        res.render("usersearch", {findUser, title: "find user"});
    }catch(err){
        res.redirect("/");
    }
});

module.exports = router;