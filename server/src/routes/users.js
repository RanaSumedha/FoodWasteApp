const router = require('express').Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Listing = require('../models/Listing');
const Claim = require('../models/Claim');
const { geocodeAddress, GeocodingError } = require('../services/tracker');

// GET /users/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ error: 'NOT_FOUND', resource: 'user' });
    const profile = user.toObject();
    if (user.completedPickups < 3) delete profile.averageRating;
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: 'SERVER_ERROR', message: err.message });
  }
});

// PATCH /users/:id/location
router.patch('/:id/location', auth, async (req, res) => {
  try {
    if (req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ error: 'FORBIDDEN' });
    }
    const { coordinates, address } = req.body;
    let coords;
    if (coordinates && Array.isArray(coordinates) && coordinates.length === 2) {
      coords = coordinates;
    } else if (address) {
      try {
        coords = await geocodeAddress(address);
      } catch (e) {
        if (e instanceof GeocodingError) {
          return res.status(422).json({ error: 'GEOCODING_ERROR', message: e.message });
        }
        throw e;
      }
    } else {
      return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Provide coordinates or address' });
    }
    const update = {
      location: { type: 'Point', coordinates: coords },
      savedAddress: address || `${coords[1].toFixed(4)}, ${coords[0].toFixed(4)}`
    };
    const user = await User.findByIdAndUpdate(req.params.id, update, { new: true }).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'SERVER_ERROR', message: err.message });
  }
});

// GET /users/:id/listings (restaurant history)
router.get('/:id/listings', auth, async (req, res) => {
  try {
    const listings = await Listing.find({ restaurantId: req.params.id })
      .populate({ path: 'claimId', populate: { path: 'claimantId', select: 'name' } })
      .sort({ createdAt: -1 });
    res.json(listings);
  } catch (err) {
    res.status(500).json({ error: 'SERVER_ERROR', message: err.message });
  }
});

// GET /users/:id/claims (ngo/volunteer history)
router.get('/:id/claims', auth, async (req, res) => {
  try {
    const claims = await Claim.find({ claimantId: req.params.id })
      .populate({ path: 'listingId', populate: { path: 'restaurantId', select: 'name' } })
      .sort({ createdAt: -1 });
    res.json(claims);
  } catch (err) {
    res.status(500).json({ error: 'SERVER_ERROR', message: err.message });
  }
});

// DELETE /users/:id (account deletion)
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user._id.toString() !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'FORBIDDEN' });
    }
    // Delete all user's listings
    await Listing.deleteMany({ restaurantId: req.params.id });
    // Delete the user
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'SERVER_ERROR', message: err.message });
  }
});

module.exports = router;
