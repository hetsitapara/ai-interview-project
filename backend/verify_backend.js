const axios = require('axios');
const mongoose = require('mongoose');
const User = require('./models/User'); // Need to access DB directly to force admin role

const API_URL = 'http://localhost:5001/api';
// Connect to DB directly for the script to modify roles
const MONGO_URI = 'mongodb://localhost:27017/sdp-project';

const runVerification = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('--- Starting Admin Verification ---');

        // 1. Register Admin User (Initially just a user)
        const email = `admin_${Date.now()}@example.com`;
        const password = 'password123';
        console.log(`\n1. Registering future admin: ${email}`);
        
        let token;
        let userId;
        try {
            const regRes = await axios.post(`${API_URL}/register`, {
                name: 'Admin User',
                email,
                password
            });
            token = regRes.data.token;
            userId = regRes.data._id;
            console.log('   ✅ Registration Successful');
        } catch (err) {
             console.error('   ❌ Registration Failed:', err.message);
             return;
        }

        // 2. Force Promote to Admin
        console.log('\n2. Promoting user to Admin via DB');
        await User.findByIdAndUpdate(userId, { role: 'admin' });
        console.log('   ✅ User promoted to admin in DB');

        const authHeader = { headers: { Authorization: `Bearer ${token}` } };

        // 3. Admin Add Question
        console.log('\n3. Admin: Adding Question');
        let questionId;
        try {
            const qRes = await axios.post(`${API_URL}/questions`, {
                title: 'Admin Question',
                topic: 'OS',
                difficulty: 'Hard',
                answer: 'Admin Answer'
            }, authHeader);
            questionId = qRes.data._id;
            console.log('   ✅ Admin Add Question Successful');
        } catch (err) {
            console.log('   ❌ Admin Add Question Failed:', err.response?.data || err.message);
        }

        // 4. Admin Update Question
        if (questionId) {
            console.log('\n4. Admin: Updating Question');
            try {
                const updateRes = await axios.put(`${API_URL}/questions/${questionId}`, {
                    title: 'Admin Question Updated'
                }, authHeader);
                if (updateRes.data.title === 'Admin Question Updated') {
                    console.log('   ✅ Admin Update Question Successful');
                } else {
                    console.log('   ❌ Admin Update Verification Failed');
                }
            } catch (err) {
                console.log('   ❌ Admin Update Question Failed:', err.message);
            }

            // 5. Admin Delete Question
            console.log('\n5. Admin: Deleting Question');
            try {
                await axios.delete(`${API_URL}/questions/${questionId}`, authHeader);
                console.log('   ✅ Admin Delete Question Successful');
            } catch (err) {
                console.log('   ❌ Admin Delete Question Failed:', err.message);
            }
        }

        // 6. Admin User Management
        console.log('\n6. Admin: Fetch Users');
        try {
            const userRes = await axios.get(`${API_URL}/users`, authHeader);
            if (Array.isArray(userRes.data)) {
                 console.log(`   ✅ Fetched ${userRes.data.length} users`);
            }
        } catch (err) {
            console.log('   ❌ Fetch Users Failed:', err.message);
        }

        // 7. Admin Blog Management (Mock Add for Delete Test)
        console.log('\n7. Admin: Blog Management');
        // Manually insert a blog using model since we didn't make a POST route for it specifically for admin, 
        // but let's assume I can't easily do that without a route.
        // Wait, I can use the direct DB connection since I have it open.
        const Blog = require('./models/Blog');
        const newBlog = await Blog.create({
            title: 'Test Blog',
            content: 'Content',
            author: 'Admin'
        });
        console.log('   (Created mock blog in DB)');

        try {
            // Get Blogs
            const blogRes = await axios.get(`${API_URL}/blogs`, authHeader);
             console.log(`   ✅ Fetched ${blogRes.data.length} blogs`);

            // Delete Blog
            await axios.delete(`${API_URL}/blogs/${newBlog._id}`, authHeader);
            console.log('   ✅ Admin Delete Blog Successful');

        } catch (err) {
             console.log('   ❌ Blog Operations Failed:', err.message);
        }

        console.log('\n--- Verification Complete ---');
        mongoose.connection.close();

    } catch (error) {
        console.error('\n❌ Verification Failed:', error.message);
        if (mongoose.connection.readyState === 1) mongoose.connection.close();
    }
};

runVerification();
