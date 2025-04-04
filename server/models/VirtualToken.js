const mongoose = require("mongoose");

const VirtualTokenSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true }, // Unique key
  TokenName: { type: String, required: true },
  CurrentPrice: { type: String},
  NumberOfIssue: { type:Number, required: true },
  EquityDiluted: { type:Number, required: true },
  image: { type: String }
});

module.exports = mongoose.model("VirtualToken", VirtualTokenSchema);