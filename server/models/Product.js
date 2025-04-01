const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true }, // Unique key
  productName: { type: String, required: true },
  description: { type: String, required: true },
  tags: { type: [String], required: true },
  team: [{ name: String, position: String }],
  images: [{ type: String, required: true }], // Store image URLs
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" }, // Approval system
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Product", ProductSchema);
