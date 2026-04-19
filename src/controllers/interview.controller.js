
import {generateInterviewReport, generateResumePdf} from '../services/ai.services.js'
import interviewReportModel from '../models/Interview.model.js'
import { createRequire } from "module"; 

const require = createRequire(import.meta.url);



const pdfparse = require("pdf-parse");
  

async function getinterviewreport(req,res) {
    
    console.log(typeof pdfparse);
    try {

    const {selfdescribe,jobdescribe}=req.body
  console.log("Received selfdescribe:", selfdescribe);


  console.log("Received jobdescribe:", jobdescribe);
    if (!req.file) {
  return res.status(400).json({
    message: "Resume file is required",
  });
}
if (!req.file?.buffer) {
  return res.status(400).json({ message: "Invalid file upload" });
}
    const resumecontext=await pdfparse(req.file.buffer)

    const interviewreport=await generateInterviewReport({
        resume:resumecontext.text,
        
  selfdescribe: selfdescribe,   
  jobdescribe: jobdescribe, 
    })
  
     const interviewresult=await interviewReportModel.create({
        resume:resumecontext.text,
         selfDescription: selfdescribe,   // ✅ FIXED
  jobDescription: jobdescribe,   
        matchScore:interviewreport.matchScore,
        technicalQuestion:interviewreport.technicalQuestion,
        behaviouralQuestion:interviewreport.behaviouralQuestion,    
        skillGaps:interviewreport.skillGaps,
       preparationPlans: interviewreport.preparationPlans || [],
        user:req.user.id
     })

     res.status(200).json({
        message:"interview report generated successfully",
        interviewReport:interviewresult
     })
    } catch (error) {
        console.error("Error generating interview report:", error);
        res.status(500).json({
          message: "An error occurred while generating the interview report.",
          error: error.message,
        });
    }
    

}


async function getinterviewreportwithid(req,res) {
    const interviewid=req.params.interviewid;
    if(!interviewid){
       return res.status(404).json({
            message:"interview id is required"
        })
    }
    const report=await interviewReportModel.findOne({_id:interviewid,user:req.user.id})
    if(!report){
        return res.status(404).json({
            message:"interview id is wrong"
        })
    }
    res.status(200).json({
        interviewReport:report
    })
}

async function allreport(req,res) {
    const userid=req.user.id;
     const reports=await interviewReportModel.find({user:userid})
    // const reports=await (await interviewModel.find({user:userid})).toSorted({createdAt:-1}).select('-resume -__v -user -updatedAt -technicalQuestion -behaviouralQuestion -skillGaps -preprationPlans -matchScore -jobDescription -selfDescription ')    
    res.status(200).json({
        interviewReports:reports
    })
}


async function generateresumepdf(req,res) {
    const {reportId}=req.params
    if(!reportId){
        return res.status(404).json({
            message:"report id is required"
        })
    }   
    const report=await interviewReportModel.findById(reportId)
    if(!report){
        return res.status(404).json({
            message:"report not found"
        })
    }
    const {resume,selfdescribe,jobdescribe}=report
    const pdfBuffer=await generateResumePdf({ resume, selfdescribe, jobdescribe })
    res.set({
        'Content-Type':'application/pdf',
   'Content-Disposition': `attachment; filename=resume_${reportId}.pdf`
    })
    res.send(pdfBuffer)
}
export  {getinterviewreport,getinterviewreportwithid,allreport,generateresumepdf}