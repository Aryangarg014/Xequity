const mongoose = require("mongoose");
const UserTokenSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,

    },
    tokens: [
        {
            tokenname: {
                type: String,
                required: true,

                maxlength: [50, 'Token name cannot exceed 50 characters']
            },
            tokenmail: {
                type: String,
                required: true,

            },
            quantity: {
                type: Number,
                default: 0,
                required: true,
                min: [0, 'Quantity cannot be negative'],
                get: v => parseFloat(v.toFixed(8)), // Ensures 8 decimal places when retrieved
                set: v => parseFloat(v.toFixed(8)) // Ensures 8 decimal places when saved
            },
            avgprice: {
                type: Number,
                default: 0,
                min: [0, 'Average price cannot be negative'],
                get: v => parseFloat(v.toFixed(2)) // Ensures 2 decimal places for currency
            },
            createdAt: {
                type: Date,
                default: Date.now
            },
            transactionHash: { type: String }
        }
    ]
}, {
    timestamps: true, // Adds createdAt and updatedAt timestamps
    toJSON: { getters: true }, // Ensures getters are applied when converted to JSON
    toObject: { getters: true } // Ensures getters are applied when converted to objects
});
const UserTokenModel = mongoose.model("UserToken", UserTokenSchema);
module.exports = UserTokenModel;
