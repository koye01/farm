var mongoose = require("mongoose");
var reviewSchema = mongoose.Schema({
  author:{
      id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
        },
      username: String
    },
  message: String
});
module.exports = mongoose.model("Review", reviewSchema);