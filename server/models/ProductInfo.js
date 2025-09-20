const mongoose = require("mongoose");

// Define the TeamMember schema (name and position for each team member)
const TeamMemberSchema = new mongoose.Schema({
    name: { type: String, required: true },
    position: { type: String, required: true },
});

// Define the Finance schema (revenue, expenses, year)
const FinanceSchema = new mongoose.Schema({
    revenue: { type: Number, required: false},
    expenses: { type: Number, required: false },
    year: { type: Number, required: false },
});

// Define the ProductInfo schema
const ProductInfoSchema = new mongoose.Schema({
    productName: { type: String, required: true },         // Product name
    description: { type: String, required: true },         // Product description
    tags: { 
        type: [String], 
        required: true, 
        validate: {
            validator: function(tags) {
                return tags.length > 0; // Ensure at least one tag is provided
            },
            message: "At least one tag is required."
        }
    },  
    team: { type: [TeamMemberSchema], required: true },    // Array of team members
    profilePic: { type: String}, // Profile picture for the product


    images: { type: [String] },            // Array of image URLs
    finances: { type: [FinanceSchema], default: [] },      // Array of financial records
        // ✅ NEW FIELD:
    customSections: [
        {
            title: { type: String, required: true },
            description: { type: String, required: true }
        }
    ],
    
    
    email: { type: String, unique: true, required: true },
     // Email of uploader
    upvote: { type: Number, default: 0 },                  // Upvote count
    createdAt: { type: Date, default: Date.now },          // Creation timestamp
});

// Create the ProductInfo model
const ProductInfoModel = mongoose.model("ProductInfo", ProductInfoSchema);

module.exports = ProductInfoModel;
