const express = require('express');
const { createQuiz } = require('../controllers/quiz.controller');
const { getQuizHistory } = require('../controllers/quiz.history.controller');
const router = express.Router();
const { submitQuiz } = require('../controllers/submission.controller');
const { retryQuiz } = require('../controllers/retry.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.post('/create', createQuiz);
router.get('/history', getQuizHistory);
router.post('/submit', authMiddleware, submitQuiz);
router.post('/retry', authMiddleware, retryQuiz);

module.exports = router;