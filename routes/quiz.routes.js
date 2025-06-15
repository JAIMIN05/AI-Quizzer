const express = require('express');
const { createQuiz } = require('../controllers/quiz.controller');
const router = express.Router();

router.post('/create', createQuiz);

module.exports = router;