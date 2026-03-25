const mongoose = require('mongoose');

const connectDB = async () => {
    const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ai-interview';
    const maxRetries = 5;
    let retries = 0;

    const connect = async () => {
        try {
            console.log(`\n[MongoDB] Attempting to connect to: ${mongoURI}`);
            console.log(`[MongoDB] Retry ${retries + 1}/${maxRetries}`);

            const conn = await mongoose.connect(mongoURI, {
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000,
                connectTimeoutMS: 10000,
                retryWrites: true,
                w: 'majority'
            });

            console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
            console.log(`📊 Database: ${conn.connection.name}\n`);
            return;
        } catch (error) {
            retries++;
            console.error(`❌ MongoDB Connection Error (Attempt ${retries}/${maxRetries}): ${error.message}`);

            if (retries < maxRetries) {
                console.log(`⏳ Retrying in 2 seconds...\n`);
                await new Promise(resolve => setTimeout(resolve, 2000));
                return connect();
            } else {
                console.error(`\n⚠️  Could not connect to MongoDB after ${maxRetries} attempts.`);
                console.error(`\n📌 Solutions:`);
                console.error(`   1. Start MongoDB with Docker: docker-compose up -d`);
                console.error(`   2. Or use MongoDB Atlas: https://www.mongodb.com/cloud/atlas`);
                console.error(`   3. Update MONGO_URI in backend/.env with your connection string\n`);
                process.exit(1);
            }
        }
    };

    return connect();
};

module.exports = {
    connectDB,
    secretKey: process.env.JWT_SECRET || 'super_secret_key_sdp_project'
};
