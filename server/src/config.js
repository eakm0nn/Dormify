const path = require('node:path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env'), quiet: true });

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret || jwtSecret.trim().length < 32 || jwtSecret === 'your_secure_jwt_secret_here') {
    throw new Error('JWT_SECRET must be set to a random secret of at least 32 characters in server/.env');
}

module.exports = {
    jwtSecret,
    clientOrigin: process.env.CLIENT_ORIGIN || 'http://127.0.0.1:5173',
};
