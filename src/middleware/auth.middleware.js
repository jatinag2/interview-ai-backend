import jwt from 'jsonwebtoken'
import tokenblackelistModel from '../models/blacklist.model.js'
async function authmiddleware(req,res,next) {
    const token= req.cookies.token
    if(!token){
        return res.status(401).json({
            message:"token not found"
        })
    }
    try {

    //      if (mongoose.connection.readyState !== 1) {
    //   return res.status(503).json({
    //     message: "Database not ready",
    //   });
    // }
         const decoded= jwt.verify(token,process.env.JWT_SECRET)

         const istokenblacklisted=await tokenblackelistModel.findOne({token})
          if(istokenblacklisted){
     return res.status(401).json({
            message:"token is blacklisted "
        })
    }
         req.user=decoded
        next()
   
    } catch (error) {
       return res.status(401).json({
      message: error.message || "Invalid token",
    });
    }
}

export default authmiddleware