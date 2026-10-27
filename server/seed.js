require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { User, Message, Conversation, CalendarEvent, Notification, AuditLog } = require('./models');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/talentbridge_v2');
    console.log('Connected to MongoDB for seeding...');

    await Promise.all([
      User.deleteMany({}),
      Message.deleteMany({}),
      Conversation.deleteMany({}),
      CalendarEvent.deleteMany({}),
      Notification.deleteMany({}),
      AuditLog.deleteMany({})
    ]);

    const hashedPassword = await bcrypt.hash('123456', 10);

    const usersData = [
      // 4 Job Seekers
      { name: 'Aarav Sharma', email: 'aarav@mail.com', password: hashedPassword, role: 'job_seeker', title: 'Frontend Developer', skills: ['React', 'JavaScript', 'CSS', 'Tailwind'], status: 'Interview' },
      { name: 'Priya Patel', email: 'priya@mail.com', password: hashedPassword, role: 'job_seeker', title: 'Data Analyst', skills: ['Python', 'SQL', 'Pandas', 'Tableau'], status: 'Applied' },
      { name: 'Rohan Mehta', email: 'rohan@mail.com', password: hashedPassword, role: 'job_seeker', title: 'Backend Developer', skills: ['Node.js', 'Express', 'MongoDB', 'Docker'], status: 'Offer' },
      { name: 'Sneha Kapoor', email: 'sneha@mail.com', password: hashedPassword, role: 'job_seeker', title: 'Cybersecurity Analyst', skills: ['Network Security', 'Penetration Testing', 'SIEM', 'Python'], status: 'Applied' },

      // 2 Recruiters
      { name: 'Nikhil Verma', email: 'recruiter1@mail.com', password: hashedPassword, role: 'recruiter', title: 'Senior Technical Recruiter', skills: ['Talent Acquisition', 'Tech Hiring'] },
      { name: 'Ananya Iyer', email: 'recruiter2@mail.com', password: hashedPassword, role: 'recruiter', title: 'Technical Recruiter', skills: ['Campus Hiring', 'Sourcing'] },

      // 3 Company Users
      { name: 'Vikram Rao', email: 'cyber@mail.com', password: hashedPassword, role: 'company', title: 'Cyber Security Head', skills: ['Information Security', 'Compliance'] },
      { name: 'Dev Menon', email: 'eng@mail.com', password: hashedPassword, role: 'company', title: 'Lead Engineer', skills: ['Architecture', 'Full Stack'] },
      { name: 'Meera Nair', email: 'ceo@mail.com', password: hashedPassword, role: 'company', title: 'CEO', skills: ['Leadership', 'Strategy'] }
    ];

    const createdUsers = await User.insertMany(usersData);
    const userMap = {};
    createdUsers.forEach(u => { userMap[u.email] = u._id; });

    // Seed Conversations & Messages
    const conv1 = await Conversation.create({
      participantIds: [userMap['aarav@mail.com'], userMap['recruiter1@mail.com']],
      lastMessageAt: new Date()
    });

    await Message.insertMany([
      { conversationId: conv1._id, senderId: userMap['recruiter1@mail.com'], text: 'Hi Aarav, saw your React profile. Are you available for a chat?', read: true, createdAt: new Date(Date.now() - 3600000 * 5) },
      { conversationId: conv1._id, senderId: userMap['aarav@mail.com'], text: 'Hello Nikhil! Yes, I am definitely interested. What times work for you?', read: true, createdAt: new Date(Date.now() - 3600000 * 4) },
      { conversationId: conv1._id, senderId: userMap['recruiter1@mail.com'], text: 'Awesome, let us schedule an interview next week.', read: false, createdAt: new Date(Date.now() - 3600000 * 3) }
    ]);

    const conv2 = await Conversation.create({
      participantIds: [userMap['priya@mail.com'], userMap['recruiter2@mail.com']],
      lastMessageAt: new Date()
    });

    await Message.insertMany([
      { conversationId: conv2._id, senderId: userMap['recruiter2@mail.com'], text: 'Hi Priya, your Data Analyst portfolio looks stellar!', read: true, createdAt: new Date(Date.now() - 86400000) },
      { conversationId: conv2._id, senderId: userMap['priya@mail.com'], text: 'Thank you Ananya! I love working with SQL and Python datasets.', read: false, createdAt: new Date(Date.now() - 72000000) }
    ]);

    // Seed Calendar Events
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 2);
    const dateStr = tomorrow.toISOString().split('T')[0];

    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 5);
    const dateStr2 = nextWeek.toISOString().split('T')[0];

    const ev1 = await CalendarEvent.create({
      title: 'Interview — Frontend Role',
      date: dateStr,
      time: '10:00',
      type: 'Interview',
      notes: 'Prepare React hook examples and component architecture questions.',
      createdBy: userMap['recruiter1@mail.com'],
      targetUser: userMap['aarav@mail.com']
    });

    const ev2 = await CalendarEvent.create({
      title: 'Initial Screening — Data Role',
      date: dateStr2,
      time: '14:30',
      type: 'Meeting',
      notes: 'Discuss Tableau dashboard experience and SQL querying performance.',
      createdBy: userMap['recruiter2@mail.com'],
      targetUser: userMap['priya@mail.com']
    });

    // Seed Notifications
    await Notification.insertMany([
      { userId: userMap['aarav@mail.com'], type: 'event', refId: ev1._id, message: 'Nikhil Verma scheduled Interview — Frontend Role', read: false },
      { userId: userMap['aarav@mail.com'], type: 'dm', refId: conv1._id, message: 'New message from Nikhil Verma', read: false },
      { userId: userMap['priya@mail.com'], type: 'event', refId: ev2._id, message: 'Ananya Iyer scheduled Initial Screening — Data Role', read: false }
    ]);

    // Seed Audit Logs
    await AuditLog.insertMany([
      { userId: userMap['cyber@mail.com'], action: 'System login by Cyber Security Head', createdAt: new Date(Date.now() - 3600000 * 2) },
      { userId: userMap['ceo@mail.com'], action: 'Command Center access verified', createdAt: new Date(Date.now() - 3600000) }
    ]);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seed();
