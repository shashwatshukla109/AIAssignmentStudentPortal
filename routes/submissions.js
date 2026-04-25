const express = require('express');
const multer = require('multer');
const path = require('path');
const Submission = require('../models/Submission');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /pdf|docx|txt/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (extname && mimetype) {
    return cb(null, true);
  }
  cb(new Error('Only PDF, DOCX, and TXT files are allowed'));
};

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter
});

router.post('/', protect, authorize('student'), upload.single('file'), async (req, res) => {
  try {
    const { assignmentId, content } = req.body;
    
    if (!req.file && !content) {
      return res.status(400).json({ message: 'Please upload a file or provide content' });
    }

    const fileName = req.file ? req.file.filename : '';
    const filePath = req.file ? req.file.path : '';
    const submissionContent = content || (req.file ? req.file.originalname : '');

    const submission = await Submission.create({
      assignmentId,
      studentId: req.user._id,
      fileName: req.file ? req.file.originalname : 'text-submission',
      filePath,
      content: submissionContent
    });

    res.status(201).json(submission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/student', protect, authorize('student'), async (req, res) => {
  try {
    const submissions = await Submission.find({ studentId: req.user._id })
      .populate('assignmentId')
      .sort({ submittedAt: -1 });
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/assignment/:id', protect, authorize('professor'), async (req, res) => {
  try {
    const submissions = await Submission.find({ assignmentId: req.params.id })
      .populate('studentId', 'username systemId department')
      .sort({ submittedAt: -1 });
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate('assignmentId')
      .populate('studentId', 'username systemId department');
    
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    if (req.user.userType === 'student' && submission.studentId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(submission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id/grade', protect, authorize('professor'), async (req, res) => {
  try {
    const { grade, feedback } = req.body;
    
    const submission = await Submission.findById(req.params.id);
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    submission.grade = grade;
    submission.feedback = feedback;
    submission.gradedAt = new Date();
    
    await submission.save();
    res.json(submission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/stats/professor', protect, authorize('professor'), async (req, res) => {
  try {
    const assignments = await require('../models/Assignment').find({ professorId: req.user._id });
    const assignmentIds = assignments.map(a => a._id);
    
    const submissions = await Submission.find({ assignmentId: { $in: assignmentIds } });
    
    const totalSubmissions = submissions.length;
    const gradedSubmissions = submissions.filter(s => s.grade !== null).length;
    const pendingSubmissions = totalSubmissions - gradedSubmissions;
    
    const avgGrade = gradedSubmissions > 0 
      ? submissions.reduce((sum, s) => sum + (s.grade || 0), 0) / gradedSubmissions 
      : 0;
    
    const avgOriginality = totalSubmissions > 0
      ? submissions.reduce((sum, s) => sum + (s.originalityScore || 0), 0) / totalSubmissions
      : 0;

    res.json({
      totalSubmissions,
      gradedSubmissions,
      pendingSubmissions,
      avgGrade: Math.round(avgGrade * 10) / 10,
      avgOriginality: Math.round(avgOriginality * 10) / 10
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;