const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Question = require('../models/Question');
const YesNoQuestion = require('../models/YesNoQuestion');
const Interview = require('../models/Interview');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

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

const { evaluateAnswer, evaluateAnswersBatch } = require('../services/answerEvaluator');


// @desc    Submit interview and get ML report
// @route   POST /api/interview/submit
// @access  Private
router.post('/submit', protect, async (req, res) => {
    try {
        const { category, difficulty, topic, resumeAnalysis, answers } = req.body;
        // answers array of { questionId, questionText, userAnswer, idealAnswer, timeTaken }

        if (!answers || answers.length === 0) {
            return res.status(400).json({ message: 'No answers submitted' });
        }

        // --- OLLAMA AND ML EVALUATION (PARALLEL) ---
        console.log("[Ollama Evaluation] Starting parallel evaluations...");

        const pythonScriptPromise = new Promise((resolve, reject) => {
            const scriptPath = path.join(__dirname, '../../ml/batch_evaluate.py');
            let pythonPath;
            if (process.platform === "win32") {
                pythonPath = path.resolve(__dirname, '../../ml/venv/Scripts/python.exe');
            } else {
                pythonPath = path.resolve(__dirname, '../../ml/venv_mac/bin/python3');
            }

            if (!fs.existsSync(pythonPath)) {
                pythonPath = process.platform === "win32" ? 'python' : 'python3';
            }

            const pythonInput = answers.map(a => ({
                question: a.questionText,
                user_answer: a.userAnswer,
                ideal_answer: a.idealAnswer || "",
                timeTaken: a.timeTaken || 0
            }));

            const pythonProcess = spawn(pythonPath, [scriptPath]);
            let dataString = '';
            let errorString = '';

            pythonProcess.stdin.write(JSON.stringify(pythonInput));
            pythonProcess.stdin.end();

            pythonProcess.stdout.on('data', (data) => { dataString += data.toString(); });
            pythonProcess.stderr.on('data', (data) => { errorString += data.toString(); });

            pythonProcess.on('close', (code) => {
                if (code !== 0) {
                    console.error(`Python script exited with code ${code}: ${errorString}`);
                    return resolve(answers.map(a => ({
                        final_score: 5,
                        feedback: "Automated feedback unavailable.",
                        similarity_score: 0.5
                    })));
                }
                try {
                    resolve(JSON.parse(dataString));
                } catch (e) {
                    console.error("Failed to parse ML output:", e);
                    resolve(answers.map(a => ({ final_score: 5, feedback: "Error parsing ML report." })));
                }
            });
        });

        // Run Ollama Batch and Python script concurrently
        const [refinedWithOllama, mlResults] = await Promise.all([
            evaluateAnswersBatch(answers),
            pythonScriptPromise
        ]);

        console.log("[Ollama Evaluation] Parallel evaluation completed.");
        // --- EVALUATION END ---

        // Construct interview record
        const interviewData = {
            user: req.user._id,
            category,
            topic,
            difficulty,
            resumeAnalysis,
            questions: refinedWithOllama.map((ans, index) => {
                const ml = mlResults[index] || {};
                const ai = ans || {};
                
                // Final Score logic: Weigh AI score (0-10) and ML accuracy (0-1)
                // If AI score exists, use it as 70% weight.
                const mlScoreConverted = (ml.accuracy_score || 0) * 10;
                let finalQuestionScore = mlScoreConverted;
                
                if (ai.aiScore !== null && ai.aiScore !== undefined) {
                    finalQuestionScore = (ai.aiScore * 0.7) + (mlScoreConverted * 0.3);
                }

                return {
                    ...ans,
                    ...ml,
                    final_score: Math.round(finalQuestionScore * 10) / 10, // Round to 1 decimal
                    explanation: ai.aiRationale || ml.explanation || "Good attempt.",
                    ai_keywords: ai.aiKeywords || [],
                    aiOverview: "Evaluation completed."
                };
            }),
            overallScore: 0, // Calculated below
            detailedReport: mlResults
        };

        // Calculate overall session score
        interviewData.overallScore = interviewData.questions.reduce((acc, curr) => acc + (curr.final_score || 0), 0) / (interviewData.questions.length || 1);

        const interview = await Interview.create(interviewData);

                // --- GAMIFICATION UPDATE START ---
                const today = new Date().toISOString().split('T')[0];
                const user = req.user;

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
            .select('category topic overallScore createdAt difficulty');
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

const { generateHint, generateCoaching } = require('../services/aiService');

// @desc  Get a hint for a question mid-interview
// @route POST /api/interview/hint
// @access Private
router.post('/hint', protect, async (req, res) => {
    try {
        const { question } = req.body;
        if (!question) return res.status(400).json({ message: 'question is required' });
        const hint = await generateHint(question);
        res.json({ success: true, hint });
    } catch (err) {
        console.error('Hint error:', err);
        res.status(500).json({ message: 'Failed to generate hint' });
    }
});

// @desc  Get AI coaching based on completed interview results
// @route POST /api/interview/coaching
// @access Private
router.post('/coaching', protect, async (req, res) => {
    try {
        const { results } = req.body;
        if (!results || results.length === 0) return res.status(400).json({ message: 'results are required' });
        const coaching = await generateCoaching(results);
        res.json({ success: true, coaching });
    } catch (err) {
        console.error('Coaching error:', err);
        res.status(500).json({ message: 'Failed to generate coaching' });
    }
});

module.exports = router;
