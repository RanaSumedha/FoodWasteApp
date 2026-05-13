const cron = require('node-cron');
const Listing = require('../models/Listing');
const { createNotification, findEligibleRecipients } = require('../services/notifier');

function startExpiryJob() {
  // Every minute: expire listings
  cron.schedule('* * * * *', async () => {
    try {
      const expired = await Listing.find({ status: 'available', expiryAt: { $lte: new Date() } });
      for (const listing of expired) {
        try {
          await Listing.findByIdAndUpdate(listing._id, { status: 'expired' });
          await createNotification(listing.restaurantId, 'expiry_reminder', {
            listingId: listing._id, foodName: listing.foodName, message: 'Your listing has expired'
          });
        } catch (e) {
          console.error(`Expiry job error for listing ${listing._id}:`, e.message);
        }
      }
    } catch (err) {
      console.error('Expiry job error:', err.message);
    }
  });

  // Every minute: send reminders for listings expiring within 2 hours
  cron.schedule('* * * * *', async () => {
    try {
      const soon = new Date(Date.now() + 2 * 3600 * 1000);
      const listings = await Listing.find({
        status: 'available',
        expiryAt: { $gt: new Date(), $lte: soon }
      });
      for (const listing of listings) {
        try {
          const recipients = await findEligibleRecipients(listing);
          for (const user of recipients) {
            await createNotification(user._id, 'expiry_reminder', {
              listingId: listing._id, foodName: listing.foodName,
              message: 'Food listing expiring soon — claim it now!'
            });
          }
        } catch (e) {
          console.error(`Reminder job error for listing ${listing._id}:`, e.message);
        }
      }
    } catch (err) {
      console.error('Reminder job error:', err.message);
    }
  });

  console.log('Expiry cron jobs started');
}

module.exports = { startExpiryJob };
