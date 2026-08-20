import { useEffect, useRef, useState } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';

const MOBILE_BREAKPOINT = 640;

export default function NotificationBell() {
  const { user } = useAuth();

  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth <= MOBILE_BREAKPOINT : false
  );
  const wrapperRef = useRef(null);


  async function loadUnreadCount() {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    try {
      const res = await api.get('/notifications/unread-count');

      setUnreadCount(res.data?.count ?? 0);
    } catch (error) {
      console.error(
        'Failed to load notification count:',
        error.response?.data || error.message
      );

      setUnreadCount(0);
    }
  }

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      setNotifications([]);
      setOpen(false);
      return;
    }

    loadUnreadCount();

    const interval = setInterval(() => {
      loadUnreadCount();
    }, 30000);

    return () => {
      clearInterval(interval);
    };
  }, [user]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  async function handleToggle() {
    if (!user) {
      setOpen(false);
      return;
    }

    const willOpen = !open;

    setOpen(willOpen);

    if (!willOpen) {
      return;
    }

    setLoading(true);

    try {
      const res = await api.get('/notifications/mine');

      setNotifications(Array.isArray(res.data) ? res.data : []);

      if (unreadCount > 0) {
        await api.post('/notifications/read-all');

        setUnreadCount(0);

        setNotifications((current) =>
          current.map((notification) => ({
            ...notification,
            IsRead: true
          }))
        );
      }
    } catch (error) {
      console.error(
        'Failed to load notifications:',
        error.response?.data || error.message
      );

      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }

  function timeAgo(dateStr) {
    if (!dateStr) {
      return '';
    }

    const date = new Date(dateStr);

    if (Number.isNaN(date.getTime())) {
      return '';
    }

    const diffMs = Date.now() - date.getTime();

    const hours = Math.floor(diffMs / 3600000);

    if (hours < 1) {
      return 'Just now';
    }

    if (hours < 24) {
      return `${hours}h ago`;
    }

    return `${Math.floor(hours / 24)}d ago`;
  }

  return (
    <div
      ref={wrapperRef}
      style={{
        position: 'relative'
      }}
    >
      <button
        type="button"
        onClick={handleToggle}
        disabled={!user}
        aria-label="Notifications"
        style={{
          background: 'none',
          border: 'none',
          position: 'relative',
          color: '#c7d3e3',
          padding: 4,
          cursor: user ? 'pointer' : 'default',
          opacity: user ? 1 : 0.6
        }}
      >
        <Bell size={19} />

        {user && unreadCount > 0 && (
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

      {open && user && (
        <div
          className="card"
          style={{
            position: isMobile ? 'fixed' : 'absolute',
            top: isMobile ? 60 : 34,
            right: isMobile ? 12 : 0,
            left: isMobile ? 12 : 'auto',
            width: isMobile ? 'auto' : 320,
            maxWidth: isMobile ? 'none' : 320,
            maxHeight: isMobile ? 'calc(100vh - 90px)' : 380,
            overflowY: 'auto',
            zIndex: 1500,
            boxShadow: 'var(--shadow-modal)'
          }}
        >
          <div
            style={{
              padding: '12px 16px',
              borderBottom: '1px solid var(--border)',
              fontWeight: 700,
              fontSize: 14
            }}
          >
            Notifications
          </div>

          {loading && (
            <div
              style={{
                padding: 20,
                textAlign: 'center',
                color: 'var(--text-secondary)',
                fontSize: 13
              }}
            >
              Loading...
            </div>
          )}

          {!loading && notifications.length === 0 && (
            <div
              style={{
                padding: 24,
                textAlign: 'center',
                color: 'var(--text-secondary)',
                fontSize: 13
              }}
            >
              <CheckCheck
                size={22}
                style={{
                  marginBottom: 8,
                  color: 'var(--text-muted)'
                }}
              />

              <div>You're all caught up.</div>
            </div>
          )}

          {!loading &&
            notifications.map((notification) => (
              <div
                key={notification.NotificationID}
                style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid var(--border)',
                  fontSize: 13,
                  color: 'var(--text-primary)',
                  background: notification.IsRead
                    ? 'transparent'
                    : 'var(--gold-100)',
                  wordBreak: 'break-word'
                }}
              >
                <div>{notification.Message}</div>

                <div
                  style={{
                    fontSize: 11,
                    color: 'var(--text-secondary)',
                    marginTop: 4
                  }}
                >
                  {timeAgo(notification.CreatedAt)}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}