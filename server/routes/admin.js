const express = require('express');
const router = express.Router();
const Post = require('../models/post');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt=require('jsonwebtoken');
const { render } = require('ejs');
const jwtsecret=process.env.JWT_SECRET;
const multer = require('multer');
const path = require('path');
const adminLayout='../views/layouts/admin';

const authMiddleware = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        const decoded = jwt.verify(token, jwtsecret);
        req.userId = decoded.userId;  // Extract the `userId` properly
        next();
    } catch (err) {
        return res.status(401).json({ message: "Unauthorized" });
    }
};




//Post admin check dashboard
router.get('/dashboard', authMiddleware, async (req, res) => {
    try {
        const locals = {
            title: "DashBoard",
        };
        const data = await Post.find({ userId: req.userId });
        res.render('admin/dashboard', { locals, data});
    } catch (err) {
        console.log(err);
    }
});

//Admin home page
router.get('/home', authMiddleware, async (req, res) => {
    try {
        const locals = { title: "Dashboard" };

        const perpage = 8;
        const page = parseInt(req.query.page) || 1;

        const data = await Post.aggregate([{ $sort: { createdAt: -1 } }])
            .skip(perpage * page - perpage)
            .limit(perpage)
            .exec() || []; // Ensure `data` is an array

        const count = await Post.countDocuments();
        const nextpage = page + 1;
        const hasnextpage = nextpage <= Math.ceil(count / perpage);

        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).send('User not found');
        }

        res.render('admin/home', {
            locals,
            data,
            user,
            current: page,
            nextpage: hasnextpage ? nextpage : null
        });

    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).render('admin/home', {
            locals: { title: "Dashboard" },
            data: [], // Pass an empty array if an error occurs
            user: {},
            current: 1,
            nextpage: null
        });
    }
});



// Admin login Page
router.get('/login', async (req, res) => {
    try {
        const locals = {
            title: "Node.js Blog",
        };

        // const data = await Post.find({ userId: req.userId }); // Fetch posts from MongoDB
        const user = await User.findById(req.params.id); // Assuming `req.userId` exists

        res.render('admin/index', { locals, user, layout: adminLayout }); // ✅ Pass `data` to EJS
    } catch (err) {
        console.error("Database Error:", err);
    }
});

//Post admin - check login

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign({ userId: user._id }, jwtsecret);
        res.cookie('token', token, { httpOnly: true });
        res.redirect('/home');
    } catch (err) {
        console.error(err);
    }
});




//get add post
router.get('/add-post', authMiddleware, async (req, res) => {

    try{
        const locals={
            title:"Add-Post",
        }
        const data=await Post.find({ userId: req.params.id });
        res.render('admin/add-post',{locals,
            data
        });
    }catch(err){
        console.log(err);
    }
});

//post add post
router.post('/add-post', authMiddleware, async (req, res) => {

    try{
        const newpost=new Post({
            title:req.body.title,
            body:req.body.body,
            userId: req.userId // Assign the logged-in user's ID
        });
        await newpost.save();
        res.redirect('/dashboard');
    }catch(err){
        console.log(err);
    }
});


//get edit post
//get add post
router.get('/edit-post/:id', authMiddleware, async (req, res) => {

    try{
        const locals={
            title:"Edit-Post",
        }
        const data=await Post.findOne({_id:req.params.id});
        res.render('admin/edit-post',{ locals,
            data,
        });
    }catch(err){
        console.log(err);
    }
});
//PUT edit post

router.put('/edit-post/:id', authMiddleware, async (req, res) => {

    try{
       await Post.findByIdAndUpdate(req.params.id,{
         title:req.body.title,
         body : req.body.body,
         updatedAt:Date.now()
        });
        res.redirect('/dashboard');
        
    }catch(err){
        console.log(err);
    }
});

// router.post('/admin', async (req, res) => {
//     try {
//         const { username, password } = req.body;
//         if(username === 'admin' && password === 'admin'){
//             res.redirect('/admin/dashboard');
//         }
//         else{
//             res.redirect('/admin');
//         }
//         res.render('admin/index', { locals,layout:adminLayout }); // ✅ Pass `data` to EJS
//     } catch (err) {
//         console.error("Database Error:", err);
//     }
// });


//admin register

router.post('/register', async (req, res) => {
    try {
        const {username,email,password}=req.body;
        const hashedPassword=await bcrypt.hash(password,10);
        const user=new User({
            username,
            email,
            password:hashedPassword
        });
        await user.save();
        //res.status(201).json({message:"User created successfully",user});
        res.redirect('/admin');
    } catch (err) {
        res.status(500).json({message:"Internal server error"});
    }
});

// router.post('/register', async (req, res) => {
//     try {
//         const { username, email, password } = req.body;
//         const user = new User({
//             email,
//             username,
//             password
//         });
//         res.status(201).json({ message: "User created successfully", user });

//     } catch (err) {
//         console.error("Database Error:", err);
//     }
// });


//DELETE
//Admin Delete post
router.delete('/delete-post/:id',authMiddleware,async(req,res)=>{
    try{
        await Post.findByIdAndDelete(req.params.id);
        res.redirect('/dashboard');
    }
    catch(err){
        console.log(err);
    }
});


//Admin Logout
router.get('/logout',(req,res)=>{
    res.clearCookie('token');
    res.redirect('/login');
});




//profile
router.get('/profile', async (req, res) => {
    try {
        const locals = { title: "Node.js Blog" };

        let perpage = 2;
        let page = parseInt(req.query.page) || 1;

        const data = await Post.aggregate([{ $sort: { createdAt: -1 } }])
            .skip(perpage * page - perpage)
            .limit(perpage)
            .exec();

        const count = await Post.countDocuments();
        const nextpage = parseInt(page) + 1;
        const hasnextpage = nextpage <= Math.ceil(count / perpage);
        const user = await User.findOne({ userId: req.userId });
        if (!user) {
            return res.status(404).send('User not found');
        }
        res.render('index', {
            locals,
            data,
            user,
            current: page,
            nextpage: hasnextpage ? nextpage : null,
            // currentRoute:'/'
        });
    } catch (err) {
        console.error("Database Error:", err);
        // res.render('index', { locals, data: [], current: 1, nextpage: null });
    }
});


//Edit profile
// Multer Configuration for Image Upload
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}_${file.originalname}`);
    }
});
const upload = multer({ storage });

// GET Edit Profile Page Route
router.get('/edit-profile/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        res.render('admin/edit-profile', { user });
    } catch (err) {
        console.error("Database Error:", err);
        res.redirect('/dashboard');
    }
});

// POST Route to Update Profile
router.post('/edit-profile/:id', upload.single('image'), async (req, res) => {
    const { name, description } = req.body;
    const updatedData = {
        name,
        description
    };

    if (req.file) {
        updatedData.image = `/uploads/${req.file.filename}`;
    }

    try {
        await User.findByIdAndUpdate(req.params.id, updatedData);
        res.redirect('/dashboard');
    } catch (err) {
        console.error("Update Error:", err);
        res.redirect('/edit-profile/' + req.params.id);
    }
});

//profile data
// router.get('/profile/:id', async (req, res) => {
//     try {
//         const user = await User.findById(req.params.id);
//         res.render('profile', { user });
//     } catch (err) {
//         console.error("Database Error:", err);
//         res.redirect('/dashboard');
//     }
// });





module.exports = router;