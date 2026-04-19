import usermodel from "../models/user.model.js";
import bcrypt from 'bcrypt'
import jwt from "jsonwebtoken"
import tokenblackelistModel from "../models/blacklist.model.js";
/**
 * @route register user controller
 * @description Register a new user
 * @access   Public
 */
async function registeruser(req,res) {
    const {username,email,password}=req.body;

    if(!username || !email || !password){
        return res.status(400).json({
            message:"please provide crendential"
        })
    }
   const useralreadyexist=await usermodel.findOne({
    $or:[{username},{email}]
   })

   if(useralreadyexist){
        return res.status(400).json({
            message:"account already existwith these credential"
        })
   }
 

  const hashpass=await bcrypt.hash(password,10)
  const user =await usermodel.create({
    username,
    email,
    password:hashpass
  })

  const token =jwt.sign(
    {id:user._id,username:user.username},
    process.env.JWT_SECRET,
    {expiresIn:'1d'}
  )

 
  res.cookie('token',token,{
    httpOnly:true,
    secure:process.env.NODE_ENV==='production',
    sameSite:'none'
  })

  res.status(201).json({
    message:"user registered successfully",
     user:{
        id:user._id,
        username:user.password,
        email:user.email
    }
  })

}
/**
 * @route login user controller
 * @description login a user
 * @access   Public
 */

async function loginuser(req,res) {
    const {email,password}=req.body

    const user=await usermodel.findOne({email})
    if(!user){
        return res.status(400).json({
            message:"user with this mail not exist"
        })
    }

    const ispassvalid=await bcrypt.compare(password,user.password)
    if(!ispassvalid){
         return res.status(400).json({
            message:"invalid password"
        })
    }

    const token =jwt.sign(
    {id:user._id,username:user.username},
    process.env.JWT_SECRET,
    {expiresIn:'1d'}
  )

  res.cookie('token',token,{
    httpOnly:true,
    secure:process.env.NODE_ENV==='production',
    sameSite:'none'
  })

  res.status(200).json({
    message:"user login successfully",
    user:{
        id:user._id,
        username:user.username,
        email:user.email
    }
  })
}

/**
 * @route logout user controller
 * @description logout a user
 * @access   Public
 */
async function logoutuser(req,res) {
    const token=req.cookies.token

     
if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
}
    if(token){
        await tokenblackelistModel.create({
            token
        })
    }

    res.clearCookie('token')
   
    res.status(200).json({
        message:"user logout successfully"
    })

}

async function getme(req,res) {
    const user=await usermodel.findById(req.user.id)
    if(user){
        res.status(200).json({
            message:"user dats fetched successfully",
            user:{
                id:user._id,
                email:user.email,
                username:user.username
            }
        })
    }
}
export {registeruser,loginuser,logoutuser,getme}