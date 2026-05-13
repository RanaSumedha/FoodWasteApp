const router = require('express').Router();
const auth = require('../middleware/auth');
const requireRoles = require('../middleware/roles');
const Claim = require('../models/Claim');
const Listing = require('../models/Listing');
const User = require('../models/User');
const { createNotification } = require('../services/notifier');
const { validatePickupTime } = require('../services/scheduler');

// POST /claims
router.post('/', auth, requireRoles('ngo', 'volunteer'), async (req, res) => {
  try {
    const { listingId, scheduledPickupTime } = req.body;
    if (!listingId || !scheduledPickupTime) {
      return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'listingId and scheduledPickupTime required' });
    }
    const listing = await Listing.findById(listingId).populate('restaurantId', 'name');
    if (!listing) return res.status(404).json({ error: 'NOT_FOUND', resource: 'listing' });
    if (listing.status !== 'available') {
      return res.status(409).json({ error: 'CONFLICT', message: 'Listing is no longer available' });
    }
    const timeError = validatePickupTime(scheduledPickupTime, listing);
    if (timeError) return res.status(400).json({ error: 'VALIDATION_ERROR', message: timeError });

    // Atomic claim
    const updated = await Listing.findOneAndUpdate(
      { _id: listingId, status: 'available' },
      { status: 'claimed' },
      { new: true }
    );
    if (!updated) return res.status(409).json({ error: 'CONFLICT', message: 'Listing was just claimed by someone else' });

    const claim = await Claim.create({ listingId, claimantId: req.user._id, scheduledPickupTime: new Date(scheduledPickupTime) });
    await Listing.findByIdAndUpdate(listingId, { claimId: claim._id });

    // Notifications
    await createNotification(req.user._id, 'claim_confirmed', {
      listingId, foodName: listing.foodName, restaurantName: listing.restaurantId.name,
      scheduledPickupTime, claimId: claim._id
    });
    await createNotification(listing.restaurantId._id, 'claim_confirmed', {
      listingId, foodName: listing.foodName, claimantName: req.user.name,
      scheduledPickupTime, claimId: claim._id
    });

    res.status(201).json(claim);
  } catch (err) {
    res.status(500).json({ error: 'SERVER_ERROR', message: err.message });
  }
});

// DELETE /claims/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id).populate('listingId');
    if (!claim) return res.status(404).json({ error: 'NOT_FOUND', resource: 'claim' });
    if (claim.claimantId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'FORBIDDEN' });
    }
    if (claim.status !== 'active') {
      return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Claim is not active' });
    }
    await Claim.findByIdAndUpdate(req.params.id, { status: 'cancelled' });
    await Listing.findByIdAndUpdate(claim.listingId._id, { status: 'available', claimId: null });
    await createNotification(claim.listingId.restaurantId, 'claim_cancelled', {
      listingId: claim.listingId._id, foodName: claim.listingId.foodName,
      claimantName: req.user.name
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'SERVER_ERROR', message: err.message });
  }
});

// PATCH /claims/:id/complete
router.patch('/:id/complete', auth, async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id).populate('listingId');
    if (!claim) return res.status(404).json({ error: 'NOT_FOUND', resource: 'claim' });

    const isClaimant = claim.claimantId.toString() === req.user._id.toString();
    const isRestaurant = claim.listingId.restaurantId.toString() === req.user._id.toString();
    if (!isClaimant && !isRestaurant) return res.status(403).json({ error: 'FORBIDDEN' });

    const now = new Date();
    await Claim.findByIdAndUpdate(req.params.id, { status: 'completed', completedAt: now });
    await Listing.findByIdAndUpdate(claim.listingId._id, { status: 'completed' });

    const qty = claim.listingId.quantity || 0;
    await User.findByIdAndUpdate(claim.claimantId, { $inc: { completedPickups: 1, totalWeightRescued: qty } });
    await User.findByIdAndUpdate(claim.listingId.restaurantId, { $inc: { completedPickups: 1, totalWeightRescued: qty } });

    await createNotification(claim.claimantId, 'pickup_complete', { claimId: claim._id, foodName: claim.listingId.foodName });
    await createNotification(claim.listingId.restaurantId, 'pickup_complete', { claimId: claim._id, foodName: claim.listingId.foodName });

    res.json({ success: true, completedAt: now });
  } catch (err) {
    res.status(500).json({ error: 'SERVER_ERROR', message: err.message });
  }
});

module.exports = router;
