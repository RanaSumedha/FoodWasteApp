const router = require('express').Router();
const auth = require('../middleware/auth');
const requireRoles = require('../middleware/roles');
const User = require('../models/User');
const Listing = require('../models/Listing');
const Claim = require('../models/Claim');
const Rating = require('../models/Rating');

const adminOnly = [auth, requireRoles('admin')];

// GET /admin/stats
router.get('/stats', ...adminOnly, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [activeListings, pickupsToday, users, weightResult] = await Promise.all([
      Listing.countDocuments({ status: 'available' }),
      Claim.countDocuments({ status: 'completed', completedAt: { $gte: today } }),
      User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
      User.aggregate([{ $group: { _id: null, total: { $sum: '$totalWeightRescued' } } }])
    ]);
    const usersByRole = {};
    users.forEach(u => { usersByRole[u._id] = u.count; });
    res.json({
      activeListings,
      pickupsToday,
      usersByRole,
      totalWeightRescued: weightResult[0]?.total || 0
    });
  } catch (err) {
    res.status(500).json({ error: 'SERVER_ERROR', message: err.message });
  }
});

// PATCH /admin/users/:id
router.patch('/users/:id', ...adminOnly, async (req, res) => {
  try {
    const { isActive } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { isActive }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ error: 'NOT_FOUND', resource: 'user' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'SERVER_ERROR', message: err.message });
  }
});

// DELETE /admin/listings/:id
router.delete('/listings/:id', ...adminOnly, async (req, res) => {
  try {
    await Listing.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'SERVER_ERROR', message: err.message });
  }
});

// DELETE /admin/ratings/:id
router.delete('/ratings/:id', ...adminOnly, async (req, res) => {
  try {
    await Rating.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'SERVER_ERROR', message: err.message });
  }
});

// GET /admin/users
router.get('/users', ...adminOnly, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'SERVER_ERROR', message: err.message });
  }
});

// GET /admin/listings
router.get('/listings', ...adminOnly, async (req, res) => {
  try {
    const listings = await Listing.find().populate('restaurantId', 'name').sort({ createdAt: -1 }).limit(100);
    res.json(listings);
  } catch (err) {
    res.status(500).json({ error: 'SERVER_ERROR', message: err.message });
  }
});

// GET /admin/ratings
router.get('/ratings', ...adminOnly, async (req, res) => {
  try {
    const ratings = await Rating.find()
      .populate('raterId', 'name')
      .populate('rateeId', 'name')
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(ratings);
  } catch (err) {
    res.status(500).json({ error: 'SERVER_ERROR', message: err.message });
  }
});

module.exports = router;
