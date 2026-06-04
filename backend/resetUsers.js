const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const prisma = new PrismaClient();
const User = prisma.user;

async function resetUsers() {
    try {
        await prisma.$connect();
        console.log('✅ Database Connected');

        // Only delete/recreate admin and test accounts — NEVER delete customer registrations
        await User.deleteMany({
            where: {
                email: {
                    in: ['admin@shuddheats.com', 'user@shuddheats.com']
                }
            }
        });
        console.log('🗑️  Admin and test accounts reset');

        // Create Admin
        const hashedPasswordAdmin = await bcrypt.hash('Admin@123', 12);
        await User.create({
            data: {
                name: 'ShuddhEats Admin',
                email: 'admin@shuddheats.com',
                password: hashedPasswordAdmin,
                role: 'admin',
                phone: '9876543210'
            }
        });
        console.log('✅ Admin created: admin@shuddheats.com / Admin@123');

        // Create Test User
        const hashedPasswordUser = await bcrypt.hash('User@1234', 12);
        await User.create({
            data: {
                name: 'Test User',
                email: 'user@shuddheats.com',
                password: hashedPasswordUser,
                role: 'user',
                phone: '9123456789'
            }
        });
        console.log('✅ User created: user@shuddheats.com / User@1234');

        const total = await User.count();
        console.log(`\n🎉 Done! Total users in DB: ${total}`);
        console.log('✨ Customer accounts preserved.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
}

resetUsers();
