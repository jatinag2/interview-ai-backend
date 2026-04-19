import { GoogleGenAI } from "@google/genai";
import { json, z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import puppeteer from "puppeteer";
// ==========import======= SCHEMAS =================

const interviewreportschematech = z.object({
  technicalQuestion: z.array(
    z.object({
      question: z.string(),
      intention: z.string(),
      answer: z.string(),
    })
  ).default([]),
});

const interviewreportschemabehave = z.object({
behaviouralQuestion: z.array(
    z.object({
      question: z.string(),
      intention: z.string(),
      answer: z.string(),
    })
  ).default([]),
});

const interviewreportschemaskill = z.object({
  skillGaps: z.array(
    z.object({
      skill: z.string(),
      severity: z.enum(["low", "medium", "high"]),
    })
  ).default([]),
});

const interviewreportschemaprepare = z.object({
  preparationPlans: z.array(
    z.object({
      days: z.number(),
      focus: z.string(),
      tasks: z.array(z.string()),
    })
  ).default([]),
});

const interviewreportschemamatch = z.object({
  matchScore: z.number().min(0).max(100).default(0),
});

// ================= SAFE AI =================

async function safeAI(callFn, fallback) {
  try {
    const res = await callFn();

    const text =
      res.text;

    if (!text) throw new Error("Empty AI response");

    return JSON.parse(text);
  } catch (err) {
    console.error("AI ERROR:", err.message);
    return fallback;
  }
}

// ================= MAIN FUNCTION =================
async function generationpdffromhtml(htmlcontent){ 
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(htmlcontent,{waitUntil:"networkidle0"});
  const pdfBuffer = await page.pdf({format: 'A4',margin:{
      top: "20mm",
            bottom: "20mm",
            left: "15mm",
            right: "15mm"
  }});
  await browser.close();
  return pdfBuffer;
}


async function generateInterviewReport({
  resume,
  selfdescribe,
  jobdescribe,
}) {
  const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY,
  });

  // ================= PROMPTS =================

  const technicalPrompt = `
Return ONLY JSON:
{ "technicalQuestion": [ { "question": "", "intention": "", "answer": "" } ] }

Resume:
${resume}

Job:
${jobdescribe}
`;

  const behaviouralPrompt = `
Return ONLY JSON:
{ "behaviouralQuestion": [ { "question": "", "intention": "", "answer": "" } ] }

Self:
${selfdescribe}
`;

  const skillPrompt = `
Return ONLY JSON:
{ "skillGaps": [ { "skill": "", "severity": "low|medium|high" } ] }

Resume:
${resume}
Job:
${jobdescribe}
`;

  const prepPrompt = `
Return ONLY JSON:
{ "preparationPlans": [ { "day": number, "focus": string, "tasks": [string] } ] }
 Rules:
- MUST use "day" (not days)
- 3–5 day plan

`;

const matchPrompt = `
Return ONLY JSON:
{ "matchScore": number (0-100) }

Rules:
- Compare resume with job description
- Consider skills, experience, keywords match
- Be strict and realistic

Resume:
${resume}

Job:
${jobdescribe}

Self Description:
${selfdescribe}
`;

  // ================= PARALLEL CALLS =================

  const [match,tech, behave, skill, prep] = await Promise.all([
     safeAI(
    () =>
      ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: matchPrompt,
      }),
    { matchScore: 0 }
  ),
    
    safeAI(
      () =>
        ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: technicalPrompt,
        }),
      { technicalQuestion: [] }
    ),
   

    safeAI(
      () =>
        ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: behaviouralPrompt,
        }),
      { behaviouralQuestion: [] }
    ),

    safeAI(
      () =>
        ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: skillPrompt,
        }),
      { skillGaps: [] }
    ),

    safeAI(
      () =>
        ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: prepPrompt,
        }),
      { preparationPlans: [] }
    ),
  ]);

  // ================= FINAL OUTPUT =================

  return {
    matchScore: match.matchScore || 0,
    technicalQuestion: tech.technicalQuestion || [],
    behaviouralQuestion: behave.behaviouralQuestion || [],
    skillGaps: skill.skillGaps || [],
    preparationPlans: prep.preparationPlans || [],
  };
}

async function generateResumePdf({  resume,
  selfdescribe,
  jobdescribe, }) {
   const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY,
  });

    const resumePdfSchema = z.object({
        html: z.string().describe("The HTML content of the resume which can be converted to PDF using any library like puppeteer")
    })

    const prompt = `Generate resume for a candidate with the following details:
                        Resume: ${resume}
                        Self Description: ${selfdescribe}
                        Job Description: ${jobdescribe}

                        the response should be a JSON object with a single field "html" which contains the HTML content of the resume which can be converted to PDF using any library like puppeteer.
                        The resume should be tailored for the given job description and should highlight the candidate's strengths and relevant experience. The HTML content should be well-formatted and structured, making it easy to read and visually appealing.
                        The content of resume should be not sound like it's generated by AI and should be as close as possible to a real human-written resume.
                        you can highlight the content using some colors or different font styles but the overall design should be simple and professional.
                        The content should be ATS friendly, i.e. it should be easily parsable by ATS systems without losing important information.
                        The resume should not be so lengthy, it should ideally be 1-2 pages long when converted to PDF. Focus on quality rather than quantity and make sure to include all the relevant information that can increase the candidate's chances of getting an interview call for the given job description.
                    `

    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: zodToJsonSchema(resumePdfSchema),
        }
    })


    const jsonContent = JSON.parse(response.text)

    const pdfBuffer = await generationpdffromhtml(jsonContent.html)

    return pdfBuffer

}


export { generateInterviewReport ,generateResumePdf };