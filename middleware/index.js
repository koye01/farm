var Product = require("../models/produce");
var Comment = require("../models/comment");
var User    = require("../models/user");
var passport = require("../models/user");
middlewareObj = {};

middlewareObj.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }else{
        req.flash("error", "please login first");
        res.redirect("/login")
    }
}

middlewareObj.isOwner = async function(req, res, next){
    try{
var edit =await Product.findById(req.params.id);
    if(req.isAuthenticated()){
        if(edit.author.id.equals(req.user._id) || req.user.isAdmin){
            next();
        }else{
            req.flash("error", "you are not authorized to edit");
            res.redirect("back");
        }
    }else{
        if(!req.isAuthenticated()){
            req.flash("error", "please login first");
            res.redirect("/login");
        }
    }
    }catch(err){
        req.flash("error", err.message);
    }
    
}

middlewareObj.commentOwner = async function(req, res, next){
    try{
        if(req.isAuthenticated()){
            var edit = await Comment.findById(req.params.comment_id);
            if(edit.author.id.equals(req.user._id) || req.user.isAdmin){
                next();
            }else{
                req.flash("error", "you are not authorized to edit")
                res.redirect("back");
            }
        }else{
            req.flash("error", "please login first");
            res.redirect("/login");
        }
    }catch(err){
        req.flash("error", err.message);
    }
}

middlewareObj.replyOwner = async function(req, res, next){
    try{
        if(req.isAuthenticated()){
            var edit = await Comment.findById(req.params.reply_id);
            if(edit.author.id.equals(req.user._id) || req.user.isAdmin){
                next();
            }else{
                req.flash("error", "you are not authorized to edit")
                res.redirect("back");
            }
        }else{
            req.flash("error", "please login first");
            res.redirect("/login");
        }
    }catch(err){
        req.flash("error", err.message);
    }
}

middlewareObj.userAuthor = async function (req, res, next){
    try{
        if(req.isAuthenticated()){
            var self = await User.findById(req.params.id);
            if(self._id.equals(req.user._id) || req.user.isAdmin){
                next();
            }else{
                req.flash("error", "sorry! you are not authorized")
                res.redirect("back");
            }
                
            }else{
                req.flash("error", "you are not authorized");
                res.redirect('back');
            }
            
        
    }catch(err){
        req.flash("error", err.message)
    }
}


module.exports = middlewareObj;