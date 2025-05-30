const mongoose=require('mongoose');

const postSchema=new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    },
    userId: {  // Reference to User model
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt:{
        type: Date,
        default:Date.now
    }
    
});


module.exports=mongoose.model('Post',postSchema);