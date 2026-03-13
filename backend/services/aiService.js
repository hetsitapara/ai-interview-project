const { Ollama } = require("ollama");

const OLLAMA_HOST = process.env.OLLAMA_HOST || "http://127.0.0.1:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3";

const ollama = new Ollama({ host: OLLAMA_HOST });

/**
 * Wrapper with timeout to prevent hanging
 */
function withTimeout(promise, ms = 60000) {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error(`llama3 timeout after ${ms / 1000}s`)), ms)
  );
  return Promise.race([promise, timeout]);
}

/**
 * Core llama3 call helper
 */
async function askLlama(prompt, maxTokens = 512) {
  const response = await withTimeout(
    ollama.chat({
      model: OLLAMA_MODEL,
      messages: [{ role: "user", content: prompt }],
      options: { temperature: 0.4, num_predict: maxTokens, top_k: 20 }
    }),
    90000
  );
  return response.message.content.trim();
}

// ─────────────────────────────────────────────
// 1. RESUME ADVISOR
// ─────────────────────────────────────────────
/**
 * Analyzes a resume text and returns structured advice.
 * @param {string} resumeText - Plain text extracted from PDF
 * @param {string[]} skills - Skills extracted by Python parser
 */
async function analyzeResume(resumeText, skills = []) {
  const prompt = `You are a senior technical recruiter and career coach.
Analyze the following resume and provide deep technical feedback.

Resume Text:
${resumeText.substring(0, 3000)}

Detected Skills: ${skills.join(", ")}

Return ONLY valid JSON:
{
  "ats_score": <number 0-100>,
  "impact_score": <number 0-100>,
  "strengths": ["...", "..."],
  "weaknesses": ["...", "..."],
  "missing_sections": ["...", "..."],
  "improvement_tips": ["...", "..."],
  "suggested_skills": ["...", "..."],
  "project_ideas": [
    { "title": "Project Name", "description": "Short technical description", "tech_stack": ["...", "..."] }
  ],
  "interview_strategy": "A 2-3 sentence strategic advice for this candidate",
  "overall_verdict": "One sentence summary"
}`;

  try {
    let text = await askLlama(prompt, 600);
    text = text.replace(/```json|```/g, "").trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    throw new Error("No JSON found");
  } catch (e) {
    console.error("❌ Resume advisor error:", e.message);
    return {
      ats_score: 0,
      strengths: [],
      weaknesses: ["Could not analyze resume at this time"],
      missing_sections: [],
      improvement_tips: ["Please try again in a moment"],
      suggested_skills: [],
      overall_verdict: "Analysis unavailable"
    };
  }
}

// ─────────────────────────────────────────────
// 2. INTERVIEW PERFORMANCE COACH
// ─────────────────────────────────────────────
/**
 * Generates a personal coaching report after an interview.
 * @param {Array} results - Array of { question, user_answer, accuracy_score, evaluation }
 */
async function generateCoaching(results) {
  const summary = results.map((r, i) =>
    `Q${i + 1}: ${r.question}\nAnswer: ${r.user_answer || "Skipped"}\nScore: ${r.accuracy_score || 0}/1\nEvaluation: ${r.evaluation || "N/A"}`
  ).join("\n\n");

  const prompt = `You are an expert interview coach. Based on this interview session:

${summary}

Write a CONCISE (max 150 words), encouraging coaching message that:
1. Identifies the top 2 weak areas with specific advice
2. Highlights what they did well
3. Gives one actionable next step

Return as plain text (no JSON, no markdown headers).`;

  try {
    return await askLlama(prompt, 350);
  } catch (e) {
    console.error("❌ Coaching error:", e.message);
    return "Great effort on your interview! Focus on reviewing the questions you found difficult and practice explaining concepts clearly. Keep it up!";
  }
}

// ─────────────────────────────────────────────
// 3. SMART QUESTION HINT
// ─────────────────────────────────────────────
/**
 * Generates a one-sentence hint for an interview question.
 * @param {string} question - The interview question
 */
async function generateHint(question) {
  const prompt = `You are a helpful interview coach giving a hint.

Question: "${question}"

Give exactly ONE helpful hint (1-2 sentences) that:
- Points the candidate in the right direction
- Does NOT give away the full answer
- Uses simple language

Hint:`;

  try {
    const hint = await askLlama(prompt, 120);
    return hint;
  } catch (e) {
    console.error("❌ Hint error:", e.message);
    return "Think about the core concept behind this topic and how you've applied it before.";
  }
}

// ─────────────────────────────────────────────
// 4. PERSONALIZED STUDY PLAN
// ─────────────────────────────────────────────
/**
 * Generates a weekly study plan based on weak areas.
 * @param {string[]} weakAreas - List of topics with low scores
 * @param {string} level - 'beginner' | 'intermediate' | 'advanced'
 */
async function generateStudyPlan(weakAreas, level = "intermediate") {
  const prompt = `You are a technical interview preparation mentor.

The candidate is at ${level} level and needs to improve in: ${weakAreas.join(", ")}.

Create a 5-day structured study plan (Mon–Fri). Return ONLY valid JSON:
{
  "plan": [
    { "day": "Monday", "topic": "...", "goals": ["...", "..."], "resources": ["...", "..."], "practice": "..." },
    { "day": "Tuesday", "topic": "...", "goals": ["...", "..."], "resources": ["...", "..."], "practice": "..." },
    { "day": "Wednesday", "topic": "...", "goals": ["...", "..."], "resources": ["...", "..."], "practice": "..." },
    { "day": "Thursday", "topic": "...", "goals": ["...", "..."], "resources": ["...", "..."], "practice": "..." },
    { "day": "Friday", "topic": "...", "goals": ["...", "..."], "resources": ["...", "..."], "practice": "..." }
  ],
  "weekly_goal": "...",
  "tip": "..."
}`;

  try {
    let text = await askLlama(prompt, 800);
    text = text.replace(/```json|```/g, "").trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    throw new Error("No JSON found");
  } catch (e) {
    console.error("❌ Study plan error:", e.message);
    return { plan: [], weekly_goal: "Review weak areas and practice daily", tip: "Consistency beats intensity." };
  }
}

// ─────────────────────────────────────────────
// 5. MODEL ANSWER GENERATOR
// ─────────────────────────────────────────────
/**
 * Generates a clean sample answer for any interview question.
 * @param {string} question - The interview question
 * @param {string} idealAnswer - Optional reference answer
 */
async function generateModelAnswer(question, idealAnswer = "") {
  const prompt = `You are a senior software engineer with 10 years of experience.

Write a clear, concise, professional interview answer for:
"${question}"

${idealAnswer ? `Reference material: ${idealAnswer.substring(0, 500)}` : ""}

Rules:
- 3-5 sentences maximum
- Use simple, direct language
- Include a real-world example if applicable
- Sound like a human, not a textbook

Answer:`;

  try {
    return await askLlama(prompt, 300);
  } catch (e) {
    console.error("❌ Model answer error:", e.message);
    return idealAnswer || "Could not generate an answer at this time. Please try again.";
  }
}

// ─────────────────────────────────────────────
// 6. CAREER TIP GENERATOR
// ─────────────────────────────────────────────
/**
 * Generates a personalized career tip based on interview history.
 * @param {string} historySummary - Summary of categories and average scores
 */
async function generateCareerTip(historySummary) {
  const prompt = `You are a career mentor. Based on this candidate's interview history summary:
"${historySummary}"

Provide a short, powerful, and practical career tip (max 25 words).
The tip should be encouraging and focus on long-term growth or a specific interview technique.

Tip:`;

  try {
    return await askLlama(prompt, 100);
  } catch (e) {
    console.error("❌ Career tip error:", e.message);
    return "Candidates who review their reports for 10+ minutes perform 30% better in real technical interviews.";
  }
}

module.exports = {
  analyzeResume,
  generateCoaching,
  generateHint,
  generateStudyPlan,
  generateModelAnswer,
  generateCareerTip
};
