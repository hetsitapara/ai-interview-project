require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 5001;
const { connectDB } = require('./config/db');

// Connect to Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false }));
app.use((req, res, next) => {
    console.log(`[REQ] ${req.method} ${req.url}`);
    next();
});

// Routes
// Note: We are using '/api' as the base for auth routes.
app.use('/api', authRoutes);
app.use('/api/profile', require('./routes/profileRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/blogs', require('./routes/blogRoutes'));
app.use('/api/questions', require('./routes/questionRoutes'));
app.use('/api/mcq', require('./routes/mcqRoutes'));
app.use('/api/yesno', require('./routes/yesNoRoutes'));
app.use('/api/coding', require('./routes/codingRoutes'));
app.use('/api/interview', require('./routes/interviewRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/experiences', require('./routes/experienceRoutes'));
app.use('/api/resume', require('./routes/resumeRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/stats', require('./routes/statsRoutes'));
app.use('/api/roadmap', require('./routes/roadmapRoutes'));

// Error Handler (Basic)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});


// Ready
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});
