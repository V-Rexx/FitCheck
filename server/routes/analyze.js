const express = require("express");
const multer = require("multer");
const router = express.Router();
const { analyzeResumeGap } = require("../services/llm");
const { extractPdfText } = require("../services/extractText");

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5*1024*1024} //5mb
});

router.post("/analyze", upload.single("resumeFile"), async (req, res) => {
  const { resume, jobDescription } = req.body;

  if(!jobDescription){
    return res.status(400).json({ error: "'jobDescription' is required."});
  }
  if(!req.file && !resume){
    return res.status(400).json({ error: "Provide a resume as 'resumeFile' (PDF) or 'resume' (text)."})
  }

  try {

    const resumeText = req.file ? await extractPdfText(req.file.buffer) : resume;

    const analysis = await analyzeResumeGap(resumeText, jobDescription);
    res.json(analysis);
  } catch (err) {
    console.error("Analyze failed:", err.message);
    res.status(502).json({ error: "Analysis failed. Please try again." });
  }
});

module.exports = router;