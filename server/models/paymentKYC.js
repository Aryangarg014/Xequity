const mongoose = require("mongoose");

const PaymentKYCSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  accountHolderName: String,
  accountNumber: String,
  ifsc: String,
  accountType: {
    type: String,
    enum: ["Current", "Savings"]
  },
  aadhaarNumber: {
    type: String,
    maxlength: 12,
    minlength:12
  },
  panNumber: {
    type: String,
    maxlength: 10
  }
});

const PaymentKYCModel = mongoose.model("PaymentKYC", PaymentKYCSchema);
module.exports = PaymentKYCModel;
