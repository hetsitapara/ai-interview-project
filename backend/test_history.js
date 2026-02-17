const axios = require('axios');

async function testHistory() {
    try {
        // 1. Register/Login
        console.log("Logging in...");
        const email = `test_hist_${Date.now()}@example.com`;
        const password = 'password123';
        
        let token;
        try {
            await axios.post('http://localhost:5001/api/register', {
                name: 'History User',
                email,
                password
            });
        } catch (e) {}

        const loginRes = await axios.post('http://localhost:5001/api/login', {
            email,
            password
        });
        token = loginRes.data.token;
        console.log("Logged in.");

        // 2. Get Questions
        const questionsRes = await axios.get('http://localhost:5001/api/coding/questions', {
            headers: { Authorization: `Bearer ${token}` }
        });
        const questionId = questionsRes.data[0]._id;
        console.log("Question ID:", questionId);

        // 3. Submit Code
        console.log("Submitting code...");
        await axios.post('http://localhost:5001/api/coding/submit', {
            questionId,
            language: 'javascript',
            code: '// Test submission'
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });

        // 4. Fetch History
        console.log("Fetching history...");
        const histRes = await axios.get(`http://localhost:5001/api/coding/submissions/${questionId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log("History Length:", histRes.data.length);
        if (histRes.data.length > 0) {
            console.log("SUCCESS: Found submission in history.");
            console.log("First submission status:", histRes.data[0].status);
        } else {
            console.error("FAILURE: No history found.");
        }

    } catch (error) {
        console.error("TEST FAILED:", error.response ? JSON.stringify(error.response.data) : error.message);
    }
}

testHistory();
