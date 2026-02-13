const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Question = require('./models/Question');

dotenv.config();

const verifyQuestions = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ai-interview-system');
        console.log('MongoDB Connected');

        const count = await Question.countDocuments();
        console.log(`Total Questions in DB: ${count}`);
        
        const examples = await Question.find({}).limit(3);
        console.log('First 3 questions:', JSON.stringify(examples, null, 2));

        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

verifyQuestions();
