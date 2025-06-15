const express = require('express');
const { submitQuiz } = require('../controllers/submission.controller');
const router = express.Router();

router.post('/submit', submitQuiz);

module.exports = router;