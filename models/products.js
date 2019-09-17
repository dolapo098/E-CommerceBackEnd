const mongoose = require("mongoose");
const schema = mongoose.Schema({
  imagePath: {
    type: String,
    required: true
  },
  categories: {
    type: Number,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  }
});

module.exports = mongoose.model("product", schema);
