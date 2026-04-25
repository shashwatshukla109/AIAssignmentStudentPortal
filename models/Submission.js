const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  assignmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  content: {
    type: String,
    default: ''
  },
  plagiarismScore: {
    type: Number,
    default: 0
  },
  originalityScore: {
    type: Number,
    default: 100
  },
  grammarSuggestions: {
    type: Array,
    default: []
  },
  studyTips: {
    type: Array,
    default: []
  },
  summary: {
    type: String,
    default: ''
  },
  grade: {
    type: Number,
    default: null
  },
  feedback: {
    type: String,
    default: ''
  },
  aiGrading: {
    type: Object,
    default: {}
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  gradedAt: {
    type: Date,
    default: null
  }
});

module.exports = mongoose.model('Submission', submissionSchema);