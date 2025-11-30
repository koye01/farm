var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");
const imageSchema = new mongoose.Schema({
    url: {type: String, required: true},
    imageId: {type: String, required: true}
});
var userSchema = new mongoose.Schema({
    username: {type: String, required: true, unique: true},
    image: [imageSchema],
    password: String,
    email: {type: String, required: true, unique: true},
    fullname: String,
    phone: String,
    description: String,
    isAdmin: {type: Boolean, default: false},
    reviews: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Review'
        }
    ],
    notifications: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Notification"
        }
    ],
    followers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    following: [
        { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'User' 
        }
    ], // Add following field
resetPasswordToken: String,
resetPasswordExpires: Date,
timestamp: { type: Date, default: Date.now },
});

userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User", userSchema)