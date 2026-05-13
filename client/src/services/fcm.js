/**
 * Firebase Cloud Messaging client service.
 * Registers FCM token, stores it via PATCH /users/:id, handles foreground messages.
 * Implementation will be completed in Task 9.
 */

/**
 * Register FCM token and store it on the user document.
 * @param {string} userId - The authenticated user's ID
 * @returns {Promise<string|null>} The FCM token, or null if push is not supported
 */
export async function registerFCMToken(userId) {
  // FCM token registration will be implemented in Task 9
  return null;
}

/**
 * Set up a foreground message handler.
 * @param {Function} onMessage - Callback invoked with the message payload
 * @returns {Function} Unsubscribe function
 */
export function onForegroundMessage(onMessage) {
  // Foreground message handler will be implemented in Task 9
  return () => {};
}
