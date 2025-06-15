const Quiz = require('../models/quiz.model');
const Submission = require('../models/submission.model');

async function retryQuiz(req, res) {
    try {
        const { submissionId, responses } = req.body;
        const userId = req.user.id;

        // Validate input
        if (!submissionId || !responses || !Array.isArray(responses)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid retry submission format'
            });
        }

        // Fetch original submission
        const originalSubmission = await Submission.findById(submissionId);
        if (!originalSubmission) {
            return res.status(404).json({
                success: false,
                message: 'Original submission not found'
            });
        }

        // Fetch associated quiz
        const quiz = await Quiz.findById(originalSubmission.quizId);
        if (!quiz) {
            return res.status(404).json({
                success: false,
                message: 'Quiz not found'
            });
        }

        // Calculate new results
        let newScore = 0;
        const questionResults = [];

        responses.forEach(response => {
            const question = quiz.questions.find(q => 
                q._id.toString() === response.questionId
            );

            if (question) {
                const isCorrect = question.correctAnswer === response.userResponse;
                newScore += isCorrect ? 1 : 0;

                questionResults.push({
                    questionId: response.questionId,
                    questionText: question.questionText,
                    userResponse: response.userResponse,
                    correctAnswer: question.correctAnswer,
                    isCorrect: isCorrect
                });
            }
        });

        // Create new submission record
        const newSubmission = new Submission({
            quizId: originalSubmission.quizId,
            userId,
            responses,
            score: newScore,
            total: quiz.questions.length,
            submittedAt: new Date(),
            isRetry: true,
            originalSubmissionId: submissionId
        });

        await newSubmission.save();

        // Calculate percentages
        const originalPercentage = (originalSubmission.score / originalSubmission.total) * 100;
        const newPercentage = (newScore / quiz.questions.length) * 100;

        // Return comparison results
        res.status(201).json({
            success: true,
            data: {
                originalSubmission: {
                    submissionId: originalSubmission._id,
                    score: originalSubmission.score,
                    total: originalSubmission.total,
                    percentage: originalPercentage.toFixed(2)
                },
                newSubmission: {
                    submissionId: newSubmission._id,
                    score: newScore,
                    total: quiz.questions.length,
                    percentage: newPercentage.toFixed(2),
                    improvement: (newPercentage - originalPercentage).toFixed(2),
                    questionResults
                }
            }
        });

    } catch (error) {
        console.error('Quiz Retry Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing quiz retry',
            error: error.message
        });
    }
}

module.exports = { retryQuiz };