import mongoose from "mongoose";

// ================= SUB SCHEMAS =================

const technicalQuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, 'question is required']
  },
  intention: {
    type: String,
    required: [true, 'intention is required']
  },
  answer: {
    type: String,
    required: [true, 'answer is required']
  }
}, { _id: false });

const behaviouralQuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, 'question is required']
  },
  intention: {
    type: String,
    required: [true, 'intention is required']
  },
  answer: {
    type: String,
    required: [true, 'answer is required']
  }
}, { _id: false });

const skillGapSchema = new mongoose.Schema({
  skill: {
    type: String,
    required: [true, 'skill is required']
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high'],
    required: [true, 'severity is required']
  }
}, { _id: false });

const preparationSchema = new mongoose.Schema({
  day: {
    type: Number,
    required: [true, 'day is required']
  },
  focus: {
    type: String,
    required: [true, 'focus is required']
  },
  tasks: [{
    type: String,
    required: [true, 'task is required']
  }]
}, { _id: false });

// ================= MAIN SCHEMA =================

const InterviewSchema = new mongoose.Schema({
  selfDescription: {
    type: String
  },
  resume: {
    type: String
  },
  jobDescription: {
    type: String
  },
  matchScore: {
    type: Number,
    min: 0,
    max: 100
  },
  technicalQuestion: [technicalQuestionSchema],
 behaviouralQuestion: [behaviouralQuestionSchema],
  skillGaps: [skillGapSchema],
  preparationPlans: [preparationSchema], // ✅ fixed
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users'
  },
  title: {
    type: String
  }
}, {
  timestamps: true
});

const interviewReportModel = mongoose.model('Interview', InterviewSchema);

export default interviewReportModel;