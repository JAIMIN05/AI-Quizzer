const mongoose = require('mongoose');

const responseSchema = new mongoose.Schema({
    questionId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    userResponse: {
        type: String,
        required: true
    }
});

module.exports = responseSchema;