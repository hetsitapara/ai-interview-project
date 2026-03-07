const ollama = require("ollama").default;

// Keep the prompt short to reduce LLM processing time
const BASE_PROMPT = `You are an AI interview evaluator. Improve or correct the candidate's answer.

Rules:
- PARTIAL: Keep the user's idea, fix grammar, add keywords, improve clarity.
- CORRECT: Keep almost identical, only fix minor grammar.
- INCORRECT: Provide the ideal answer instead.

Return ONLY valid JSON (no extra text):
{"type":"correct|partial|incorrect","refined_answer":"final answer here"}`;

const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3";

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
Ideal: ${idealAnswer}
User: ${userAnswer || "No answer"}

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
      // Normalize to lowercase to match Mongoose enum ['correct','partial','incorrect','unknown','error','']
      const type = (parsed.type || "partial").toLowerCase();
      console.log(`✅ Ollama [${question.substring(0,30)}...] → ${type}`);
      return {
        type,
        refined_answer: parsed.refined_answer || userAnswer
      };
    } catch {
      // If can't parse, return raw text as refined answer
      return { type: "partial", refined_answer: text };
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

module.exports = { evaluateAnswer };
