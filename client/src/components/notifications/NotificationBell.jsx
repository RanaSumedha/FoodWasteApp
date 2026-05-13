import { useState } from 'react';
import useNotifications from '../../hooks/useNotifications';
import NotificationItem from './NotificationItem';

export default function NotificationBell() {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);

  return (
    <div className="notif-bell-wrapper">
      <button className="notif-bell" onClick={() => setOpen(o => !o)}>
        🔔
        {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
      </button>
      {open && (
        <div className="notif-dropdown">
          <div className="notif-header">
            <span>Notifications</span>
            {unreadCount > 0 && <button className="btn-link" onClick={markAllRead}>Mark all read</button>}
          </div>
          <div className="notif-list">
            {notifications.length === 0 && <p className="notif-empty">No notifications</p>}
            {notifications.map(n => <NotificationItem key={n._id} notification={n} onRead={markRead} />)}
          </div>
        </div>
      )}
    </div>
  );
}
