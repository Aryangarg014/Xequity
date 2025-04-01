const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
    email: { type: String, required: true }, // User who created the post
    name: { type: String, required: true },  // Name of the poster
    title: { type: String, required: true },
    content: { type: String, required: true },
    upvotes: { type: Number, default: 0 },
    comments: [{
        email: String,
        name: String,
        text: String,
        timestamp: { type: Date, default: Date.now }
    }],
    image: [{ type: String }],
}, { timestamps: true });

const PostModel = mongoose.model("Post", PostSchema);
module.exports = PostModel;
