import { Router } from "express";
import authmiddleware from "../middleware/auth.middleware.js";
import upload from "../middleware/multer.middleware.js";
import {getinterviewreport,allreport,getinterviewreportwithid,generateresumepdf} from "../controllers/interview.controller.js";
const interviewrouter=Router()




interviewrouter.post('/',authmiddleware,upload.single('file'),getinterviewreport)

interviewrouter.get('/report/:interviewid',authmiddleware,getinterviewreportwithid)
interviewrouter.get('/',authmiddleware,allreport)
interviewrouter.get('/resume/pdf/:reportId',authmiddleware,generateresumepdf)
export default interviewrouter