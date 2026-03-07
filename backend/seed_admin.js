const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/sdp-project';

const seedAdmin = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('MongoDB Connected');

        const adminEmail = 'admin@gmail.com';
        const adminPassword = 'adminpassword';

        // Check if admin exists
        const existingAdmin = await User.findOne({ email: adminEmail });
        if (existingAdmin) {
            console.log('Admin already exists');
            // Force role update just in case
            existingAdmin.role = 'admin';
            // Force password update
            const salt = await bcrypt.genSalt(10);
            existingAdmin.password = await bcrypt.hash(adminPassword, salt);
            await existingAdmin.save();
            console.log('Admin updated');
        } else {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(adminPassword, salt);

            await User.create({
                name: 'Super Admin',
                email: adminEmail,
                password: hashedPassword,
                role: 'admin',
                skills: ['Administrator'],
                careerGoals: 'Manage the platform'
            });
            console.log('Admin user created');
        }

        mongoose.connection.close();
        process.exit();
    } catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    }
};

seedAdmin();
