const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    questionText: {
        type: String,
        required: true
    },
    options: {
        type: [String],
        required: true,
        validate: [
            array => array.length >= 2,
            'Questions must have at least 2 options'
        ]
    },
    correctAnswer: {
        type: String,
        required: true,
        validate: {
            validator: function(v) {
                return this.options.includes(v);
            },
            message: 'Correct answer must be one of the options'
        }
    }
});

module.exports = questionSchema;