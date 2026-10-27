import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import './JobSeekerDashboard.css';

export default function JobSeekerDashboard() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    loadEvents();
    loadConversations();
    const interval = setInterval(() => {
      loadEvents();
      loadConversations();
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation._id);
    }
  }, [selectedConversation]);

  const loadEvents = async () => {
    try {
      const data = await api.getEvents();
      setEvents(data);
    } catch (err) {
      console.error('Failed to load events:', err);
    }
  };

  const loadConversations = async () => {
    try {
      const data = await api.getConversations();
      setConversations(data);
    } catch (err) {
      console.error('Failed to load conversations:', err);
    }
  };

  const loadMessages = async (convId) => {
    try {
      const data = await api.getMessages(convId);
      setMessages(data);
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      await api.sendMessage(selectedConversation._id, newMessage);
      setNewMessage('');
      loadMessages(selectedConversation._id);
      loadConversations();
    } catch (err) {
      console.error('Send message error:', err);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    return { daysInMonth, startingDay };
  };

  const renderCalendar = () => {
    const { daysInMonth, startingDay } = getDaysInMonth(currentMonth);
    const days = [];
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];

    // Empty cells before first day
    for (let i = 0; i < startingDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    // Days of month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayEvents = events.filter(e => e.date === dateStr);

      days.push(
        <div key={day} className={`calendar-day ${dayEvents.length > 0 ? 'has-events' : ''}`}>
          <div className="day-number">{day}</div>
          <div className="day-events">
            {dayEvents.map(event => (
              <div
                key={event._id}
                className={`event-badge event-${event.type.toLowerCase()}`}
                onClick={() => setSelectedEvent(event)}
              >
                {event.title}
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="calendar-container">
        <div className="calendar-header">
          <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}>
            ←
          </button>
          <h2>{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</h2>
          <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}>
            →
          </button>
        </div>
        <div className="calendar-weekdays">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="weekday">{d}</div>
          ))}
        </div>
        <div className="calendar-grid">{days}</div>
      </div>
    );
  };

  return (
    <div className="seeker-dashboard">
      <Navbar />

      <div className="dashboard-content">
        {/* Profile Card */}
        <div className="profile-card">
          <div className="profile-avatar">{user?.name?.charAt(0) || 'U'}</div>
          <h2>{user?.name}</h2>
          <p className="profile-title">{user?.title}</p>
          <div className="profile-status">
            <span className={`status-badge status-${user?.status?.toLowerCase()}`}>
              {user?.status}
            </span>
          </div>
          <div className="profile-skills">
            {user?.skills?.map((skill, i) => (
              <span key={i} className="skill-tag">{skill}</span>
            ))}
          </div>
        </div>

        {/* Calendar */}
        <div className="calendar-section">
          <h3>My Calendar</h3>
          {renderCalendar()}
        </div>

        {/* Messages */}
        <div className="messages-section">
          <h3>Messages</h3>
          <div className="messages-container">
            <div className="conversations-list">
              {conversations.length === 0 ? (
                <div className="empty-state">No conversations yet</div>
              ) : (
                conversations.map(conv => (
                  <div
                    key={conv._id}
                    className={`conversation-item ${selectedConversation?._id === conv._id ? 'active' : ''}`}
                    onClick={() => setSelectedConversation(conv)}
                  >
                    <div className="conv-avatar">{conv.otherUser?.name?.charAt(0)}</div>
                    <div className="conv-details">
                      <div className="conv-name">{conv.otherUser?.name}</div>
                      <div className="conv-preview">{conv.lastMessage}</div>
                    </div>
                    {conv.unreadCount > 0 && (
                      <span className="unread-badge">{conv.unreadCount}</span>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="chat-area">
              {selectedConversation ? (
                <>
                  <div className="chat-header">
                    <strong>{selectedConversation.otherUser?.name}</strong>
                    <span>{selectedConversation.otherUser?.title}</span>
                  </div>
                  <div className="chat-messages">
                    {messages.map(msg => (
                      <div
                        key={msg._id}
                        className={`message ${msg.senderId?._id === user?.id ? 'sent' : 'received'}`}
                      >
                        <div className="message-sender">{msg.senderId?.name}</div>
                        <div className="message-text">{msg.text}</div>
                        <div className="message-time">
                          {new Date(msg.createdAt).toLocaleTimeString()}
                        </div>
                      </div>
                    ))}
                  </div>
                  <form onSubmit={handleSendMessage} className="chat-input">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                    />
                    <button type="submit">Send</button>
                  </form>
                </>
              ) : (
                <div className="empty-state">Select a conversation</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="modal-overlay" onClick={() => setSelectedEvent(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedEvent(null)}>×</button>
            <h2>{selectedEvent.title}</h2>
            <div className="event-detail">
              <p><strong>Date:</strong> {selectedEvent.date}</p>
              <p><strong>Time:</strong> {selectedEvent.time}</p>
              <p><strong>Type:</strong> {selectedEvent.type}</p>
              <p><strong>Created by:</strong> {selectedEvent.createdBy?.name}</p>
              {selectedEvent.notes && <p><strong>Notes:</strong> {selectedEvent.notes}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
