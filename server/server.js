const express = require('express');
const dotenv = require('dotenv');

const app = express();
app.use(express.json());

dotenv.config();

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

async function analyzeResumeGap(resume, jobDescription) {
  // Instructions + the EXACT output contract live in the system message.
  const systemPrompt = `You are a technical recruiter assistant.
    Compare a candidate's resume against a job description and report the gap.
    Only consider skills/requirements actually stated in the job description.
    Do not invent skills the resume does not show.

    Return ONLY a JSON object with EXACTLY these keys:
    {
    "matchScore": <integer 0-100, overall fit>,
    "matchedSkills": [<JD requirements the resume clearly covers>],
    "missingSkills": [<JD requirements missing or weak in the resume>],
    "suggestions": [
        {
        "original": "<a real phrase from the resume, or empty string if adding new>",
        "improved": "<a rewritten bullet tailored to this JD>",
        "reason": "<one short sentence why it helps>"
        }
    ],
    "summary": "<one sentence overall verdict>"
    }
    Give 3-5 suggestions. No markdown, no text outside the JSON.`;

  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      temperature: 0.3, // low = consistent analysis, not creative variety
      response_format: { type: "json_object" }, // guarantee valid JSON
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `RESUME:\n${resume}\n\nJOB DESCRIPTION:\n${jobDescription}` },
      ],
    }),
  });

  if(!res.ok){
    const errText = await res.text();
    throw new Error(`Groq API ${res.status}: ${errText}`);
  }

  const data = await res.json();
  const content = data.choices[0].message.content;
  return JSON.parse(content); // the model's JSON text -> a real JS object
}


app.get("/", (req, res) => {
    res.send("Analyzer API is running");
});

app.post("/analyze", async (req, res) => {
  const { resume, jobDescription } = req.body;

  if (!resume || !jobDescription) {
    return res
      .status(400)
      .json({ error: "Both 'resume' and 'jobDescription' are required." });
  }

  try {
    const analysis = await analyzeResumeGap(resume, jobDescription);
    res.json(analysis);
  } catch (err) {
    console.error(err);
    res.status(502).json({ error: err.message });
  }
});


const PORT = 8080
app.listen(PORT, () => console.log(`Server running on PORT: ${PORT}`));