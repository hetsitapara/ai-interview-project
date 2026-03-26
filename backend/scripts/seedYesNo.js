const mongoose = require('mongoose');
const dotenv = require('dotenv');
const YesNoQuestion = require('../models/YesNoQuestion');

dotenv.config({ path: './backend/.env' });

// Fallback to local if env missing, matching config/db.js
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/sdp-project';

mongoose.connect(MONGO_URI)
.then(() => console.log("MongoDB Connected for Seeding"))
.catch(err => console.log(err));

const questions = [
    { question: "Is HTML a programming language?", answer: "No", category: "Web Development", topic: "Basics" },
    { question: "Does CSS stand for Cascading Style Sheets?", answer: "Yes", category: "Web Development", topic: "Styling" },
    { question: "Is React a JavaScript library?", answer: "Yes", category: "Web Development", topic: "Library" },
    { question: "Is Python a compiled language only?", answer: "No", category: "Programming", topic: "Basics" },
    { question: "Is HTTP a stateless protocol?", answer: "Yes", category: "Web Development", topic: "Networking" },
    { question: "Can you use 'await' outside of an async function in older Node.js versions?", answer: "No", category: "Node.js", topic: "Async" },
    { question: "Is the Time Complexity of Binary Search O(log n)?", answer: "Yes", category: "DSA", topic: "Algorithms" },
    { question: "Is a Linked List a linear data structure?", answer: "Yes", category: "DSA", topic: "Data Structures" },
    { question: "Does SQL stand for Structured Query Language?", answer: "Yes", category: "Database", topic: "SQL" },
    { question: "Is MongoDB a relational database?", answer: "No", category: "Database", topic: "NoSQL" },
    { question: "Is null an object in JavaScript?", answer: "Yes", category: "JavaScript", topic: "Basics" }, // Technicality: typeof null === 'object'
    { question: "Is undefined same as null in JS?", answer: "No", category: "JavaScript", topic: "Basics" },
    { question: "Do HR interviews typically ask about technical coding skills primarily?", answer: "No", category: "HR", topic: "Behavioral" },
    { question: "Is 'Tell me about yourself' a common first interview question?", answer: "Yes", category: "HR", topic: "General" }
];

const seedDB = async () => {
    try {
        await YesNoQuestion.deleteMany({});
        await YesNoQuestion.insertMany(questions);
        console.log("Yes/No Questions Seeded!");
    } catch (error) {
        console.error("Error seeding:", error);
    } finally {
        mongoose.connection.close();
    }
};

seedDB();
