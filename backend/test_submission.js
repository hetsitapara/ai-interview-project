const axios = require('axios');

async function testSubmission() {
    try {
        // 1. Register/Login
        console.log("Registering/Logging in...");
        const email = `test${Date.now()}@example.com`;
        const password = 'password123';
        
        let token;
        try {
            await axios.post('http://localhost:5001/api/register', {
                name: 'Test User',
                email,
                password
            });
            console.log("Registered new user.");
        } catch (e) {
            // If already exists (unlikely with timestamp), just login
        }

        const loginRes = await axios.post('http://localhost:5001/api/login', {
            email,
            password
        });
        token = loginRes.data.token;
        console.log("Logged in. Token received.");

        // 2. Get Questions
        console.log("Fetching questions...");
        const questionsRes = await axios.get('http://localhost:5001/api/coding/questions', {
            headers: { Authorization: `Bearer ${token}` }
        });
        const questionId = questionsRes.data[0]._id;
        console.log("Question ID:", questionId);

        // 3. Submit Correct Code (Two Sum)
        console.log("Submitting code...");
        const code = `
const fs = require('fs');
const input = fs.readFileSync(0, 'utf-8').trim().split('\\n');
const nums = input[0].split(',').map(Number);
const target = Number(input[1]);

function twoSum(nums, target) {
    const map = new Map();
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        map.set(nums[i], i);
    }
}
console.log(JSON.stringify(twoSum(nums, target)));
        `;

        const submitRes = await axios.post('http://localhost:5001/api/coding/submit', {
            questionId,
            language: 'javascript',
            code
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log("Submission Result:", JSON.stringify(submitRes.data, null, 2));

        if (submitRes.data.submissionId) {
            console.log("SUCCESS: Submission ID returned:", submitRes.data.submissionId);
        } else {
            console.error("FAILURE: No submission ID returned");
        }

    } catch (error) {
        console.error("TEST FAILED:", error.response ? JSON.stringify(error.response.data) : error.message);
        if (error.code) console.error("Error Code:", error.code);
    }
}

testSubmission();
