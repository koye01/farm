var mongoose = require("mongoose");
var reviewSchema = mongoose.Schema({
  author:{
      id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
        },
      username: String
    },
  message: String,
  rating: { type: Number, min: 1, max: 5 }
});
module.exports = mongoose.model("Review", reviewSchema);