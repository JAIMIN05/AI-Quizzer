const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const login = (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Basic validation
        if (!username || !password || !email) {
            return res.status(400).json({
                success: false,
                message: 'Username, email and password are required'
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email format'
            });
        }

        // Generate a unique userId
        const userId = uuidv4();

        // Create JWT payload
        const payload = {
            id: userId,
            username: username,
            email: email,
            timestamp: Date.now()
        };

        // Sign JWT token
        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({
            success: true,
            data: {
                userId,
                email,
                token
            }
        });

    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error during login',
            error: error.message
        });
    }
};

module.exports = { login };