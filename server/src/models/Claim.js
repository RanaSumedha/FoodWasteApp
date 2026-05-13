const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema({
  listingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
  claimantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  scheduledPickupTime: { type: Date, required: true },
  status: { type: String, enum: ['active', 'cancelled', 'completed'], default: 'active' },
  completedAt: { type: Date, default: null }
}, { timestamps: true });

claimSchema.index({ listingId: 1 });
claimSchema.index({ claimantId: 1 });

module.exports = mongoose.model('Claim', claimSchema);
