const mongoose = require('mongoose');
const questionSchema = require('./question.model');

const quizSchema = new mongoose.Schema({
    grade: {
        type: Number,
        required: true,
        min: 1,
        max: 12
    },
    subject: {
        type: String,
        required: true,
        trim: true
    },
    difficulty: {
        type: String,
        required: true,
        enum: ['easy', 'medium', 'hard']
    },
    totalQuestions: {
        type: Number,
        required: true,
        min: 1
    },
    maxScore: {
        type: Number,
        required: true,
        min: 1
    },
    questions: {
        type: [questionSchema],
        required: true,
        validate: [
            array => array.length > 0,
            'Quiz must have at least one question'
        ]
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Quiz = mongoose.model('Quiz', quizSchema);

module.exports = Quiz;