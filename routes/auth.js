const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

router.post('/signup', async (req, res) => {
  try {
    const { username, userType, systemId, employeeId, department, password } = req.body;

    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    let uniqueId = '';
    if (userType === 'student' && systemId) {
      const systemIdExists = await User.findOne({ systemId });
      if (systemIdExists) {
        return res.status(400).json({ message: 'System ID already registered' });
      }
      uniqueId = systemId;
    } else if ((userType === 'professor' || userType === 'admin') && employeeId) {
      const employeeIdExists = await User.findOne({ employeeId });
      if (employeeIdExists) {
        return res.status(400).json({ message: 'Employee ID already registered' });
      }
      uniqueId = employeeId;
    }

    const user = await User.create({
      username,
      userType,
      ...(userType === 'student' && { systemId: uniqueId }),
      ...((userType === 'professor' || userType === 'admin') && { employeeId: uniqueId }),
      department,
      password
    });

    res.status(201).json({
      _id: user._id,
      username: user.username,
      userType: user.userType,
      department: user.department,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/signin', async (req, res) => {
  try {
    const { username, password, userType } = req.body;

    const user = await User.findOne({ username, userType });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.json({
      _id: user._id,
      username: user.username,
      userType: user.userType,
      department: user.department,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/me', protect, async (req, res) => {
  res.json(req.user);
});

module.exports = router;