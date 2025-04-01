const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema({
    postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
    email: { type: String, required: true },
    name: { type: String, required: true },
    text: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

const CommentModel = mongoose.model("Comment", CommentSchema);
module.exports = CommentModel;
