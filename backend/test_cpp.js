const axios = require('axios');

async function testCpp() {
    try {
        // 1. Register/Login
        const email = `test_cpp_${Date.now()}@example.com`;
        const password = 'password123';
        
        try {
            await axios.post('http://localhost:5001/api/register', {
                name: 'CPP User',
                email,
                password
            });
        } catch (e) {}

        const loginRes = await axios.post('http://localhost:5001/api/login', {
            email,
            password
        });
        const token = loginRes.data.token;

        // 2. Get Factorial Question
        const questionsRes = await axios.get('http://localhost:5001/api/coding/questions', {
            headers: { Authorization: `Bearer ${token}` }
        });
        const question = questionsRes.data.find(q => q.title.includes('Factorial'));
        if (!question) throw new Error("Factorial question not found");

        console.log("Testing Question:", question.title);

        // 3. Submit C++ Code
        const cppCode = `
#include <iostream>
using namespace std;

long long factorial(int n) {
    if (n == 0) return 1;
    long long res = 1;
    for(int i=1; i<=n; i++) res *= i;
    return res;
}

int main() {
    int n;
    if (cin >> n) {
        cout << factorial(n);
    }
    return 0;
}
        `;

        console.log("Submitting C++ solution...");
        const res = await axios.post('http://localhost:5001/api/coding/submit', {
            questionId: question._id,
            language: 'cpp',
            code: cppCode
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log("Results:");
        res.data.results.forEach((r, i) => {
            console.log(`Test Case ${i+1}: ${r.passed ? 'PASSED' : 'FAILED'} (Exp: ${r.expected}, Act: ${r.actual})`);
        });

        if (res.data.allPassed) {
            console.log("SUCCESS: C++ Solution Passed!");
        } else {
            console.error("FAILURE: Some test cases failed.");
        }

    } catch (error) {
        console.error("TEST FAILED:", error.response ? JSON.stringify(error.response.data) : error.message);
    }
}

testCpp();
