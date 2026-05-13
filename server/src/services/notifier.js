const User = require('../models/User');
const Notification = require('../models/Notification');

async function createNotification(recipientId, type, payload) {
  return Notification.create({ recipientId, type, payload });
}

async function findEligibleRecipients(listing) {
  return User.find({
    role: { $in: ['ngo', 'volunteer'] },
    isActive: true,
    location: {
      $nearSphere: {
        $geometry: { type: 'Point', coordinates: listing.location.coordinates },
        $maxDistance: 10000 * 10 // default 10km
      }
    }
  });
}

async function notifyNearbyUsers(listing, restaurantName) {
  try {
    const recipients = await findEligibleRecipients(listing);
    const now = new Date();
    const msLeft = listing.expiryAt - now;
    const hoursLeft = Math.max(0, Math.floor(msLeft / 3600000));
    const minsLeft = Math.max(0, Math.floor((msLeft % 3600000) / 60000));
    for (const user of recipients) {
      await createNotification(user._id, 'new_listing', {
        listingId: listing._id,
        foodName: listing.foodName,
        quantity: listing.quantity,
        unit: listing.unit,
        restaurantName,
        timeRemaining: `${hoursLeft}h ${minsLeft}m`
      });
    }
  } catch (err) {
    console.error('notifyNearbyUsers error:', err.message);
  }
}

module.exports = { createNotification, findEligibleRecipients, notifyNearbyUsers };
