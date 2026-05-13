const router = require('express').Router();
const auth = require('../middleware/auth');
const Rating = require('../models/Rating');
const Claim = require('../models/Claim');
const User = require('../models/User');

// POST /ratings
router.post('/', auth, async (req, res) => {
  try {
    const { claimId, rateeId, stars, comment } = req.body;
    if (!claimId || !rateeId || !stars) {
      return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'claimId, rateeId, and stars are required' });
    }
    if (!Number.isInteger(Number(stars)) || stars < 1 || stars > 5) {
      return res.status(400).json({ error: 'VALIDATION_ERROR', field: 'stars', message: 'Stars must be 1–5' });
    }
    if (comment && comment.length > 500) {
      return res.status(400).json({ error: 'VALIDATION_ERROR', field: 'comment', message: 'Comment must be 500 characters or less' });
    }
    const claim = await Claim.findById(claimId);
    if (!claim || claim.status !== 'completed') {
      return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Claim not found or not completed' });
    }
    const hoursElapsed = (Date.now() - claim.completedAt) / 3600000;
    if (hoursElapsed > 48) {
      return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Rating window has expired (48 hours)' });
    }
    const existing = await Rating.findOne({ claimId, raterId: req.user._id });
    if (existing) return res.status(409).json({ error: 'CONFLICT', message: 'You have already rated this pickup' });

    const rating = await Rating.create({ claimId, raterId: req.user._id, rateeId, stars: Number(stars), comment: comment || '' });

    // Recalculate average
    const allRatings = await Rating.find({ rateeId });
    const avg = allRatings.reduce((s, r) => s + r.stars, 0) / allRatings.length;
    await User.findByIdAndUpdate(rateeId, {
      averageRating: Math.round(avg * 100) / 100,
      ratingCount: allRatings.length
    });

    res.status(201).json(rating);
  } catch (err) {
    res.status(500).json({ error: 'SERVER_ERROR', message: err.message });
  }
});

// GET /ratings/:userId
router.get('/:userId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ error: 'NOT_FOUND', resource: 'user' });
    const ratings = await Rating.find({ rateeId: req.params.userId })
      .populate('raterId', 'name role')
      .sort({ createdAt: -1 });
    const result = { ratings };
    if (user.completedPickups >= 3) {
      result.averageRating = user.averageRating;
      result.ratingCount = user.ratingCount;
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'SERVER_ERROR', message: err.message });
  }
});

module.exports = router;
