const mongoose = require("mongoose");

const BuyBidSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true }, // Token Email (unique per token)
  name: { type: String, required: true },                // Token Name
  bids: [
    {
      quantity: { type: Number, required: true, default: 0 },
      price: { type: Number, required: true }
    }
  ]
});

// Optional: automatically sort bids from highest to lowest price (best bid first)
BuyBidSchema.pre("save", function (next) {
  this.bids.sort((a, b) => b.price - a.price); // Higher prices first
  next();
});

const BuyBidModel = mongoose.model("BuyBid", BuyBidSchema);
module.exports = BuyBidModel;
