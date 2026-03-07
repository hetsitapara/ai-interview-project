const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
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

module.exports = router;
