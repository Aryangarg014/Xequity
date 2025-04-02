const mongoose = require("mongoose");

const ProfileInfoSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: { type: String, unique: true, required: true }, // Ensure email is unique and required
    mobile: String,
    headline: String,
    type: { type: String, enum: ["company", "investor"], required: true }, // Type field with enum constraint
    experience: [
        {
            companyName: { type: String, required: true },
            role: { type: String, required: true },
            startYear: { type: Number, required: true },
            endYear: { type: Number, required: true },
        },
    ], // Array for multiple experiences
    education: [
        {
            schoolName: { type: String, required: true },
            startYear: { type: Number, required: true },
            endYear: { type: Number, required: true },
            courseName: { type: String, required: true },
        },
    ],
    location: String,
    description: String,
    likes: [
        {
            likecomp: { type: String }
        }
    ],
    likesposts: [
        {
            likecomp: { type: String }
        }
    ],
    comments: [
        {
            postId: String,
            comment: String,
            createdAt: { type: Date, default: Date.now }
        }
    ],
    tags: {
        type: [String], 
        required: true, 
        validate: {
            validator: function(tags) {
                return tags.length > 0; // Ensure at least one tag is provided
            },
            message: "At least one tag is required."
        }
    } // Array of tags, each of type String
});

const ProfileInfoModel = mongoose.model("ProfileInfo", ProfileInfoSchema);

module.exports = ProfileInfoModel;
