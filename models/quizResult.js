const mongoose = require('mongoose');

const quizResultSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  quizType: {
    type: String,
    enum: ['PHQ9', 'GAD7'],
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  answers: [{
    questionNumber: Number,
    answer: Number
  }],
  severity: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('QuizResult', quizResultSchema);
