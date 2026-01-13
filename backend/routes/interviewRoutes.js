const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Question = require('../models/Question');
const YesNoQuestion = require('../models/YesNoQuestion');
const Interview = require('../models/Interview');
const { spawn } = require('child_process');
const path = require('path');

// @desc    Start a new interview (Fetch questions)
// @route   POST /api/interview/start
// @access  Private
router.post('/start', protect, async (req, res) => {
    const { category, count = 5 } = req.body;
    const limit = parseInt(count);

    try {
        const matchStage = {};
        if (category) {
             matchStage.category = { $regex: new RegExp(category, 'i') };
        }

        // 1. Fetch Yes/No Question(s)
        // User wants "at least one" and "more than one also pick randomly"
        // Let's decide a probability. e.g. 20-30% chance for more Yes/No?
        // Simplest Robust Logic: 
        // Always get 1 guaranteed Yes/No. 
        // Then get (limit - 1) from a MIXED pool or assume Text questions for the rest?
        // The prompt says "mostly pick randomly".
        // Let's do this: Fetch 1 Yes/No. Fetch (limit - 1) Text.
        // BUT also convert some Text slots to Yes/No randomly?
        // Better: Fetch 2 Yes/No and (limit - 2) Text if limit > 3?
        
        // Let's stick to the interpretation: "At least one Yes/No. The rest can be random".
        // Since we have separate collections, true random across collections is hard without 2 queries.
        // We will fetch:
        // - 1 Guaranteed Yes/No
        // - (limit - 1) Regular Questions
        // - AND potentially replace 1 Regular with another Yes/No if available?
        
        // New Strategy:
        // Fetch 1 Yes/No.
        // Fetch (limit - 1) Regular.
        // If we want more Yes/No, we can just fetch 2 Yes/No and (limit - 2) Regular.
        // Let's randomize the split slightly.
        
        const yesNoCount = limit > 3 ? (Math.random() > 0.5 ? 2 : 1) : 1;
        const regularCount = limit - yesNoCount;

        console.log(`[Start Interview] Category: ${category}, Total: ${limit}, Yes/No Needed: ${yesNoCount}`);

        // Try exact category match for Yes/No
        let yesNoQuestions = await YesNoQuestion.aggregate([
            { $match: matchStage },
            { $sample: { size: yesNoCount } }
        ]);

        console.log(`[Start Interview] Found Yes/No (Exact): ${yesNoQuestions.length}`);

        // If not enough Yes/No questions found in category, try fetching GENERAL or RANDOM ones to satisfy requirement
        if (yesNoQuestions.length < yesNoCount) {
             const needed = yesNoCount - yesNoQuestions.length;
             console.log(`[Start Interview] Not enough exact match Yes/No. Fetching ${needed} from General/Any.`);
             
             // Fallback: exclude already found IDs (not strictly needed if count is small, but good practice)
             const existingIds = yesNoQuestions.map(q => q._id);

             const fallbackYesNo = await YesNoQuestion.aggregate([
                  { $match: { _id: { $nin: existingIds } } }, // Just get any
                  { $sample: { size: needed } }
             ]);
             
             yesNoQuestions = [...yesNoQuestions, ...fallbackYesNo];
        }
        
        console.log(`[Start Interview] Final Yes/No Count: ${yesNoQuestions.length}`);

        // If we still have 0 Yes/No questions, it means the DB is empty of them.
        // We will proceed with regular questions only but log a warning.
        
        // Adjust regular count based on how many Yes/No we *actually* got (could be 0 if DB empty)
        const foundYesNo = yesNoQuestions.length;
        const neededRegular = limit - foundYesNo;

        const regularQuestions = await Question.aggregate([
            { $match: matchStage },
            { $sample: { size: neededRegular } }
        ]);

        console.log(`[Start Interview] Regular Questions Found: ${regularQuestions.length}`);

        // 3. Combine and Shuffle
        let combinedQuestions = [
            ...yesNoQuestions.map(q => ({...q, type: 'YesNo'})), 
            ...regularQuestions.map(q => ({...q, type: 'Text'}))
        ];
        combinedQuestions = combinedQuestions.sort(() => Math.random() - 0.5);

        res.json(combinedQuestions);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
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

// @desc    Get user's interview history
// @route   GET /api/interview/history
// @access  Private
router.get('/history', protect, async (req, res) => {
    try {
        const interviews = await Interview.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .select('category overallScore createdAt difficulty');
        res.json(interviews);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error fetching history' });
    }
});

// @desc    Get interview details by ID
// @route   GET /api/interview/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const interview = await Interview.findById(req.params.id);

        if (!interview) {
            return res.status(404).json({ message: 'Interview not found' });
        }

        // Ensure user owns this interview
        if (interview.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        res.json(interview);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error fetching interview' });
    }
});

module.exports = router;
