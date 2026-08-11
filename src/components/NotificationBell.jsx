import { useEffect, useRef, useState } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import api from '../api/api';

export default function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef(null);

  function loadUnreadCount() {
    api.get('/notifications/unread-count').then((res) => setUnreadCount(res.data.count)).catch(() => {});
  }

  // Check for new notifications every 30 seconds, so the badge stays
  // current even if the citizen leaves this tab open for a while.
  useEffect(() => {
    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close the dropdown when clicking anywhere outside it
  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function handleToggle() {
    const willOpen = !open;
    setOpen(willOpen);

    if (willOpen) {
      setLoading(true);
      try {
        const res = await api.get('/notifications/mine');
        setNotifications(res.data);
        if (unreadCount > 0) {
          await api.post('/notifications/read-all');
          setUnreadCount(0);
        }
      } catch {
        // Quietly fail - the bell just won't show anything new this time
      } finally {
        setLoading(false);
      }
    }
  }

  function timeAgo(dateStr) {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diffMs / 3600000);
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  }

  return (
    <div ref={wrapperRef} style={{ position: 'relative' }}>
      <button
        onClick={handleToggle}
        style={{ background: 'none', border: 'none', position: 'relative', color: '#c7d3e3', padding: 4, cursor: 'pointer' }}
      >
        <Bell size={19} />
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: -2,
              right: -2,
              background: '#ef4444',
              color: 'white',
              fontSize: 10,
              fontWeight: 700,
              borderRadius: '50%',
              width: 16,
              height: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="card"
          style={{
            position: 'absolute',
            top: 34,
            right: 0,
            width: 320,
            maxHeight: 380,
            overflowY: 'auto',
            zIndex: 200,
            boxShadow: 'var(--shadow-modal)'
          }}
        >
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: 14 }}>
            Notifications
          </div>

          {loading && <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13 }}>Loading...</div>}

          {!loading && notifications.length === 0 && (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13 }}>
              <CheckCheck size={22} style={{ marginBottom: 8, color: 'var(--text-muted)' }} />
              <div>You're all caught up.</div>
            </div>
          )}

          {!loading &&
            notifications.map((n) => (
              <div
                key={n.NotificationID}
                style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid var(--border)',
                  fontSize: 13,
                  color: 'var(--text-primary)',
                  background: n.IsRead ? 'transparent' : 'var(--gold-100)'
                }}
              >
                <div>{n.Message}</div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>{timeAgo(n.CreatedAt)}</div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
