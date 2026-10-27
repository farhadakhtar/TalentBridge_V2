import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { api } from '../services/api';
import './CompanyDashboard.css';

export default function CompanyDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const result = await api.getCommandCenter();
      setData(result);
      setLoading(false);
    } catch (err) {
      console.error('Command center load error:', err);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="company-dashboard">
        <Navbar />
        <div className="loading-container">Loading Command Center...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="company-dashboard">
        <Navbar />
        <div className="error-container">Failed to load data. Please check MongoDB connection.</div>
      </div>
    );
  }

  return (
    <div className="company-dashboard">
      <Navbar />

      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1>Company Command Center</h1>
          <div className="tab-nav">
            <button
              className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button
              className={`tab-btn ${activeTab === 'pipeline' ? 'active' : ''}`}
              onClick={() => setActiveTab('pipeline')}
            >
              Pipeline
            </button>
            <button
              className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => setActiveTab('security')}
            >
              Security
            </button>
            <button
              className={`tab-btn ${activeTab === 'engineering' ? 'active' : ''}`}
              onClick={() => setActiveTab('engineering')}
            >
              Engineering
            </button>
          </div>
        </div>

        {activeTab === 'overview' && (
          <div className="overview-section">
            {/* Funnel */}
            <div className="funnel-card">
              <h2>Hiring Funnel</h2>
              <div className="funnel-chart">
                <div className="funnel-stage" style={{ width: '100%' }}>
                  <div className="funnel-bar applied">
                    <span className="funnel-label">Applied</span>
                    <span className="funnel-count">{data.funnel.applied}</span>
                  </div>
                </div>
                <div className="funnel-stage" style={{ width: `${(data.funnel.interview / data.funnel.total) * 100}%` }}>
                  <div className="funnel-bar interview">
                    <span className="funnel-label">Interview</span>
                    <span className="funnel-count">{data.funnel.interview}</span>
                  </div>
                </div>
                <div className="funnel-stage" style={{ width: `${(data.funnel.offer / data.funnel.total) * 100}%` }}>
                  <div className="funnel-bar offer">
                    <span className="funnel-label">Offer</span>
                    <span className="funnel-count">{data.funnel.offer}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="kpi-grid">
              <div className="kpi-card">
                <div className="kpi-icon">👥</div>
                <div className="kpi-content">
                  <div className="kpi-value">{data.ceo.totalApplicants}</div>
                  <div className="kpi-label">Total Applicants</div>
                </div>
              </div>
              <div className="kpi-card">
                <div className="kpi-icon">📅</div>
                <div className="kpi-content">
                  <div className="kpi-value">{data.ceo.eventsScheduled}</div>
                  <div className="kpi-label">Events Scheduled</div>
                </div>
              </div>
              <div className="kpi-card">
                <div className="kpi-icon">💬</div>
                <div className="kpi-content">
                  <div className="kpi-value">{data.ceo.totalMessages}</div>
                  <div className="kpi-label">Messages Exchanged</div>
                </div>
              </div>
              <div className="kpi-card">
                <div className="kpi-icon">⭐</div>
                <div className="kpi-content">
                  <div className="kpi-value">{data.ceo.mostActiveRecruiter}</div>
                  <div className="kpi-label">Top Recruiter</div>
                </div>
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="events-card">
              <h2>Upcoming Meetings</h2>
              {data.upcomingEvents.length === 0 ? (
                <div className="empty-state">No upcoming events</div>
              ) : (
                <div className="events-list">
                  {data.upcomingEvents.map(event => (
                    <div key={event._id} className="event-row">
                      <div className="event-date">
                        <div className="date-day">{new Date(event.date).getDate()}</div>
                        <div className="date-month">{new Date(event.date).toLocaleString('default', { month: 'short' })}</div>
                      </div>
                      <div className="event-info">
                        <div className="event-title">{event.title}</div>
                        <div className="event-meta">
                          {event.time} • {event.targetUser?.name} • {event.createdBy?.name}
                        </div>
                      </div>
                      <span className={`event-type type-${event.type.toLowerCase()}`}>{event.type}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recruiter Stats */}
            <div className="recruiters-card">
              <h2>Recruiter Activity</h2>
              <div className="recruiters-list">
                {data.recruiterStats.map(rec => (
                  <div key={rec.recruiterId} className="recruiter-row">
                    <div className="recruiter-avatar">{rec.name.charAt(0)}</div>
                    <div className="recruiter-info">
                      <div className="recruiter-name">{rec.name}</div>
                      <div className="recruiter-email">{rec.email}</div>
                    </div>
                    <div className="recruiter-stats">
                      <div className="stat">
                        <span className="stat-value">{rec.messagesSent}</span>
                        <span className="stat-label">Messages</span>
                      </div>
                      <div className="stat">
                        <span className="stat-value">{rec.conversations}</span>
                        <span className="stat-label">Threads</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'pipeline' && (
          <div className="pipeline-section">
            <h2>Candidate Pipeline</h2>
            <div className="pipeline-table">
              <div className="pipeline-header">
                <div>Name</div>
                <div>Title</div>
                <div>Status</div>
                <div>Upcoming Event</div>
                <div>Unread DMs</div>
              </div>
              {data.pipeline.map(candidate => (
                <div key={candidate._id} className="pipeline-row">
                  <div className="candidate-name">
                    <span className="avatar-small">{candidate.name.charAt(0)}</span>
                    {candidate.name}
                  </div>
                  <div>{candidate.title}</div>
                  <div>
                    <span className={`status-badge status-${candidate.status.toLowerCase()}`}>
                      {candidate.status}
                    </span>
                  </div>
                  <div>{candidate.upcomingEvent}</div>
                  <div>{candidate.unreadDMs}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="security-section">
            <h2>Cyber Security Dashboard</h2>

            <div className="security-grid">
              <div className="audit-log-card">
                <h3>Authentication Audit Log</h3>
                <div className="audit-list">
                  {data.cyberSecurity.auditLogs.map((log, i) => (
                    <div key={i} className="audit-row">
                      <div className="audit-time">
                        {new Date(log.createdAt).toLocaleString()}
                      </div>
                      <div className="audit-user">{log.userId?.name || 'System'}</div>
                      <div className="audit-action">{log.action}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="checklist-card">
                <h3>Security Checklist</h3>
                <div className="checklist">
                  {data.cyberSecurity.checklist.map((item, i) => (
                    <div key={i} className="checklist-item">
                      <span className="check-icon">✓</span>
                      <div className="check-content">
                        <div className="check-task">{item.task}</div>
                        <div className={`check-status status-${item.status.toLowerCase()}`}>
                          {item.status}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'engineering' && (
          <div className="engineering-section">
            <h2>Engineering Dashboard</h2>

            <div className="status-grid">
              <div className="status-card">
                <h3>API Status</h3>
                <div className="status-indicator healthy">
                  <span className="status-dot"></span>
                  {data.engineer.apiStatus}
                </div>
              </div>

              <div className="status-card">
                <h3>MongoDB Connection</h3>
                <div className={`status-indicator ${data.engineer.dbStatus === 'Connected' ? 'healthy' : 'unhealthy'}`}>
                  <span className="status-dot"></span>
                  {data.engineer.dbStatus}
                </div>
              </div>
            </div>

            <div className="collections-card">
              <h3>Collection Counts</h3>
              <div className="collections-grid">
                <div className="collection-item">
                  <span className="collection-count">{data.engineer.collectionCounts.users}</span>
                  <span className="collection-name">Users</span>
                </div>
                <div className="collection-item">
                  <span className="collection-count">{data.engineer.collectionCounts.conversations}</span>
                  <span className="collection-name">Conversations</span>
                </div>
                <div className="collection-item">
                  <span className="collection-count">{data.engineer.collectionCounts.messages}</span>
                  <span className="collection-name">Messages</span>
                </div>
                <div className="collection-item">
                  <span className="collection-count">{data.engineer.collectionCounts.events}</span>
                  <span className="collection-name">Events</span>
                </div>
                <div className="collection-item">
                  <span className="collection-count">{data.engineer.collectionCounts.notifications}</span>
                  <span className="collection-name">Notifications</span>
                </div>
                <div className="collection-item">
                  <span className="collection-count">{data.engineer.collectionCounts.auditLogs}</span>
                  <span className="collection-name">Audit Logs</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
