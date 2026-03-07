const ollama = require("ollama").default;

/*
Preloaded prompt with your conditions
*/

const BASE_PROMPT = `
You are an AI interview evaluator.

Your job is to improve or correct a candidate's answer.

Follow these rules strictly:

CASE 1 — PARTIALLY CORRECT ANSWER
If the user's answer is partially correct:
- Keep the user's idea
- Fix grammar and spelling
- Add missing keywords if necessary
- Improve clarity
- Do NOT completely rewrite the answer

CASE 2 — CORRECT ANSWER
If the answer is correct:
- Keep the answer almost identical
- Only fix grammar and wording

CASE 3 — INCORRECT ANSWER
If the answer is completely incorrect:
- Ignore the user's answer
- Provide the correct answer using the ideal answer

IMPORTANT: Return ONLY a valid JSON object, no extra text:

{
  "type": "correct | partial | incorrect",
  "refined_answer": "final improved answer"
}
`;

const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3";
const OLLAMA_HOST = process.env.OLLAMA_HOST || "http://127.0.0.1:11434";

/**
 * Evaluates a user's answer against an ideal answer using Ollama (local LLM).
 * @param {string} question - The interview question.
 * @param {string} idealAnswer - The reference/ideal answer.
 * @param {string} userAnswer - The answer provided by the candidate.
 * @returns {Promise<Object>} - An object with { type, refined_answer }.
 */
async function evaluateAnswer(question, idealAnswer, userAnswer) {
  const prompt = `${BASE_PROMPT}

Question:
${question}

Ideal Answer:
${idealAnswer}

User Answer:
${userAnswer || "No answer provided"}

Remember: Return ONLY valid JSON.`;

  try {
    const response = await ollama.chat({
      model: OLLAMA_MODEL,
      messages: [
        { role: "user", content: prompt }
      ],
      options: {
        temperature: 0.3,   // Low temperature for consistent evaluation
        num_predict: 512    // Limit response length
      }
    });

    let text = response.message.content.trim();

    // Clean markdown code blocks if present
    if (text.startsWith("```json")) {
      text = text.replace(/```json|```/g, "").trim();
    } else if (text.startsWith("```")) {
      text = text.replace(/```/g, "").trim();
    }

    // Extract JSON if there's extra text around it
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      text = jsonMatch[0];
    }

    try {
      const parsed = JSON.parse(text);
      console.log(`✅ Ollama evaluation complete (type: ${parsed.type})`);
      return {
        type: parsed.type || "partial",
        refined_answer: parsed.refined_answer || text
      };
    } catch (parseError) {
      console.error("⚠️ Failed to parse Ollama JSON output, using raw text:", text.substring(0, 100));
      return {
        type: "partial",
        refined_answer: text
      };
    }
  } catch (error) {
    console.error("❌ Ollama Error:", error.message);

    let explanation = "AI evaluation unavailable.";
    if (error.message.includes("ECONNREFUSED") || error.message.includes("fetch")) {
      explanation = "Ollama is not running. Please start it with: ollama serve";
      console.error("💡 Start Ollama with: ollama serve");
    } else if (error.message.includes("model") && error.message.includes("not found")) {
      explanation = `Model '${OLLAMA_MODEL}' not found. Run: ollama pull ${OLLAMA_MODEL}`;
      console.error(`💡 Pull the model with: ollama pull ${OLLAMA_MODEL}`);
    }

    return {
      type: "error",
      refined_answer: userAnswer,
      explanation
    };
  }
}

module.exports = { evaluateAnswer };
