/**
 * TalentBridge_V2 — Seed script (idempotent)
 * Clears all collections, then re-creates demo users, DM threads,
 * calendar events, notifications and audit logs.
 * Run: bun prisma/seed.ts   (or: bun run db:seed)
 */
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const db = new PrismaClient()

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10)
}
function isoTime(h: number, m: number): string {
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}
function daysFromNow(n: number): Date {
  return new Date(Date.now() + n * 24 * 60 * 60 * 1000)
}

async function main() {
  console.log('🌱 Seeding TalentBridge_V2 ...')

  // ---- Clear everything (idempotent reset) ----
  await db.auditLog.deleteMany()
  await db.notification.deleteMany()
  await db.application.deleteMany()
  await db.message.deleteMany()
  await db.calendarEvent.deleteMany()
  await db.conversation.deleteMany()
  await db.job.deleteMany()
  await db.user.deleteMany()

  const hash = bcrypt.hashSync('123456', 10)

  // ---- 9 demo users ----
  const [aarav, priya, rohan, sneha, nikhil, ananya, vikram, dev, meera] =
    await Promise.all([
      db.user.create({
        data: {
          email: 'aarav@mail.com', password: hash, name: 'Aarav Sharma',
          role: 'job_seeker', title: 'Frontend Developer',
          skills: JSON.stringify(['React', 'TypeScript', 'Next.js', 'Tailwind CSS']),
          status: 'Interview',
        },
      }),
      db.user.create({
        data: {
          email: 'priya@mail.com', password: hash, name: 'Priya Patel',
          role: 'job_seeker', title: 'Data Analyst',
          skills: JSON.stringify(['SQL', 'Python', 'Power BI', 'Statistics']),
          status: 'Applied',
        },
      }),
      db.user.create({
        data: {
          email: 'rohan@mail.com', password: hash, name: 'Rohan Mehta',
          role: 'job_seeker', title: 'Backend Developer',
          skills: JSON.stringify(['Node.js', 'PostgreSQL', 'Docker', 'Redis']),
          status: 'Applied',
        },
      }),
      db.user.create({
        data: {
          email: 'sneha@mail.com', password: hash, name: 'Sneha Kapoor',
          role: 'job_seeker', title: 'Cybersecurity Analyst',
          skills: JSON.stringify(['Pen Testing', 'SIEM', 'OWASP', 'Network Security']),
          status: 'Offer',
        },
      }),
      db.user.create({
        data: {
          email: 'recruiter1@mail.com', password: hash, name: 'Nikhil Verma',
          role: 'recruiter', title: 'Talent Lead',
        },
      }),
      db.user.create({
        data: {
          email: 'recruiter2@mail.com', password: hash, name: 'Ananya Iyer',
          role: 'recruiter', title: 'Technical Recruiter',
        },
      }),
      db.user.create({
        data: {
          email: 'cyber@mail.com', password: hash, name: 'Vikram Rao',
          role: 'company', title: 'Cyber Security Head', subRole: 'cyber',
        },
      }),
      db.user.create({
        data: {
          email: 'eng@mail.com', password: hash, name: 'Dev Menon',
          role: 'company', title: 'Lead Engineer', subRole: 'engineer',
        },
      }),
      db.user.create({
        data: {
          email: 'ceo@mail.com', password: hash, name: 'Meera Nair',
          role: 'company', title: 'CEO', subRole: 'ceo',
        },
      }),
    ])

  console.log('✅ 9 users created')

  // ---- Sample DM conversations ----
  async function thread(aId: string, bId: string, msgs: { from: string; text: string; minutesAgo: number; read: boolean }[]) {
    const conv = await db.conversation.create({
      data: { participants: { connect: [{ id: aId }, { id: bId }] } },
    })
    let last = new Date()
    for (const m of msgs) {
      const at = new Date(Date.now() - m.minutesAgo * 60 * 1000)
      last = at
      await db.message.create({
        data: {
          conversationId: conv.id, senderId: m.from, text: m.text,
          read: m.read, createdAt: at,
        },
      })
    }
    await db.conversation.update({ where: { id: conv.id }, data: { lastMessageAt: last } })
    return conv
  }

  // Priya ↔ Nikhil discussing an interview
  const convPriyaNikhil = await thread(priya.id, nikhil.id, [
    { from: nikhil.id, text: 'Hi Priya! We reviewed your application for the Data Analyst role — really strong SQL project.', minutesAgo: 300, read: true },
    { from: priya.id, text: 'Thank you so much! I enjoyed building the churn-prediction dashboard.', minutesAgo: 290, read: true },
    { from: nikhil.id, text: 'Would you be open to a technical interview this week? It would be a video call with our analytics lead.', minutesAgo: 280, read: true },
    { from: priya.id, text: 'Absolutely, any afternoon works for me.', minutesAgo: 270, read: true },
    { from: nikhil.id, text: 'Great — I am scheduling it now, watch your calendar for the invite.', minutesAgo: 60, read: false },
  ])

  // Aarav ↔ Nikhil
  const convAaravNikhil = await thread(aarav.id, nikhil.id, [
    { from: nikhil.id, text: 'Hey Aarav, your React portfolio impressed the panel.', minutesAgo: 500, read: true },
    { from: aarav.id, text: 'Thanks! I also open-sourced a component library recently.', minutesAgo: 490, read: true },
    { from: nikhil.id, text: 'Saw it — clean work. Next step is the Frontend Role interview, invite coming.', minutesAgo: 480, read: true },
    { from: aarav.id, text: 'Looking forward to it!', minutesAgo: 470, read: true },
  ])

  // Rohan ↔ Ananya
  const convRohanAnanya = await thread(rohan.id, ananya.id, [
    { from: ananya.id, text: 'Hi Rohan, quick question — are you comfortable with event-driven systems?', minutesAgo: 200, read: true },
    { from: rohan.id, text: 'Yes, I run a Kafka pipeline in production at my current job.', minutesAgo: 190, read: true },
    { from: ananya.id, text: 'Perfect. Our backend team would love to talk architecture with you.', minutesAgo: 180, read: true },
    { from: rohan.id, text: 'Happy to jump on a call whenever suits the team.', minutesAgo: 170, read: false },
  ])

  console.log('✅ 3 DM threads created')

  // ---- Calendar events ----
  const evInterview = await db.calendarEvent.create({
    data: {
      title: 'Interview — Frontend Role', date: isoDate(daysFromNow(7)), time: isoTime(10, 30),
      type: 'Interview', notes: 'Video call. Panel: Nikhil + Lead Engineer. Bring portfolio walkthrough.',
      createdById: nikhil.id, targetUserId: aarav.id,
    },
  })
  const evIntroCall = await db.calendarEvent.create({
    data: {
      title: 'Intro Call — Data Analyst', date: isoDate(daysFromNow(3)), time: isoTime(15, 0),
      type: 'Call', notes: 'Quick 30-min intro before the technical round.',
      createdById: ananya.id, targetUserId: priya.id,
    },
  })
  const evTeamSync = await db.calendarEvent.create({
    data: {
      title: 'Architecture Chat — Backend', date: isoDate(daysFromNow(5)), time: isoTime(11, 0),
      type: 'Meeting', notes: 'Discuss Kafka pipeline experience with backend team.',
      createdById: ananya.id, targetUserId: rohan.id,
    },
  })
  const evOffer = await db.calendarEvent.create({
    data: {
      title: 'Offer Discussion — Cybersecurity', date: isoDate(daysFromNow(2)), time: isoTime(16, 0),
      type: 'Meeting', notes: 'Final offer walkthrough with HR.',
      createdById: nikhil.id, targetUserId: sneha.id,
    },
  })

  console.log('✅ 4 calendar events created')

  // ---- Notifications ----
  await db.notification.createMany({
    data: [
      // event notifications for targeted seekers (unread)
      { userId: aarav.id, type: 'event', refId: evInterview.id, message: 'Nikhil Verma scheduled "Interview — Frontend Role" with you', createdAt: new Date(Date.now() - 50 * 60 * 1000) },
      { userId: priya.id, type: 'event', refId: evIntroCall.id, message: 'Ananya Iyer scheduled "Intro Call — Data Analyst" with you', createdAt: new Date(Date.now() - 55 * 60 * 1000) },
      { userId: rohan.id, type: 'event', refId: evTeamSync.id, message: 'Ananya Iyer scheduled "Architecture Chat — Backend" with you', createdAt: new Date(Date.now() - 40 * 60 * 1000) },
      { userId: sneha.id, type: 'event', refId: evOffer.id, message: 'Nikhil Verma scheduled "Offer Discussion — Cybersecurity" with you', createdAt: new Date(Date.now() - 30 * 60 * 1000) },
      // DM notifications for last unread messages
      { userId: priya.id, type: 'dm', refId: convPriyaNikhil.id, message: 'Nikhil Verma: Great — I am scheduling it now, watch your calendar for the invite.', createdAt: new Date(Date.now() - 60 * 60 * 1000) },
      { userId: ananya.id, type: 'dm', refId: convRohanAnanya.id, message: 'Rohan Mehta: Happy to jump on a call whenever suits the team.', createdAt: new Date(Date.now() - 170 * 60 * 1000) },
    ],
  })

  console.log('✅ notifications created')

  // ---- Job postings (recruiter-published; skills align with seeker profiles) ----
  function minutesAgo(n: number): Date {
    return new Date(Date.now() - n * 60 * 1000)
  }
  const [jobFrontend, jobData, jobBackend, jobSoc, jobDevops] = await Promise.all([
    db.job.create({
      data: {
        title: 'Senior Frontend Engineer', company: 'Nimbus Labs', location: 'Bengaluru · Hybrid',
        type: 'Full-time', postedById: nikhil.id, createdAt: minutesAgo(3 * 24 * 60),
        description:
          'Own the customer-facing web app end to end. You will build accessible, animated interfaces with React and Next.js, pair with designers on a dark-first design system, and mentor two junior engineers.',
        skills: JSON.stringify(['React', 'TypeScript', 'Next.js', 'Tailwind CSS']),
      },
    }),
    db.job.create({
      data: {
        title: 'Data Analyst — Growth Team', company: 'Nimbus Labs', location: 'Remote (India)',
        type: 'Full-time', postedById: ananya.id, createdAt: minutesAgo(2 * 24 * 60),
        description:
          'Turn product and revenue data into decisions. You will own dashboards in Power BI, write the SQL behind them, and run churn/retention analyses the leadership team actually acts on.',
        skills: JSON.stringify(['SQL', 'Python', 'Power BI', 'Statistics']),
      },
    }),
    db.job.create({
      data: {
        title: 'Backend Engineer (Node.js)', company: 'Helios Systems', location: 'Hyderabad · On-site',
        type: 'Full-time', postedById: ananya.id, createdAt: minutesAgo(26 * 60),
        description:
          'Design and scale event-driven services that process millions of jobs a day. Deep PostgreSQL work, Redis caching layers, and Docker-based deploys are your daily bread.',
        skills: JSON.stringify(['Node.js', 'PostgreSQL', 'Docker', 'Redis']),
      },
    }),
    db.job.create({
      data: {
        title: 'SOC Analyst — Cyber Security', company: 'Helios Systems', location: 'Mumbai · Hybrid',
        type: 'Full-time', postedById: nikhil.id, createdAt: minutesAgo(20 * 60),
        description:
          'Front line of our 24/7 security operations center. Triage SIEM alerts, run vulnerability assessments and periodic pen tests, and harden the network against OWASP top-10 threats.',
        skills: JSON.stringify(['SIEM', 'Pen Testing', 'Network Security', 'OWASP']),
      },
    }),
    db.job.create({
      data: {
        title: 'DevOps Intern', company: 'Nimbus Labs', location: 'Bengaluru',
        type: 'Internship', postedById: nikhil.id, createdAt: minutesAgo(8 * 60),
        description:
          'Six-month internship on the platform team. You will containerize services, wire up CI/CD pipelines and learn Kubernetes on a real production cluster.',
        skills: JSON.stringify(['Docker', 'Kubernetes', 'CI/CD']),
      },
    }),
    db.job.create({
      data: {
        title: 'Product Manager — Platform', company: 'Nimbus Labs', location: 'Remote (India)',
        type: 'Full-time', postedById: ananya.id, createdAt: minutesAgo(5 * 60),
        description:
          'Drive the platform roadmap with engineering and design. You will gather requirements from customers, prioritize ruthlessly, and communicate trade-offs to stakeholders.',
        skills: JSON.stringify(['Roadmapping', 'Stakeholder Management', 'Analytics']),
      },
    }),
  ])

  console.log('✅ 6 job postings created')

  // ---- Applications (seekers apply to the roles that match their profiles) ----
  await db.application.createMany({
    data: [
      {
        jobId: jobFrontend.id, userId: aarav.id,
        coverLetter: 'I have been building React + Next.js apps for 4 years and would love to own your customer-facing web app.',
        createdAt: minutesAgo(2 * 24 * 60),
      },
      {
        jobId: jobData.id, userId: priya.id,
        coverLetter: 'My churn-prediction dashboard project maps directly to the growth-analytics work you described.',
        createdAt: minutesAgo(1 * 24 * 60),
      },
      {
        jobId: jobBackend.id, userId: rohan.id,
        coverLetter: 'I run a Kafka pipeline in production today — event-driven systems are my comfort zone.',
        createdAt: minutesAgo(18 * 60),
      },
      {
        jobId: jobSoc.id, userId: sneha.id,
        coverLetter: null,
        createdAt: minutesAgo(15 * 60),
      },
      {
        jobId: jobDevops.id, userId: rohan.id,
        coverLetter: 'I already containerize everything with Docker and would like to grow into Kubernetes.',
        createdAt: minutesAgo(6 * 60),
      },
      // A second applicant on the Frontend role so the recruiter sees a list, not a single row.
      {
        jobId: jobFrontend.id, userId: priya.id,
        coverLetter: 'Pivoting from data into frontend — strong TypeScript fundamentals from my analytics work.',
        createdAt: minutesAgo(4 * 60),
      },
    ],
  })

  console.log('✅ 6 applications created')

  // ---- Audit logs (historic logins) ----
  await db.auditLog.createMany({
    data: [
      { userId: meera.id, action: 'login', createdAt: new Date(Date.now() - 26 * 60 * 60 * 1000) },
      { userId: dev.id, action: 'login', createdAt: new Date(Date.now() - 20 * 60 * 60 * 1000) },
      { userId: nikhil.id, action: 'login', createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000) },
      { userId: aarav.id, action: 'login', createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000) },
      { userId: vikram.id, action: 'login', createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000) },
    ],
  })

  console.log('✅ audit logs created')
  console.log('🎉 Seed complete! Login with any demo account, password: 123456')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
