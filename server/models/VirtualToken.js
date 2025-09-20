const mongoose = require("mongoose");




const VirtualTokenSchema = new mongoose.Schema({
  email: { type: String, required: true },
  TokenName: { type: String, required: true },
  CurrentPrice: { type: String, default: "NA" },
  NumberOfIssue: {
    type: Number,
    required: true,
    get: value => parseFloat(Number(value).toFixed(8)), // Convert to number first
    set: value => parseFloat(Number(value).toFixed(8))  // Convert to number first
  },
  EquityDiluted: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    get: value => parseFloat(Number(value).toFixed(4)), // Convert to number first
    set: value => parseFloat(Number(value).toFixed(4))  // Convert to number first
  },
  image: { type: String }
}, {
  toJSON: { getters: true },
  toObject: { getters: true }
});
module.exports = mongoose.model("VirtualToken", VirtualTokenSchema);