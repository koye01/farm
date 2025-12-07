var mongoose = require("mongoose");
var commentSchema = mongoose.Schema({
  author:{
      id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
        },
      username: String
    },
  post: String,
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  replies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }], // Array to store replies
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model("Comment", commentSchema);
