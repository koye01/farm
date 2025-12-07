var express = require("express");
var router = express.Router();
var Product = require("../models/produce");
var Comment = require("../models/comment");
var User    = require("../models/user");
var Notification = require("../models/notification");
const ChatMessage = require("../models/ChatMessage");
const { SitemapStream, streamToPromise } = require('sitemap');
const { createGzip } = require('zlib');
const { Readable } = require('stream');

const cloudinary = require('cloudinary').v2;
const fs = require('fs');

cloudinary.config({ 
    cloud_name: "djt5dffbq", 
    api_key: process.env.cloudinary_api_key, 
    api_secret: process.env.cloudinary_api_secret 
  });

//livestock page
router.get("/livestocks", async function(req, res){
    try{
        // PAGINATION
        let page = parseInt(req.query.page) || 1;
         // Ensure page is at least 1
        page = Math.max(1, page);
        const limit = 6; // you can change to any number
        const skip = (page - 1) * limit;

        // FETCH TOTAL COUNT
        const total = await Product.countDocuments({
            category: "Livestocks",
            adminpost: "true"
        });
        const livestocks = await Product.find({"category": "Livestocks", "adminpost": "true"})
        .skip(skip)
        .limit(limit)
        .sort({ _id: 1 });
        const totalPages = Math.ceil(total / limit);
        const canonicalUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
        const keywords = livestocks.map(animals => animals.name).join(", ");
        res.render("categories/livestocks", {livestocks, title: 'Quality farm animals | Farmgate', 
            description: "Your trusted source for robust cattle, sheep, goat and poultry. Explore our available breeding stock and learn about our commitment to animal health and customer success.", 
            keywords,
            image: "/pics/livestock.jpg", 
            canonicalUrl, 
            currentPage: page, 
            totalPages});
    }catch(err){
        console.log(err)
    }
});
//pets
router.get("/pets", async function(req, res){
    try{
         // PAGINATION
        let page = parseInt(req.query.page) || 1;
         // Ensure page is at least 1
        page = Math.max(1, page);
        const limit = 6; // you can change to any number
        const skip = (page - 1) * limit;

        // FETCH TOTAL COUNT
        const total = await Product.countDocuments({
            category: "Pets",
            adminpost: "true"
        });
        const pets = await Product.find({"category": "Pets", "adminpost": "true"})
        .skip(skip)
        .limit(limit)
        .sort({ _id: 1 });
        const totalPages = Math.ceil(total / limit);
        const canonicalUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
        const keywords = pets.map(other => other.name).join(", ");
        res.render("categories/pets", {
            pets, 
            currentPage: page, 
            totalPages,
            title: 'Pet Animals', description: "Many pets have exhibited life-saving behaviors", 
            keywords,
            image: "/pics/pets.jpg",
            canonicalUrl
        });
    }catch(err){
        console.log(err)
    }
});
//vegetable page
// router.get("/vegetables", async function(req, res){
//     try{
//         var veggies = await Product.find({"category": "Vegetables", "adminpost": "true"});
//         const canonicalUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
//         const keywords = veggies.map(veg => veg.name).join(", ");
//         res.render("categories/vegetables", {veggies, title: 'Fresh Vegetables for Sale | Farmgate Nigeria Marketplace', description: 
//             "Discover and buy fresh vegetables directly from Nigerian farmers. Farmgate Nigeria connects buyers with leafy and fruity vegetables at farm-gate prices.", 
//             keywords,
//             image: "/pics/logo.png", canonicalUrl});
//     }catch(err){
//         console.log(err)
//     }
// });

router.get("/vegetables", async (req, res) => {
    try {
        // PAGINATION
        let page = parseInt(req.query.page) || 1;
         // Ensure page is at least 1
        page = Math.max(1, page);
        const limit = 6; // you can change to any number
        const skip = (page - 1) * limit;

        // FETCH TOTAL COUNT
        const total = await Product.countDocuments({
            category: "Vegetables",
            adminpost: "true"
        });

        // FETCH CURRENT PAGE PRODUCTS
        const veggies = await Product.find({
            category: "Vegetables",
            adminpost: "true"
        })
        .skip(skip)
        .limit(limit)
        .sort({ _id: 1 });

        const totalPages = Math.ceil(total / limit);

        // SEO VALUES
        const canonicalUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
        const keywords = veggies.map(veg => veg.name).join(", ");

        const title = "Buy fresh Vegetables Online in Nigeria| Tomatoes, Peppers & more| Farmgate";
        const description = "Discover and buy fresh vegetables directly from Nigerian farmers. Farmgate Nigeria connects buyers with leafy and fruity vegetables at farm-gate prices.";

        // RENDER PAGE
        res.render("categories/vegetables", { 
            veggies,
            currentPage: page,
            totalPages,
            title,
            description,
            keywords,
            image: "/pics/logo.png",
            canonicalUrl
        });

    } catch (err) {
        console.log(err);
        res.status(500).send("Server error");
    }
});


//floriculture page
router.get("/flowers", async function(req, res){
    try{
                // PAGINATION
        let page = parseInt(req.query.page) || 1;
         // Ensure page is at least 1
        page = Math.max(1, page);
        const limit = 6; // you can change to any number
        const skip = (page - 1) * limit;

        // FETCH TOTAL COUNT
        const total = await Product.countDocuments({
            category: "Seedlings",
            adminpost: "true"
        });

        const totalPages = Math.ceil(total / limit);
        var seedlings = await Product.find({"category": "Seedlings", "adminpost": "true"})
        .skip(skip)
        .limit(limit)
        .sort({ _id: 1 });
        const canonicalUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
        const keywords = seedlings.map(plant => plant.name).join(", ");
        res.render("categories/flowers", {
            seedlings, title: 'Buy Fresh Flowers Online in Nigeria| Rose Bouquets & More', 
            description: "Order fresh, beautiful flowers for delivery across Nigeria. Stunning roses, bouquets for birthdays, aniversaries & weddings.", 
            currentPage: page,
            totalPages,
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
        const description = "List and explore feed ingredients, grains, and specialty agricultural products at competitive farm-gate prices. Connect with buyers nationwide on Farmgate Nigeria.";

        // Render the page
        res.render("categories/food", {
            food,
            title: "Feed Ingredients and Grains for Sale | Farmgate Nigerian Marketplace",
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
// router.get("/chef", async function(req, res){
//     try{
//         var chef = await Product.find({"category": "Chef", "adminpost": "true"});
//         const canonicalUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
//         const keywords = chef.map(ch => ch.name).join(", ");
//         res.render("categories/chef", {chef, title: 'chef', description: "chefs specializing in both local and international cuisines", 
//             keywords,
//             image: "/pics/logo.png", canonicalUrl});
//     }catch(err){
//         console.log(err)
//     }
// });
router.get("/chef", async (req, res) => {
    try {
        // PAGINATION
        let page = parseInt(req.query.page) || 1;
         // Ensure page is at least 1
        page = Math.max(1, page);
        const limit = 6; // you can change to any number
        const skip = (page - 1) * limit;

        // FETCH TOTAL COUNT
        const total = await Product.countDocuments({
            category: "Chef",
            adminpost: "true"
        });

        // FETCH CURRENT PAGE PRODUCTS
        const chef = await Product.find({
            category: "Chef",
            adminpost: "true"
        })
        .skip(skip)
        .limit(limit)
        .sort({ _id: 1 });

        const totalPages = Math.ceil(total / limit);

        // SEO VALUES
        const canonicalUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
        const keywords = chef.map(ch => ch.name).join(", ");

        const title = "Private Chef Services in Nigeria | Personal & Event Chef |Farmgate";
        const description = "Host an unforgettable event with Farmgate's  private chef services. We provide professional chefs for dinners, parties % corporate events in lagos, Abuja & across Nigeria. Book your experience";

        // RENDER PAGE
        res.render("categories/chef", { 
            chef,
            currentPage: page,
            totalPages,
            title,
            description,
            keywords,
            image: "/pics/logo.png",
            canonicalUrl
        });

    } catch (err) {
        console.log(err);
        res.status(500).send("Server error");
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
        // PAGINATION
        let page = parseInt(req.query.page) || 1;
         // Ensure page is at least 1
        page = Math.max(1, page);
        const limit = 6; // you can change to any number
        const skip = (page - 1) * limit;
        // FETCH TOTAL COUNT
        const total = await Product.countDocuments({
            category: "Agricultural talk",
            adminpost: "true"
        });
        const Agricultural_talk = await Product.find({"category": "Agricultural talk", "adminpost": "true"})
        .skip(skip)
        .limit(limit)
        .sort({ _id: 1 });
        const totalPages = Math.ceil(total / limit);
        const canonicalUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
        const keywords = Agricultural_talk.map(blog => blog.name).join(", ");
        res.render("categories/talk", {
            Agricultural_talk, title: 'Agricultural Talk – Engage, Learn & Connect | Farmgate Nigeria', 
            description: "Agricultural Talk, Farmgate Nigeria, livestock management, animal health, petcare Nigeria, feeding formulation, livestock diseases, farm discussion, agricultural forum Nigeria, animal behavior, livestock solutions", 
            keywords,
            totalPages,
            currentPage: page,
            image: "/pics/Agrictalk.jpg",
            canonicalUrl
        });
    }catch(err){
        console.log(err)
    }
});


//privacy policy
router.get("/policy", async function(req, res){
    try{
        const canonicalUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
        res.render("policy", {
            title: 'privacy policy statement | Farmgate Nigeria', 
            description: "privacy policy statement", 
            keywords: "privacy policy",
            image: "/pics/farmequip.jpg",
            canonicalUrl
        });
    }catch(err){
        console.log(err)
    }
});

//terms and conditions
router.get("/terms_and_conditions", async function(req, res){
    try{
        const canonicalUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
        res.render("terms_and_conditions", {
            title: 'terms and conditions | Farmgate Nigeria', 
            description: "farmgate nigeria's terms and conditions", 
            keywords: "terms and conditions",
            image: "/pics/logo.png",
            canonicalUrl
        });
    }catch(err){
        res.redirect("back");
    }
});

//For farmers
router.get("/farmers", async function(req, res){
    try{
        const canonicalUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
        res.render("farmers", {
            title: 'Sell your farm produce directly to verified buyers without relying on middlemen', 
            description: "Reach thousands of active buyers across Nigeria — including food processors, restaurants, retailers, exporters, and animal feed producers.", 
            keywords: "Sellers of commodities at farmgate nigeria",
            image: "/pics/farmequip.jpg",
            canonicalUrl
        });
    }catch(err){
        console.log(err)
    }
});

//For buyers
router.get("/buyers", async function(req, res){
    try{
        const canonicalUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
        res.render("buyers", {
            title: 'Source high-quality agricultural produce directly from verified farmers across Nigeria', 
            description: "Buy in bulk with confidence, knowing every seller on Farmgate is screened and their listings are monitored for accuracy and authenticity.", 
            keywords: "buyers of commodities at farmgate nigeria",
            image: "/pics/farmequip.jpg",
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
router.post("/adminpost/:id", async function (req, res) {
  try {
    const deletePic = await Product.findById(req.params.id);
    if (!deletePic) {
      return res.status(404).json({ message: "Image set not found" });
    }

    // Delete each image from Cloudinary using its public_id
    const deletePromises = deletePic.image.map(img =>
      cloudinary.uploader.destroy(img.public_id)
    );
    await Promise.all(deletePromises);

    await Product.findByIdAndRemove(req.params.id);

    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.redirect("/" + req.params.id);
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
        const category = req.params.category;
        var product = await Product.find({adminpost: true });
        const user = await User.find({});
        const canonicalUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
        const shuffled = product.sort(() => 0.5 - Math.random());
        const featured = shuffled.slice(0, 3);
        res.render("index",{category, featured, product, user, canonicalUrl, image: "/pics/farmequip.jpg"});
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
        const category = req.params.category;
        const regex = new RegExp(req.body.productSearch, "i");
        const products = await Product.find({ name: regex });
        const canonicalUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
        res.render("productsearch", {
            category,
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


// Sitemap route - Production version
router.get('/sitemap.xml', async (req, res) => {
  try {
    res.header('Content-Type', 'application/xml');
    res.header('Content-Encoding', 'gzip');

    // Create sitemap stream
    const smStream = new SitemapStream({ 
      hostname: 'https://www.farmgate.com.ng'
    });

    // Pipe through gzip
    const pipeline = smStream.pipe(createGzip());

    // Static URLs first
    smStream.write({ url: '/', changefreq: 'daily', priority: 1.0 });
    smStream.write({ url: '/livestocks', changefreq: 'weekly', priority: 0.8 });
    smStream.write({ url: '/pets', changefreq: 'weekly', priority: 0.7 });
    smStream.write({ url: '/vegetables', changefreq: 'weekly', priority: 0.7 });
    smStream.write({ url: '/food', changefreq: 'weekly', priority: 0.7 });
    smStream.write({ url: '/farmequips', changefreq: 'weekly', priority: 0.7 });
    smStream.write({ url: '/estate', changefreq: 'weekly', priority: 0.7 });
    smStream.write({ url: '/flowers', changefreq: 'weekly', priority: 0.7 });
    smStream.write({ url: '/talk', changefreq: 'weekly', priority: 0.7 });
    smStream.write({ url: '/buyers', changefreq: 'weekly', priority: 0.7 });
    smStream.write({ url: '/farmers', changefreq: 'weekly', priority: 0.7 });
    smStream.write({ url: '/policy', changefreq: 'weekly', priority: 0.7 });
    smStream.write({ url: '/about', changefreq: 'monthly', priority: 0.5 });
    smStream.write({ url: '/contact', changefreq: 'monthly', priority: 0.5 });
    smStream.write({ url: '/faq', changefreq: 'monthly', priority: 0.5 });

    // Add pagination for categories
    const categories = ['livestocks', 'pets', 'vegetables', 'food', 'farmequips', 'estate', 'flowers', 'talk'];
    const itemsPerPage = 6;
    
    for (const category of categories) {
      try {
        const productCount = await Product.countDocuments({ category: category });
        const totalPages = Math.ceil(productCount / itemsPerPage);
        
        for (let page = 1; page <= Math.min(totalPages, 6); page++) {
          smStream.write({
            url: `/${category}?page=${page}`,
            changefreq: 'daily',
            priority: 0.5
          });
        }
      } catch (err) {
        // Silently continue with other categories
      }
    }

    // Fetch and add product URLs
    try {
      const allProducts = await Product.find({}).select('_id category updatedAt createdAt').lean();
      
      allProducts.forEach(product => {
        smStream.write({
          url: `/${product.category}/${product._id}`,
          lastmod: product.updatedAt || product.createdAt,
          changefreq: 'weekly',
          priority: 0.6
        });
      });
    } catch (err) {
      // Silently continue if products can't be fetched
    }

    // Add user profile URLs
    try {
      const users = await User.find({}).select('_id updatedAt createdAt').lean();
      
      users.forEach(user => {
        smStream.write({
          url: `/user/${user._id}`,
          lastmod: user.updatedAt || user.createdAt,
          changefreq: 'monthly',
          priority: 0.4
        });
      });
    } catch (err) {
      // Silently continue if users can't be fetched
    }

    // End the stream
    smStream.end();

    // Pipe to response
    pipeline.pipe(res);

  } catch (err) {
    // Fallback to simple sitemap on critical error
    res.header('Content-Encoding', 'identity');
    res.send(`<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      <url>
        <loc>https://www.farmgate.com.ng/</loc>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
      </url>
      <url>
        <loc>https://www.farmgate.com.ng/products</loc>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
      </url>
      <url>
        <loc>https://www.farmgate.com.ng/about</loc>
        <changefreq>monthly</changefreq>
        <priority>0.5</priority>
      </url>
    </urlset>`);
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