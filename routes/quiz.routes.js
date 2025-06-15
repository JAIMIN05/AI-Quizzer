const express = require('express');
const { createQuiz } = require('../controllers/quiz.controller');
const { getQuizHistory } = require('../controllers/quiz.history.controller');
const router = express.Router();

router.post('/create', createQuiz);
router.get('/history', getQuizHistory);

module.exports = router;