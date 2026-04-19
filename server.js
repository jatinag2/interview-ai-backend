
import dotenv from 'dotenv'
dotenv.config();

import connectToDB from "./src/config/database.js";

import app from "./src/app.js"

const port=process.env.PORT || 3000;
connectToDB();
app.listen(port,()=>{
    console.log('server is running on port 3000')
})
