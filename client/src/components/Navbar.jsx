import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState({ notifications: [], unreadCount: 0 });
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (!user || user.role === 'company') return;

    const fetchNotifications = async () => {
      try {
        const data = await api.getNotifications();
        setNotifications(data);
      } catch (err) {
        console.error('Notification fetch error:', err);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 4000);
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNotificationClick = async (notif) => {
    await api.markNotificationRead(notif._id);
    setShowDropdown(false);

    if (notif.type === 'dm') {
      // Navigate to messages - conversation ID is in refId
      navigate(window.location.pathname, { state: { openConversation: notif.refId } });
    } else if (notif.type === 'event') {
      // Already on calendar view, just refresh
      window.location.reload();
    }
  };

  const getRoleColor = () => {
    if (!user) return 'var(--gray-600)';
    switch (user.role) {
      case 'job_seeker': return 'var(--blue-600)';
      case 'recruiter': return 'var(--emerald-600)';
      case 'company': return 'var(--indigo-600)';
      default: return 'var(--gray-600)';
    }
  };

  const getRoleBadgeClass = () => {
    if (!user) return '';
    switch (user.role) {
      case 'job_seeker': return 'role-badge-seeker';
      case 'recruiter': return 'role-badge-recruiter';
      case 'company': return 'role-badge-company';
      default: return '';
    }
  };

  return (
    <nav className="navbar" style={{ '--role-color': getRoleColor() }}>
      <div className="navbar-left">
        <div className="navbar-logo">TB</div>
        <span className="navbar-title">TalentBridge V2</span>
        {user && (
          <span className={`role-badge ${getRoleBadgeClass()}`}>
            {user.role === 'job_seeker' ? 'Job Seeker' : user.role === 'recruiter' ? 'Recruiter' : 'Company'}
          </span>
        )}
      </div>

      <div className="navbar-right">
        {user && user.role !== 'company' && (
          <div className="notification-wrapper">
            <button
              className="notification-btn"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              🔔
              {notifications.unreadCount > 0 && (
                <span className="notification-badge">{notifications.unreadCount}</span>
              )}
            </button>

            {showDropdown && (
              <div className="notification-dropdown">
                <div className="notification-tabs">
                  <div className="notification-tab active">
                    Messages ({notifications.notifications.filter(n => n.type === 'dm').length})
                  </div>
                  <div className="notification-tab active">
                    Calendar ({notifications.notifications.filter(n => n.type === 'event').length})
                  </div>
                </div>
                <div className="notification-list">
                  {notifications.notifications.length === 0 ? (
                    <div className="notification-empty">No new notifications</div>
                  ) : (
                    notifications.notifications.map((notif) => (
                      <div
                        key={notif._id}
                        className={`notification-item ${notif.read ? 'read' : 'unread'}`}
                        onClick={() => handleNotificationClick(notif)}
                      >
                        <span className="notification-icon">
                          {notif.type === 'dm' ? '✉️' : '📅'}
                        </span>
                        <div className="notification-content">
                          <div className="notification-message">{notif.message}</div>
                          <div className="notification-time">
                            {new Date(notif.createdAt).toLocaleString()}
                          </div>
                        </div>
                        {!notif.read && <span className="unread-dot" />}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {user && (
          <div className="user-chip">
            <div className="user-avatar">{user.name.charAt(0)}</div>
            <span className="user-name">{user.name}</span>
          </div>
        )}

        {user && (
          <button onClick={handleLogout} className="btn-logout">
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}
