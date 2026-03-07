const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const resumeController = require('../controllers/resumeController');

// Configure Multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const tempDir = path.join(__dirname, '../temp');
        const fs = require('fs');
        if (!fs.existsSync(tempDir)){
            fs.mkdirSync(tempDir);
        }
        cb(null, tempDir);
    },
    filename: function (req, file, cb) {
        cb(null, 'resume-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDFs are allowed'));
        }
    }
});

router.post('/upload', upload.single('resume'), resumeController.uploadResume);

// @desc  Get AI-powered advice on an already-parsed resume
// @route POST /api/resume/advise
// @access Public (also callable right after upload)
const { analyzeResume } = require('../services/aiService');

router.post('/advise', async (req, res) => {
    try {
        const { resumeText, skills } = req.body;
        if (!resumeText) return res.status(400).json({ message: 'resumeText is required' });
        const advice = await analyzeResume(resumeText, skills || []);
        res.json({ success: true, advice });
    } catch (err) {
        console.error('Resume advise error:', err);
        res.status(500).json({ message: 'Failed to analyze resume' });
    }
});

module.exports = router;
