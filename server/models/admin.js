const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    accountAddress: { type: String, required: true, default: process.env.DEPLOYER_ADDRESS },
    privateKey: { type: String, required: true, default: process.env.ADMIN_PRIVATE_KEY }
});

const Admin = mongoose.model("Admin", adminSchema);

module.exports = Admin;