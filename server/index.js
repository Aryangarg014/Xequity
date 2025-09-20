require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");

const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { ethers } = require("ethers");
const { Heap } = require("heap-js");

const UserTokenModel = require("./models/UserToken"); // Import the UserToken model
const UserModel = require("./models/User");
const ProfileInfoModel = require("./models/ProfileInfo");
const ProfilePicModel = require("./models/ProfilePic");
// const ProductInfoModel = require("./models/ProductInfo");
const ProductInfoModel = require("./models/ProductInfo"); // adjust path if needed


const PostModel = require("./models/Post")
const AdminModel = require("./models/admin");
const ProductModel = require("./models/Product");  // Import Product.js model
const UnverifiedUser = require("./models/Unverified");  // Adjust path if needed
const VirtualTokenModel = require("./models/VirtualToken");

const BuyBidModel = require("./models/BuyBid");
const SellBidModel = require("./models/SellBid");
const BuyTicketModel = require("./models/BuyTicket");
const SellTicketModel = require("./models/SellTicket");
const MessageModel = require("./models/Message");
const TransactionHistoryModel = require("./models/TransactionHistory");





const OTPModel = require('./models/otp');
const { sendOTP } = require('./config/emailConfig');
const sendMail = require("./utils/sendMail");


const app = express();
app.use(express.json());

const cors = require("cors");
app.use(cors());


// Middleware for serving uploaded profile pictures
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/Xequity", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// File upload configuration with multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/"); // Store uploaded files in the uploads folder
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        } else {
            cb(new Error("Invalid file type. Only images are allowed!"));
        }
    },
});

// File upload configuration for PDFs
const storage1 = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/"); // Store uploaded files in the "uploads" folder
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const upload1 = multer({
    storage: storage1,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === "application/pdf") {
            cb(null, true);
        } else {
            cb(new Error("Invalid file type. Only PDFs are allowed!"));
        }
    },
});


/////////////------------KYC Payment ------------------///////////
const PaymentKYCModel = require('./models/paymentKYC'); // import your model
// Save or update KYC
app.post('/api/payment-kyc', async (req, res) => {
    const { email, accountHolderName, accountNumber, ifsc, accountType, aadhaarNumber, panNumber } = req.body;

    if (!email) return res.status(400).json({ message: "Email is required" });

    try {
        const existing = await PaymentKYCModel.findOne({ email });

        const kycMessage = `
Dear User,

Your KYC details have been ${existing ? 'updated' : 'submitted'} successfully.

Here are your submitted details:
- Account Holder Name: ${accountHolderName}
- Account Number: ${accountNumber}
- IFSC Code: ${ifsc}
- Account Type: ${accountType}
- Aadhaar Number: ${aadhaarNumber}
- PAN Number: ${panNumber}

Thank you,
Team Xequity`;

        if (existing) {
            // Update fields
            existing.accountHolderName = accountHolderName;
            existing.accountNumber = accountNumber;
            existing.ifsc = ifsc;
            existing.accountType = accountType;
            existing.aadhaarNumber = aadhaarNumber;
            existing.panNumber = panNumber;
            await existing.save();

            await sendMail({
                email,
                subject: "Your KYC Details Have Been Updated",
                message: kycMessage,
            });

            return res.json({ message: "KYC updated" });
        }

        await PaymentKYCModel.create(req.body);

        await sendMail({
            email,
            subject: "Your KYC Details Have Been Submitted",
            message: kycMessage,
        });

        res.json({ message: "KYC saved " });

    } catch (err) {
        console.error("KYC save error:", err);
        res.status(500).json({ error: 'Error saving KYC info' });
    }
});


// Get KYC info
app.get('/api/payment-kyc/:email', async (req, res) => {
    try {
        const kyc = await PaymentKYCModel.findOne({ email: req.params.email });
        if (!kyc) return res.status(404).json({ message: "No KYC data" });
        res.json(kyc);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching KYC info' });
    }
});


// Ensure middleware is correctly applied for file uploads
app.post("/register", upload1.single("pdfFile"), async (req, res) => {
    try {
        const { name, email, password, signupType } = req.body;
        const pdfFilePath = req.file ? req.file.path : null;
        console.log(email);
        // Detailed validation
        if (!name || !email || !password || !signupType) {
            return res.status(400).json({
                message: "All fields are required. Please fill in all information."
            });
        }

        if (!pdfFilePath) {
            return res.status(400).json({
                message: "Please upload a PDF file."
            });
        }

        // Check if email is verified in OTP collection
        const otpRecord = await OTPModel.findOne({ email });
        if (!otpRecord) {
            // If OTP record doesn't exist, check if it was recently verified
            const recentlyVerified = await OTPModel.findOne({
                email,
                verified: true,
                createdAt: { $gt: new Date(Date.now() - 5 * 60 * 1000) } // within last 5 minutes
            });

            if (!recentlyVerified) {
                return res.status(400).json({
                    message: "Please verify your email before signing up."
                });
            }
        }

        // Check existing users
        const existingVerifiedUser = await UserModel.findOne({ email });
        if (existingVerifiedUser) {
            return res.status(400).json({
                message: "This email is already registered."
            });
        }

        const existingUnverifiedUser = await UnverifiedUser.findOne({ email });
        if (existingUnverifiedUser) {
            return res.status(400).json({
                message: "Your registration is already under review."
            });
        }

        // Create new unverified user
        const newUser = new UnverifiedUser({
            name,
            email,
            password,
            type: signupType,
            pdfFile: pdfFilePath,
            status: "pending",
        });

        await newUser.save();
        // ✅ Send confirmation email to user
        const subject = "Registration Submitted - Xequity";
        const message = `Dear ${name},\n\nThank you for registering on Xequity.\n\nYour profile has been successfully submitted and is currently under review. You will receive an update regarding the status of your profile within 2-3 working days.\n\nBest regards,\nTeam Xequity;`

        const mailSent = await sendMail(email, subject, message);

        if (!mailSent) {
            console.warn("User registered but confirmation email failed to send.");
        }
        // Delete the OTP record after successful registration
        await OTPModel.deleteOne({ email });

        res.status(200).json({
            status: "Success",
            message: "Your signup request has been submitted for verification."
        });

    } catch (err) {
        console.error("Registration error:", err);
        res.status(500).json({
            message: "An error occurred during registration. Please try again."
        });
    }
});





// Login route
app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await UserModel.findOne({ email });
        if (!user) return res.status(400).json({ status: "Error", message: "Email not registered" });
        if (user.password !== password) return res.status(401).json({ status: "Error", message: "Invalid credentials" });

        // Fetch the user type from ProfileInfo
        const profile = await ProfileInfoModel.findOne({ email });
        const userType = profile ? profile.type : "unknown";

        res.json({ status: "Success", user: { name: user.name, email: user.email, type: userType } });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ status: "Error", message: "Database error" });
    }
});
// Admin login

app.post('/admin/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const admin = await AdminModel.findOne({ email });
        if (!admin) return res.json({ status: "Error", message: "Admin not found" });

        // Directly compare passwords (Plain text)
        if (password !== admin.password) {
            return res.json({ status: "Error", message: "Invalid credentials" });
        }

        res.json({ status: "Success", user: { name: admin.name, email: admin.email, type: "admin" } });
    } catch (error) {
        console.error("Admin Login Error:", error);
        res.status(500).json({ status: "Error", message: "Server error" });
    }
});

// ======================== API to fetch user tokens by email ======================== //



// API to get top 10 sell bids sorted by quantity (highest first)
app.get('/api/sell-bids/:email', async (req, res) => {
    try {
        const { email } = req.params;
        // Find the sell bids document for this company
        const sellBidsDoc = await SellBidModel.findOne({ email });

        // If no document found or no bids array, return empty array
        const sellBids = sellBidsDoc?.bids || [];

        // Sort bids by quantity (descending - highest quantity first)
        // And limit to top 10
        const sortedBids = sellBids
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 10);

        res.status(200).json({
            message: 'Top 10 sell bids by quantity retrieved successfully',
            sellBids: sortedBids
        });
    } catch (error) {
        console.error('Error fetching sell bids:', error);
        res.status(200).json({
            message: 'Error occurred but returning empty array',
            sellBids: []
        });
    }
});

// API to get top 10 buy bids sorted by quantity (highest first)
app.get('/api/buy-bids/:email', async (req, res) => {
    try {
        const { email } = req.params;

        // Find the buy bids document for this company
        const buyBidsDoc = await BuyBidModel.findOne({ email });

        // If no document found or no bids array, return empty array
        const buyBids = buyBidsDoc?.bids || [];

        // Sort bids by quantity (descending - highest quantity first)
        // And limit to top 10
        const sortedBids = buyBids
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 10);

        res.status(200).json({
            message: 'Top 10 buy bids by quantity retrieved successfully',
            buyBids: sortedBids
        });
    } catch (error) {
        console.error('Error fetching buy bids:', error);
        res.status(200).json({
            message: 'Error occurred but returning empty array',
            buyBids: []
        });
    }
});

// Sell and buy order amtch logic



// const resolveMarket = async (tokenemail, tokenname) => {
//     const BuyTicket = await BuyTicketModel.findOne({ tokenemail, name: tokenname });
//     const SellTicket = await SellTicketModel.findOne({ tokenemail, name: tokenname });

//     if (!BuyTicket || !SellTicket) return;

//     // ✅ Max-heap for buy (highest price first)
//     const buyHeap = new Heap((a, b) =>
//         b.price !== a.price ? b.price - a.price : new Date(a.time) - new Date(b.time)
//     );

//     // ✅ Min-heap for sell (lowest price first)
//     const sellHeap = new Heap((a, b) =>
//         a.price !== b.price ? a.price - b.price : new Date(a.time) - new Date(b.time)
//     );

//     // Insert all existing orders into the heaps
//     BuyTicket.Tickets.forEach(ticket => buyHeap.push(ticket));
//     SellTicket.Tickets.forEach(ticket => sellHeap.push(ticket));

//     while (!buyHeap.isEmpty() && !sellHeap.isEmpty()) {
//         const buy = buyHeap.peek();
//         const sell = sellHeap.peek();

//         if (buy.price < sell.price) break;

//         const tradeQty = Math.min(buy.quantity, sell.quantity);
//         const tradePrice = sell.price;
//         const buyerEmail = buy.useremail;
//         const sellerEmail = sell.useremail;

//         // Fetch buyer & seller wallet info
//         const buyerUser = await UserModel.findOne({ email: buyerEmail });
//         const sellerUser = await UserModel.findOne({ email: sellerEmail });

//         if (!buyerUser || !sellerUser) {
//             console.error("❌ Buyer or seller account not found");
//             break; // or continue if you want to skip and try next
//         }
//         // console.log('adf');


//         const provider = new ethers.JsonRpcProvider("http://127.0.0.1:7545");
//         const admin = await UserModel.findOne({ email: 'ks' });
//         if (!admin) {
//             console.error("❌ Admin account not found");
//             return;
//         }
//         const adminWallet = new ethers.Wallet(admin.privateKey, provider);
//         const buyerWallet = new ethers.Wallet(buyerUser.privateKey, provider);
//         const recipientAddress = buyerWallet.address;
//         const sellerWallet = new ethers.Wallet(sellerUser.privateKey, provider);
//         const senderAddress = sellerWallet.address;


//         const ethAmount = ethers.parseEther((tradeQty).toFixed(18));



//         ////////////////////////
//         const value = ethers.parseEther((tradeQty).toString());
//         const gasPrice = await provider.getFeeData().then(data => data.gasPrice || ethers.parseUnits("1", "gwei"));
//         const gasLimit = ethers.toBigInt(21000); // ETH transfer cost
//         const totalCost = value + (gasPrice * gasLimit);


//         const sellerBalance = await provider.getBalance(senderAddress);

//         console.log(`💰 seller Balance: ${ethers.formatEther(sellerBalance)} ETH`);
//         console.log(`🔎 Required total: ${ethers.formatEther(totalCost)} ETH`);

//         if (sellerBalance < totalCost) {
//             console.log("⚠️ Buyer has insufficient ETH. Sending top-up...");

//             const tx = await adminWallet.sendTransaction({
//                 to: senderAddress,
//                 value: totalCost - sellerBalance + ethers.parseEther("0.01"), // send a bit extra
//                 gasLimit,
//                 gasPrice,
//             });

//             await tx.wait();
//             console.log(`✅ Sent ETH to buyer: ${tx.hash}`);
//         } else {
//             console.log("✅ seller already has enough ETH");
//         }
//         console.log("👤 Seller:", sellerUser.accountAddress);



//         try {
//             const tx = await sellerWallet.sendTransaction({
//                 to: recipientAddress,
//                 value: ethAmount,
//                 gasLimit: 100000
//             });
//             const receipt = await tx.wait();
//             console.log(`✅ Blockchain Tx Success: ${receipt.hash}`);
//         } catch (err) {
//             console.error("❌ Blockchain transfer failed:", err);
//             break;
//         }


//         const buyerDoc = await UserTokenModel.findOne({ email: buyerEmail });
//         const buyerToken = buyerDoc?.tokens?.find(t => t.tokenname === tokenname);

//         if (buyerToken) {
//             const oldQty = buyerToken.quantity;
//             const oldAvg = buyerToken.avgprice;

//             const newQty = oldQty + tradeQty;
//             const newAvg = ((oldQty * oldAvg) + (tradeQty * tradePrice)) / newQty;

//             await UserTokenModel.updateOne(
//                 { email: buyerEmail, "tokens.tokenname": tokenname },
//                 {
//                     $set: { "tokens.$.avgprice": newAvg },
//                     $inc: { "tokens.$.quantity": tradeQty }
//                 }
//             );
//         } else {
//             await UserTokenModel.updateOne(
//                 { email: buyerEmail },
//                 {
//                     $push: {
//                         tokens: {
//                             tokenname: tokenname,
//                             tokenmail: tokenemail,
//                             quantity: tradeQty,
//                             avgprice: tradePrice
//                         }
//                     }
//                 },
//                 { upsert: true }
//             );
//         }

//         // ✅ Reduce seller's tokens
//         await UserTokenModel.updateOne(
//             { email: sellerEmail, "tokens.tokenname": tokenname },
//             {
//                 $inc: { "tokens.$.quantity": -tradeQty }
//             }
//         );

//         // ✅ Adjust order book
//         buy.quantity -= tradeQty;
//         sell.quantity -= tradeQty;

//         await VirtualTokenModel.findOneAndUpdate(
//             { email: tokenemail, TokenName: tokenname },
//             { $set: { CurrentPrice: tradePrice.toString() } }
//         );

//         buyHeap.pop();
//         if (buy.quantity > 0) buyHeap.push(buy);

//         sellHeap.pop();
//         if (sell.quantity > 0) sellHeap.push(sell);
//     }
//     // Save updated orders
//     const remainingBuy = [];
//     const remainingSell = [];
//     while (!buyHeap.isEmpty()) remainingBuy.push(buyHeap.pop());
//     while (!sellHeap.isEmpty()) remainingSell.push(sellHeap.pop());

//     BuyTicket.Tickets = remainingBuy;
//     SellTicket.Tickets = remainingSell;

//     await BuyTicket.save();
//     await SellTicket.save();
// };


const resolveMarket = async (tokenemail, tokenname) => {
    const BuyTicket = await BuyTicketModel.findOne({ tokenemail, name: tokenname });
    const SellTicket = await SellTicketModel.findOne({ tokenemail, name: tokenname });


    if (!BuyTicket || !SellTicket) return;


    // ✅ Max-heap for buy (highest price first)
    const buyHeap = new Heap((a, b) =>
        b.price !== a.price ? b.price - a.price : new Date(a.time) - new Date(b.time)
    );


    // ✅ Min-heap for sell (lowest price first)
    const sellHeap = new Heap((a, b) =>
        a.price !== b.price ? a.price - b.price : new Date(a.time) - new Date(b.time)
    );


    // Insert all existing orders into the heaps
    BuyTicket.Tickets.forEach(ticket => buyHeap.push(ticket));
    SellTicket.Tickets.forEach(ticket => sellHeap.push(ticket));


    while (!buyHeap.isEmpty() && !sellHeap.isEmpty()) {
        const buy = buyHeap.peek();
        const sell = sellHeap.peek();


        if (buy.price < sell.price) break;


        const tradeQty = Math.min(buy.quantity, sell.quantity);
        const tradePrice = sell.price;
        const buyerEmail = buy.useremail;
        const sellerEmail = sell.useremail;
        const sellprice = sell.price;
        const buyprice = buy.price;
        const buyBidDoc = await BuyBidModel.findOne({ email: tokenemail, name: tokenname });
        if (buyBidDoc) {
            const bid = buyBidDoc.bids.find(b => b.price === buyprice);
            if (bid) {
                bid.quantity -= tradeQty;


                if (bid.quantity <= 0) {
                    // Remove this bid entirely
                    buyBidDoc.bids = buyBidDoc.bids.filter(b => b.price !== buyprice);
                }


                await buyBidDoc.save(); // Will also trigger your sorting hook
            }
        }


        const sellBidDoc = await SellBidModel.findOne({ email: tokenemail, name: tokenname });
        if (sellBidDoc) {
            const bid = sellBidDoc.bids.find(b => b.price === sellprice);
            if (bid) {
                bid.quantity -= tradeQty;


                if (bid.quantity <= 0) {
                    // Remove this bid entirely
                    sellBidDoc.bids = sellBidDoc.bids.filter(b => b.price !== sellprice);
                }


                await sellBidDoc.save(); // Will also trigger your sorting hook
            }
        }
        // Fetch buyer & seller wallet info
        const buyerUser = await UserModel.findOne({ email: buyerEmail });
        const sellerUser = await UserModel.findOne({ email: sellerEmail });


        if (!buyerUser || !sellerUser) {
            console.error("Buyer or seller account not found");
            break; // or continue if you want to skip and try next
        }
        // console.log('adf');




        const provider = new ethers.JsonRpcProvider("http://127.0.0.1:7545");
        const admin = await UserModel.findOne({ email: 'ks' });
        if (!admin) {
            console.error("Admin account not found");
            return;
        }
        const adminWallet = new ethers.Wallet(admin.privateKey, provider);
        const buyerWallet = new ethers.Wallet(buyerUser.privateKey, provider);
        const recipientAddress = buyerWallet.address;
        const sellerWallet = new ethers.Wallet(sellerUser.privateKey, provider);
        const senderAddress = sellerWallet.address;




        const ethAmount = ethers.parseEther((tradeQty).toFixed(18));






        ////////////////////////
        const value = ethers.parseEther((tradeQty).toString());
        const gasPrice = await provider.getFeeData().then(data => data.gasPrice || ethers.parseUnits("1", "gwei"));
        const gasLimit = ethers.toBigInt(21000); // ETH transfer cost
        const totalCost = value + (gasPrice * gasLimit);




        const sellerBalance = await provider.getBalance(senderAddress);


        console.log(`seller Balance: ${ethers.formatEther(sellerBalance)} ETH`);
        console.log(`Required total: ${ethers.formatEther(totalCost)} ETH`);


        if (sellerBalance < totalCost) {
            console.log("Buyer has insufficient ETH. Sending top-up...");


            const tx = await adminWallet.sendTransaction({
                to: senderAddress,
                value: totalCost - sellerBalance + ethers.parseEther("0.01"), // send a bit extra
                gasLimit,
                gasPrice,
            });


            await tx.wait();
            console.log(`Sent ETH to buyer: ${tx.hash}`);
        } else {
            console.log("seller already has enough ETH");
        }
        console.log("👤 Seller:", sellerUser.accountAddress);






        try {
            const tx = await sellerWallet.sendTransaction({
                to: recipientAddress,
                value: ethAmount,
                gasLimit: 100000
            });
            const receipt = await tx.wait();
            console.log(`Blockchain Tx Success: ${receipt.hash}`);
        } catch (err) {
            console.error("Blockchain transfer failed:", err);
            break;
        }




        const buyerDoc = await UserTokenModel.findOne({ email: buyerEmail });
        const buyerToken = buyerDoc?.tokens?.find(t => t.tokenname === tokenname);


        if (buyerToken) {
            const oldQty = buyerToken.quantity;
            const oldAvg = buyerToken.avgprice;


            const newQty = oldQty + tradeQty;
            const newAvg = ((oldQty * oldAvg) + (tradeQty * tradePrice)) / newQty;


            await UserTokenModel.updateOne(
                { email: buyerEmail, "tokens.tokenname": tokenname },
                {
                    $set: { "tokens.$.avgprice": newAvg },
                    $inc: { "tokens.$.quantity": tradeQty }
                }
            );
        } else {
            await UserTokenModel.updateOne(
                { email: buyerEmail },
                {
                    $push: {
                        tokens: {
                            tokenname: tokenname,
                            tokenmail: tokenemail,
                            quantity: tradeQty,
                            avgprice: tradePrice
                        }
                    }
                },
                { upsert: true }
            );
        }


        // Reduce seller's tokens
        await UserTokenModel.updateOne(
            { email: sellerEmail, "tokens.tokenname": tokenname },
            {
                $inc: { "tokens.$.quantity": -tradeQty }
            }
        );
        // Addon for transaction history
        const transactionRecord = {
            tokenname: tokenname,
            tokenmail: tokenemail,
            quantity: tradeQty,
            price: tradePrice,
            createdAt: new Date(),
            transactiontype: "buy" // for buyer
        };


        await TransactionHistoryModel.updateOne(
            { email: buyerEmail },
            { $push: { transactions: transactionRecord } },
            { upsert: true }
        );


        const sellTransactionRecord = {
            tokenname: tokenname,
            tokenmail: tokenemail,
            quantity: tradeQty,
            price: tradePrice,
            createdAt: new Date(),
            transactiontype: "sell" // for seller
        };


        await TransactionHistoryModel.updateOne(
            { email: sellerEmail },
            { $push: { transactions: sellTransactionRecord } },
            { upsert: true }
        );


        // Adjust order book
        buy.quantity -= tradeQty;
        sell.quantity -= tradeQty;


        await VirtualTokenModel.findOneAndUpdate(
            { email: tokenemail, TokenName: tokenname },
            { $set: { CurrentPrice: tradePrice.toString() } }
        );


        buyHeap.pop();
        if (buy.quantity > 0) buyHeap.push(buy);


        sellHeap.pop();
        if (sell.quantity > 0) sellHeap.push(sell);
    }
    // Save updated orders
    const remainingBuy = [];
    const remainingSell = [];
    while (!buyHeap.isEmpty()) remainingBuy.push(buyHeap.pop());
    while (!sellHeap.isEmpty()) remainingSell.push(sellHeap.pop());


    BuyTicket.Tickets = remainingBuy;
    SellTicket.Tickets = remainingSell;


    await BuyTicket.save();
    await SellTicket.save();
};



app.delete("/api/cancel-sell-ticket", async (req, res) => {
    console.log("hi")
    const { useremail, tokenemail, tokenname, time, quantity, price } = req.body;

    const qty = Number(quantity);


    if (isNaN(qty) || qty <= 0) {
        return res.status(400).json({ message: "Invalid quantity" });
    }


    try {
        const ticket = await SellTicketModel.findOneAndUpdate(
            { tokenemail, name: tokenname },
            { $pull: { Tickets: { useremail, time: new Date(time) } } },
            { new: true }
        );


        if (!ticket) {
            return res.status(404).json({ message: "Sell ticket not found" });
        }


        let userToken = await UserTokenModel.findOne({ email: useremail });


        if (!userToken) {
            userToken = new UserTokenModel({
                email: useremail,
                tokens: [{
                    tokenname: tokenname,
                    tokenmail: tokenemail,
                    quantity: qty,
                    avgprice: 0,
                }]
            });
        } else {
            const tokenIndex = userToken.tokens.findIndex(
                (t) => t.tokenname === tokenname && t.tokenmail === tokenemail
            );


            if (tokenIndex !== -1) {
                userToken.tokens[tokenIndex].quantity += qty;
            } else {
                userToken.tokens.push({
                    tokenname: tokenname,
                    tokenmail: tokenemail,
                    quantity: qty,
                    avgprice: 0
                });
            }
        }


        await userToken.save();
        // Step 3: Update BuyBidModel
        const sellBidDoc = await SellBidModel.findOne({ email: tokenemail, name: tokenname });


        if (sellBidDoc) {
            const bid = sellBidDoc.bids.find(b => b.price === price);


            if (bid) {
                bid.quantity -= quantity;


                if (bid.quantity <= 0) {
                    // Remove this bid entirely
                    sellBidDoc.bids = sellBidDoc.bids.filter(b => b.price !== price);
                }


                await sellBidDoc.save(); // Will also trigger your sorting hook
            }
        }
        res.status(200).json({
            message: "Sell ticket cancelled and user tokens updated",
            ticket,
            userToken
        });
    } catch (error) {
        console.error("Error cancelling sell ticket:", error);
        res.status(500).json({ message: "Server error while cancelling sell ticket" });
    }
});



// app.post("/buy-token", async (req, res) => {
//     const { email, tokenemail, tokenname, quantity, price } = req.body;
//     console.log(email);
//     try {
//         const newTicket = {
//             useremail: email, // ✅ correct key for schema
//             quantity,
//             price,
//             time: new Date()
//         };

//         // Check if BuyTicket doc already exists
//         let ticketDoc = await BuyTicketModel.findOne({
//             tokenemail,
//             name: tokenname
//         });

//         if (ticketDoc) {
//             ticketDoc.Tickets.push(newTicket);
//             await ticketDoc.save();
//         } else {
//             ticketDoc = new BuyTicketModel({
//                 tokenemail,
//                 name: tokenname,
//                 Tickets: [newTicket] // ✅ correct field name used
//             });
//             await ticketDoc.save();
//         }
//         await resolveMarket(tokenemail, tokenname);
//         res.status(200).json({ message: "Buy ticket placed successfully", ticket: ticketDoc });
//     } catch (error) {
//         console.error("Error placing buy ticket:", error);
//         res.status(500).json({ message: "Server error while placing buy ticket" });
//     }
// });

app.post("/buy-token", async (req, res) => {
    const { email, tokenemail, tokenname, quantity, price } = req.body;
    console.log(email);
    try {
        const newTicket = {
            useremail: email, // ✅ correct key for schema
            quantity,
            price,
            time: new Date()
        };


        // Check if BuyTicket doc already exists
        let ticketDoc = await BuyTicketModel.findOne({
            tokenemail,
            name: tokenname
        });


        if (ticketDoc) {
            ticketDoc.Tickets.push(newTicket);
            await ticketDoc.save();
        } else {
            ticketDoc = new BuyTicketModel({
                tokenemail,
                name: tokenname,
                Tickets: [newTicket] // ✅ correct field name used
            });
            await ticketDoc.save();
        }


        // ✅ Update BuyBidModel
        const buyBidDoc = await BuyBidModel.findOne({ email: tokenemail, name: tokenname });


        if (buyBidDoc) {
            // Check if bid at this price exists
            const existingBid = buyBidDoc.bids.find(b => b.price === price);
            if (existingBid) {
                existingBid.quantity += quantity;
            } else {
                buyBidDoc.bids.push({ quantity, price });
            }
            // Will trigger pre-save hook to sort bids
            await buyBidDoc.save();
        } else {
            const newBidDoc = new BuyBidModel({
                email: tokenemail,
                name: tokenname,
                bids: [{ quantity, price }]
            });
            await newBidDoc.save();
        }


        await resolveMarket(tokenemail, tokenname);
        res.status(200).json({ message: "Buy ticket placed successfully", ticket: ticketDoc });
    } catch (error) {
        console.error("Error placing buy ticket:", error);
        res.status(500).json({ message: "Server error while placing buy ticket" });
    }
});








// app.post("/sell-token", async (req, res) => {
//     const { email, tokenemail, tokenname, quantity, price } = req.body;
//     console.log("Incoming Sell Request:", req.body);

//     try {
//         const userTokenDoc = await UserTokenModel.findOne({ email });
//         console.log(email);
//         if (!userTokenDoc) {

//             return res.status(404).json({ message: "User tokens not found" });
//         }

//         const tokenIndex = userTokenDoc.tokens.findIndex(
//             (t) => t.tokenname === tokenname && t.tokenmail === tokenemail
//         );


//         if (tokenIndex === -1) {
//             return res.status(400).json({ message: "User doesn't own this token" });
//         }

//         const userToken = userTokenDoc.tokens[tokenIndex];

//         if (userToken.quantity < quantity) {

//             return res.status(400).json({ message: "Insufficient token quantity" });
//         }

//         userToken.quantity -= quantity;
//         await userTokenDoc.save();


//         let ticketDoc = await SellTicketModel.findOne({
//             tokenemail,
//             name: tokenname
//         });

//         const newTicket = {
//             useremail: email,
//             quantity,
//             price,
//             time: new Date()
//         };

//         if (ticketDoc) {
//             ticketDoc.Tickets.push(newTicket);
//             await ticketDoc.save();
//             console.log("Sell ticket updated");
//         } else {
//             ticketDoc = new SellTicketModel({
//                 tokenemail,
//                 name: tokenname,
//                 Tickets: [newTicket]
//             });
//             await ticketDoc.save();

//             await resolveMarket(tokenemail, tokenname);

//             console.log("Sell ticket created");
//         }

//         return res.status(200).json({ message: "Sell ticket placed", ticket: ticketDoc });
//     } catch (error) {
//         console.error("Error in /sell-token:", error);
//         return res.status(500).json({ message: "Server error", error: error.message });
//     }
// });

app.post("/sell-token", async (req, res) => {
    const { email, tokenemail, tokenname, quantity, price } = req.body;
    console.log("Incoming Sell Request:", req.body);


    try {
        const userTokenDoc = await UserTokenModel.findOne({ email });
        console.log(email);
        if (!userTokenDoc) {


            return res.status(404).json({ message: "User tokens not found" });
        }


        const tokenIndex = userTokenDoc.tokens.findIndex(
            (t) => t.tokenname === tokenname && t.tokenmail === tokenemail
        );




        if (tokenIndex === -1) {
            return res.status(400).json({ message: "User doesn't own this token" });
        }


        const userToken = userTokenDoc.tokens[tokenIndex];


        if (userToken.quantity < quantity) {


            return res.status(400).json({ message: "Insufficient token quantity" });
        }


        userToken.quantity -= quantity;
        await userTokenDoc.save();




        let ticketDoc = await SellTicketModel.findOne({
            tokenemail,
            name: tokenname
        });


        const newTicket = {
            useremail: email,
            quantity,
            price,
            time: new Date()
        };


        if (ticketDoc) {
            ticketDoc.Tickets.push(newTicket);
            await ticketDoc.save();
            console.log("Sell ticket updated");
        } else {
            ticketDoc = new SellTicketModel({
                tokenemail,
                name: tokenname,
                Tickets: [newTicket]
            });
            await ticketDoc.save();


            console.log("Sell ticket created");
        }


        // ✅ Update SellBidModel
        const sellBidDoc = await SellBidModel.findOne({ email: tokenemail, name: tokenname });


        if (sellBidDoc) {
            // Check if bid at this price exists
            const existingBid = sellBidDoc.bids.find(b => b.price === price);
            if (existingBid) {
                existingBid.quantity += quantity;
            } else {
                sellBidDoc.bids.push({ quantity, price });
            }
            // Will trigger pre-save hook to sort bids
            await sellBidDoc.save();
        } else {
            const newBidDoc = new SellBidModel({
                email: tokenemail,
                name: tokenname,
                bids: [{ quantity, price }]
            });
            await newBidDoc.save();
        }
        await resolveMarket(tokenemail, tokenname);


        return res.status(200).json({ message: "Sell ticket placed", ticket: ticketDoc });
    } catch (error) {
        console.error("Error in /sell-token:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
});





// Get all BUY tickets of a user for a specific token
app.get("/api/user-buy-tickets", async (req, res) => {
    const { useremail, tokenemail, tokenname } = req.query;

    try {
        const buyTicket = await BuyTicketModel.findOne({ tokenemail, name: tokenname });
        if (!buyTicket) return res.json({ tickets: [] });

        const userTickets = buyTicket.Tickets.filter(t => t.useremail === useremail);
        res.json({ tickets: userTickets });
    } catch (err) {
        console.error("Error fetching user buy tickets:", err);
        res.status(500).json({ error: "Failed to fetch buy tickets" });
    }
});

// Get all SELL tickets of a user for a specific token
app.get("/api/user-sell-tickets", async (req, res) => {
    const { useremail, tokenemail, tokenname } = req.query;

    try {
        const sellTicket = await SellTicketModel.findOne({ tokenemail, name: tokenname });
        if (!sellTicket) return res.json({ tickets: [] });

        const userTickets = sellTicket.Tickets.filter(t => t.useremail === useremail);
        res.json({ tickets: userTickets });
    } catch (err) {
        console.error("Error fetching user sell tickets:", err);
        res.status(500).json({ error: "Failed to fetch sell tickets" });
    }
});
// Cancel Buy Ticket

// app.delete("/api/cancel-buy-ticket", async (req, res) => {
//     const { useremail, tokenemail, tokenname, time } = req.body;

//     try {
//         const ticket = await BuyTicketModel.findOneAndUpdate(
//             { tokenemail, name: tokenname },
//             { $pull: { Tickets: { useremail, time: new Date(time) } } },
//             { new: true }
//         );

//         if (!ticket) {
//             return res.status(404).json({ message: "Buy ticket not found" });
//         }

//         res.status(200).json({ message: "Buy ticket cancelled successfully", ticket });
//     } catch (error) {
//         console.error("Error cancelling buy ticket:", error);
//         res.status(500).json({ message: "Server error while cancelling buy ticket" });
//     }
// });

app.delete("/api/cancel-buy-ticket", async (req, res) => {
    const { useremail, tokenemail, tokenname, time, price, quantity } = req.body;


    try {
        const ticket = await BuyTicketModel.findOneAndUpdate(
            { tokenemail, name: tokenname },
            { $pull: { Tickets: { useremail, time: new Date(time) } } },
            { new: true }
        );


        if (!ticket) {
            return res.status(404).json({ message: "Buy ticket not found" });
        }
        console.log(price)
        console.log(quantity)
        // Update BuyBidModel
        const buyBidDoc = await BuyBidModel.findOne({ email: tokenemail, name: tokenname });
        if (buyBidDoc) {
            const bid = buyBidDoc.bids.find(b => b.price === price);


            if (bid) {
                bid.quantity -= quantity;


                if (bid.quantity <= 0) {
                    // Remove this bid entirely
                    buyBidDoc.bids = buyBidDoc.bids.filter(b => b.price !== price);
                }


                await buyBidDoc.save(); // Will also trigger your sorting hook
            }
        }
        res.status(200).json({ message: "Buy ticket cancelled successfully", ticket });
    } catch (error) {
        console.error("Error cancelling buy ticket:", error);
        res.status(500).json({ message: "Server error while cancelling buy ticket" });
    }
});





app.get("/api/user-tokens/:email", async (req, res) => {
    try {
        const { email } = req.params;
        const userTokens = await UserTokenModel.findOne({ email });

        if (!userTokens) {
            return res.status(404).json({ message: "User tokens not found" });
        }

        res.json(userTokens.tokens); // Return only the tokens array
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

app.get("/api/virtual-assets", async (req, res) => {
    try {
        const assets = await VirtualTokenModel.find();
        res.json(assets);
    } catch (error) {
        console.error("Error fetching virtual assets:", error.message); // Log error message
        res.status(500).json({ error: error.message }); // Send actual error message
    }
});


// Exchange's matching engine.


app.get("/api/virtual-assets-with-product/:email", async (req, res) => {
    const { email } = req.params;

    try {
        const tokenData = await VirtualTokenModel.findOne({ email });
        const productData = await ProductInfoModel.findOne({ email });

        if (!tokenData) {
            return res.status(404).json({ message: "Token not found" });
        }

        if (!productData) {
            return res.status(404).json({ message: "Product info not found" });
        }

        res.json({ token: tokenData, product: productData });
    } catch (error) {
        console.error("Error fetching token and product data:", error);
        res.status(500).json({ message: "Server error" });
    }
});




// ======================== COMMUNITY FORUM ======================== //

// ======================== COMMUNITY FORUM ======================== //






// Fetch all posts
app.get("/posts", async (req, res) => {
    try {
        const posts = await PostModel.find().sort({ createdAt: -1 });
        res.json({ status: "Success", posts }); // Make sure frontend expects { posts: [...] }
    } catch (error) {
        console.error("Error in fetching posts :", error);  // <-- Logs the actual error
        res.status(500).json({ status: "Error", message: error.message });
    }
});




// Upvote a post
app.get("/posts/:postid/:usermail", async (req, res) => {
    const { postid, usermail } = req.params;


    try {
        // Find the user in ProfileInfoModel
        let user = await ProfileInfoModel.findOne({ email: usermail });


        if (!user) {
            return res.status(404).json({ status: "Error", message: `User not found: ${usermail}` });
        }


        // Ensure the likesposts field is initialized
        if (!user.likesposts) {
            user.likesposts = [];
        }


        // Check if the user has already liked the post
        const alreadyLiked = user.likesposts.some((post) => post.likecomp === postid);
        let count = 0;


        if (!alreadyLiked) {
            // Add the post to the user's likedposts
            user.likesposts.push({ likecomp: postid });
            await user.save();


            // Increment the upvote count in the PostModel
            const post = await PostModel.findById(postid);
            if (!post) {
                return res.status(404).json({ status: "Error", message: "Post not found" });
            }


            post.upvotes += 1;
            count = post.upvotes;
            await post.save();


            return res.status(200).json({ status: "Success", message: "Upvoted successfully", count });
        } else {
            // Remove the like
            user.likesposts = user.likesposts.filter((post) => post.likecomp !== postid);
            await user.save();


            // Decrement the upvote count in the PostModel
            const post = await PostModel.findById(postid);
            if (!post) {
                return res.status(404).json({ status: "Error", message: "Post not found" });
            }


            post.upvotes -= 1;
            count = post.upvotes;
            await post.save();


            return res.status(200).json({ status: "Success", message: "Upvote removed", count });
        }
    } catch (error) {
        console.error("Error updating upvotes:", error);
        res.status(500).json({ status: "Error", message: "Server Error" });
    }
});


// Add a comment to a post
app.post("/posts/:id/comment", async (req, res) => {
    const { id } = req.params;
    const { email, text } = req.body;


    if (!email || !text) {
        return res.status(400).json({ status: "Error", message: "Email and comment text are required" });
    }


    try {
        // Fetch user details to get the name
        const user = await ProfileInfoModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ status: "Error", message: "User not found" });
        }


        // Find post and update comments
        const post = await PostModel.findByIdAndUpdate(
            id,
            { $push: { comments: { email, name: user.firstName, text } } },  // Store name
            { new: true }
        );


        if (!post) {
            return res.status(404).json({ status: "Error", message: "Post not found" });
        }


        res.status(201).json({ status: "Success", post });
    } catch (error) {
        console.error("Error adding comment:", error);
        res.status(500).json({ status: "Error", message: "Failed to add comment" });
    }
});




// Fetch all comments for a specific post
app.get("/posts/:id/comments", async (req, res) => {
    try {
        const post = await PostModel.findById(req.params.id).select("comments");
        if (!post) {
            return res.status(404).json({ status: "Error", message: "Post not found" });
        }
        res.json({ status: "Success", comments: post.comments });
    } catch (error) {
        console.error("Error fetching comments:", error);
        res.status(500).json({ status: "Error", message: "Failed to fetch comments" });
    }
});


// Make a post
// Create a new post with optional image upload
app.post("/create-post", upload.array("images"), async (req, res) => {
    try {
        const { email, title, content, name } = req.body;


        if (!email || !title || !content) {
            return res.status(400).json({ status: "Error", message: "Email, title, and content are required." });
        }


        // Fetch the user's name from ProfileInfo
        const user = await ProfileInfoModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ status: "Error", message: "User not found" });
        }


        const imagePaths = req.files?.map(file => `http://localhost:3001/uploads/${file.filename}`) || [];


        // Use firstName, fallback to name if missing
        const posterName = user.firstName || name;


        const newPost = new PostModel({
            email,
            name: posterName,
            title,
            content,
            image: imagePaths,
        });


        await newPost.save();


        res.status(201).json({ status: "Success", message: "Post created successfully", post: newPost });
    } catch (error) {
        console.error("Error creating post:", error);
        res.status(500).json({ status: "Error", message: "Failed to create post" });
    }
});








// Fetch posts created by the logged-in user
app.get("/myposts/:email", async (req, res) => {
    const { email } = req.params;
    try {
        const posts = await PostModel.find({ email }).sort({ createdAt: -1 });
        res.json({ status: "Success", posts });
    } catch (error) {
        console.error("Error fetching user posts:", error);
        res.status(500).json({ error: "Error fetching user posts" });
    }
});


// Fetch posts where the user has commented
app.get("/mycomments/:email", async (req, res) => {
    const { email } = req.params;
    try {
        // Fetch all posts where the user has commented
        const posts = await PostModel.find({ "comments.email": email });


        // Filter comments for each post to include only the user's comments
        const postsWithUserComments = posts.map(post => {
            const userComments = post.comments.filter(comment => comment.email === email);
            return { ...post.toObject(), comments: userComments };
        });


        res.json({ status: "Success", posts: postsWithUserComments });
    } catch (error) {
        console.error("Error fetching commented posts:", error);
        res.status(500).json({ error: "Error fetching commented posts" });
    }
});


// Fetch posts upvoted by the user
app.get("/myupvotes/:email", async (req, res) => {
    const { email } = req.params;
    try {
        const profile = await ProfileInfoModel.findOne({ email });
        if (!profile) return res.status(404).json({ error: "User profile not found" });


        const postIds = profile.likesposts.map(post => post.likecomp);
        const posts = await PostModel.find({ _id: { $in: postIds } });
        res.json({ status: "Success", posts });
    } catch (error) {
        console.error("Error fetching upvoted posts:", error);
        res.status(500).json({ error: "Error fetching upvoted posts" });
    }
});


// Delete a post and its associated comments and upvotes
app.delete("/post/:id", async (req, res) => {
    const { id } = req.params;
    try {
        // Fetch the post to ensure it exists
        const post = await PostModel.findById(id);
        if (!post) {
            return res.status(404).json({ status: "Error", message: "Post not found" });
        }


        // Remove all comments for the post from each user's profile
        await ProfileInfoModel.updateMany(
            { "comments.postId": id },
            { $pull: { comments: { postId: id } } }
        );


        // Remove the post from all users' likedposts
        await ProfileInfoModel.updateMany(
            { "likesposts.likecomp": id },
            { $pull: { likesposts: { likecomp: id } } }
        );


        // Delete the post itself
        await PostModel.findByIdAndDelete(id);


        res.json({ status: "Success", message: "Post and associated data deleted successfully" });
    } catch (error) {
        console.error("Error deleting post:", error);
        res.status(500).json({ error: "Error deleting post" });
    }
});


// Delete a specific comment
app.delete("/comment/:postId/:commentId", async (req, res) => {
    const { postId, commentId } = req.params;
    try {
        // Remove the comment from the PostModel
        const post = await PostModel.findByIdAndUpdate(
            postId,
            { $pull: { comments: { _id: commentId } } },
            { new: true }
        );


        if (!post) {
            return res.status(404).json({ status: "Error", message: "Post not found" });
        }


        // Remove the comment from the ProfileInfoModel (if applicable)
        await ProfileInfoModel.updateMany(
            { "comments._id": commentId },
            { $pull: { comments: { _id: commentId } } }
        );


        res.json({ status: "Success", message: "Comment deleted successfully", post });
    } catch (error) {
        console.error("Error deleting comment:", error);
        res.status(500).json({ error: "Error deleting comment" });
    }
});

// ======================== PROFILE ROUTES ======================== //

// Create or update profile info
app.post("/profile", async (req, res) => {
    const { email, firstName, lastName, mobile, headline, experience, education, location, description, tags } = req.body;

    try {
        const updateFields = {
            firstName,
            lastName,
            mobile,
            headline,
            experience,
            location,
            description,
        };

        if (education && education.length > 0) updateFields.education = education;
        if (experience && experience.length > 0) updateFields.experience = experience;
        if (tags && Array.isArray(tags)) updateFields.tags = tags; // ✅ Add tags safely

        const updatedProfile = await ProfileInfoModel.findOneAndUpdate(
            { email },
            { $set: updateFields },
            { new: true, upsert: true }
        );

        res.json({ status: "Success", profile: updatedProfile });
    } catch (error) {
        console.error("Profile update error:", error);
        res.status(500).json({ status: "Error", message: "Failed to save profile information" });
    }
});


// Fetch profile picture URL by email
app.get("/profile/photo/:email", async (req, res) => {
    try {
        const profilePic = await ProfilePicModel.findOne({ email: req.params.email });
        if (!profilePic || !profilePic.profilePic) {
            return res.status(404).json({ status: "Not Found", message: "Profile picture not found" });
        }
        res.json({ status: "Success", profilePic: profilePic.profilePic });
    } catch (error) {
        console.error("Error fetching profile picture:", error);
        res.status(500).json({ status: "Error", message: "Failed to retrieve profile picture" });
    }
});


// Fetch all profiles (investors & companies)
app.get("/profiles", async (req, res) => {
    try {
        const profiles = await ProfileInfoModel.find();
        res.json({ status: "Success", profiles });
    } catch (error) {
        console.error("Error fetching profiles:", error);
        res.status(500).json({ status: "Error", message: "Failed to fetch profiles" });
    }
});
// Fetching profile of investors
app.get("/profile/:email", async (req, res) => {
    try {
        const profile = await ProfileInfoModel.findOne({ email: req.params.email });

        if (!profile) {
            return res.status(404).json({ status: "Error", message: "Profile not found" });
        }

        // Ensure tags are always included in the response
        const profileData = {
            ...profile.toObject(),
            tags: profile.tags || [], // Ensure tags are always included
        };

        res.json({ status: "Success", profile: profileData });
    } catch (error) {
        console.error("Error fetching profile:", error);
        res.status(500).json({ status: "Error", message: "Server error" });
    }
});

// Handle profile photo upload
app.post("/profile/upload", upload.single("profilePic"), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ status: "Error", message: "No file uploaded" });

        const { email } = req.body;
        const profilePicPath = `http://localhost:3001/uploads/${req.file.filename}`;

        // Delete old profile picture if it exists
        const oldProfile = await ProfilePicModel.findOne({ email });
        if (oldProfile && oldProfile.profilePic) {
            const oldFilePath = path.join(__dirname, oldProfile.profilePic.replace("http://localhost:3001/", ""));
            if (fs.existsSync(oldFilePath)) fs.unlinkSync(oldFilePath);
        }

        const updatedProfile = await ProfilePicModel.findOneAndUpdate(
            { email },
            { profilePic: profilePicPath },
            { upsert: true, new: true }
        );

        res.status(200).json({ status: "Success", profilePic: updatedProfile });
    } catch (error) {
        console.error("Profile picture upload error:", error);
        res.status(500).json({ status: "Error", message: "Failed to upload profile picture" });
    }
});


// Fetch profile picture URL by email
app.get("/profile-pic/:email", async (req, res) => {
    try {
        const profilePic = await ProfilePicModel.findOne({ email: req.params.email });
        if (!profilePic || !profilePic.profilePic) {
            return res.status(404).json({ status: "Not Found", message: "Profile picture not found" });
        }
        res.json({ status: "Success", profilePic: profilePic.profilePic });
    } catch (error) {
        console.error("Error fetching profile picture:", error);
        res.status(500).json({ status: "Error", message: "Failed to retrieve profile picture" });
    }
});

// ======================== PRODUCTS ROUTES ======================== //
app.post("/add-product", upload.fields([
    { name: 'profilePic', maxCount: 1 },
    { name: 'sliderImages', maxCount: 10 }
]), async (req, res) => {
    const { productName, description, tags, team, email, finances, customSections } = req.body;


    if (!productName || !description || !tags || !email) {
        return res.status(400).json({
            status: "Error",
            message: "Product name, description, tags, and email are required.",
        });
    }


    let parsedTags = [];
    let parsedTeam = [];
    let parsedFinances = [];
    let parsedCustomSections = [];


    try {
        parsedTags = JSON.parse(tags);
        parsedTeam = JSON.parse(team);
        parsedFinances = JSON.parse(finances);
        parsedCustomSections = JSON.parse(customSections);
    } catch (err) {
        console.error("Parsing error:", err.message);
        return res.status(400).json({ status: "Error", message: "Invalid JSON in request body." });
    }


    // Handle profile picture
    const profilePicFile = req.files?.profilePic?.[0];
    if (!profilePicFile) {
        return res.status(400).json({ status: "Error", message: "Profile picture is required." });
    }
    const profilePicPath = `http://localhost:3001/uploads/${profilePicFile.filename}`;


    // Handle slider images
    const sliderImageFiles = req.files?.sliderImages || [];
    if (sliderImageFiles.length === 0) {
        return res.status(400).json({ status: "Error", message: "At least one slider image is required." });
    }
    const sliderImagePaths = sliderImageFiles.map(file => `http://localhost:3001/uploads/${file.filename}`);


    try {
        // Save to Product model (Product.js)
        const newProduct = new ProductModel({
            productName,
            description,
            tags: parsedTags,
            team: parsedTeam,
            finances: parsedFinances,
            profilePic: profilePicPath,
            images: sliderImagePaths,
            email,
            status: "pending",
            createdAt: new Date(),
            customSections: parsedCustomSections,
        });
        await newProduct.save();

        res.json({ status: "Success", message: "Product added successfully" });
    } catch (error) {
        console.error("Error adding product:", error);
        res.status(500).json({
            status: "Error",
            message: "Failed to add product",
            error: error.message,
        });
    }
});

// // Fetch all products (only for companies)
// app.get("/products", async (req, res) => {
//     try {
//         const companies = await ProfileInfoModel.find({ type: "company" }, "email");
//         const companyEmails = companies.map(c => c.email);
//         const products = await ProductInfoModel.find({ email: { $in: companyEmails } });

//         res.json({ status: "Success", products });
//     } catch (error) {
//         console.error("Error fetching products:", error);
//         res.status(500).json({ status: "Error", message: "Failed to fetch products" });
//     }
// });

// Fetch all or filtered products
app.get("/products", async (req, res) => {
    try {
        const query = req.query.q;
        let filter = {};

        if (query) {
            filter = { productName: { $regex: query, $options: "i" } };
        }

        const products = await ProductInfoModel.find(filter);
        res.json({ status: "Success", products });
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ status: "Error", message: "Failed to fetch products" });
    }
});

// Fetch all or filtered investors
app.get("/investors", async (req, res) => {
    try {
        const query = req.query.q;
        let filter = { type: "investor" };

        if (query) {
            filter.firstName = { $regex: query, $options: "i" };
        }

        const investors = await ProfileInfoModel.find(filter);
        res.json({ status: "Success", investors });
    } catch (error) {
        console.error("Error fetching investors:", error);
        res.status(500).json({ status: "Error", message: "Failed to fetch investors" });
    }
});

// Fetch investors by tag
app.get("/investors/tag/:tagName", async (req, res) => {
    try {
        const tagName = req.params.tagName;
        const investors = await ProfileInfoModel.find({ type: "investor", tags: tagName });

        if (investors.length > 0) {
            res.json({ status: "Success", investors });
        } else {
            res.json({ status: "No Data", message: "No investors found with this tag" });
        }
    } catch (error) {
        console.error("Error fetching investors by tag:", error);
        res.status(500).json({ status: "Error", message: "Server error" });
    }
});

// Fetch products by tag
app.get("/products-by-tag/:tag", async (req, res) => {
    try {
        const { tag } = req.params;
        const products = await ProductInfoModel.find({ tags: tag }); //search Products by tag
        res.json({ status: "Success", products });
    } catch (error) {
        res.status(500).json({ status: "Error", message: error.message });
    }
});

app.get("/product/:email/:usermail", async (req, res) => {
    try {
        const { email, usermail } = req.params;

        const gproduct = await ProfileInfoModel.findOne({
            email: usermail,
            likes: { $elemMatch: { likecomp: email } }
        });

        let count;

        if (!gproduct) {
            const user = await ProfileInfoModel.findOne({ email: usermail });

            if (!user) {
                return res.status(404).json({ message: `User not found ${usermail}` });
            }

            user.likes.push({ likecomp: email });
            await user.save();

            // Update upvote count
            const compinfo = await ProductInfoModel.findOne({ email: email });

            if (!compinfo) {
                return res.status(404).json({ message: "Company not found" });
            }

            compinfo.upvote += 1;
            count = compinfo.upvote;
            await compinfo.save();

            return res.status(200).json({ message: "Like added successfully", count });
        } else {
            // User already liked, so REMOVE like
            await ProfileInfoModel.findOneAndUpdate(
                { email: usermail },
                { $pull: { likes: { likecomp: email } } }
            );

            const compinfo = await ProductInfoModel.findOne({ email: email });

            if (!compinfo) {
                return res.status(404).json({ message: "Company not found" });
            }

            compinfo.upvote -= 1;
            count = compinfo.upvote;
            await compinfo.save();

            return res.status(200).json({ message: "Like removed successfully", count });
        }
    } catch (error) {
        console.error("Error updating likes:", error);
        res.status(500).json({ message: "Server Error" });
    }
});



// Fetch products for a specific company
app.get("/products/:email", async (req, res) => {
    try {
        const products = await ProductInfoModel.find({ email: req.params.email });
        res.json({ status: "Success", products });
    } catch (error) {
        console.error("Error fetching company products:", error);
        res.status(500).json({ status: "Error", message: "Failed to fetch products" });
    }
});

// Fetch a single product by ID
app.get("/product/:email", async (req, res) => {
    try {
        const product = await ProductInfoModel.findOne({ email: req.params.email });
        if (!product) {
            return res.status(404).json({ status: "Error", message: "Product not found" });
        }
        res.json({ status: "Success", product });
    } catch (error) {
        console.error("Error fetching product:", error);
        res.status(500).json({ status: "Error", message: "Server error" });
    }
});

// app.post("/update-product/:email", async (req, res) => {
//     try {
//         const updatedProduct = await ProductInfoModel.findOneAndUpdate(
//             { email: req.params.email },  // Search by email
//             { $set: req.body },  // Update only fields present in req.body
//             { new: true, runValidators: true, omitUndefined: true }  // Keep unchanged fields intact
//         );

//         if (!updatedProduct) {
//             return res.json({ status: "Error", message: "Product not found" });
//         }

//         res.json({ status: "Success", product: updatedProduct });
//     } catch (error) {
//         console.error("Update error:", error);
//         res.json({ status: "Error", message: "Failed to update product" });
//     }
// });
// Express Route: Update Product by Email
app.post("/update-product/:email", async (req, res) => {
    try {
        const updatedProduct = await ProductInfoModel.findOneAndUpdate(
            { email: req.params.email },
            { $set: req.body },
            { new: true, runValidators: true, omitUndefined: true }
        );

        if (!updatedProduct) {
            return res.json({ status: "Error", message: "Product not found" });
        }

        res.json({ status: "Success", product: updatedProduct });
    } catch (error) {
        console.error("Update error:", error);
        res.json({ status: "Error", message: "Failed to update product" });
    }
});

// Get pending products
app.get("/admin/pending-products", async (req, res) => {
    try {
        const products = await ProductModel.find({ status: "pending" });
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: "Error fetching pending products" });
    }
});


// Get approved products
app.get("/admin/approved-products", async (req, res) => {
    try {
        const products = await ProductModel.find({ status: "approved" });
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: "Error fetching approved products" });
    }
});

// admin approve products

app.post("/admin/approve-product/:id", async (req, res) => {
    try {
        const updatedProduct = await ProductModel.findByIdAndUpdate(
            req.params.id,
            { status: "approved" },  // ✅ Update status
            { new: true }            // Return the updated document
        );

        if (!updatedProduct) {
            return res.status(404).json({ status: "Error", message: "Product not found" });
        }

        // Also add to ProductInfo collection if not already there
        const existingProduct = await ProductInfoModel.findOne({ email: updatedProduct.email });

        if (!existingProduct) {
            const newProduct = new ProductInfoModel({
                productName: updatedProduct.productName,
                description: updatedProduct.description,
                tags: updatedProduct.tags,
                team: updatedProduct.team,
                images: updatedProduct.images,
                profilePic: updatedProduct.profilePic,
                finances: updatedProduct.finances,
                customSections: updatedProduct.customSections,
                email: updatedProduct.email,
                upvote: updatedProduct.upvote,
                status: "approved"
            });

            await newProduct.save();
            const subject = "Your Product has been Approved - Xequity";
            const message = `Dear User,\n\nYour product "${newProduct.productName}" has been approved by the admin.\n\nand is listed under product section.\nFor more information , visit Xequity  \nWith regards,\nTeam Xequity`;


            await sendMail(newProduct.email, subject, message);

        }

        res.json({ status: "Success", message: "Product approved", product: updatedProduct });
    } catch (err) {
        console.error("Approval error:", err);
        res.status(500).json({ status: "Error", message: "Failed to approve product" });
    }
});



//====================reject product===================//
app.post("/admin/reject-product/:id", async (req, res) => {
    try {
        const productId = req.params.id;
        const { reasons } = req.body;

        const product = await ProductModel.findById(productId);
        if (!product) {
            return res.status(404).json({ status: "Error", message: "Product not found" });
        }

        // ✅ Delete the product
        await ProductModel.findByIdAndDelete(productId);

        // ✅ Compose rejection email
        let message = `Dear User,\n\nWe regret to inform you that your product "${product.productName}" has been rejected by the admin.\n\n`;

        if (reasons && reasons.length > 0) {
            message += `Please review the following points:\n- ${reasons.join('\n- ')}\n\n`;
        }

        message += `You may revise your product and submit again later.\n\nWith regards,\nTeam Xequity`;

        const subject = "Your Product was Rejected - Xequity";

        // ✅ Send the email
        await sendMail(product.email, subject, message);

        return res.status(200).json({ status: "Success", message: "Product rejected and email sent." });
    } catch (err) {
        console.error("Error rejecting product:", err);
        return res.status(500).json({ status: "Error", message: "Internal server error" });
    }
});




// Fetch pending users
app.get("/pending-users", async (req, res) => {
    try {
        const pendingUsers = await UnverifiedUser.find({ status: "pending" });
        res.status(200).json(pendingUsers);
    } catch (err) {
        console.error("Error fetching pending users:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// Fetch approved users
app.get("/approved-users", async (req, res) => {
    try {
        const approvedUsers = await UnverifiedUser.find({ status: "approved" });
        res.status(200).json(approvedUsers);
    } catch (err) {
        console.error("Error fetching approved users:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});



// Approve Pending User API
app.post("/admin/approve-user/:email", async (req, res) => {
    const { email } = req.params;

    try {
        const unverifiedUser = await UnverifiedUser.findOne({ email });

        if (!unverifiedUser) {
            return res.status(404).json({ status: "Error", message: "User not found" });
        }

        console.log("💰 Generating wallet...");
        const wallet = ethers.Wallet.createRandom();
        const accountAddress = wallet.address;
        const privateKey = wallet.privateKey;

        // 4. Create new user
        const newUser = new UserModel({
            name: unverifiedUser.name,
            email: unverifiedUser.email,
            password: unverifiedUser.password,
            type: unverifiedUser.type,
            accountAddress,
            privateKey
        });


        await newUser.save();

        // Store basic info in ProfileInfo
        const newProfileInfo = new ProfileInfoModel({
            email: unverifiedUser.email,
            type: unverifiedUser.type,
        });
        await newProfileInfo.save();

        // Update status in Unverified collection
        unverifiedUser.status = "approved";
        await unverifiedUser.save();

        console.log("✅ Unverified user marked as approved.");


        // ✅ Send approval email
        const subject = "Profile Approved - Xequity";
        const message = `Dear ${newUser.name || "User"},\n\nYour profile has been approved by the admin.\n\nBy Xequity.;`

        const mailSent = await sendMail(newUser.email, subject, message);

        if (!mailSent) {
            console.warn("User approved but email failed to send");
        }

        res.json({
            status: "Success",
            message: "User approved and created",
            user: {
                email: newUser.email,
                name: newUser.name,
                type: newUser.type,
                accountAddress,
                privateKey
            }
        });

    } catch (error) {
        console.error("Error approving user:", error);
        res.status(500).json({ status: "Error", message: "Internal Server Error" });
    }
});



// ================== ❌ Reject User API ================== //
app.post("/admin/reject-user/:email", async (req, res) => {
    try {
        const { email } = req.params;
        const { reason } = req.body;

        const user = await UnverifiedUser.findOne({ email });
        if (!user) {
            return res.status(404).json({ status: "Error", message: "User not found" });
        }

        // Optionally delete or update the user status
        await UnverifiedUser.deleteOne({ email });

        // Compose rejection email
        let message = `Dear User,\n\nWe regret to inform you that your registration was rejected by the admin.\n\n`;

        if (reason && reason.trim() !== "") {
            message += `Reason:\n${reason}\n\n`;
        }

        message += `You may correct the issue and try registering again.\n\nWith regards,\nTeam Xequity`;

        const subject = "Your Registration Was Rejected - Xequity";
        await sendMail(email, subject, message);

        return res.status(200).json({ status: "Success", message: "User rejected and email sent." });
    } catch (err) {
        console.error("Error rejecting user:", err);
        return res.status(500).json({ status: "Error", message: "Internal server error" });
    }
});

// app.post("/admin/reject-user/:email", async (req, res) => {
//     const { email } = req.params;

//     try {
//         const unverifiedUser = await UnverifiedUser.findOne({ email, status: "pending" });

//         if (!unverifiedUser) {
//             return res.status(404).json({
//                 status: "Error",
//                 message: "Pending user not found or already processed"
//             });
//         }

//         // Update status to rejected
//         unverifiedUser.status = "rejected";
//         await unverifiedUser.save();

//         // Optional: Delete uploaded PDF file
//         if (unverifiedUser.pdfFile) {
//             const filePath = path.join(__dirname, unverifiedUser.pdfFile);
//             if (fs.existsSync(filePath)) {
//                 fs.unlinkSync(filePath);
//             }
//         }

//         // ✅ Send rejection email
//         const subject = "Profile Rejected - Xequity";
//         const message = `Dear ${unverifiedUser.name || "User"},\n\nUnfortunately your profile has been rejected by the admin as it does not meet the standards of the platform.\n\nPlease work on your profile and try again later.\n\nBy Xequity.;`

//         const mailSent = await sendMail(unverifiedUser.email, subject, message);

//         if (!mailSent) {
//             console.warn("User rejected, but email failed to send");
//         }

//         res.json({
//             status: "Success",
//             message: "User rejected successfully",
//             email: unverifiedUser.email
//         });

//     } catch (error) {
//         console.error("Error rejecting user:", error);
//         res.status(500).json({
//             status: "Error",
//             message: "Internal Server Error",
//             error: error.message
//         });
//     }
// });

// ======================== API to fetch user tokens by email ======================== //
app.get("/api/user-tokens/:email", async (req, res) => {
    try {
        const { email } = req.params;
        const userTokens = await UserTokenModel.findOne({ email });

        if (!userTokens) {
            return res.status(404).json({ message: "User tokens not found" });
        }

        res.json(userTokens.tokens); // Return only the tokens array
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

app.get("/api/virtual-assets", async (req, res) => {
    try {
        const assets = await VirtualTokenModel.find();
        res.json(assets);
    } catch (error) {
        console.error("Error fetching virtual assets:", error.message); // Log error message
        res.status(500).json({ error: error.message }); // Send actual error message
    }
});
// Tokens with complete data for my investments page
app.get("/api/my-investments/:email", async (req, res) => {
    const { email } = req.params;

    try {
        // Fetch the user's tokens
        const userTokens = await UserTokenModel.findOne({ email });

        if (!userTokens) {
            return res.status(404).json({ status: "Error", message: "User tokens not found" });
        }

        // Fetch the current price and other details for each token
        const tokensWithDetails = await Promise.all(
            userTokens.tokens.map(async (token) => {
                const virtualToken = await VirtualTokenModel.findOne({ email: token.tokenmail });

                if (virtualToken) {
                    return {
                        tokenname: token.tokenname,
                        tokenmail: token.tokenmail,
                        quantity: token.quantity,
                        avgprice: token.avgprice,
                        currentPrice: virtualToken.CurrentPrice,
                        image: virtualToken.image,
                    };
                }

                return null; // Skip if no matching virtual token is found
            })
        );

        // Filter out null values (tokens without matching virtual tokens)
        const filteredTokens = tokensWithDetails.filter((token) => token !== null);

        res.json({ status: "Success", tokens: filteredTokens });
    } catch (error) {
        console.error("Error fetching user investments:", error.message);
        res.status(500).json({ status: "Error", message: "Server error" });
    }
});
// ========================ISSUE TOKEN AND GAIN EQUITY =============//
app.post("/api/virtualtokens", upload.single("image"), async (req, res) => {
    try {
        const { email, TokenName, NumberOfIssue, EquityDiluted } = req.body;

        const parsedNumberOfIssue = parseFloat(NumberOfIssue);
        const parsedEquityDiluted = parseFloat(EquityDiluted);

        if (isNaN(parsedNumberOfIssue)) {
            return res.status(400).json({ error: "NumberOfIssue must be a valid number" });
        }
        if (isNaN(parsedEquityDiluted)) {
            return res.status(400).json({ error: "EquityDiluted must be a valid number" });
        }

        // Save to VirtualTokenModel
        const newToken = new VirtualTokenModel({
            email,
            TokenName,
            NumberOfIssue: parsedNumberOfIssue,
            EquityDiluted: parsedEquityDiluted,
            image: req.file ? `http://localhost:3001/uploads/${req.file.filename}` : null,
        });

        await newToken.save();

        // Save or update in UserTokenModel
        const tokenEntry = {
            tokenname: TokenName,
            tokenmail: email,
            quantity: parsedNumberOfIssue,
            avgprice: 0, // Set default avgprice to 0; or compute if needed
        };

        const existingUser = await UserTokenModel.findOne({ email });

        if (existingUser) {
            // Check if token already exists in user's token list
            const tokenIndex = existingUser.tokens.findIndex(
                (token) => token.tokenname === TokenName && token.tokenmail === email
            );

            if (tokenIndex > -1) {
                // If token exists, update quantity and optionally avgprice
                existingUser.tokens[tokenIndex].quantity += parsedNumberOfIssue;
            } else {
                // If token does not exist, push new token entry
                existingUser.tokens.push(tokenEntry);
            }

            await existingUser.save();
        } else {
            // Create a new user with this token
            const newUserToken = new UserTokenModel({
                email,
                tokens: [tokenEntry],
            });
            await newUserToken.save();
        }

        res.status(201).json({ message: "Token added successfully!", token: newToken });
    } catch (error) {
        console.error("Full error:", error);
        res.status(500).json({
            error: "Error adding token",
            details: error.message,
        });
    }
});


// Combined update and delete endpoint
// Updated combined update endpoint
app.post('/api/virtualtokens/update', async (req, res) => {
    try {
        const { email, TokenName, NumberOfIssue, EquityDiluted, coinsPurchased, transactionHash } = req.body;

        // Convert to proper number types
        const numCoinsPurchased = parseFloat(coinsPurchased);
        const numEquityDiluted = parseFloat(EquityDiluted);
        const numNumberOfIssue = parseFloat(NumberOfIssue);

        // Check if we need to delete (coins reached zero)
        if (numNumberOfIssue <= 0) {
            // Delete from VirtualToken
            await VirtualTokenModel.findOneAndDelete({ email });

            // Remove from UserToken's tokens array
            await UserTokenModel.updateMany(
                { 'tokens.tokenname': TokenName },
                { $pull: { tokens: { tokenname: TokenName } } }
            );

            return res.json({ deleted: true });
        }

        // Update VirtualToken
        const updatedToken = await VirtualTokenModel.findOneAndUpdate(
            { email },
            {
                TokenName,
                NumberOfIssue: numNumberOfIssue,
                EquityDiluted: numEquityDiluted
            },
            { new: true }
        );

        // Update UserToken (quantity and transaction hash)
        const userTokenUpdate = await UserTokenModel.findOneAndUpdate(
            { email, 'tokens.tokenname': TokenName },
            {
                $inc: { 'tokens.$.quantity': numCoinsPurchased },
                $set: { 'tokens.$.transactionHash': transactionHash }
            },
            { new: true }
        );

        // If token didn't exist in UserToken, add it
        if (!userTokenUpdate) {
            await UserTokenModel.findOneAndUpdate(
                { email },
                {
                    $push: {
                        tokens: {
                            tokenname: TokenName,
                            tokenmail: email,
                            quantity: numCoinsPurchased,
                            avgprice: 0,
                            transactionHash: transactionHash
                        }
                    }
                },
                { upsert: true, new: true }
            );
        }

        res.json({
            success: true,
            deleted: false,
            token: updatedToken
        });

    } catch (err) {
        console.error("Update error:", err);
        res.status(500).json({
            error: "Failed to update token",
            details: err.message
        });
    }
});

app.get('/api/virtualtokens/:email', async (req, res) => {
    try {
        const token = await VirtualTokenModel.findOne({ email: req.params.email });
        if (!token) {
            return res.status(404).json({ error: 'Token not found' });
        }
        console.log(token)
        res.json(token);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});




// =======================User.js part===========================//

// GET user by email
app.get('/usertoken/:email', async (req, res) => {
    const { email } = req.params;

    try {
        const user = await UserModel.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.json({
            tokens: user.tokens,
            accountAddress: user.accountAddress,
            privateKey: user.privateKey
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});


// Add this new endpoint
app.post("/api/transfer-tokens", async (req, res) => {
    try {
        const { email, numberOfTokens, recipientAddress } = req.body;

        // Get admin credentials (you should store these securely)
        const admin = await UserModel.findOne({ email: 'ks' });
        if (!admin) {
            return res.status(404).json({ error: 'Admin account not found' });
        }

        // Setup provider and wallet
        const provider = new ethers.JsonRpcProvider('HTTP://127.0.0.1:7545'); // Update with your provider URL
        const adminWallet = new ethers.Wallet(admin.privateKey, provider);

        // Convert tokens to ETH amount (assuming 1 token = 1 ETH for simplicity)
        const ethAmount = ethers.parseEther(numberOfTokens.toString());

        // Create and send transaction
        const transaction = {
            to: recipientAddress,
            value: ethAmount,
            gasLimit: 21000
        };

        const transactionResponse = await adminWallet.sendTransaction(transaction);
        const receipt = await transactionResponse.wait();

        res.json({
            success: true,
            transactionHash: receipt.hash,
            message: 'Tokens transferred successfully'
        });

    } catch (error) {
        console.error('Transaction error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});


app.post("/api/transfer-to-admin", async (req, res) => {
    try {
        const { email, numberOfCoins, userEmail } = req.body;

        // Get admin (product owner) details
        const admin = await UserModel.findOne({ email: 'ks' });
        if (!admin) {
            return res.status(404).json({ error: "Admin not found" });
        }

        // Get user details
        const user = await UserModel.findOne({ email: userEmail });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Setup provider and wallet
        const provider = new ethers.JsonRpcProvider('HTTP://127.0.0.1:7545');
        const userWallet = new ethers.Wallet(user.privateKey, provider);

        // Calculate ETH amount (1 token = 1 ETH for simplicity)
        const ethAmount = ethers.parseEther(numberOfCoins.toString());

        // Check user balance first
        const userBalance = await provider.getBalance(user.accountAddress);
        if (userBalance < ethAmount) {
            return res.status(400).json({
                success: false,
                error: 'Insufficient funds'
            });
        }

        // Send transaction
        const transaction = await userWallet.sendTransaction({
            to: admin.accountAddress,
            value: ethAmount,
            gasLimit: 21000
        });

        // Wait for transaction to be mined
        const receipt = await transaction.wait();

        res.json({
            success: true,
            transactionHash: receipt.hash,
            message: 'Transaction successful'
        });

    } catch (error) {
        console.error('Transaction error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

////////////////////////////////////////////////////////////////////////

app.get('/messages/:user1/:user2', async (req, res) => {
    const { user1, user2 } = req.params;
    try {
        const messages = await MessageModel.find({
            $or: [
                { senderId: user1, receiverId: user2 },
                { senderId: user2, receiverId: user1 }
            ]
        }).sort({ createdAt: 1 }); // sort by time ascending

        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});


app.post("/messages", async (req, res) => {
    try {
        const { senderId, receiverId, text } = req.body;
        if (!senderId || !receiverId || !text.trim()) {
            return res.status(400).json({ error: "Invalid input" });
        }

        const newMessage = new MessageModel({ senderId, receiverId, text });
        await newMessage.save();

        const messages = await MessageModel.find({
            $or: [
                { senderId, receiverId },
                { senderId: receiverId, receiverId: senderId },
            ],
        }).sort({ createdAt: 1 });

        res.status(200).json(messages);
    } catch (error) {
        console.error("Error sending message:", error);
        res.status(500).json({ error: "Failed to send message" });
    }
});

// GET top 5 products sorted by upvote
app.get("/top-products", async (req, res) => {
    try {
        const topProducts = await ProductInfoModel.find({})
            .sort({ upvote: -1 })
            .limit(5);

        res.json({
            status: "Success",
            products: topProducts,
        });
    } catch (error) {
        console.error("Error fetching top products:", error);
        res.status(500).json({
            status: "Error",
            message: "Failed to fetch top products",
        });
    }
});


// Get all messages where user is either sender or receiver
app.get('/messages/:userEmail', async (req, res) => {
    const { userEmail } = req.params;
    try {
        const messages = await MessageModel.find({
            $or: [
                { senderId: userEmail },
                { receiverId: userEmail }
            ]
        });

        res.json({ status: "Success", messages });
    } catch (err) {
        console.error("Error fetching user messages:", err);
        res.status(500).json({ error: "Failed to fetch messages" });
    }
});


// ======================== OTP ROUTES ======================== //

app.post("/send-otp", async (req, res) => {
    const { email } = req.body;

    try {
        // Check if email exists in User collection
        const existingVerifiedUser = await UserModel.findOne({ email });
        if (existingVerifiedUser) {
            return res.status(400).json({
                status: "Error",
                message: "Email already registered and verified"
            });
        }

        // Check if email exists in UnverifiedUser collection
        const existingUnverifiedUser = await UnverifiedUser.findOne({ email });
        if (existingUnverifiedUser) {
            return res.status(400).json({
                status: "Error",
                message: "Email is already under review"
            });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Save OTP to database
        await OTPModel.findOneAndUpdate(
            { email },
            { otp },
            { upsert: true, new: true }
        );

        // Send OTP via email
        const emailSent = await sendOTP(email, otp);

        if (emailSent) {
            res.json({
                status: "Success",
                message: "OTP sent successfully"
            });
        } else {
            res.status(500).json({
                status: "Error",
                message: "Failed to send OTP"
            });
        }
    } catch (error) {
        console.error("Error sending OTP:", error);
        res.status(500).json({
            status: "Error",
            message: "Server error"
        });
    }
});

app.post("/verify-otp", async (req, res) => {
    const { email, otp } = req.body;

    try {
        const otpRecord = await OTPModel.findOne({ email });

        if (!otpRecord) {
            return res.status(400).json({
                status: "Error",
                message: "OTP expired or not found"
            });
        }

        if (otpRecord.otp !== otp) {
            return res.status(400).json({
                status: "Error",
                message: "Invalid OTP"
            });
        }

        // Mark as verified
        otpRecord.verified = true;
        await otpRecord.save();

        res.json({
            status: "Success",
            message: "Email verified successfully"
        });
    } catch (error) {
        console.error("Error verifying OTP:", error);
        res.status(500).json({
            status: "Error",
            message: "Server error"
        });
    }
});


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////user tokens display API ///////////////////////////////////////////////////////////////////////////////////////////

//================SHOWING MY TOKENS TO USERS===============//


app.get('/api/usertokens/:tokenmail', async (req, res) => {
    try {
        const token = await UserTokenModel.findOne({ email: req.params.tokenmail });
        if (!token) {
            return res.status(200).json({ Quantity: 0 });
        }
        const tokenIndex = token.tokens.findIndex(
            (t) => t.tokenmail === req.params.tokenmail
        );
        if (tokenIndex === -1) {
            return res.status(200).json({ Quantity: 0 });
        }
        const userTokenQty = token.tokens[tokenIndex].quantity;
        console.log(userTokenQty)
        res.json({ Quantity: userTokenQty });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});





///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////// GAIN EQUITY API /////////////////////////////////////////////////////////////////////////////////////////

// app.post("/api/gain-equity", async (req, res) => {
//     try {
//         const { email, tokenEmail, tokenName, quantity } = req.body;
//         const quantityToGain = parseFloat(quantity);


//         if (isNaN(quantityToGain) || quantityToGain <= 0) {
//             return res.status(400).json({ error: "Invalid quantity" });
//         }


//         // 1. ✅ Check user and token ownership
//         const userDoc = await UserTokenModel.findOne({ email });
//         if (!userDoc) {
//             return res.status(404).json({ error: "User not found" });
//         }


//         const userTokenIndex = userDoc.tokens.findIndex(
//             (token) => token.tokenmail === tokenEmail && token.tokenname === tokenName
//         );


//         if (userTokenIndex === -1) {
//             return res.status(400).json({ error: "Token not found in user's account" });
//         }


//         const userToken = userDoc.tokens[userTokenIndex];
//         if (userToken.quantity < quantityToGain) {
//             return res.status(400).json({ error: "Not enough tokens to return" });
//         }


//         // 2. ✅ Deduct from user's token
//         userToken.quantity -= quantityToGain;
//         if (userToken.quantity === 0) {
//             userDoc.tokens.splice(userTokenIndex, 1);
//         }
//         await userDoc.save();


//         // 3. ✅ Update VirtualTokenModel
//         const virtualToken = await VirtualTokenModel.findOne({
//             email: tokenEmail,
//             TokenName: tokenName,
//         });


//         if (!virtualToken) {
//             return res.status(404).json({ error: "Matching virtual token not found" });
//         }


//         const currentIssue = parseFloat(virtualToken.NumberOfIssue);
//         const currentEquity = parseFloat(virtualToken.EquityDiluted);
//         const equityPerToken = currentEquity / currentIssue;


//         const equityToGain = equityPerToken * quantityToGain;


//         const newNumberOfIssue = parseFloat((currentIssue - quantityToGain).toFixed(8));
//         const newEquityDiluted = parseFloat((currentEquity - equityToGain).toFixed(4));


//         // Update or remove the virtual token
//         if (newNumberOfIssue === 0) {
//             await VirtualTokenModel.deleteOne({ _id: virtualToken._id });
//             // Also remove from UserTokenModel for the company
//             const companyDoc = await UserTokenModel.findOne({ email: tokenEmail });
//             if (companyDoc) {
//                 companyDoc.tokens = companyDoc.tokens.filter(
//                     (token) => !(token.tokenname === tokenName && token.tokenmail === tokenEmail)
//                 );
//                 await companyDoc.save();
//             }
//         } else {
//             virtualToken.NumberOfIssue = newNumberOfIssue;
//             virtualToken.EquityDiluted = newEquityDiluted;
//             await virtualToken.save();
//         }


//         res.json({
//             message: "Equity returned successfully",
//             updatedToken: virtualToken,
//         });
//     } catch (error) {
//         console.error("Gain equity error:", error.message);
//         res.status(500).json({ error: "Internal server error" });
//     }
// });

app.post("/api/gain-equity", async (req, res) => {
    try {
        const { email, tokenEmail, tokenName, quantity } = req.body;
        const quantityToGain = parseFloat(quantity);

        if (isNaN(quantityToGain) || quantityToGain <= 0) {
            return res.status(400).json({ error: "Invalid quantity" });
        }

        // ✅ 1. Fetch user & admin
        const user = await UserModel.findOne({ email });
        const admin = await UserModel.findOne({ email: "ks" });

        if (!user || !admin || !user.privateKey || !admin.privateKey) {
            return res.status(404).json({ error: "Wallet info not found" });
        }

        // ✅ 2. Setup provider & wallets


        const provider = new ethers.JsonRpcProvider("http://127.0.0.1:7545");
        const userWallet = new ethers.Wallet(user.privateKey, provider);
        const adminWallet = new ethers.Wallet(admin.privateKey, provider);

        const ethAmount = (quantityToGain).toFixed(6);

        // ✅ 3. Log ETH balance before
        const balanceBefore = await provider.getBalance(userWallet.address);
        console.log(`User ETH Balance before tx: ${ethers.formatEther(balanceBefore)} ETH`);

        // ✅ 4. Send ETH from user to admin
        const tx = await userWallet.sendTransaction({
            to: adminWallet.address,
            value: ethers.parseEther(ethAmount),
        });
        await tx.wait();

        // ✅ 5. Log ETH balance after
        const balanceAfter = await provider.getBalance(userWallet.address);
        console.log(`User ETH Balance after tx: ${ethers.formatEther(balanceAfter)} ETH`);
        console.log(`Transaction hash: ${tx.hash}`);

        // ✅ 6. Update user token quantity
        const userDoc = await UserTokenModel.findOne({ email });
        const userTokenIndex = userDoc.tokens.findIndex(
            (token) => token.tokenmail === tokenEmail && token.tokenname === tokenName
        );

        if (userTokenIndex === -1) {
            return res.status(400).json({ error: "Token not found in user's account" });
        }

        const userToken = userDoc.tokens[userTokenIndex];
        if (userToken.quantity < quantityToGain) {
            return res.status(400).json({ error: "Not enough tokens to return" });
        }

        userToken.quantity -= quantityToGain;
        if (userToken.quantity === 0) {
            userDoc.tokens.splice(userTokenIndex, 1);
        }
        await userDoc.save();

        // ✅ 7. Update virtual token info
        const virtualToken = await VirtualTokenModel.findOne({
            email: tokenEmail,
            TokenName: tokenName,
        });

        if (!virtualToken) {
            return res.status(404).json({ error: "Matching virtual token not found" });
        }

        const currentIssue = parseFloat(virtualToken.NumberOfIssue);
        const currentEquity = parseFloat(virtualToken.EquityDiluted);
        const equityPerToken = currentEquity / currentIssue;
        const equityToGain = equityPerToken * quantityToGain;

        const newNumberOfIssue = parseFloat((currentIssue - quantityToGain).toFixed(8));
        const newEquityDiluted = parseFloat((currentEquity - equityToGain).toFixed(4));

        if (newNumberOfIssue === 0) {
            await VirtualTokenModel.deleteOne({ _id: virtualToken._id });

            const companyDoc = await UserTokenModel.findOne({ email: tokenEmail });
            if (companyDoc) {
                companyDoc.tokens = companyDoc.tokens.filter(
                    (token) => !(token.tokenname === tokenName && token.tokenmail === tokenEmail)
                );
                await companyDoc.save();
            }
        } else {
            virtualToken.NumberOfIssue = newNumberOfIssue;
            virtualToken.EquityDiluted = newEquityDiluted;
            await virtualToken.save();
        }

        res.json({
            message: "Equity returned successfully",
            txHash: tx.hash,
            updatedToken: virtualToken,
        });
    } catch (error) {
        console.error("Gain equity error:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
});


// Reset password route
app.post("/reset-password", async (req, res) => {
    const { email, otp, newPassword } = req.body;


    try {
        // Verify OTP
        const otpRecord = await OTPModel.findOne({ email });


        if (!otpRecord || otpRecord.otp !== otp || !otpRecord.verified) {
            return res.status(400).json({ status: "Error", message: "Invalid or unverified OTP" });
        }


        // Update password in UserModel
        const updatedUser = await UserModel.findOneAndUpdate(
            { email },
            { password: newPassword },
            { new: true }
        );


        if (!updatedUser) {
            return res.status(404).json({ status: "Error", message: "User not found" });
        }


        // Optional: delete OTP record
        await OTPModel.deleteOne({ email });


        res.json({ status: "Success", message: "Password updated successfully" });
    } catch (error) {
        console.error("Reset password error:", error);
        res.status(500).json({ status: "Error", message: "Server error" });
    }
});


app.get("/user/:useremail/:productemail", async (req, res) => {
    const { useremail, productemail } = req.params;
    try {
        const user = await UserModel.findOne({ email: useremail });
        const isUpvoted = user.upvotedProducts.includes(productemail);
        res.json({ status: "Success", upvoted: isUpvoted });
    } catch (error) {
        res.status(500).json({ status: "Error", message: "Server error" });
    }
});

app.get("/upvote/:useremail/:productemail", async (req, res) => {
    const { useremail, productemail } = req.params;
    try {
        const user = await UserModel.findOne({ email: useremail });
        const product = await ProductInfoModel.findOne({ email: productemail });

        if (!user || !product) {
            return res.status(404).json({ status: "Error", message: "User or Product not found" });
        }

        const hasUpvoted = user.upvotedProducts.includes(productemail);

        if (hasUpvoted) {
            user.upvotedProducts.pull(productemail);
            product.upvote -= 1;
        } else {
            user.upvotedProducts.push(productemail);
            product.upvote += 1;
        }

        await user.save();
        await product.save();

        res.json({ status: "Success", upvoted: !hasUpvoted, upvotes: product.upvote });
    } catch (error) {
        res.status(500).json({ status: "Error", message: "Server error" });
    }
});

app.get("/api/transaction-history/:email", async (req, res) => {
    const { email } = req.params;
    console.log("Requested history for:", email);
    try {
        const userHistory = await TransactionHistoryModel.findOne({ email });

        if (!userHistory) {
            return res.status(404).json({ message: "No history found" });
        }

        // Enrich each transaction with token info from ProductInfoModel
        const enrichedTransactions = await Promise.all(
            userHistory.transactions.map(async (tx) => {
                const tokenData = await ProductInfoModel.findOne({ email: tx.tokenmail });
                return {
                    ...tx.toObject(),
                    companyName: tokenData?.companyName,
                    productName: tokenData?.productName
                };
            })
        );

        res.json({ transactions: enrichedTransactions.reverse() }); // recent first
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error fetching transaction history" });
    }
});


// ======================== SERVER START ======================== //

app.listen(3001, () => {
    console.log("Server is running on http://localhost:3001");
});