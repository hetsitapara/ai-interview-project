const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateAIOverview(question, userAnswer, score, feedback) {
    if (!process.env.GEMINI_API_KEY) {
        console.warn("GEMINI_API_KEY is not set in .env");
        return "AI Overview unavailable (No API Key).";
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
        You are an elite interview coach. Provide a concise, professional, and encouraging AI analysis (maximum 60 words) for the user's answer.
        
        Question: ${question}
        User's Answer: ${userAnswer || "Skipped"}
        Our Calculated Score: ${score}/10
        ML Feedback: ${feedback}
        
        Requirements:
        1. Explain briefly why the score was given.
        2. Provide one sharp, actionable improvement tip.
        3. Do not use markdown headers or bolding.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text().trim();
    } catch (error) {
        console.error("AI Overview Generation Error:", error);
        return "Deep analysis currently unavailable.";
    }
}

module.exports = { generateAIOverview };
