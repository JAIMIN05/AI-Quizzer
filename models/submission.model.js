const mongoose = require('mongoose');
const responseSchema = require('./response.model');

const submissionSchema = new mongoose.Schema({
    quizId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz',
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    responses: {
        type: [responseSchema],
        required: true,
        validate: [
            array => array.length > 0,
            'Submission must have at least one response'
        ]
    },
    score: {
        type: Number,
        required: true,
        min: 0
    },
    total: {
        type: Number,
        required: true,
        min: 0
    },
    submittedAt: {
        type: Date,
        default: Date.now
    },
    isRetry: {
        type: Boolean,
        default: false
    },
    originalSubmissionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Submission'
    }
});

submissionSchema.index({ quizId: 1, userId: 1 });

const Submission = mongoose.model('Submission', submissionSchema);

module.exports = Submission;