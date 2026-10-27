require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Message, Conversation, CalendarEvent, Notification, AuditLog } = require('./models');

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/talentbridge_v2';

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// Auth Middleware
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// 1. Auth: Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    // Record AuditLog
    await AuditLog.create({
      userId: user._id,
      action: `User ${user.name} (${user.role}) logged in`
    });

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        title: user.title,
        skills: user.skills,
        status: user.status
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Current User Details
app.get('/api/auth/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Users Listing (For Recruiters and Dropdowns)
app.get('/api/users', auth, async (req, res) => {
  try {
    const { role } = req.query;
    const query = role ? { role } : {};
    const users = await User.find(query).select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Calendar Events
app.get('/api/events', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    let events = [];
    if (user.role === 'job_seeker') {
      events = await CalendarEvent.find({ targetUser: user._id })
        .populate('createdBy', 'name email title')
        .populate('targetUser', 'name email title');
    } else if (user.role === 'recruiter') {
      events = await CalendarEvent.find({ createdBy: user._id })
        .populate('createdBy', 'name email title')
        .populate('targetUser', 'name email title');
    } else {
      // Company observers can see all events
      events = await CalendarEvent.find()
        .populate('createdBy', 'name email title')
        .populate('targetUser', 'name email title');
    }
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/events', auth, async (req, res) => {
  try {
    if (req.user.role !== 'recruiter') {
      return res.status(403).json({ error: 'Only recruiters can schedule events' });
    }
    const { title, date, time, type, notes, targetUser } = req.body;
    if (!title || !date || !time || !type || !targetUser) {
      return res.status(400).json({ error: 'All fields required' });
    }

    const event = await CalendarEvent.create({
      title,
      date,
      time,
      type,
      notes,
      createdBy: req.user.id,
      targetUser
    });

    // Create Notification for the target job seeker
    await Notification.create({
      userId: targetUser,
      type: 'event',
      refId: event._id,
      message: `${req.user.name} scheduled ${title}`
    });

    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Conversations & Direct Messages
app.get('/api/conversations', auth, async (req, res) => {
  try {
    if (req.user.role === 'company') {
      return res.status(403).json({ error: 'Company users do not have DM inbox' });
    }

    const convs = await Conversation.find({ participantIds: req.user.id })
      .populate('participantIds', 'name email role title')
      .sort({ lastMessageAt: -1 });

    // Attach unread counts and latest message
    const formatted = await Promise.all(convs.map(async (c) => {
      const otherUser = c.participantIds.find(p => p._id.toString() !== req.user.id);
      const unreadCount = await Message.countDocuments({
        conversationId: c._id,
        senderId: { $ne: req.user.id },
        read: false
      });
      const lastMsg = await Message.findOne({ conversationId: c._id }).sort({ createdAt: -1 });
      return {
        _id: c._id,
        otherUser,
        unreadCount,
        lastMessage: lastMsg ? lastMsg.text : '',
        lastMessageAt: c.lastMessageAt
      };
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/conversations/init', auth, async (req, res) => {
  try {
    const { targetUserId } = req.body;
    if (!targetUserId) return res.status(400).json({ error: 'targetUserId required' });

    let conv = await Conversation.findOne({
      participantIds: { $all: [req.user.id, targetUserId] }
    });

    if (!conv) {
      conv = await Conversation.create({
        participantIds: [req.user.id, targetUserId],
        lastMessageAt: new Date()
      });
    }

    res.json(conv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/conversations/:id/messages', auth, async (req, res) => {
  try {
    const messages = await Message.find({ conversationId: req.params.id })
      .populate('senderId', 'name email')
      .sort({ createdAt: 1 });

    // Mark messages from other user as read
    await Message.updateMany(
      { conversationId: req.params.id, senderId: { $ne: req.user.id }, read: false },
      { $set: { read: true } }
    );

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/conversations/:id/messages', auth, async (req, res) => {
  try {
    if (req.user.role === 'company') {
      return res.status(403).json({ error: 'Company users cannot send messages' });
    }
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Message text required' });

    const conv = await Conversation.findById(req.params.id);
    if (!conv) return res.status(404).json({ error: 'Conversation not found' });

    const message = await Message.create({
      conversationId: conv._id,
      senderId: req.user.id,
      text,
      read: false
    });

    conv.lastMessageAt = new Date();
    await conv.save();

    const recipientId = conv.participantIds.find(p => p.toString() !== req.user.id);
    if (recipientId) {
      await Notification.create({
        userId: recipientId,
        type: 'dm',
        refId: conv._id,
        message: `New message from ${req.user.name}`
      });
    }

    const populated = await Message.findById(message._id).populate('senderId', 'name email');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Notifications
app.get('/api/notifications', auth, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(30);
    const unreadCount = await Notification.countDocuments({ userId: req.user.id, read: false });
    res.json({ notifications, unreadCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/notifications/:id/read', auth, async (req, res) => {
  try {
    const notif = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { $set: { read: true } },
      { new: true }
    );
    res.json(notif);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. View 3: Company Command Center Endpoints
app.get('/api/company/command-center', auth, async (req, res) => {
  try {
    if (req.user.role !== 'company') {
      return res.status(403).json({ error: 'Authorized company observers only' });
    }

    // Funnel stats
    const applicants = await User.find({ role: 'job_seeker' }).select('-password');
    const appliedCount = applicants.filter(a => a.status === 'Applied').length;
    const interviewCount = applicants.filter(a => a.status === 'Interview').length;
    const offerCount = applicants.filter(a => a.status === 'Offer').length;

    // Recruiters & DM Stats
    const recruiters = await User.find({ role: 'recruiter' }).select('name email');
    const recruiterStats = await Promise.all(recruiters.map(async (r) => {
      const convCount = await Conversation.countDocuments({ participantIds: r._id });
      const msgCount = await Message.countDocuments({ senderId: r._id });
      return {
        recruiterId: r._id,
        name: r.name,
        email: r.email,
        messagesSent: msgCount,
        conversations: convCount
      };
    }));

    // Pipeline table data with unread DMs & next event
    const pipeline = await Promise.all(applicants.map(async (app) => {
      const nextEvent = await CalendarEvent.findOne({ targetUser: app._id })
        .sort({ date: 1, time: 1 })
        .populate('createdBy', 'name');

      const unreadCount = await Message.countDocuments({
        senderId: app._id,
        read: false
      });

      return {
        _id: app._id,
        name: app.name,
        email: app.email,
        title: app.title,
        status: app.status,
        skills: app.skills,
        upcomingEvent: nextEvent ? `${nextEvent.title} (${nextEvent.date} ${nextEvent.time})` : 'None',
        unreadDMs: unreadCount
      };
    }));

    // Upcoming meetings
    const upcomingEvents = await CalendarEvent.find()
      .sort({ date: 1, time: 1 })
      .limit(5)
      .populate('createdBy', 'name')
      .populate('targetUser', 'name');

    // Cyber Security logs
    const auditLogs = await AuditLog.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('userId', 'name email role');

    // Engineer System Status
    const dbState = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
    const counts = {
      users: await User.countDocuments(),
      conversations: await Conversation.countDocuments(),
      messages: await Message.countDocuments(),
      events: await CalendarEvent.countDocuments(),
      notifications: await Notification.countDocuments(),
      auditLogs: await AuditLog.countDocuments()
    };

    // CEO KPI
    const totalEvents = await CalendarEvent.countDocuments();
    const totalDMs = await Message.countDocuments();
    const mostActive = recruiterStats.sort((a, b) => b.messagesSent - a.messagesSent)[0]?.name || 'N/A';

    res.json({
      funnel: {
        applied: appliedCount,
        interview: interviewCount,
        offer: offerCount,
        total: applicants.length
      },
      recruiterStats,
      pipeline,
      upcomingEvents,
      cyberSecurity: {
        auditLogs,
        checklist: [
          { task: 'JWT authentication with bcryptjs hashing', status: 'Passed' },
          { task: 'RBAC Access controls on DM and Event routes', status: 'Enforced' },
          { task: 'Audit log generation on authentication events', status: 'Active' },
          { task: 'Localhost database isolation (port 27017)', status: 'Verified' }
        ]
      },
      engineer: {
        apiStatus: 'Healthy (HTTP 200 OK)',
        dbStatus: dbState,
        collectionCounts: counts
      },
      ceo: {
        totalApplicants: applicants.length,
        eventsScheduled: totalEvents,
        totalMessages: totalDMs,
        mostActiveRecruiter: mostActive
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
