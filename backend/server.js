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
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
// Note: We are using '/api' as the base for auth routes.
// The routes file defines /register and /login, so the full paths are:
// /api/register
// /api/login
// This matches what the frontend expects.
app.use('/api', authRoutes);
app.use('/api/profile', require('./routes/profileRoutes'));
app.use('/api/questions', require('./routes/questionRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/blogs', require('./routes/blogRoutes'));
app.use('/api/interview', require('./routes/interviewRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/experiences', require('./routes/experienceRoutes'));
app.use('/api/mcq', require('./routes/mcqRoutes'));

// Error Handler (Basic)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Start Server
app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});
