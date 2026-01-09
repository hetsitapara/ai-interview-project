const User = require('../models/User');

// @desc    Get user profile
// @route   GET /api/profile
// @access  Private
const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update user profile
// @route   PUT /api/profile
// @access  Private
const updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update fields if present in request body
        if (req.body.skills) user.skills = req.body.skills;
        if (req.body.careerGoals) user.careerGoals = req.body.careerGoals;
        if (req.body.socialLinks) {
            user.socialLinks = {
                ...user.socialLinks, // keep existing sub-fields if not provided? Or replace entirely? Let's merge.
                ...req.body.socialLinks
            };
        }
        if (req.body.name) user.name = req.body.name; // Allow updating name too

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            skills: updatedUser.skills,
            careerGoals: updatedUser.careerGoals,
            socialLinks: updatedUser.socialLinks
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getProfile,
    updateProfile
};
