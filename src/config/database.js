import mongoose from 'mongoose'

async function connectToDB() {
    try {
         await mongoose.connect(process.env.MONGODB_URI)
         console.log('connected to db')
         console.log("mongoose state:", mongoose.connection.readyState);
         
    } catch (error) {
        console.error(error)
        process.exit(1)
    }
   
}

export default connectToDB;