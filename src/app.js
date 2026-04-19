import express from 'express'
import authrouter from './routes/auth.route.js'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import interviewrouter from './routes/interview.route.js'
const app=express()
app.use(cookieParser())

app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin:"https://interview-ai-frontend-eight.vercel.app",
    credentials:true    
}

))
app.use('/api/auth',authrouter)
app.use('/api/interview',interviewrouter)
export default app