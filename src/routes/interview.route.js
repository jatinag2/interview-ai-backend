import { Router } from "express";
import rateLimit from "express-rate-limit";
import authmiddleware from "../middleware/auth.middleware.js";
import upload from "../middleware/multer.middleware.js";
import {getinterviewreport,allreport,getinterviewreportwithid,generateresumepdf} from "../controllers/interview.controller.js";
const interviewrouter=Router()


const generateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, 
  message: {
    message: "Too many interview plans generated from this IP, please try again after 15 minutes",
  },
  standardHeaders: true, 
  legacyHeaders: false, 
});

interviewrouter.post('/',authmiddleware,generateLimiter,upload.single('file'),getinterviewreport)

interviewrouter.get('/report/:interviewid',authmiddleware,getinterviewreportwithid)
interviewrouter.get('/',authmiddleware,allreport)
interviewrouter.get('/resume/pdf/:reportId',authmiddleware,generateresumepdf)
export default interviewrouter