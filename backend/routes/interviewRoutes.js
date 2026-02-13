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
    // Added topic to destructuring
    const { category, topic, count = 5 } = req.body;
    const limit = parseInt(count);

    try {
        const matchStage = {};

        // Category Filter
        if (category && category !== 'Random') {
            if (category.includes(',')) {
                const categories = category.split(',').map(c => c.trim());
                matchStage.category = { $in: categories };
            } else {
                matchStage.category = { $regex: new RegExp(category, 'i') };
            }
        }

        // Subtopic Filter (New Feature)
        if (topic && topic !== 'Random' && topic !== '') {
            matchStage.topic = topic;
        }

        // If category is 'Random' or empty, matchStage remains empty {} -> fetches all/any questions

        // Yes/No Logic (similar to before but now respects topic)
        const yesNoCount = limit > 3 ? (Math.random() > 0.5 ? 2 : 1) : 1;
        const regularCount = limit - yesNoCount;

        console.log(`[Start Interview] Category: ${category}, Topic: ${topic}, Total: ${limit}, Yes/No Needed: ${yesNoCount}`);

        // Try exact match for Yes/No
        let yesNoQuestions = await YesNoQuestion.aggregate([
            { $match: matchStage },
            { $sample: { size: yesNoCount } }
        ]);

        console.log(`[Start Interview] Found Yes/No (Exact): ${yesNoQuestions.length}`);

        // If not enough Yes/No questions found in category/topic, try fetching GENERAL or RANDOM ones
        if (yesNoQuestions.length < yesNoCount) {
            const needed = yesNoCount - yesNoQuestions.length;
            console.log(`[Start Interview] Not enough exact match Yes/No. Fetching ${needed} from General/Any.`);

            const existingIds = yesNoQuestions.map(q => q._id);

            // Fallback might ignore topic strictly if not enough found?
            // Or try to find random Yes/No without topic constraint but maybe kept category?
            // Let's just find ANY random Yes/No for now to ensure we have questions.
            const fallbackYesNo = await YesNoQuestion.aggregate([
                { $match: { _id: { $nin: existingIds } } },
                { $sample: { size: needed } }
            ]);

            yesNoQuestions = [...yesNoQuestions, ...fallbackYesNo];
        }

        // Regular Questions
        const foundYesNo = yesNoQuestions.length;
        const neededRegular = limit - foundYesNo;

        let regularQuestions = await Question.aggregate([
            { $match: matchStage },
            { $sample: { size: neededRegular } }
        ]);

        // If not enough regular questions found with strict topic, try relaxing topic but keeping category
        if (regularQuestions.length < neededRegular && topic) {
            const neededMore = neededRegular - regularQuestions.length;
            console.log(`[Start Interview] Not enough regular questions with topic ${topic}. relaxing to category ${category}`);

            // Remove topic constraint but keep category
            const relaxedMatch = { ...matchStage };
            delete relaxedMatch.topic;

            const existingIds = regularQuestions.map(q => q._id);

            const relaxedQuestions = await Question.aggregate([
                { $match: { ...relaxedMatch, _id: { $nin: existingIds } } },
                { $sample: { size: neededMore } }
            ]);

            regularQuestions = [...regularQuestions, ...relaxedQuestions];
        }

        // If STILL not enough (e.g. category itself has few questions), relax to ANY random
        if (regularQuestions.length < neededRegular) {
            const neededMore = neededRegular - regularQuestions.length;
            console.log(`[Start Interview] Not enough regular questions in category. Fetching random.`);
            const existingIds = regularQuestions.map(q => q._id);

            const randomQuestions = await Question.aggregate([
                { $match: { _id: { $nin: existingIds } } },
                { $sample: { size: neededMore } }
            ]);
            regularQuestions = [...regularQuestions, ...randomQuestions];
        }

        console.log(`[Start Interview] Regular Questions Found: ${regularQuestions.length}`);

        // Combine and Shuffle
        let combinedQuestions = [
            ...yesNoQuestions.map(q => ({ ...q, type: 'YesNo' })),
            ...regularQuestions.map(q => ({ ...q, type: 'Text' }))
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
        const pythonPath = process.platform === 'win32'
            ? path.join(__dirname, '../../ml/venv/Scripts/python.exe')
            : path.join(__dirname, '../../ml/venv/bin/python');

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
                // Fallback if ML fails? Or return error
                // return res.status(500).json({ message: 'Error generating report', error: errorString });
                // Let's create a partial report if ML fails instead of blocking user
                console.warn("ML generation failed, proceeding with basic report");
            }

            try {
                // Parse results from python
                let results = [];
                try {
                    results = JSON.parse(dataString);
                } catch (e) {
                    console.error("Failed to parse ML output, using fallback values");
                    results = answers.map(a => ({ final_score: 5, feedback: " automated feedback unavailable." }));
                }

                // Construct interview record
                const interviewData = {
                    user: req.user._id,
                    category,
                    difficulty,
                    questions: answers.map((ans, index) => ({
                        ...ans,
                        ...results[index] // Merge ML results (scores, feedback)
                    })),
                    overallScore: results.reduce((acc, curr) => acc + (curr.final_score || 0), 0) / (results.length || 1),
                    detailedReport: results // Store raw report just in case
                };

                const interview = await Interview.create(interviewData);

                // --- GAMIFICATION UPDATE START ---
                // Reuse logic ideally in a helper, but putting inline for now for speed
                const today = new Date().toISOString().split('T')[0];
                // User is already attached to req by protect middleware? 
                const user = await req.user;
                // Wait, protect middleware attaches user doc to req.user.
                // We need to fetch/save.

                // Mongoose document is attached, so we can modify and save.
                // Re-fetch to be absolutely sure or just trust middleware. 
                // Middleware usually does `req.user = await User.findById(decoded.id).select('-password')`

                if (user) {
                    let shouldIncrementStreak = false;
                    if (user.stats && user.stats.lastActiveDate) {
                        const lastDate = new Date(user.stats.lastActiveDate).toISOString().split('T')[0];
                        const diffTime = Math.abs(new Date(today) - new Date(lastDate));
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                        if (diffDays === 1) {
                            shouldIncrementStreak = true;
                        } else if (diffDays > 1) {
                            user.stats.streak = 0; // Reset
                            shouldIncrementStreak = true;
                        }
                    } else {
                        shouldIncrementStreak = true;
                    }

                    if (shouldIncrementStreak && user.stats.lastActiveDate?.toISOString().split('T')[0] !== today) {
                        user.stats.streak = (user.stats.streak || 0) + 1;
                    }

                    user.stats.lastActiveDate = new Date();
                    user.stats.totalScore = (user.stats.totalScore || 0) + (interviewData.overallScore * 10);

                    // Update Activity Log
                    if (!user.stats.activityLog) user.stats.activityLog = [];
                    const logIndex = user.stats.activityLog.findIndex(l => l.date === today);
                    if (logIndex > -1) {
                        user.stats.activityLog[logIndex].count += 1;
                    } else {
                        user.stats.activityLog.push({ date: today, count: 1 });
                    }

                    await user.save();
                }
                // --- GAMIFICATION END ---

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
