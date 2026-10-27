const API_BASE = 'http://localhost:5000/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const api = {
  // Auth
  login: async (email, password) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Login failed');
    return res.json();
  },

  getMe: async () => {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeader()
    });
    if (!res.ok) throw new Error('Auth failed');
    return res.json();
  },

  // Users
  getUsers: async (role = '') => {
    const url = role ? `${API_BASE}/users?role=${role}` : `${API_BASE}/users`;
    const res = await fetch(url, { headers: getAuthHeader() });
    if (!res.ok) throw new Error('Failed to fetch users');
    return res.json();
  },

  // Events
  getEvents: async () => {
    const res = await fetch(`${API_BASE}/events`, { headers: getAuthHeader() });
    if (!res.ok) throw new Error('Failed to fetch events');
    return res.json();
  },

  createEvent: async (eventData) => {
    const res = await fetch(`${API_BASE}/events`, {
      method: 'POST',
      headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData)
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Event creation failed');
    return res.json();
  },

  // Conversations & Messages
  getConversations: async () => {
    const res = await fetch(`${API_BASE}/conversations`, { headers: getAuthHeader() });
    if (!res.ok) throw new Error('Failed to fetch conversations');
    return res.json();
  },

  initConversation: async (targetUserId) => {
    const res = await fetch(`${API_BASE}/conversations/init`, {
      method: 'POST',
      headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetUserId })
    });
    if (!res.ok) throw new Error('Conversation init failed');
    return res.json();
  },

  getMessages: async (conversationId) => {
    const res = await fetch(`${API_BASE}/conversations/${conversationId}/messages`, {
      headers: getAuthHeader()
    });
    if (!res.ok) throw new Error('Failed to fetch messages');
    return res.json();
  },

  sendMessage: async (conversationId, text) => {
    const res = await fetch(`${API_BASE}/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    if (!res.ok) throw new Error('Message send failed');
    return res.json();
  },

  // Notifications
  getNotifications: async () => {
    const res = await fetch(`${API_BASE}/notifications`, { headers: getAuthHeader() });
    if (!res.ok) throw new Error('Failed to fetch notifications');
    return res.json();
  },

  markNotificationRead: async (notificationId) => {
    const res = await fetch(`${API_BASE}/notifications/${notificationId}/read`, {
      method: 'PATCH',
      headers: getAuthHeader()
    });
    if (!res.ok) throw new Error('Failed to mark notification read');
    return res.json();
  },

  // Company Command Center
  getCommandCenter: async () => {
    const res = await fetch(`${API_BASE}/company/command-center`, {
      headers: getAuthHeader()
    });
    if (!res.ok) throw new Error('Failed to fetch command center data');
    return res.json();
  }
};
