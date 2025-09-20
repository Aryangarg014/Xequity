const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true }, // company email
  productName: { type: String, required: true },  // company name
  description: { type: String, required: true },  
  tags: { type: [String], required: true }, // add tags 
  team: [{ name: String, position: String }],  
  profilePic: { type: String, required: true }, // Profile picture for the product
  images: [{ type: String, required: true }], // add multiple images
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" }, // add status as pending
  finances: [
    {
      revenue: { type: Number, required: false},
      expenses: { type: Number, required: false},
      year: { type: Number, required: false }
    }
  ],
  customSections: [                           // Company can multiple heading and the detail of that heading
  {
    title: { type: String, required: true },
    description: { type: String, required: true }
  }
],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Product", ProductSchema);


