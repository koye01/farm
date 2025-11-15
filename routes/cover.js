var express = require("express");
var router = express.Router();
var Product = require("../models/produce");
var Comment = require("../models/comment");
var User    = require("../models/user");
var Notification = require("../models/notification");
const ChatMessage = require("../models/ChatMessage");

//livestock page
router.get("/livestocks", async function(req, res){
    try{
        var livestocks = await Product.find({"category": "Livestocks", "adminpost": "true"});
        const canonicalUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
        const keywords = livestocks.map(animals => animals.name).join(", ");
        res.render("categories/livestocks", {livestocks, title: 'Livestock session', 
            description: "Animals and animal products", 
            keywords,
            image: "/pics/livestock.jpg", canonicalUrl});
    }catch(err){
        console.log(err)
    }
});
//pets
router.get("/pets", async function(req, res){
    try{
        var pets = await Product.find({"category": "Pets", "adminpost": "true"});
        const canonicalUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
        const keywords = pets.map(other => other.name).join(", ");
        res.render("categories/pets", {
            pets, title: 'Pet Animals', description: "Many pets have exhibited life-saving behaviors", 
            keywords,
            image: "/pics/logo.png",
            canonicalUrl
        });
    }catch(err){
        console.log(err)
    }
});
//vegetable page
router.get("/vegetables", async function(req, res){
    try{
        var veggies = await Product.find({"category": "Vegetables", "adminpost": "true"});
        const canonicalUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
        const keywords = veggies.map(veg => veg.name).join(", ");
        res.render("categories/vegetables", {veggies, title: 'Fresh Vegetables for Sale | Farmgate Nigeria Marketplace', description: 
            "Discover and buy fresh vegetables directly from Nigerian farmers. Farmgate Nigeria connects buyers with leafy and fruity vegetables at farm-gate prices.", 
            keywords,
            image: "/pics/logo.png", canonicalUrl});
    }catch(err){
        console.log(err)
    }
});
//seedling page
router.get("/seedlings", async function(req, res){
    try{
        var seedlings = await Product.find({"category": "Seedlings", "adminpost": "true"});
        const canonicalUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
        const keywords = seedlings.map(plant => plant.name).join(", ");
        res.render("categories/seedlings", {
            seedlings, title: 'Floricultural and Environment', description: "We beautifies the nature", 
            keywords,
            image: "/pics/logo.png",
            canonicalUrl
        });
    }catch(err){
        console.log(err)
    }
});
// Food page
router.get("/food", async function(req, res) {
    try {
        // Fetch only admin-approved food products
        let food = await Product.find({ 
            category: "Food", 
            adminpost: true // Boolean, not string
        });
        const canonicalUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
        // Generate keywords from all food names
        const keywords = food.map(eat => eat.name).join(", ");

        // Page-level description (since food.description is undefined here)
        const description = "List and explore feed ingredients, grains, and specialty agricultural products at competitive farm-gate prices. Connect with buyers nationwide on Farmgate Global.";

        // Render the page
        res.render("categories/food", {
            food,
            title: "Feed Ingredients and Grains for Sale | FarmgateGate Nigerian Marketplace",
            description,
            keywords,
            image: "/pics/feed.jpg",
            canonicalUrl
        });

    } catch (err) {
        console.error(err);
        res.status(500).send("Server error");
    }
});

//farmequipment page
router.get("/farmequips", async function(req, res){
    try{
        var farmequips = await Product.find({"category": "Farm equipments", "adminpost": "true"});
        const canonicalUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
        const keywords = farmequips.map(equips => equips.name).join(", ");
        res.render("categories/farmequips", {
            farmequips, title: 'Farm Equipment for Sale | Connect Farmers to Global Markets - Farmgate Nigeria', 
            description: "Explore modern farm equipment for sale at Farmgate Nigeria. Connect with global markets, boost your agricultural business, and access advanced tools like drones, harvesters, planters, and livestock management aids.", 
            keywords,
            image: "/pics/farmequip.jpg",
            canonicalUrl
        });
    }catch(err){
        console.log(err)
    }
});
//chef page
router.get("/chef", async function(req, res){
    try{
        var chef = await Product.find({"category": "Chef", "adminpost": "true"});
        const canonicalUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
        const keywords = chef.map(ch => ch.name).join(", ");
        res.render("categories/chef", {chef, title: 'chef', description: "chefs specializing in both local and international cuisines", 
            keywords,
            image: "/pics/logo.png", canonicalUrl});
    }catch(err){
        console.log(err)
    }
});
// real estate page
router.get("/estate", async function(req, res){
    try{
        var estate = await Product.find({"category": "Farm Real Estate", "adminpost": "true"});
        const canonicalUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
        const keywords = estate.map(bake => bake.name).join(", ");
        res.render("categories/estate", {
            estate, title: 'Farmgate Real Estate – Lease or Sell Agricultural Properties Nationwide',
            description: "Farmgate Nigeria connects farmers with buyers and tenants for agricultural land, farm structures, and buildings. List your farm real estate to reach the right audience nationwide.", 
            keywords,
            image: "/pics/logo.png",
            canonicalUrl
        });
    }catch(err){
        console.log(err)
    }
});
//Others
router.get("/others", async function(req, res){
    try{
        var others = await Product.find({"category": "Others", "adminpost": "true"});
        const canonicalUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
        const keywords = others.map(other => other.name).join(", ");
        res.render("categories/others", {
            others, title: 'Other commodity', description: "other goods and services for sales", 
            keywords,
            image: "/pics/logo.png",
            canonicalUrl
        });
    }catch(err){
        console.log(err)
    }
});

//Agricultural talk
router.get("/talk", async function(req, res){
    try{
        var Agricultural_talk = await Product.find({"category": "Agricultural talk", "adminpost": "true"});
        const canonicalUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
        const keywords = Agricultural_talk.map(blog => blog.name).join(", ");
        res.render("categories/talk", {
            Agricultural_talk, title: 'Agricultural Talk – Engage, Learn & Connect | Farmgate Nigeria', 
            description: "Agricultural Talk, Farmgate Nigeria, livestock management, animal health, petcare Nigeria, feeding formulation, livestock diseases, farm discussion, agricultural forum Nigeria, animal behavior, livestock solutions", 
            keywords,
            image: "/pics/Agrictalk.jpg",
            canonicalUrl
        });
    }catch(err){
        console.log(err)
    }
});

//admin page
router.get("/adminpost", async function(req, res){
    try{
        var post = await Product.find({"adminpost": "false"});
        const canonicalUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
        res.render("categories/post", {
            post, title: 'Administrative post', description: "Koye staff page", keywords: "admin post",
            image: "/pics/logo.png",
            canonicalUrl,
            noindex: true 
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
        const user = await User.find({});
        const canonicalUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
        // Shuffle them randomly
        const shuffled = product.sort(() => 0.5 - Math.random());
        // Pick only 3
        const featured = shuffled.slice(0, 3);
        res.render("index",{product, featured, user, canonicalUrl});
    }catch(err){
        console.log(err)
    }
});
// router.post("/search", async function(req, res){
//     try{
//         var regex = new RegExp(["", req.body.productSearch, "$"].join(""), "i");
//         var product = await Product.find({name: regex});
//         res.render("productsearch", {product, title: "find product", 
//             description: 'Product search bar', 
//             keywords: product.forEach(function(each){
//                 each.name;
//             }),
//             image: "/pics/logo.png"});
//     }catch(err){
//         res.redirect("/");
//     }
// });
router.post("/search", async function(req, res) {
    try {
        const regex = new RegExp(req.body.productSearch, "i");
        const products = await Product.find({ name: regex });
        const canonicalUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
        res.render("productsearch", {
            product: products,
            title: "Find Product",
            description: "Product search bar",
            keywords: products.map(p => p.name).join(", "),
            image: "/pics/logo.png",
            canonicalUrl
        });
    } catch (err) {
        console.error(err);
        res.redirect("/");
    }
});


router.post("/usersearch", async function(req, res) {
    try {
        const regex = new RegExp(req.body.userSearch, "i");
        const findUser = await User.find({ username: regex });
        const canonicalUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
        res.render("usersearch", {
            findUser,
            title: "Find User",
            description: "User search bar",
            keywords: findUser.map(user => user.username).join(", "),
            image: "/pics/logo.png",
            canonicalUrl
        });
    } catch (err) {
        console.error(err);
        res.redirect("/");
    }
});


router.get("/about", async function(req, res){
    try{
        const canonicalUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
        res.render("about", {title: "about farm-gate", 
            description: "Farm-Gate is a dynamic and innovative platform dedicated to connecting farmers with their target audience",
            keywords: "farmgate",
            image: "/pics/logo.png",
            canonicalUrl
        });
    }catch(err){
        res.redirect("/")
    }
})

router.get("/contact", async function(req, res){
    try{
        const canonicalUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
        res.render("contact", {title: "contact information", 
            description: "Farm-Gate is a dynamic and innovative platform dedicated to connecting farmers with their target audience",
            keywords: "farm-gate contact information",
            image: "/pics/logo.png",
            canonicalUrl
        });
    }catch(err){
        res.redirect("/")
    }
});

router.get("/faq", async function(req, res){
    try{
        const canonicalUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
        res.render("faq", {title: "frequently asked questions", 
            description: "Farm-Gate is a dynamic and innovative platform dedicated to connecting farmers with their target audience",
            keywords: "frequently asked questions",
            image: "/pics/logo.png", 
            canonicalUrl
        });
    }catch(err){
        res.redirect("/")
    }
});

//web chat interface
router.get("/chat/:id", async (req, res) => {
    const recipient = await User.findById(req.params.id);
    const currentUser = req.user;
  
    if (!recipient) {
      return res.status(404).send("Recipient not found.");
    }
  const canonicalUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
    // Render chat.ejs with both sender and recipient
    res.render("chat", {
      user: currentUser,       // sender
      recipient: recipient,     // recipient
      title: "live chat", 
        description: "live chat",
        keywords: "live chat",
        image: "/pics/logo.png",
        canonicalUrl,
        noindex: true 
    });
});
  


module.exports = router;