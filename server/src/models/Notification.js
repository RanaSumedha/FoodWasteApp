const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['new_listing', 'claim_confirmed', 'expiry_reminder', 'pickup_complete', 'claim_cancelled'],
    required: true
  },
  payload: { type: mongoose.Schema.Types.Mixed, default: {} },
  read: { type: Boolean, default: false }
}, { timestamps: true });

notificationSchema.index({ recipientId: 1, read: 1 });
notificationSchema.index({ createdAt: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
