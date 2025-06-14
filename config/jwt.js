const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = '1h';

module.exports = {
    JWT_SECRET,
    JWT_EXPIRES_IN
};