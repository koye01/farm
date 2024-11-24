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
resetPasswordToken: String,
resetPasswordExpires: Date,
});

userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User", userSchema)