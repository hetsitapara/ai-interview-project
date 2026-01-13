const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Question = require('../models/Question');
const Interview = require('../models/Interview');
const { spawn } = require('child_process');
const path = require('path');

// @desc    Start a new interview (Fetch questions)
// @route   POST /api/interview/start
// @access  Private
router.post('/start', protect, async (req, res) => {
    try {
        const { category, count, difficulty } = req.body;
        
        const limit = parseInt(count) || 5;
        const diff = difficulty || 'Medium';

        // Find questions matching criteria
        // Using sample size aggregation to randomise
        const matchStage = {};
        if (category) {
             matchStage.category = { $regex: new RegExp(category, 'i') };
        }
        // Difficulty ignored as requested

        const questions = await Question.aggregate([
            { $match: matchStage },
            { $sample: { size: limit } }
        ]);

        if (questions.length === 0) {
            return res.status(404).json({ message: 'No questions found for this category.' });
        }

        res.status(200).json(questions);
    } catch (error) {
        console.error('Error starting interview:', error);
        res.status(500).json({ message: 'Server error starting interview' });
    }
});

// @desc    Submit interview and get ML report
// @route   POST /api/interview/submit
// @access  Private
router.post('/submit', protect, async (req, res) => {
    try {
        const { category, difficulty, answers } = req.body;
        // answers array of { questionId, questionText, userAnswer, idealAnswer, timeTaken }

        if (!answers || answers.length === 0) {
            return res.status(400).json({ message: 'No answers submitted' });
        }

        // Prepare input for python script
        const pythonInput = answers.map(a => ({
            question: a.questionText,
            user_answer: a.userAnswer,
            ideal_answer: a.idealAnswer || ""
        }));

        // Path to python script and executable
        const scriptPath = path.join(__dirname, '../../ml/batch_evaluate.py');
        const pythonPath = path.join(__dirname, '../../ml/venv/bin/python');
        
        // Spawn python process
        const pythonProcess = spawn(pythonPath, [scriptPath]);

        let dataString = '';
        let errorString = '';

        // Write data to stdin
        pythonProcess.stdin.write(JSON.stringify(pythonInput));
        pythonProcess.stdin.end();

        pythonProcess.stdout.on('data', (data) => {
            dataString += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            errorString += data.toString();
        });

        pythonProcess.on('close', async (code) => {
            if (code !== 0) {
                console.error(`Python script exited with code ${code}`);
                console.error(`Python stderr: ${errorString}`);
                return res.status(500).json({ message: 'Error generating report', error: errorString });
            }

            try {
                // Parse results from python
                const results = JSON.parse(dataString);
                
                // Construct interview record
                const interviewData = {
                    user: req.user._id,
                    category,
                    difficulty,
                    questions: answers.map((ans, index) => ({
                        ...ans,
                        ...results[index] // Merge ML results (scores, feedback)
                    })),
                    overallScore: results.reduce((acc, curr) => acc + (curr.final_score || 0), 0) / results.length,
                    detailedReport: results // Store raw report just in case
                };

                const interview = await Interview.create(interviewData);

                res.status(201).json(interview);

            } catch (err) {
                console.error('Error parsing python output:', err);
                res.status(500).json({ message: 'Error processing report', output: dataString });
            }
        });

    } catch (error) {
        console.error('Error submitting interview:', error);
        res.status(500).json({ message: 'Server error submitting interview' });
    }
});

module.exports = router;
