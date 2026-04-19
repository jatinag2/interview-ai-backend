import mongoose from "mongoose"

const blacklistTokenSchema=new mongoose.Schema({
    token:{
        type:String,
        required:[true,"token required to be blacklist"]
    }
   },{
        timestamps:true
    }
)

const tokenblackelistModel=mongoose.model('blacklistTokens',blacklistTokenSchema)

export default tokenblackelistModel