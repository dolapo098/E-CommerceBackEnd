const mongoose = require('mongoose');
const schema = mongoose.Schema({
    Categories:Number,
    Name:String,
    Price:Number
});
module.exports= mongoose.model('createproduct', schema);