const mongoose = require("mongoose");

const UnverifiedSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        
    },
    email: {
        type: String,
        required: true,
        
    },
    password: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ["investor", "company"],
        required: true
    },
    pdfFile: {
        type: String, // Store the path of the uploaded PDF file
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" }

});

module.exports = mongoose.model("Unverified", UnverifiedSchema);
