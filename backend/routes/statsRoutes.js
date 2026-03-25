const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Interview = require('../models/Interview');
const { generateCareerTip } = require('../services/aiService');

// @desc    Get user's interview stats summary
// @route   GET /api/stats/summary
// @access  Private
router.get('/summary', protect, async (req, res) => {
    try {
        const history = await Interview.find({ user: req.user._id })
            .select('category overallScore createdAt')
            .sort({ createdAt: -1 });

        if (history.length === 0) {
            return res.json({
                averageScore: 0,
                totalSessions: 0,
                topCategory: 'N/A',
                recentTrend: []
            });
        }

        const totalSessions = history.length;
        const averageScore = history.reduce((acc, curr) => acc + (curr.overallScore || 0), 0) / totalSessions;
        
        // Find top category
        const categories = history.map(h => h.category);
        const topCategory = categories.sort((a,b) =>
            categories.filter(v => v===a).length - categories.filter(v => v===b).length
        ).pop();

        // Trend (last 7)
        const recentTrend = history.slice(0, 7).reverse().map(h => h.overallScore);

        res.json({
            averageScore: Math.round(averageScore * 10) / 10,
            totalSessions,
            topCategory,
            recentTrend
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error fetching stats' });
    }
});

// @desc    Get AI career tip based on history
// @route   GET /api/stats/tip
// @access  Private
router.get('/tip', protect, async (req, res) => {
    try {
        const history = await Interview.find({ user: req.user._id })
            .select('category overallScore')
            .limit(10);

        if (history.length === 0) {
            return res.json({ tip: "Candidates who review their reports for 10+ minutes perform 30% better in real technical interviews." });
        }

        const summary = history.map(h => `${h.category} (${h.overallScore}/10)`).join(', ');
        const tip = await generateCareerTip(summary);

        res.json({ tip });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error generating tip' });
    }
});

module.exports = router;
