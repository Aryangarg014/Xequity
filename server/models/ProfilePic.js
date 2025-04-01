const mongoose = require("mongoose");

// Define the ProfilePic schema
const ProfilePicSchema = new mongoose.Schema({
    email: { type: String, unique: true, required: true },
    profilePic: {
        type: String,
        default: "http://localhost:3001/uploads/Investor.jpg"  // Default to Investor.jpg
    },  
});

const ProfilePicModel = mongoose.model("ProfilePic", ProfilePicSchema);

module.exports = ProfilePicModel;
