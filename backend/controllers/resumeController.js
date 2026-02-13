const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');
const Question = require('../models/Question');
const YesNoQuestion = require('../models/YesNoQuestion');

exports.uploadResume = async (req, res) => {
    // Determine python executable path
    let pythonExecutable;
    if (process.platform === "win32") {
        pythonExecutable = path.resolve(__dirname, '../../ml/venv/Scripts/python.exe');
    } else {
        pythonExecutable = path.resolve(__dirname, '../../ml/venv/bin/python');
    }

    if (!fs.existsSync(pythonExecutable)) {
        pythonExecutable = 'python';
    }

    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const filePath = req.file.path;
        console.log("[Resume Processor] Analyzing file:", filePath);

        const pythonScriptPath = path.resolve(__dirname, '../../ml/resume_parser.py');
        const pythonProcess = spawn(pythonExecutable, [pythonScriptPath, filePath]);

        let dataString = '';
        let errorString = '';

        pythonProcess.stdout.on('data', (data) => {
            dataString += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            errorString += data.toString();
        });

        pythonProcess.on('error', (err) => {
            console.error("Failed to start python process:", err);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            return res.status(500).json({ error: 'Failed to execute resume parser', details: err.message });
        });

        pythonProcess.on('close', async (code) => {
            console.log(`[Resume Processor] Python process closed with code ${code}`);

            // Clean up uploaded file
            if (fs.existsSync(filePath)) {
                fs.unlink(filePath, (err) => {
                    if (err) console.error("Error deleting temp file:", err);
                });
            }

            if (code !== 0) {
                console.error(`[Resume Processor] Error: Python script exited with code ${code}`);
                console.error(`[Resume Processor] Stderr: ${errorString}`);
                return res.status(500).json({ error: 'Failed to analyze resume', details: errorString });
            }

            console.log(`[Resume Processor] Raw Python Output: ${dataString}`);

            try {
                if (!dataString.trim()) {
                    throw new Error("Python script returned empty output");
                }
                const analysis = JSON.parse(dataString);

                if (analysis.error) {
                    return res.status(400).json({ error: analysis.error });
                }

                const { categories, topics } = analysis;
                console.log("[Resume Processor] Detected Categories:", categories);
                console.log("[Resume Processor] Detected Topics:", topics);

                // Fetch Questions from Database based on detected data
                // Goal: 1-2 YesNo and 8-9 regular questions, total 10.

                const matchStage = {
                    category: { $in: categories }
                };

                // Use topics if available to refine search (optional but better)
                // We'll try to find some questions specifically for topics, then fill with categories

                // 1. Get YesNo Questions
                let yesNoQuestions = await YesNoQuestion.aggregate([
                    { $match: matchStage },
                    { $sample: { size: 2 } }
                ]);

                // Fallback for YesNo if none in specific categories
                if (yesNoQuestions.length < 1) {
                    yesNoQuestions = await YesNoQuestion.aggregate([
                        { $sample: { size: 1 } }
                    ]);
                }

                // 2. Get Regular Questions
                const neededRegular = 10 - yesNoQuestions.length;

                // Priority: Match by TOPIC if topics exist, else category
                let regularQuestions = [];
                if (topics && topics.length > 0) {
                    regularQuestions = await Question.aggregate([
                        {
                            $match: {
                                $or: [
                                    { topic: { $in: topics } },
                                    { category: { $in: categories } }
                                ]
                            }
                        },
                        { $sample: { size: neededRegular } }
                    ]);
                } else {
                    regularQuestions = await Question.aggregate([
                        { $match: matchStage },
                        { $sample: { size: neededRegular } }
                    ]);
                }

                // Final Combine
                let combinedQuestions = [
                    ...yesNoQuestions.map(q => ({ ...q, type: 'YesNo' })),
                    ...regularQuestions.map(q => ({ ...q, type: 'Text' }))
                ];

                // Safety Fallback: If absolutely no questions found, get 5 random ones from any category 
                if (combinedQuestions.length === 0) {
                    console.warn("[Resume Processor] No questions matched detected categories. Fetching global random questions.");
                    const fallbackQuestions = await Question.aggregate([{ $sample: { size: 5 } }]);
                    combinedQuestions = fallbackQuestions.map(q => ({ ...q, type: 'Text' }));
                }

                // Shuffle
                combinedQuestions = combinedQuestions.sort(() => Math.random() - 0.5);

                console.log(`[Resume Processor] Returning ${combinedQuestions.length} questions.`);
                res.json(combinedQuestions);

            } catch (e) {
                console.error("Error processing analysis results:", e);
                res.status(500).json({ error: 'Internal error processing analysis', details: e.message });
            }
        });

    } catch (err) {
        console.error("Resume upload error:", err);
        res.status(500).json({ error: 'Server error during resume processing' });
    }
};
