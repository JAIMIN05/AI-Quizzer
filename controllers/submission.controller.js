const Quiz = require('../models/quiz.model');
const Submission = require('../models/submission.model');
const { sendQuizResults } = require('../services/email.service');

async function submitQuiz(req, res) {
    try {
        const { quizId, responses } = req.body;
        const userId = req.user.id; // Get userId from JWT token
        const userEmail = req.user.email; // Get email from JWT payload

        // Validate input
        if (!quizId || !responses || !Array.isArray(responses)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid submission format'
            });
        }

        // Fetch quiz
        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return res.status(404).json({
                success: false,
                message: 'Quiz not found'
            });
        }

        // Calculate results
        let score = 0;
        const questionResults = [];

        responses.forEach(response => {
            const question = quiz.questions.find(q => 
                q._id.toString() === response.questionId
            );

            if (question) {
                const isCorrect = question.correctAnswer === response.userResponse;
                score += isCorrect ? 1 : 0;

                questionResults.push({
                    questionId: response.questionId,
                    questionText: question.questionText,
                    userResponse: response.userResponse,
                    correctAnswer: question.correctAnswer,
                    isCorrect: isCorrect
                });
            }
        });

        // Calculate statistics
        const total = quiz.questions.length;
        const percentage = (score / total) * 100;

        // Create submission record with userId
        const submission = new Submission({
            quizId,
            userId, // Store the userId from JWT
            responses,
            score,
            total,
            submittedAt: new Date()
        });

        await submission.save();

        // Prepare results for email
        const quizResults = {
            score,
            total: quiz.questions.length,
            correctAnswers: questionResults.filter(q => q.isCorrect),
            wrongAnswers: questionResults.filter(q => !q.isCorrect)
        };

        // Send email asynchronously
        sendQuizResults(userEmail, quizResults).catch(error => {
            console.error('Email sending failed:', error);
        });

        // Return detailed results
        res.status(201).json({
            success: true,
            data: {
                submissionId: submission._id,
                userId,
                score,
                total,
                percentage: percentage.toFixed(2),
                correctCount: score,
                wrongCount: total - score,
                questionResults
            }
        });

    } catch (error) {
        console.error('Quiz Submission Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing submission',
            error: error.message
        });
    }
}

module.exports = { submitQuiz };