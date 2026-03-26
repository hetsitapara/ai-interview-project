const mongoose = require('mongoose');
const CodingQuestion = require('../models/CodingQuestion');

const MONGO_URI = 'mongodb://127.0.0.1:27017/sdp-project';

const checkData = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        const count = await CodingQuestion.countDocuments();
        const first = await CodingQuestion.findOne({}, 'title');
        console.log(`Coding Questions found: ${count}`);
        console.log(`First question: ${first ? first.title : 'NONE'}`);
        process.exit();
    } catch (e) { console.error(e); process.exit(1); }
};
checkData();
