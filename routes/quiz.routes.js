const express = require('express');
const router = express.Router();
const { createQuiz } = require('../controllers/quiz.controller');
const { getQuizHistory } = require('../controllers/quiz.history.controller');
const { submitQuiz } = require('../controllers/submission.controller');
const { retryQuiz } = require('../controllers/retry.controller');
const { generateHint } = require('../controllers/hint.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.post('/create', createQuiz);
router.get('/history', getQuizHistory);
router.post('/submit', authMiddleware, submitQuiz);
router.post('/retry', authMiddleware, retryQuiz);
router.post('/hint', generateHint);

module.exports = router;