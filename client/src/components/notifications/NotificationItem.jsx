const ICONS = {
  new_listing: '🍱',
  claim_confirmed: '✅',
  expiry_reminder: '⚡',
  pickup_complete: '🎉',
  claim_cancelled: '❌'
};

export default function NotificationItem({ notification, onRead }) {
  const icon = ICONS[notification.type] || '🔔';
  const msg = notification.payload?.message ||
    (notification.type === 'new_listing' ? `New food available: ${notification.payload?.foodName}` :
     notification.type === 'claim_confirmed' ? `Pickup confirmed for ${notification.payload?.foodName}` :
     notification.type === 'expiry_reminder' ? `${notification.payload?.foodName} expiring soon!` :
     notification.type === 'pickup_complete' ? `Pickup completed: ${notification.payload?.foodName}` :
     notification.type === 'claim_cancelled' ? `Claim cancelled for ${notification.payload?.foodName}` : 'Notification');

  return (
    <div className={`notif-item ${notification.read ? 'read' : 'unread'}`} onClick={() => !notification.read && onRead(notification._id)}>
      <span className="notif-icon">{icon}</span>
      <div className="notif-content">
        <p>{msg}</p>
        <small>{new Date(notification.createdAt).toLocaleString()}</small>
      </div>
      {!notification.read && <span className="notif-dot" />}
    </div>
  );
}
