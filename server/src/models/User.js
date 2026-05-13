const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 8 },
  role: { type: String, enum: ['restaurant', 'ngo', 'volunteer', 'admin'], required: true },
  isActive: { type: Boolean, default: true },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] }
  },
  savedAddress: { type: String, default: '' },
  notificationRadius: { type: Number, default: 10 },
  averageRating: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },
  completedPickups: { type: Number, default: 0 },
  totalListingsCreated: { type: Number, default: 0 },
  totalWeightRescued: { type: Number, default: 0 }
}, { timestamps: true });

userSchema.index({ location: '2dsphere' });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

module.exports = mongoose.model('User', userSchema);
