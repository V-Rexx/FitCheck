const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

async function analyzeResumeGap(resume, jobDescription) {
  const systemPrompt = `You are a technical recruiter assistant.
    Compare a candidate's resume against a job description and report the gap.
    Only consider skills/requirements actually stated in the job description.

    Before judging coverage, EXPAND common stack acronyms and treat their components
    as present. For example: MERN = MongoDB, Express, React, Node.js;
    MEAN = MongoDB, Express, Angular, Node.js. A resume saying "MERN" already
    covers React and MongoDB — do not list those as missing.

    Be honest and accurate:
    - matchedSkills: JD requirements the resume clearly covers (including via expanded acronyms).
    - missingSkills: JD requirements genuinely absent from the resume.
    - suggestions: ONLY reframe or sharpen experience the resume ALREADY shows, to better
    match the JD's wording. NEVER invent skills, tools, or experience the candidate does
    not have. Never claim familiarity with a skill that is in missingSkills.

    Return ONLY a JSON object with EXACTLY these keys:
    {
    "matchScore": <integer 0-100, overall fit>,
    "matchedSkills": [<JD requirements the resume clearly covers>],
    "missingSkills": [<JD requirements missing from the resume>],
    "suggestions": [
        {
        "original": "<a real phrase from the resume>",
        "improved": "<a rewritten bullet tailored to this JD, using only real experience>",
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
      model: MODEL,
      temperature: 0.3,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `RESUME:\n${resume}\n\nJOB DESCRIPTION:\n${jobDescription}` },
      ],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Groq API ${res.status}: ${errText}`);
  }

  const data = await res.json();
  return parseAnalysis(data.choices[0].message.content);
}

function parseAnalysis(raw) {
  const cleaned = raw.replace(/```json/gi, "").replace(/```/g, "").trim();

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error("LLM returned non-JSON output");
  }

  return {
    matchScore: Number(parsed.matchScore) || 0,
    matchedSkills: Array.isArray(parsed.matchedSkills) ? parsed.matchedSkills : [],
    missingSkills: Array.isArray(parsed.missingSkills) ? parsed.missingSkills : [],
    suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
    summary: typeof parsed.summary === "string" ? parsed.summary : "",
  };
}

module.exports = { analyzeResumeGap };