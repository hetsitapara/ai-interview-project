const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const MONGO_URI = 'mongodb://127.0.0.1:27017/sdp-project';

const fixAdmin = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);
        
        await User.findOneAndUpdate(
            { email: 'admin@gmail.com' },
            { 
                email: 'admin@gmail.com',
                password: hashedPassword,
                role: 'admin',
                name: 'System Admin'
            },
            { upsert: true }
        );
        console.log('Admin user fixed with password: admin123');
        process.exit();
    } catch (e) { console.error(e); process.exit(1); }
};
fixAdmin();
