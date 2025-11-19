var mongoose = require("mongoose");

var notificationSchema = new mongoose.Schema({
    post: {
        username: String,
        productId: String,
    },
    comment: {
        username: String,
        productId: String,
    },
    reply: {
        username: String,
        parentCommentId: String,
        productId: String
    },
    chat: {
        username: String,
        userID: String
    },
    isRead: {
        type: Boolean, default: false
    }
});
module.exports = mongoose.model("Notification", notificationSchema);