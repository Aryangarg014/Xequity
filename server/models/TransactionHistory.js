const mongoose = require("mongoose");
const TransactionHistorySchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,


    },
    transactions: [
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
                min: [0, 'Quantity cannot be negative']
            },
            price: {
                type: Number,
                default: 0,
                min: [0, 'Average price cannot be negative']
            },
            createdAt: {
                type: Date,
                default: Date.now
            },
            transactiontype: {
                type: String,
                reqired: true
            }
        }
    ]
});
const TransactionHistoryModel = mongoose.model("TransactionHistory", TransactionHistorySchema);
module.exports = TransactionHistoryModel;




