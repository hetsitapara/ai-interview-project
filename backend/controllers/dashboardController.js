const Interview = require('../models/Interview');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
const getDashboardStats = async (req, res) => {
    try {
        const userId = req.user.id;

        // 1. Total Interviews
        const totalInterviews = await Interview.countDocuments({ user: userId });

        // 2. Average Overall Score
        const interviews = await Interview.find({ user: userId }).select('overallScore category createdAt');

        let totalScore = 0;
        interviews.forEach(i => totalScore += (i.overallScore || 0));
        const avgScore = totalInterviews > 0 ? (totalScore / totalInterviews).toFixed(1) : 0;

        // 3. Category Breakdown (Average score per category)
        const categoryStats = {}; // { "HR": { total: 0, count: 0 }, ... }

        interviews.forEach(interview => {
            const cat = interview.category || 'General';
            if (!categoryStats[cat]) {
                categoryStats[cat] = { total: 0, count: 0 };
            }
            categoryStats[cat].total += (interview.overallScore || 0);
            categoryStats[cat].count += 1;
        });

        // Format for frontend (e.g., labels and data for charts or progress bars)
        const skillProgress = Object.keys(categoryStats).map(cat => ({
            label: cat,
            percent: Math.round((categoryStats[cat].total / categoryStats[cat].count) * 10) // Score is out of 10, so * 10 for percentage
        }));

        // 4. Recent Activity (Last 3)
        // We can just return the last few interviews
        const recentInterviews = await Interview.find({ user: userId })
            .sort({ createdAt: -1 })
            .limit(3)
            .select('category overallScore createdAt');

        res.json({
            totalInterviews,
            averageScore: avgScore,
            skillProgress, // For Skill Progress bars
            recentInterviews // For potential recent activity feed
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error fetching stats' });
    }
};

module.exports = {
    getDashboardStats
};
