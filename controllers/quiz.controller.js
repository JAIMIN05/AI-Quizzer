const Quiz = require('../models/quiz.model');
const { generateQuiz } = require('../services/ai.service');

async function createQuiz(req, res, next) {
    try {
        const { grade, subject, difficulty, totalQuestions, maxScore } = req.body;

        // Validate input
        if (!grade || !subject || !difficulty || !totalQuestions || !maxScore) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // Generate quiz using AI
        const generatedQuiz = await generateQuiz(grade, subject, difficulty, totalQuestions);

        // Create quiz document with timeout handling
        const quiz = new Quiz({
            grade,
            subject,
            difficulty,
            totalQuestions,
            maxScore,
            questions: generatedQuiz.questions,
            title: generatedQuiz.title
        });

        // Save with timeout handling
        const savedQuiz = await quiz.save();

        res.status(201).json({
            success: true,
            data: savedQuiz
        });

    } catch (error) {
        console.error('Create Quiz Error:', error);
        next(error); // Pass to error handling middleware
    }
}

module.exports = { createQuiz };