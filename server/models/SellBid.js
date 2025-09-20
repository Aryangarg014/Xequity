// const mongoose = require("mongoose");

// const SellBidSchema = new mongoose.Schema({
//   email: { type: String, required: true, unique: true }, // Token Email (unique per token)
//   name: { type: String, required: true },                // Token Name
//   bids: [
//     {
//       quantity: { type: Number, required: true, default: 0 },
//       price: { type: Number, required: true }
//     }
//   ]
// });

// // Optional: sort bids by price ascending automatically when fetching
// SellBidSchema.pre("save", function (next) {
//   this.bids.sort((a, b) => a.price - b.price); // Lower prices first
//   next();
// });

// const SellBidModel = mongoose.model("SellBid", SellBidSchema);
// module.exports = SellBidModel;
const mongoose = require("mongoose");


const SellBidSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true }, // Token Email (unique per token)
  name: { type: String, required: true },                // Token Name
  bids: [
    {
      quantity: { type: Number, required: true, default: 0 },
      price: { type: Number, required: true }
    }
  ]
});


// Optional: sort bids by price ascending automatically when fetching
SellBidSchema.pre("save", function (next) {
  this.bids.sort((a, b) => a.price - b.price); // Lower prices first
  next();
});


const SellBidModel = mongoose.model("SellBid", SellBidSchema);
module.exports = SellBidModel;



