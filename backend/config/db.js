const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        console.log(`Attempting to connect to MongoDB: ${process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/sdp-project'}`);
        const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/sdp-project', {
            serverSelectionTimeoutMS: 5000
        });

        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`MongoDB Connection Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = {
    connectDB,
    secretKey: process.env.JWT_SECRET || 'super_secret_key_sdp_project'
};
