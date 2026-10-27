import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import './RecruiterDashboard.css';

export default function RecruiterDashboard() {
  const { user } = useAuth();
  const [applicants, setApplicants] = useState([]);
  const [events, setEvents] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showEventModal, setShowEventModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [eventForm, setEventForm] = useState({
    title: '',
    date: '',
    time: '',
    type: 'Interview',
    notes: '',
    targetUser: ''
  });

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation._id);
    }
  }, [selectedConversation]);

  const loadData = async () => {
    try {
      const [usersData, eventsData, convData] = await Promise.all([
        api.getUsers('job_seeker'),
        api.getEvents(),
        api.getConversations()
      ]);
      setApplicants(usersData);
      setEvents(eventsData);
      setConversations(convData);
    } catch (err) {
      console.error('Data load error:', err);
    }
  };

  const loadMessages = async (convId) => {
    try {
      const data = await api.getMessages(convId);
      setMessages(data);
    } catch (err) {
      console.error('Messages load error:', err);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      await api.createEvent(eventForm);
      setShowEventModal(false);
      setEventForm({ title: '', date: '', time: '', type: 'Interview', notes: '', targetUser: '' });
      loadData();
    } catch (err) {
      alert('Failed to create event: ' + err.message);
    }
  };

  const handleStartMessage = async (applicant) => {
    try {
      const conv = await api.initConversation(applicant._id);
      setShowMessageModal(null);
      loadData();
      // Find and select the conversation
      setTimeout(() => {
        const newConv = conversations.find(c => c._id === conv._id);
        if (newConv) setSelectedConversation(newConv);
      }, 500);
    } catch (err) {
      console.error('Init conversation error:', err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      await api.sendMessage(selectedConversation._id, newMessage);
      setNewMessage('');
      loadMessages(selectedConversation._id);
    } catch (err) {
      console.error('Send error:', err);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    return { daysInMonth: lastDay.getDate(), startingDay: firstDay.getDay() };
  };

  const renderCalendar = () => {
    const { daysInMonth, startingDay } = getDaysInMonth(currentMonth);
    const days = [];
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];

    for (let i = 0; i < startingDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayEvents = events.filter(e => e.date === dateStr);

      days.push(
        <div key={day} className={`calendar-day ${dayEvents.length > 0 ? 'has-events' : ''}`}>
          <div className="day-number">{day}</div>
          <div className="day-events">
            {dayEvents.map(event => (
              <div key={event._id} className={`event-badge event-${event.type.toLowerCase()}`}>
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
          <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}>←</button>
          <h2>{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</h2>
          <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}>→</button>
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
    <div className="recruiter-dashboard">
      <Navbar />

      <div className="dashboard-content">
        {/* Applicants Board */}
        <div className="applicants-section">
          <h3>Applicants</h3>
          <div className="applicants-grid">
            {applicants.map(applicant => (
              <div key={applicant._id} className="applicant-card">
                <div className="applicant-avatar">{applicant.name.charAt(0)}</div>
                <h4>{applicant.name}</h4>
                <p className="applicant-title">{applicant.title}</p>
                <span className={`status-badge status-${applicant.status?.toLowerCase()}`}>
                  {applicant.status}
                </span>
                <div className="applicant-actions">
                  <button onClick={() => handleStartMessage(applicant)} className="btn-message">
                    Message
                  </button>
                  <button onClick={() => {
                    setEventForm({ ...eventForm, targetUser: applicant._id });
                    setShowEventModal(true);
                  }} className="btn-schedule">
                    Schedule
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Calendar */}
        <div className="calendar-section">
          <div className="section-header">
            <h3>My Calendar</h3>
            <button onClick={() => setShowEventModal(true)} className="btn-create">
              + Create Event
            </button>
          </div>
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
                    {conv.unreadCount > 0 && <span className="unread-badge">{conv.unreadCount}</span>}
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
                      <div key={msg._id} className={`message ${msg.senderId?._id === user?.id ? 'sent' : 'received'}`}>
                        <div className="message-sender">{msg.senderId?.name}</div>
                        <div className="message-text">{msg.text}</div>
                        <div className="message-time">{new Date(msg.createdAt).toLocaleTimeString()}</div>
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

      {/* Create Event Modal */}
      {showEventModal && (
        <div className="modal-overlay" onClick={() => setShowEventModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowEventModal(false)}>×</button>
            <h2>Create Event</h2>
            <form onSubmit={handleCreateEvent} className="event-form">
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={eventForm.title}
                  onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Date</label>
                  <input
                    type="date"
                    value={eventForm.date}
                    onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Time</label>
                  <input
                    type="time"
                    value={eventForm.time}
                    onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Type</label>
                <select
                  value={eventForm.type}
                  onChange={(e) => setEventForm({ ...eventForm, type: e.target.value })}
                >
                  <option value="Interview">Interview</option>
                  <option value="Meeting">Meeting</option>
                  <option value="Call">Call</option>
                </select>
              </div>
              <div className="form-group">
                <label>Target Seeker</label>
                <select
                  value={eventForm.targetUser}
                  onChange={(e) => setEventForm({ ...eventForm, targetUser: e.target.value })}
                  required
                >
                  <option value="">Select a job seeker</option>
                  {applicants.map(a => (
                    <option key={a._id} value={a._id}>{a.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea
                  value={eventForm.notes}
                  onChange={(e) => setEventForm({ ...eventForm, notes: e.target.value })}
                  rows="3"
                />
              </div>
              <button type="submit" className="btn-submit">Create Event</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
