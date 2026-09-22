import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'panda_motors_secret_key_2026';

// Create a test admin token
const token = jwt.sign(
    {
        id: 1,
        email: 'admin@test.com',
        role: 'admin',
        name: 'Test Admin'
    },
    JWT_SECRET,
    { expiresIn: '7d' }
);

console.log('\n?? ADMIN TOKEN:');
console.log('========================================');
console.log(token);
console.log('========================================\n');
console.log('Use this token in Authorization header:');
console.log(`Bearer ${token}\n`);