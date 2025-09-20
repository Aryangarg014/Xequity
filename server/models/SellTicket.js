const mongoose = require("mongoose");

const SellTicketSchema = new mongoose.Schema({
  tokenemail: { type: String, required: true }, // Product Email
  name: { type: String, required: true },       // Token Name
  Tickets: [
    {
      useremail: { type: String},  // Seller Email
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
      time: { type: Date, default: Date.now } 
    }
  ]
});

// ✅ Compound index to allow multiple entries but efficiently query per user-token
SellTicketSchema.index(
  { tokenemail: 1, useremail: 1, name: 1 },
  { unique: false }
);

const SellTicketModel = mongoose.model("SellTicket", SellTicketSchema);
module.exports = SellTicketModel;
