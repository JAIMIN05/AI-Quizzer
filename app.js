// src/app.js

const express = require('express');
const mongoose = require('./config/db');

const app = express();
const PORT = process.env.PORT || 3000;

// Test route
app.get('/test', (req, res) => {
    res.send('Hello World');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Connect to MongoDB
mongoose();