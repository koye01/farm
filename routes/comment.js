var express = require("express");
var router = express.Router({mergeParams: true});
var Product = require("../models/produce");
var Comment = require("../models/comment");
var User    = require("../models/user");
var Notification = require("../models/notification");
var middleware = require("../middleware/index");


//comment route
router.get("/:id/comment/new", middleware.isLoggedIn, async function(req, res){
    try{
        var product = await Product.findById(req.params.id);
       res.render("comment/new", {product, title: 'new comment'});
    }catch(err){
        console.log(err)
    }
});


router.post("/:id/comment", middleware.isLoggedIn, async function(req, res){
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
        res.redirect("/" + product._id);
    }catch(err){
        console.log(err);
    }
});
router.get("/:id/comment/:comment_id/edit", middleware.commentOwner, async function(req, res){
    var edit = await Comment.findById(req.params.comment_id);
 res.render("comment/edit", {product_id:req.params.id, edit, title: 'comment edit mode'});
});

//comment update route
router.put("/:id/comment/:comment_id", middleware.commentOwner, async function(req, res){
    try{
        var update = await Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment);
        req.flash("success", "comment successfully updated");
        res.redirect("/" + req.params.id);
    }catch(err){
        console.log(err);
    }
});

//comment delete route
router.delete("/:id/comment/:comment_id", middleware.commentOwner, async function(req, res){
    try{
        var removeComment = await Comment.findByIdAndRemove(req.params.comment_id);
        req.flash("error", "comment successfully deleted");
        res.redirect("/" + req.params.id);
    }catch(err){
        console.log(err)
    }
});

// Reply to a comment GET route
router.get("/:id/comment/:comment_id/reply", middleware.isLoggedIn, async function(req, res) {
    try {
        var product = await Product.findById(req.params.id); // Get the product
        var parentComment = await Comment.findById(req.params.comment_id); // Get the comment that will have the reply
        res.render("comment_sub/new", { product, parentComment, title: 'comment reply' }); // Render the reply form
    } catch (err) {
        console.log(err);
        req.flash("error", err.message);
    }
});

// Reply to a comment POST route
router.post("/:id/comment/:comment_id/reply", middleware.isLoggedIn, async function(req, res) {
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
        res.redirect("/" + product._id); // Redirect to the product page
    } catch (err) {
        console.log(err);
    }
});


module.exports = router;