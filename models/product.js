const mongoose = require('mongoose');
     
// Schema defines how the user data will be stored in MongoDB
var ProductSchema = new mongoose.Schema({  
    img: { type: String },
    name: { type: String, required: true },
    price:{ type: Number },
    isInCart: { type: Boolean, default: false },
    description: { type: String, required: true },
    age: { type: String, required: true }
});

module.exports = mongoose.model('Product', ProductSchema);  