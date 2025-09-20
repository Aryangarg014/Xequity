const mongoose = require("mongoose");

const BuyTicketSchema = new mongoose.Schema({
  tokenemail: { type: String, required: true },  // Token creator's email
  name: { type: String, required: true },        // Token name

  Tickets: [
    {
      useremail: { type: String},   // Buyer's email
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
      time: { type: Date, default: Date.now }    // Time when bid was placed
    }
  ]
});

// Compound index (not enforcing uniqueness on Tickets array)
BuyTicketSchema.index(
  { tokenemail: 1,name: 1 },
  { unique: false }
);

const BuyTicketModel = mongoose.model("BuyTicket", BuyTicketSchema);
module.exports = BuyTicketModel;
