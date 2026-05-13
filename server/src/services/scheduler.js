function validatePickupTime(scheduledTime, listing) {
  const t = new Date(scheduledTime);
  if (isNaN(t.getTime())) return 'Invalid pickup time';
  if (t < new Date(listing.pickupWindowStart)) {
    return 'Pickup time is before the pickup window start';
  }
  if (t >= new Date(listing.expiryAt)) {
    return 'Pickup time must be before the listing expiry';
  }
  return null;
}

module.exports = { validatePickupTime };
