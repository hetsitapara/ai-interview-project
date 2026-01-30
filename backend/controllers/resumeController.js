const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

exports.uploadResume = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const filePath = req.file.path;
        console.log("Resume uploaded at:", filePath);

        // Path to python script
        const pythonScriptPath = path.join(__dirname, '../../ml/resume_parser.py');
        
        // Define python executable - try to use venv if possible, else default python
        // Assuming venv is at ../ml/venv/bin/python based on previous steps
        const pythonExecutable = path.resolve(__dirname, '../../ml/venv/bin/python'); // or just 'python3' if not using venv in prod

        console.log("Spawning python process:", pythonExecutable, pythonScriptPath, filePath);

        const pythonProcess = spawn(pythonExecutable, [pythonScriptPath, filePath]);

        let dataString = '';
        let errorString = '';

        pythonProcess.stdout.on('data', (data) => {
            dataString += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            errorString += data.toString();
            console.error(`Python Error: ${data}`);
        });

        pythonProcess.on('close', (code) => {
            // Clean up uploaded file
            fs.unlink(filePath, (err) => {
                if (err) console.error("Error deleting temp file:", err);
            });

            if (code !== 0) {
                console.error(`Python script exited with code ${code}`);
                return res.status(500).json({ error: 'Failed to analyze resume', details: errorString });
            }

            try {
                const results = JSON.parse(dataString);
                res.json(results);
            } catch (e) {
                console.error("Error parsing python output:", e, dataString);
                res.status(500).json({ error: 'Invalid response from analysis engine' });
            }
        });

    } catch (err) {
        console.error("Resume upload error:", err);
        res.status(500).json({ error: 'Server error during resume processing' });
    }
};
