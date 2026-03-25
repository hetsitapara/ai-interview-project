const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const CodingQuestion = require('../models/CodingQuestion');
const Submission = require('../models/Submission');
const fs = require('fs');
const path = require('path');
// const { spawn } = require('child_process'); // Replaced by destructuring below

// @desc    Get all coding questions
// @route   GET /api/coding/questions
// @access  Private
router.get('/questions', protect, async (req, res) => {
    try {
        const questions = await CodingQuestion.find({}, 'title difficulty');
        res.json(questions);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Get single coding question
// @route   GET /api/coding/questions/:id
// @access  Private
router.get('/questions/:id', protect, async (req, res) => {
    try {
        const question = await CodingQuestion.findById(req.params.id);
        if (question) {
            res.json(question);
        } else {
            res.status(404).json({ message: 'Question not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

const { spawn, exec } = require('child_process');

// Helper to execute code
const executeCode = (language, code, input) => {
    return new Promise((resolve, reject) => {
        const timestamp = Date.now();
        const filename = `temp_${timestamp}`;
        const tempDir = path.join(__dirname, '../temp');
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

        let filePath;
        let command;
        let args;
        let isCompiled = false;
        let compiledPath;

        if (language === 'python') {
            filePath = path.join(tempDir, `${filename}.py`);
            command = 'python3';
            args = [filePath];
        } else if (language === 'javascript') {
            filePath = path.join(tempDir, `${filename}.js`);
            command = 'node';
            args = [filePath];
        } else if (language === 'c') {
            filePath = path.join(tempDir, `${filename}.c`);
            compiledPath = path.join(tempDir, `${filename}.out`);
            isCompiled = true;
            command = compiledPath;
            args = [];
        } else if (language === 'cpp') {
            filePath = path.join(tempDir, `${filename}.cpp`);
            compiledPath = path.join(tempDir, `${filename}.out`);
            isCompiled = true;
            command = compiledPath;
            args = [];
        } else {
            return reject('Unsupported language');
        }

        // Write code to file
        fs.writeFileSync(filePath, code);

        const runCode = () => {
            const child = spawn(command, args);

            let output = '';
            let errorOutput = '';

            // Write input to stdin
            if (input) {
                child.stdin.write(input);
                child.stdin.end();
            }

            child.stdout.on('data', (data) => {
                output += data.toString();
            });

            child.stderr.on('data', (data) => {
                errorOutput += data.toString();
            });

            child.on('close', (code) => {
                // Cleanup files
                try {
                    fs.unlinkSync(filePath);
                    if (isCompiled && fs.existsSync(compiledPath)) fs.unlinkSync(compiledPath);
                } catch (e) { }

                if (code !== 0) {
                    resolve({ success: false, output: errorOutput || 'Runtime Error' });
                } else {
                    resolve({ success: true, output: output.trim() });
                }
            });

            // Timeout safety
            setTimeout(() => {
                if (!child.killed) {
                    child.kill();
                    try {
                        fs.unlinkSync(filePath);
                        if (isCompiled && fs.existsSync(compiledPath)) fs.unlinkSync(compiledPath);
                    } catch (e) { }
                    resolve({ success: false, output: 'Time Limit Exceeded' });
                }
            }, 2000); // 2s timeout
        };

        if (isCompiled) {
            const compiler = language === 'c' ? 'gcc' : 'g++';
            exec(`${compiler} "${filePath}" -o "${compiledPath}"`, (error, stdout, stderr) => {
                if (error) {
                    try { fs.unlinkSync(filePath); } catch (e) { }
                    resolve({ success: false, output: `Compilation Error:\n${stderr}` });
                } else {
                    runCode();
                }
            });
        } else {
            runCode();
        }
    });
};

// @desc    Run arbitrary code (Playground)
// @route   POST /api/coding/execute
// @access  Private
router.post('/execute', protect, async (req, res) => {
    const { language, code, input } = req.body;
    try {
        const result = await executeCode(language, code, input || "");
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Execution Error' });
    }
});

// @desc    Run code against test cases
// @route   POST /api/coding/run
// @access  Private
router.post('/run', protect, async (req, res) => {
    const { questionId, language, code } = req.body;

    try {
        const question = await CodingQuestion.findById(questionId);
        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        // Run against public test cases (or specific one)
        // For MVP, let's run against ALL test cases designated as public
        // Or if user selected "Run", maybe just the first one?
        // Let's run against ALL PUBLIC test cases.

        const publicTestCases = question.testCases.filter(tc => tc.isPublic);
        const results = [];

        for (const tc of publicTestCases) {
            const result = await executeCode(language, code, tc.input);
            const passed = result.success && result.output === tc.expectedOutput;

            results.push({
                input: tc.input,
                expectedOutput: tc.expectedOutput,
                actualOutput: result.output,
                passed,
                error: !result.success ? result.output : null
            });
        }

        res.json({ results });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Execution Error' });
    }
});

// @desc    Submit code (Run against ALL test cases)
// @route   POST /api/coding/submit
// @access  Private
router.post('/submit', protect, async (req, res) => {
    const { questionId, language, code } = req.body;

    try {
        const question = await CodingQuestion.findById(questionId);
        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        const allTestCases = question.testCases;
        const results = [];
        let allPassed = true;

        for (const tc of allTestCases) {
            const result = await executeCode(language, code, tc.input);
            const passed = result.success && result.output === tc.expectedOutput;
            if (!passed) allPassed = false;

            results.push({
                isPublic: tc.isPublic,
                input: tc.isPublic ? tc.input : 'Hidden',
                expectedOutput: tc.isPublic ? tc.expectedOutput : 'Hidden',
                actualOutput: tc.isPublic ? result.output : (passed ? 'Passed' : 'Failed'),
                passed,
            });
        }


        // Save Submission
        const submission = await Submission.create({
            user: req.user._id,
            question: questionId,
            code,
            language,
            status: allPassed ? 'Passed' : 'Failed',
            passedCases: results.filter(r => r.passed).length,
            totalCases: allTestCases.length,
            results: results.map(r => ({
                input: r.input === 'Hidden' ? 'Hidden' : r.input,
                expected: r.expectedOutput === 'Hidden' ? 'Hidden' : r.expectedOutput,
                actual: r.actualOutput,
                passed: r.passed,
                error: r.passed ? null : r.actualOutput // specific error handling could be better
            }))
        });

        res.json({ allPassed, results, submissionId: submission._id });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Execution Error' });
    }
});

// @desc    Get user submissions for a question
// @route   GET /api/coding/submissions/:questionId
// @access  Private
router.get('/submissions/:questionId', protect, async (req, res) => {
    try {
        const submissions = await Submission.find({
            user: req.user._id,
            question: req.params.questionId
        }).sort({ createdAt: -1 });

        res.json(submissions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    AI Code Analysis using Ollama/llama3
// @route   POST /api/coding/analyze
// @access  Private
router.post('/analyze', protect, async (req, res) => {
    const { code, language, questionTitle } = req.body;
    if (!code || code.trim().length < 10) {
        return res.status(400).json({ message: 'No code provided' });
    }
    try {
        const { Ollama } = require('ollama');
        const ollama = new Ollama({ host: process.env.OLLAMA_HOST || 'http://127.0.0.1:11434' });
        const model = process.env.OLLAMA_MODEL || 'llama3';

        const prompt = `You are a senior software engineer performing a technical code review. Analyze the following ${language} code${questionTitle ? ` for the problem: "${questionTitle}"` : ''}.

Code:
\`\`\`${language}
${code}
\`\`\`

Analyze it thoroughly and return ONLY valid JSON with these exact fields:
{
  "summary": "One encouraging sentence about the solution",
  "overall_rating": 8,
  "time_complexity": "O(n)",
  "space_complexity": "O(n)",
  "current_approach": "Hash Map",
  "suggested_approach": "Two Pointers",
  "key_idea": "Brief explanation of the key algorithmic idea",
  "consider": "A thought-provoking question to make them think of an optimization",
  "efficiency_suggestion": "Specific suggestion to improve time or space complexity",
  "readability": 4,
  "structure": 4,
  "efficiency_score": 3,
  "best_practices": 4,
  "style_suggestion": "Specific code style improvement suggestion",
  "improvements": ["Improvement point 1", "Improvement point 2", "Improvement point 3"]
}

Rules:
- overall_rating is 0-10 (be fair and accurate)
- readability, structure, efficiency_score, best_practices are all 0-5 star ratings
- time_complexity and space_complexity must be in standard Big-O notation like O(n), O(n log n), O(n²), O(1), O(log n)
- improvements must be 2-4 specific, actionable items
- Return ONLY the JSON. No extra text.`;

        const response = await ollama.chat({
            model,
            messages: [{ role: 'user', content: prompt }],
            options: { temperature: 0.2, num_predict: 600 }
        });

        let text = response.message.content.trim();
        text = text.replace(/```json|```/g, '').trim();
        const match = text.match(/\{[\s\S]*\}/);
        if (!match) return res.status(500).json({ message: 'Could not parse analysis' });

        const analysis = JSON.parse(match[0]);
        console.log(`[Ollama] Code analysis complete. Score: ${analysis.overall_rating}/10`);
        res.json(analysis);
    } catch (error) {
        console.error('[CodeAnalysis] Error:', error.message);
        res.status(500).json({ message: 'Analysis failed: ' + error.message });
    }
});

// @desc    Admin: Create coding question
// @route   POST /api/coding/questions
// @access  Private/Admin
router.post('/questions', protect, admin, async (req, res) => {
    try {
        const question = await CodingQuestion.create(req.body);
        res.status(201).json(question);
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: 'Invalid question data', error: error.message });
    }
});

// @desc    Admin: Update coding question
// @route   PUT /api/coding/questions/:id
// @access  Private/Admin
router.put('/questions/:id', protect, admin, async (req, res) => {
    try {
        const question = await CodingQuestion.findById(req.params.id);
        if (question) {
            Object.assign(question, req.body);
            await question.save();
            res.json(question);
        } else {
            res.status(404).json({ message: 'Question not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: 'Error updating question', error: error.message });
    }
});

// @desc    Admin: Delete coding question
// @route   DELETE /api/coding/questions/:id
// @access  Private/Admin
router.delete('/questions/:id', protect, admin, async (req, res) => {
    try {
        const question = await CodingQuestion.findById(req.params.id);
        if (question) {
            await question.deleteOne();
            res.json({ message: 'Question removed' });
        } else {
            res.status(404).json({ message: 'Question not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
