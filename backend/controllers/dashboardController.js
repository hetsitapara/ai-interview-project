const Interview = require('../models/Interview');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
const getDashboardStats = async (req, res) => {
    try {
        const userId = req.user.id;

        // 1. Total Interviews
        const totalInterviews = await Interview.countDocuments({ user: userId });

        // 2. Fetch all interviews for processing
        const interviews = await Interview.find({ user: userId })
            .select('overallScore category createdAt')
            .sort({ createdAt: -1 });

        // 3. XP and Level Calculation
        let totalXP = 0;
        interviews.forEach(i => {
            // Base 100 XP + (Score * 20)
            totalXP += 100 + ((i.overallScore || 0) * 20);
        });
        
        // Round to 2 decimals
        totalXP = Math.round(totalXP * 100) / 100;
        
        const currentLevel = Math.floor(totalXP / 1000) + 1;
        const xpInLevel = Math.round((totalXP % 1000) * 100) / 100;

        // 4. Daily Streak Calculation
        let streak = 0;
        if (interviews.length > 0) {
            const today = new Date().setHours(0, 0, 0, 0);
            let checkDate = today;
            let currentIdx = 0;

            // Check if played today or yesterday to start counting
            const lastSessionDate = new Date(interviews[0].createdAt).setHours(0, 0, 0, 0);
            if (lastSessionDate === today || lastSessionDate === today - 86400000) {
                while (currentIdx < interviews.length) {
                    const sessionDate = new Date(interviews[currentIdx].createdAt).setHours(0, 0, 0, 0);
                    if (sessionDate === checkDate) {
                        streak++;
                        checkDate -= 86400000;
                        // Skip other sessions on the same day
                        while (currentIdx < interviews.length && new Date(interviews[currentIdx].createdAt).setHours(0, 0, 0, 0) === sessionDate) {
                            currentIdx++;
                        }
                    } else if (sessionDate < checkDate) {
                        break; // Streak broken
                    } else {
                        currentIdx++;
                    }
                }
            }
        }

        // 5. Heatmap Analysis (Peak & Sharpest hours)
        const hourStats = {}; // { hour: { count, totalScore } }
        interviews.forEach(i => {
            const hour = new Date(i.createdAt).getHours();
            if (!hourStats[hour]) hourStats[hour] = { count: 0, totalScore: 0 };
            hourStats[hour].count++;
            hourStats[hour].totalScore += (i.overallScore || 0);
        });

        let peakHour = 'N/A';
        let maxCount = 0;
        let sharpestHour = 'N/A';
        let maxAvg = 0;

        Object.keys(hourStats).forEach(h => {
            if (hourStats[h].count > maxCount) {
                maxCount = hourStats[h].count;
                peakHour = `${h}:00 - ${parseInt(h)+1}:00`;
            }
            const avg = hourStats[h].totalScore / hourStats[h].count;
            if (avg > maxAvg) {
                maxAvg = avg;
                sharpestHour = `${h}:00 - ${parseInt(h)+1}:00`;
            }
        });

        // 6. Readiness Score (Weighted)
        // More weight to recent sessions (last 5)
        const recentWeights = [0.4, 0.25, 0.15, 0.1, 0.1];
        let readiness = 0;
        if (interviews.length > 0) {
            const lastSessions = interviews.slice(0, 5);
            let totalWeight = 0;
            lastSessions.forEach((s, idx) => {
                readiness += (s.overallScore || 0) * recentWeights[idx];
                totalWeight += recentWeights[idx];
            });
            readiness = (readiness / totalWeight) * 10; // Scaling to 100%
        }

        // 7. Category Breakdown
        const categoryStats = {};
        interviews.forEach(interview => {
            const cat = interview.category || 'General';
            if (!categoryStats[cat]) categoryStats[cat] = { total: 0, count: 0 };
            categoryStats[cat].total += (interview.overallScore || 0);
            categoryStats[cat].count += 1;
        });

        const skillProgress = Object.keys(categoryStats).map(cat => ({
            label: cat,
            percent: Math.round((categoryStats[cat].total / categoryStats[cat].count) * 10)
        }));

        res.json({
            totalInterviews,
            averageScore: totalInterviews > 0 ? (interviews.reduce((a,b)=>a+(b.overallScore||0),0)/totalInterviews).toFixed(1) : 0,
            skillProgress,
            recentInterviews: interviews.slice(0, 3),
            xp: { totalXP, currentLevel, xpInLevel, nextLevelXP: 1000 },
            streak,
            heatmap: { peakHour, sharpestHour, activeSessions: totalInterviews },
            readiness: Math.round(readiness)
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error fetching stats' });
    }
};

module.exports = {
    getDashboardStats
};
