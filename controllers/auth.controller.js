const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const login = (req, res) => {
    try {
        const { username, password } = req.body;

        // Basic validation
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username and password are required'
            });
        }

        // Generate a unique userId
        const userId = uuidv4();

        // Create JWT payload
        const payload = {
            id: userId,
            username: username,
            timestamp: Date.now()
        };

        // Sign JWT token
        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Return token and userId
        res.json({
            success: true,
            data: {
                userId,
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