const router = require('express').Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

function signToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '24h' });
}

// POST /auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'All fields are required' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Invalid credentials' });
    }
    const validRoles = ['restaurant', 'ngo', 'volunteer'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Invalid role' });
    }
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Invalid credentials' });
    }
    const user = await User.create({ name, email, password, role });
    const token = signToken(user);
    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: 'SERVER_ERROR', message: err.message });
  }
});

// POST /auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Invalid credentials' });
    }
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Invalid credentials' });
    }
    if (!user.isActive) {
      return res.status(403).json({ error: 'ACCOUNT_DEACTIVATED', message: 'Account has been deactivated' });
    }
    const token = signToken(user);
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: 'SERVER_ERROR', message: err.message });
  }
});

// GET /auth/me
router.get('/me', auth, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
