const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/auth');
const requireRoles = require('../middleware/roles');
const Listing = require('../models/Listing');
const User = require('../models/User');
const { notifyNearbyUsers } = require('../services/notifier');
const { haversineDistance } = require('../services/tracker');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../../uploads')),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// GET /listings
router.get('/', async (req, res) => {
  try {
    const { lng, lat, radius = 10 } = req.query;
    const query = { status: 'available' };

    // Exclude deactivated restaurant listings
    const inactiveRestaurants = await User.find({ isActive: false }).select('_id');
    const inactiveIds = inactiveRestaurants.map(u => u._id);
    if (inactiveIds.length) query.restaurantId = { $nin: inactiveIds };

    if (lng && lat) {
      query.location = {
        $nearSphere: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: parseFloat(radius) * 1000
        }
      };
    }

    const listings = await Listing.find(query)
      .populate('restaurantId', 'name averageRating')
      .limit(100);

    const result = listings.map(l => {
      const obj = l.toObject();
      if (lng && lat) {
        obj.distance = haversineDistance(
          [parseFloat(lng), parseFloat(lat)],
          l.location.coordinates
        );
      }
      return obj;
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'SERVER_ERROR', message: err.message });
  }
});

// GET /listings/:id
router.get('/:id', async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id).populate('restaurantId', 'name averageRating completedPickups');
    if (!listing) return res.status(404).json({ error: 'NOT_FOUND', resource: 'listing' });
    res.json(listing);
  } catch (err) {
    res.status(500).json({ error: 'SERVER_ERROR', message: err.message });
  }
});

// POST /listings
router.post('/', auth, requireRoles('restaurant'), upload.array('photos', 5), async (req, res) => {
  try {
    const { foodName, quantity, unit, description, pickupWindowStart, expiryAt, lng, lat } = req.body;
    if (!foodName || !quantity || !unit || !pickupWindowStart || !expiryAt || lng == null || lat == null) {
      return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Missing required fields' });
    }
    if (parseFloat(quantity) <= 0) {
      return res.status(400).json({ error: 'VALIDATION_ERROR', field: 'quantity', message: 'Quantity must be greater than 0' });
    }
    if (new Date(expiryAt) <= new Date()) {
      return res.status(400).json({ error: 'VALIDATION_ERROR', field: 'expiryAt', message: 'Expiry must be in the future' });
    }
    const photoUrls = (req.files || []).map(f => `/uploads/${f.filename}`);
    const listing = await Listing.create({
      restaurantId: req.user._id,
      foodName, quantity: parseFloat(quantity), unit, description,
      photoUrls,
      location: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
      pickupWindowStart: new Date(pickupWindowStart),
      expiryAt: new Date(expiryAt),
      status: 'available'
    });
    await User.findByIdAndUpdate(req.user._id, { $inc: { totalListingsCreated: 1 } });
    notifyNearbyUsers(listing, req.user.name).catch(() => {});
    res.status(201).json(listing);
  } catch (err) {
    res.status(500).json({ error: 'SERVER_ERROR', message: err.message });
  }
});

// PATCH /listings/:id
router.patch('/:id', auth, requireRoles('restaurant'), async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ error: 'NOT_FOUND', resource: 'listing' });
    if (listing.restaurantId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'FORBIDDEN' });
    }
    const updates = {};
    const allowed = ['foodName', 'quantity', 'unit', 'description', 'pickupWindowStart'];
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    if (req.body.expiryAt) {
      const newExpiry = new Date(req.body.expiryAt);
      const maxExpiry = new Date(listing.expiryAt.getTime() + 4 * 3600 * 1000);
      if (newExpiry > maxExpiry) {
        return res.status(400).json({ error: 'VALIDATION_ERROR', field: 'expiryAt', message: 'Cannot extend expiry by more than 4 hours' });
      }
      updates.expiryAt = newExpiry;
    }
    const updated = await Listing.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'SERVER_ERROR', message: err.message });
  }
});

// DELETE /listings/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ error: 'NOT_FOUND', resource: 'listing' });
    const isOwner = listing.restaurantId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) return res.status(403).json({ error: 'FORBIDDEN' });
    await listing.deleteOne();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'SERVER_ERROR', message: err.message });
  }
});

module.exports = router;
