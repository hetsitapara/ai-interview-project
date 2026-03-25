const express = require('express');
const router = express.Router();
const InterviewExperience = require('../models/InterviewExperience');
const { protect } = require('../middleware/authMiddleware');

// @route   GET /api/experiences
// @desc    Get all interview experiences with filters
// @access  Public
router.get('/', async (req, res) => {
    try {
        const { company, level, search } = req.query;
        const query = {};

        if (company && company !== 'Company') {
            query.company = company;
        }

        if (level && level !== 'Difficulty') {
            query.level = level;
        }

        if (search) {
            query.$or = [
                { company: { $regex: search, $options: 'i' } },
                { role: { $regex: search, $options: 'i' } }
            ];
        }

        const experiences = await InterviewExperience.find(query).sort({ createdAt: -1 });
        res.json(experiences);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   POST /api/experiences
// @desc    Create a new interview experience
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const { company, role, level, desc, topics } = req.body;

        const experience = await InterviewExperience.create({
            company,
            role,
            level,
            desc,
            topics,
            user: req.user._id,
            author: req.user.name
        });

        res.status(201).json(experience);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
