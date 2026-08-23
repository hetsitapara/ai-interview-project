const { Ollama } = require("ollama");

const OLLAMA_HOST = process.env.OLLAMA_HOST || "http://127.0.0.1:11434";
const ollama = new Ollama({ host: OLLAMA_HOST });

// Keep the prompt short to reduce LLM processing time
const BASE_PROMPT = `You are a strict but fair technical interviewer. Evaluate the candidate's answer based on your own knowledge.

Rules:
1. Provide a "score" from 0.0 to 10.0 based purely on technical accuracy. If the answer is gibberish, irrelevant, or totally incorrect, you MUST give a score of 0.
2. Provide an "improved_answer" containing the perfect, professional version of how the question should have been answered.
3. Provide short "advice" explaining how to improve.
4. Provide a "rationale" explaining why the score was given.
5. Provide an "accuracy" percentage (0 to 100) on how technically correct they are.
6. Provide a "keywords_score" percentage (0 to 100) based on their use of relevant technical terms.

Return ONLY valid JSON (no extra text):
{"score": 8.0, "improved_answer": "...", "advice": "...", "rationale": "...", "accuracy": 85, "keywords_score": 80}`;

const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "qwen2.5:1.5b-instruct-q4_0";

/**
 * Timeout wrapper: rejects if Ollama takes too long.
 */
function withTimeout(promise, ms = 30000) {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error(`Ollama timeout after ${ms}ms`)), ms)
  );
  return Promise.race([promise, timeout]);
}

/**
 * Evaluates a user's answer using local Ollama LLM.
 */
async function evaluateAnswer(question, idealAnswer, userAnswer) {
  const prompt = `${BASE_PROMPT}

Q: ${question}
User Answer: ${userAnswer || "No answer"}

JSON:`;

  try {
    const response = await withTimeout(
      ollama.chat({
        model: OLLAMA_MODEL,
        messages: [{ role: "user", content: prompt }],
        options: {
          temperature: 0.1,  // Very low for fast, consistent output
          num_predict: 256,  // Short output only
          top_k: 10          // Narrow sampling for speed
        }
      }),
      45000 // 45 second timeout
    );

    let text = response.message.content.trim();

    // Strip markdown code blocks
    text = text.replace(/```json|```/g, "").trim();

    // Extract the first JSON object found
    const jsonMatch = text.match(/\{[\s\S]*?\}/);
    if (jsonMatch) {
      text = jsonMatch[0];
    }

    try {
      const parsed = JSON.parse(text);
      console.log(`✅ Ollama [${question.substring(0,30)}...] → score: ${parsed.score}`);
      return {
        score: parsed.score !== undefined ? parsed.score : null,
        advice: parsed.advice || "",
        rationale: parsed.rationale || "",
        accuracy: parsed.accuracy || 0,
        keywords_score: parsed.keywords_score || 0,
        improved_answer: parsed.improved_answer || ""
      };
    } catch {
      // If can't parse, return raw text as advice
      return { advice: text };
    }

  } catch (error) {
    if (error.message.includes("timeout")) {
      console.warn("⏳ Ollama timeout — returning original answer");
    } else if (error.message.includes("ECONNREFUSED")) {
      console.error("❌ Ollama not running! Start with: ollama serve");
    } else {
      console.error("❌ Ollama Error:", error.message);
    }
    // Always fall back gracefully — never block the interview from completing
    return { type: "error", refined_answer: userAnswer };
  }
}

async function evaluateAnswersBatch(answers) {
  if (!answers || answers.length === 0) return [];
  console.log(`[Ollama] Processing ${answers.length} items sequentially...`);

  const finalResults = [];

  for (let i = 0; i < answers.length; i++) {
    const a = answers[i];
    console.log(`[Ollama] Generating AI answer for question ${i + 1}/${answers.length}`);
    
    // Short-circuit: if the user skipped the question, strictly give 0 and do not waste LLM time
    if (!a.userAnswer || a.userAnswer.trim() === "") {
        console.log(`✅ Ollama [${a.questionText.substring(0,30)}...] → SKIPPED (Score: 0)`);
        finalResults.push({
          ...a,
          aiAdvice: "You did not provide an answer. In a real interview, it's better to talk through your thought process than remain completely silent.",
          aiScore: 0,
          aiRationale: "The question was skipped.",
          aiAccuracy: 0,
          aiKeywordsScore: 0,
          aiImprovedAnswer: ""
        });
        continue;
    }

    const evalResult = await evaluateAnswer(a.questionText, a.idealAnswer, a.userAnswer);
    
    finalResults.push({
      ...a,
      aiAdvice: evalResult.advice || "",
      aiScore: evalResult.score !== undefined ? evalResult.score : null,
      aiRationale: evalResult.rationale || "",
      aiAccuracy: evalResult.accuracy || 0,
      aiKeywordsScore: evalResult.keywords_score || 0,
      aiImprovedAnswer: evalResult.improved_answer || ""
    });
  }

  return finalResults;
}

module.exports = { evaluateAnswer, evaluateAnswersBatch };
