const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  foodName: { type: String, required: true, trim: true },
  quantity: { type: Number, required: true, min: 0.01 },
  unit: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  photoUrls: [{ type: String }],
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true }
  },
  pickupWindowStart: { type: Date, required: true },
  expiryAt: { type: Date, required: true },
  status: { type: String, enum: ['available', 'claimed', 'expired', 'completed'], default: 'available' },
  claimId: { type: mongoose.Schema.Types.ObjectId, ref: 'Claim', default: null }
}, { timestamps: true });

listingSchema.index({ location: '2dsphere' });
listingSchema.index({ status: 1 });
listingSchema.index({ expiryAt: 1 });
listingSchema.index({ restaurantId: 1 });

module.exports = mongoose.model('Listing', listingSchema);
