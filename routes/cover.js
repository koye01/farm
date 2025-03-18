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
        const keywords = livestocks.map(animals => animals.name).join(", ");
        res.render("categories/livestocks", {livestocks, title: 'Livestock session', 
            description: "Animals and animal products", 
            keywords,
            image: "/pics/logo.png"});
    }catch(err){
        console.log(err)
    }
});
//vegetable page
router.get("/vegetables", async function(req, res){
    try{
        var veggies = await Product.find({"category": "Vegetables", "adminpost": "true"});
        const keywords = veggies.map(veg => veg.name).join(", ");
        res.render("categories/vegetables", {veggies, title: 'vegetables', description: "both leafy and fruit vegetables", 
            keywords,
            image: "/pics/logo.png"});
    }catch(err){
        console.log(err)
    }
});
//seedling page
router.get("/seedlings", async function(req, res){
    try{
        var seedlings = await Product.find({"category": "Seedlings", "adminpost": "true"});
        const keywords = seedlings.map(plant => plant.name).join(", ");
        res.render("categories/seedlings", {
            seedlings, title: 'Floricultural and Environment', description: food.description, 
            keywords,
            image: "/pics/logo.png"
        });
    }catch(err){
        console.log(err)
    }
});
//food page
router.get("/food", async function(req, res){
    try{
        var food = await Product.find({"category": "Food", "adminpost": "true"});
        const keywords = food.map(eat => eat.name).join(", ");
        res.render("categories/food", {
            food, title: 'feed ingredients', description: food.description, 
            keywords,
            image: "/pics/logo.png"
        });
    }catch(err){
        console.log(err)
    }
});
//farmequipment page
router.get("/farmequips", async function(req, res){
    try{
        var farmequips = await Product.find({"category": "Farm equipments", "adminpost": "true"});
        const keywords = farmequips.map(equips => equips.name).join(", ");
        res.render("categories/farmequips", {
            farmequips, title: 'farm equipments', description: farmequips.description, 
            keywords,
            image: "/pics/logo.png"
        });
    }catch(err){
        console.log(err)
    }
});
//chef page
router.get("/chef", async function(req, res){
    try{
        var chef = await Product.find({"category": "chef", "adminpost": "true"});
        const keywords = chef.map(ch => ch.name).join(", ");
        res.render("categories/chef", {chef, title: 'chef', description: chef.description, 
            keywords,
            image: "/pics/logo.png"});
    }catch(err){
        console.log(err)
    }
});
//bakery page
router.get("/bakeries", async function(req, res){
    try{
        var bakeries = await Product.find({"category": "bakeries", "adminpost": "true"});
        const keywords = bakeries.map(bake => bake.name).join(", ");
        res.render("categories/bakeries", {
            bakeries, title: 'baked products',description: "All baked items such as; cake, bread and small chops", 
            keywords,
            image: "/pics/logo.png"
        });
    }catch(err){
        console.log(err)
    }
});
//Others
router.get("/others", async function(req, res){
    try{
        var others = await Product.find({"category": "Others", "adminpost": "true"});
        const keywords = others.map(other => other.name).join(", ");
        res.render("categories/others", {
            others, title: 'Other commodity', description: "other goods and services for sales", 
            keywords,
            image: "/pics/logo.png"
        });
    }catch(err){
        console.log(err)
    }
});

//Agricultural talk
router.get("/talk", async function(req, res){
    try{
        var Agricultural_talk = await Product.find({"category": "Agricultural talk", "adminpost": "true"});
        const keywords = Agricultural_talk.map(blog => blog.name).join(", ");
        res.render("categories/talk", {
            Agricultural_talk, title: 'Agricultural talk', description: 'matters arrising in the field of agricultural sciences', 
            keywords,
            image: "/pics/logo.png"
        });
    }catch(err){
        console.log(err)
    }
});

//admin page
router.get("/adminpost", async function(req, res){
    try{
        var post = await Product.find({"adminpost": "false"});
        res.render("categories/post", {
            post, title: 'Administrative post', description: "Koye staff page", keywords: "admin post",
            image: "/pics/logo.png"
        });
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

router.get("/approvepost/:id", async function(req, res){
    try{
        var approve = await Product.findById(req.params.id);
        approve.adminpost = true;
        approve.save();
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
        res.render("productsearch", {product, title: "find product", 
            description: 'Product search bar', 
            keywords: product.forEach(function(each){
                each.name;
            }),
            image: "/pics/logo.png"});
    }catch(err){
        res.redirect("/");
    }
});

router.post("/usersearch", async function(req, res){
    try{
        var regex = new RegExp(["", req.body.userSearch, "$"].join(""), "i");
        var findUser = await User.find({username: regex});
        res.render("usersearch", {findUser, title: "find user", 
            description: 'User search bar', 
            keywords: findUser.forEach(function(each){
                each.name;
            }),
            image: "/pics/logo.png"
        });
    }catch(err){
        res.redirect("/");
    }
});

router.get("/about", async function(req, res){
    try{
        res.render("about", {title: "about farm-gate", 
            description: "Farm-Gate is a dynamic and innovative platform dedicated to connecting farmers with their target audience",
            keywords: "farmgate",
            image: "/pics/logo.png"
        });
    }catch(err){
        res.redirect("/")
    }
})

router.get("/contact", async function(req, res){
    try{
        res.render("contact", {title: "contact information", 
            description: "Farm-Gate is a dynamic and innovative platform dedicated to connecting farmers with their target audience",
            keywords: "farm-gate contact information",
            image: "/pics/logo.png"
        });
    }catch(err){
        res.redirect("/")
    }
})
module.exports = router;