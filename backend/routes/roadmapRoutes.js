const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { Ollama } = require('ollama');

// @desc    Generate a learning roadmap using AI
// @route   POST /api/roadmap/generate
// @access  Private
router.post('/generate', protect, async (req, res) => {
    const { role, level } = req.body;

    if (!role) {
        return res.status(400).json({ message: 'Role is required' });
    }

    try {
        const ollama = new Ollama({ host: process.env.OLLAMA_HOST || 'http://127.0.0.1:11434' });
        const model = process.env.OLLAMA_MODEL || 'qwen2.5:1.5b-instruct-q4_0';

        const prompt = `You are an expert career coach and technical mentor. Create a detailed, step-by-step learning roadmap for someone wanting to become a "${role}" at a "${level}" level.

Your response must be ONLY a valid JSON object with the following structure:
{
  "role": "${role}",
  "level": "${level}",
  "phases": [
    {
      "phase": 1,
      "title": "Phase Title",
      "duration": "Estimated time (e.g., 2-4 weeks)",
      "description": "What this phase covers",
      "topics": [
        {
          "name": "Topic Name",
          "subtopics": ["Subtopic 1", "Subtopic 2"],
          "resources": ["Resource 1", "Resource 2"]
        }
      ]
    }
  ]
}

Requirements:
- Provide 4-6 distinct phases.
- Ensure the roadmap is progressive and logical.
- For each topic, give 2-3 specific subtopics.
- Suggest 2-3 high-quality free resources (like MDN, FreeCodeCamp, specific YouTube channels, or official docs) for each topic.
- Do NOT include any text before or after the JSON.`;

        const response = await ollama.chat({
            model,
            messages: [{ role: 'user', content: prompt }],
            options: { temperature: 0.2 }
        });

        let content = response.message.content.trim();
        
        // Find JSON block if AI added markdown
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            content = jsonMatch[0];
        }

        const roadmap = JSON.parse(content);
        res.json(roadmap);

    } catch (error) {
        console.error('Roadmap Generation Error:', error);
        res.status(500).json({ message: 'Failed to generate roadmap', error: error.message });
    }
});

module.exports = router;
