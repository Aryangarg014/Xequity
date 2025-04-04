const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const UserModel = require("./models/User");
const ProfileInfoModel = require("./models/ProfileInfo");
const ProfilePicModel = require("./models/ProfilePic");
const ProductInfoModel = require("./models/ProductInfo");
const PostModel = require("./models/Post")
const AdminModel = require("./models/admin");
const ProductModel = require("./models/Product");  // Import Product.js model
const UnverifiedUser = require("./models/Unverified");  // Adjust path if needed
const VirtualTokenModel = require("./models/VirtualToken");

const app = express();
app.use(express.json());
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

// Ensure middleware is correctly applied for file uploads
app.post("/register", upload1.single("pdfFile"), async (req, res) => {
    try {
        const { name, email, password, signupType } = req.body;
        const pdfFilePath = req.file ? req.file.path : null;

        if (!pdfFilePath) {
            return res.status(400).json({ message: "PDF file is required." });
        }

        // Check if the user is already pending approval
        const existingUser = await UnverifiedUser.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email is already under review." });
        }

        // Create a new unverified user entry
        const newUser = new UnverifiedUser({
            name,
            email,
            password,
            type: signupType,
            pdfFile: pdfFilePath, // Store the file path
            status: "pending",
        });

        await newUser.save();
        res.status(200).json({ message: "Signup request submitted for verification." });

    } catch (err) {
        console.error("Error registering user:", err);
        res.status(500).json({ message: "Internal Server Error" });
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



// ======================== COMMUNITY FORUM ======================== //



// Fetch all posts
app.get("/posts", async (req, res) => {
    try {
        const posts = await PostModel.find().sort({ createdAt: -1 });
        res.json({ status: "Success", posts });
    } catch (error) {
        console.error("Database fetch error:", error);  // <-- Logs the actual error
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
        const { email, title, content } = req.body;

        if (!email || !title || !content) {
            return res.status(400).json({ status: "Error", message: "Email, title, and content are required." });
        }

        // Fetch the user's name from ProfileInfo
        const user = await ProfileInfoModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ status: "Error", message: "User not found" });
        }

        const imagePaths = req.files?.map(file => `http://localhost:3001/uploads/${file.filename}`) || [];

        const newPost = new PostModel({
            email,
            name: user.firstName, // Store the user's name
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

// Insert a new product (allows flexible image upload)
app.post("/add-product", upload.array("images"), async (req, res) => {
    // console.log("Uploaded files:", req.files);  // Log files to check if they're uploaded
   
    const { productName, description, tags, team, email } = req.body;

    if (!productName || !description || !tags || !email) {
        return res.status(400).json({ status: "Error", message: "Product name, description, tags, and email are required." });
    }

    // Ensure at least one image is uploaded
    const imagePaths = req.files?.map(file => `http://localhost:3001/uploads/${file.filename}`) || [];
    if (imagePaths.length === 0) {
        return res.status(400).json({ status: "Error", message: "At least one image is required." });
    }

    try {
        const newProduct = new ProductModel({  
            productName, 
            description, 
            tags, 
            team, // Ensure team data is parsed correctly
            images: imagePaths, 
            email ,
             status: "pending"
        });
       
        await newProduct.save();
        res.json({ status: "Success", message: "Product added successfully" });
    } catch (error) {
        console.error("Error adding product:", error);
        res.status(500).json({ status: "Error", message: "Failed to add product", error: error.message });
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

app.post("/update-product/:email", async (req, res) => {
    try {
        const updatedProduct = await ProductInfoModel.findOneAndUpdate(
            { email: req.params.email },  // Search by email
            { $set: req.body },  // Update only fields present in req.body
            { new: true, runValidators: true, omitUndefined: true }  // Keep unchanged fields intact
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
                email: updatedProduct.email,
                upvote: updatedProduct.upvote,
                status: "approved"
            });

            await newProduct.save();
        }

        res.json({ status: "Success", message: "Product approved", product: updatedProduct });
    } catch (err) {
        console.error("Approval error:", err);
        res.status(500).json({ status: "Error", message: "Failed to approve product" });
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
        // Find user in Unverified collection
        const unverifiedUser = await UnverifiedUser.findOne({ email });

        if (!unverifiedUser) {
            return res.status(404).json({ status: "Error", message: "User not found" });
        }

        // Store user data in Users collection
        const newUser = new UserModel({
            name: unverifiedUser.name,
            email: unverifiedUser.email,
            password: unverifiedUser.password,
            type: unverifiedUser.type
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

        return res.json({ 
            status: "Success", 
            user: { 
                email: newUser.email, 
                name: newUser.name,
                type: newUser.type 
            } 
        });

    } catch (error) {
        console.error("Error approving user:", error);
        res.status(500).json({ status: "Error", message: "Internal Server Error" });
    }
});

// Add this route in your index.js file (backend)
app.post("/admin/reject-user/:email", async (req, res) => {
    const { email } = req.params;

    try {
        // Find the pending user in Unverified collection
        const unverifiedUser = await UnverifiedUser.findOne({ email, status: "pending" });

        if (!unverifiedUser) {
            return res.status(404).json({ 
                status: "Error", 
                message: "Pending user not found or already processed" 
            });
        }

        // Update status to rejected (don't create entries in User or ProfileInfo collections)
        unverifiedUser.status = "rejected";
        await unverifiedUser.save();

        // Optional: Delete the uploaded PDF file
        if (unverifiedUser.pdfFile) {
            const filePath = path.join(__dirname, unverifiedUser.pdfFile);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        res.json({ 
            status: "Success", 
            message: "User rejected successfully",
            email: unverifiedUser.email
        });

    } catch (error) {
        console.error("Error rejecting user:", error);
        res.status(500).json({ 
            status: "Error", 
            message: "Internal Server Error",
            error: error.message 
        });
    }
});

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
// ======================== SERVER START ======================== //

app.listen(3001, () => {
    console.log("Server is running on http://localhost:3001");
});
