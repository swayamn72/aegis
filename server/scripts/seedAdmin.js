import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from '../models/admin.model.js';

dotenv.config();

const seedAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: 'admin@aegis.com' });

    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      console.log('Email: admin@aegis.com');
      console.log('Password: admin123');
      process.exit(0);
    }

    // Create new admin user
    const admin = new Admin({
      username: 'admin',
      email: 'admin@aegis.com',
      password: 'admin123', // This will be hashed by the pre-save middleware
      role: 'superadmin',
      permissions: [
        'canCreateTournament',
        'canEditTournament',
        'canDeleteTournament',
        'canCreateMatch',
        'canEditMatch',
        'canDeleteMatch',
        'canManageUsers',
        'canViewAnalytics',
        'canManageSettings'
      ],
      isActive: true,
      lastLogin: new Date()
    });

    await admin.save();
    console.log('✅ Admin user created successfully!');
    console.log('Email: admin@aegis.com');
    console.log('Password: admin123');
    console.log('Role: superadmin');

  } catch (error) {
    console.error('❌ Error seeding admin:', error);
  } finally {
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    process.exit(0);
  }
};

// Run the seed function
seedAdmin();
