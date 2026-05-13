const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  claimId: { type: mongoose.Schema.Types.ObjectId, ref: 'Claim', required: true },
  raterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rateeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  stars: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, default: '', maxlength: 500 }
}, { timestamps: true });

ratingSchema.index({ claimId: 1, raterId: 1 }, { unique: true });
ratingSchema.index({ rateeId: 1 });

module.exports = mongoose.model('Rating', ratingSchema);
