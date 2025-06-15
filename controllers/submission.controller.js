const Quiz = require('../models/quiz.model');
const Submission = require('../models/submission.model');

async function submitQuiz(req, res) {
    try {
        const { quizId, responses } = req.body;

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
        const correctCount = score;
        const wrongCount = total - score;
        const percentage = (score / total) * 100;

        // Create submission record
        const submission = new Submission({
            quizId,
            userId: req.user?.id || 'anonymous', // If you have authentication
            responses,
            score,
            total,
            submittedAt: new Date()
        });

        await submission.save();

        // Return detailed results
        res.json({
            success: true,
            data: {
                score,
                total,
                percentage: percentage.toFixed(2),
                correctCount,
                wrongCount,
                questionResults,
                submissionId: submission._id
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