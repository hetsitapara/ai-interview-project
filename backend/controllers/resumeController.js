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
        console.warn(`[Resume Processor] venv python not found at ${pythonExecutable}, falling back to system python`);
        pythonExecutable = process.platform === "win32" ? 'python' : 'python3';
    }

    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const filePath = req.file.path;
        console.log("[Resume Processor] Analyzing file:", filePath);

        const pythonScriptPath = path.resolve(__dirname, '../../ml/resume_parser.py');
        console.log(`[Resume Processor] Spawning: ${pythonExecutable} ${pythonScriptPath}`);

        const pythonProcess = spawn(pythonExecutable, [pythonScriptPath, filePath]);

        let dataString = '';
        let errorString = '';
        let responseSent = false;

        pythonProcess.stdout.on('data', (data) => {
            dataString += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            errorString += data.toString();
        });

        pythonProcess.on('error', (err) => {
            console.error("Failed to start python process:", err);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            if (!responseSent) {
                responseSent = true;
                return res.status(500).json({ error: 'Failed to execute resume parser', details: err.message });
            }
        });

        pythonProcess.on('close', async (code) => {
            console.log(`[Resume Processor] Python process closed with code ${code}`);

            // Clean up uploaded file
            if (fs.existsSync(filePath)) {
                fs.unlink(filePath, (err) => {
                    if (err) console.error("Error deleting temp file:", err);
                });
            }

            if (responseSent) return;

            if (code !== 0) {
                console.error(`[Resume Processor] Error: Python script exited with code ${code}`);
                console.error(`[Resume Processor] Stderr: ${errorString}`);
                responseSent = true;
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

                const { categories, topics, name, summary, skills } = analysis;
                console.log("[Resume Processor] Detected Categories:", categories);
                console.log("[Resume Processor] Detected Topics:", topics);

                // Instead of fetching questions immediately, return the analysis results
                // Frontend will display this and then call /start with verified categories/topics

                res.json({
                    success: true,
                    analysis: {
                        name,
                        summary,
                        skills,
                        categories,
                        topics
                    }
                });

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
