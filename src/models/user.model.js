import mongoose from "mongoose";

const userschema=new mongoose.Schema({
    username:{
        type:String,
        unique:[true,'username already taken']
    },
    email:{
        type:String,
        unique:[true,'account already exist with this email address'],
        required:true
    },
    password:{
        type:String,
        required:true
    }

})
const usermodel=mongoose.model('users',userschema);
export default usermodel;
