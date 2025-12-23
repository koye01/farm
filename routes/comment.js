var express = require("express");
var router = express.Router({mergeParams: true});
var Product = require("../models/produce");
var Comment = require("../models/comment");
var User    = require("../models/user");
var Notification = require("../models/notification");
var middleware = require("../middleware/index");


//comment route
router.get("/:category/:id/comment/new", middleware.isLoggedIn, async function(req, res){
    try{
        var category = await Product.find({category: req.params.category});
        var product = await Product.findById(req.params.id);
        const canonicalUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
       res.render("comment/new", {category, product, title: 'new comment', description: "add new comment", 
        keywords: product.name,
        image: product.image, canonicalUrl});
    }catch(err){
        req.flash("error", "failed to communicate with the comment's form");
        res.redirect("back");
    }
});


router.post("/:category/:id/comment", middleware.isLoggedIn, async function(req, res){
    try{
        var product = await Product.findById(req.params.id);
        var commentData = req.body.comment;
        var comment = await Comment.create(commentData);
        comment.author.username = req.user.username;
        comment.author.id = req.user._id;
        comment.save();
        product.comments.push(comment);
        product.save();
        var user = await User.findById(req.user._id).populate('followers').exec();
        var newNotification ={
            comment: {
                username: req.user.username,
                productId: product.id,
            }
            
        }
        var products = product.author.username;
        var userfinder = await User.find({username: products});
        for(var userComment of userfinder){
            var notification = await Notification.create(newNotification);
                userComment.notifications.push(notification);
                userComment.save();
        }
        req.flash("success", "you successfully added your comment")
         res.redirect("/" + req.params.category + "/" + product._id);
    } catch(err) {
    req.flash("error", "Unable to post comment.");
    return res.redirect("back");   // ← THIS FIXES THE INFINITE LOAD
}

});
router.get("/:category/:id/comment/:comment_id/edit", middleware.commentOwner, async function(req, res){
    var category = await Product.find({category: req.params.category});
    var product = await Product.findById(req.params.id);
    var edit = await Comment.findById(req.params.comment_id);
    const canonicalUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
 res.render("comment/edit", {category, product_id:req.params.id, edit, title: 'comment edit mode', description: edit.post, 
    keywords: product.name,
    image: product.image, canonicalUrl, noindex: true});
});

//comment update route
router.put("/:category/:id/comment/:comment_id", middleware.commentOwner, async function(req, res){
    try{
        var product = await Product.findById(req.params.id); // Get the product first
        await Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment);
        req.flash("success", "comment successfully updated");
        res.redirect("/" + req.params.category + "/" + req.params.id + "#comment-" + req.params.comment_id);
    }catch(err){
        req.flash("error", "Failed to update comment");
        res.redirect("back");
    }
});

//comment delete route
router.delete("/:category/:id/comment/:comment_id", middleware.commentOwner, async function(req, res){
    try{
        var removeComment = await Comment.findByIdAndRemove(req.params.comment_id);
        req.flash("error", "comment successfully deleted");
        res.redirect("/" + req.params.id);
    }catch(err){
        req.flash("error", "failed to be deleted");
        res.redirect("back");
    }
});

// Reply to a comment GET route
router.get("/:category/:id/comment/:comment_id/reply", middleware.isLoggedIn, async function(req, res) {
    try {
        var category = await Product.find({category: req.params.category});
        var product = await Product.findById(req.params.id); // Get the product
        var parentComment = await Comment.findById(req.params.comment_id); // Get the comment that will have the reply
        const canonicalUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
        res.render("comment_sub/new", {category, product, parentComment, title: product.name,
            description: parentComment.post, 
            keywords: product.name,
            image: product.image, canonicalUrl}); // Render the reply form
    } catch (err) {
        res.redirect("back");
        req.flash("error", err.message);
    }
});

// Reply to a comment POST route
router.post("/:category/:id/comment/:comment_id/reply", middleware.isLoggedIn, async function(req, res) {
    try {
        var product = await Product.findById(req.params.id); // Get the product
        var parentComment = await Comment.findById(req.params.comment_id); // Get the parent comment
        var replyData = req.body.comment; // Get the reply text from the form

        // Create a new comment for the reply
        var reply = await Comment.create(replyData);
        reply.author.username = req.user.username;
        reply.author.id = req.user._id;
        reply.product = product._id; // Associate the reply with the product
        reply.save(); // Save the reply

        // Add the reply to the parent comment's 'replies' array
        parentComment.replies.push(reply._id); // Add the reply to the parent comment's replies
        await parentComment.save(); // Save the updated parent comment

        // Optionally, send a notification (like in the original comment POST route)
        var notification = {
            reply: {
                username: req.user.username,
                parentCommentId: parentComment.id,
                productId: product._id
            }
        };

        var commentOwner = parentComment.author.username;
        var userfinder = await User.find({username: commentOwner});
        for(var userReply of userfinder){
            var notification = await Notification.create(notification);
            userReply.notifications.push(notification);
            userReply.save();
        }

        req.flash("success", "You successfully replied to the comment"); // Flash success message
        // Add #comment-{id} to scroll to the specific comment
        res.redirect("/" + req.params.category + "/" + product._id + "#comment-" + parentComment._id);
    } catch (err) {
        req.flash("error", "Failed to post reply");
        res.redirect("back");
    }
});

router.get("/:category/:id/comment/:comment_id/reply/:reply_id/edit", middleware.replyOwner, async function(req, res){
    try{
        var category = await Product.find({category: req.params.category});
        var product = await Product.findById(req.params.id); 
        var parentComment = await Comment.findById(req.params.comment_id); 
        var editReply = await Comment.findById(req.params.reply_id);
        const canonicalUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
        res.render("comment_sub/edit", {category, product_id: req.params.id, 
            editReply_id: req.params.reply_id, product, parentComment, editReply, 
            title: 'edit reply mode', description: editReply.post, keywords: product.name,
        image: product.image, canonicalUrl, noindex: true});
    }catch(error){
        req.flash("error", "failed to edit");
        res.redirect("back");
    }
});

// Alternative: Scroll to the updated reply itself
router.put("/:category/:id/comment/:comment_id/reply/:reply_id", middleware.replyOwner, async function(req, res){
    try{
        const replyUpd = await Comment.findByIdAndUpdate(
            req.params.reply_id, 
            req.body.replies,
            { new: true }
        );
        
        const product = await Product.findById(req.params.id);
        
        req.flash("success", "Your response was updated successfully");
        
        // Scroll to the updated reply instead of parent comment
        res.redirect("/" + req.params.category + "/" + product._id + "#reply-" + req.params.reply_id);
        
    } catch(err) {
        req.flash("error", "Failed to update reply");
        res.redirect("back");
    }
});

router.delete("/:category/:id/comment/:comment_id/reply/:reply_id", middleware.replyOwner, async function(req, res){
    try{
        var deleteReply = await Comment.findByIdAndRemove(req.params.reply_id);
        req.flash("success", "your reply was successfully removed");
        res.redirect("/" + req.params.category + "/" + req.params.id)
    }catch(err){
        req.flash("error", err.message);
        res.redirect("back")
    }
})

module.exports = router;