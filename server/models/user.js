const mongoose=require('mongoose');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String
    },
    description: {
        type: String,
        default: "N/A"
    },
    photo: {
        type: String
    }
});


module.exports=mongoose.model('User',UserSchema);