const mongoose = require("mongoose");

// Define the PostPic schema
const ProfilePicSchema = new mongoose.Schema({
    email: { type: String, unique: true },
    PostPic: {
        type: String,
    },  
});

const PostPicModel = mongoose.model("PostPic", PostPicSchema);

module.exports = PostPicModel;
