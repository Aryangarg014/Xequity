const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    type: { type: String, required: true }, // 'investor' or 'company'
    accountAddress: { type: String, required: true }, // ✅ Ethereum Wallet Address
    privateKey: { type: String, required: true },// ✅ Ethereum Private Key
    upvotedProducts: [String] // Stores product **emails**

});

const UserModel = mongoose.model("user", UserSchema);
module.exports = UserModel;
