const express = require('express');
const router = express.Router();
const Post = require('../models/post');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt=require('jsonwebtoken');


// Home Page
// Home Page with Pagination
router.get('/', async (req, res) => {
    try {
      const locals = { title: "Welcome to Blogee" };
      res.render('landing', { locals ,layout:false});
    } catch (err) {
      console.error("Error rendering landing page:", err);
      res.status(500).send("Something went wrong!");
    }
  });

  
  




// router.get('/', async (req, res) => {
//     const locals = {
//         title: "Node.js Blog",
//     };

//     try {
//         const data = await Post.find(); // Fetch posts from MongoDB
//         res.render('index', { locals, data }); // ✅ Pass `data` to EJS
//     } catch (err) {
//         console.error("Database Error:", err);

//         // ✅ Ensure `data` is always defined (even in case of an error)
//         // res.render('index', { locals, data: [] }); 
//     }
// });


//get id

router.get('/post/:id', async (req, res) => {

    try {

        let slug=req.params.id;
        const data = await Post.findById(slug); // Fetch posts from MongoDB
        
        const locals = { 
            title: data.title,
            currentRoute:`/post/${slug}`
        }
        res.render('Post', { locals, data }); // ✅ Pass `data` to EJS
    } catch (err) {
        console.error("Database Error:", err);
    }
});


//POST Search

router.post('/search', async (req, res) => {
    try {
        const locals = {
            title: "Search",
        };
        let searchTerm = req.body.searchTerm;
        const splchar = searchTerm.replace(/[!@#$%^&*(),.?":{}|<>]/g,"");
        
        const data = await Post.find({
            $or:[
                {title:{$regex:splchar,$options:'i'}},
                {body:{$regex:splchar,$options:'i'}}
            ]
        }); 
        res.render('search', { locals, data }); 
    } catch (err) {
        console.error("Database Error:", err);
    }
});

//home 


// router.get('/home', async (req, res) => {
//     try {
//         const posts = await Post.find().sort({ createdAt: -1 }); // Latest first
//         res.render('home', { posts }); // render home.ejs
//     } catch (err) {
//         res.status(500).send('Server Error');
//     }
// });


// function insertone(){
//     Post.insertMany([{
//         title:"Build a node js site",
//         body:"This is a body of the post"
//         },
//         {
//             title:"Build a node js",
//             body:"This is a body of the post"
//         },
//         {
//             title:"Build a node js site",
//             body:"Thisben"
//         },
//     ])
// }

// insertone();


// About Page

// Insert Post (Fixed)
// router.post('/add-post', async (req, res) => {
//     try {
//         const newPost = await Post.create({
//             title: "Build a Node.js site",
//             body: "This is the body of the post",
//         });
//         res.status(201).json({ message: "Post added!", post: newPost });
//     } catch (err) {
//         res.status(500).json({ error: "Error inserting post" });
//     }
// });


module.exports = router;