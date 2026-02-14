import { PrismaClient, CallStatus } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const hashedPassword = await hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@pfchangs.com' },
    update: {},
    create: {
      email: 'admin@pfchangs.com',
      name: 'Admin User',
      role: 'ADMIN',
      hashedPassword,
      emailVerified: new Date(),
    },
  });
  console.log('✅ Created admin user:', admin.email);

  // Create sample callers
  const callers = await Promise.all([
    prisma.caller.create({
      data: {
        phoneNumber: '+14801234567',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        company: 'ABC Corp',
      },
    }),
    prisma.caller.create({
      data: {
        phoneNumber: '+14809876543',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        company: 'XYZ Inc',
      },
    }),
    prisma.caller.create({
      data: {
        phoneNumber: '+14805551234',
        firstName: 'Bob',
        lastName: 'Johnson',
      },
    }),
  ]);
  console.log(`✅ Created ${callers.length} sample callers`);

  // Create sample call sessions
  const intents = ['info_request', 'appointment', 'employment', 'vendor', 'transfer'];
  const statuses: CallStatus[] = ['COMPLETED', 'COMPLETED', 'COMPLETED', 'IN_PROGRESS', 'FAILED'];

  const callSessions = [];
  for (let i = 0; i < 20; i++) {
    const daysAgo = Math.floor(Math.random() * 7);
    const caller = callers[Math.floor(Math.random() * callers.length)];
    const intent = intents[Math.floor(Math.random() * intents.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];

    const startTime = new Date();
    startTime.setDate(startTime.getDate() - daysAgo);
    startTime.setHours(9 + Math.floor(Math.random() * 8));

    const session = await prisma.callSession.create({
      data: {
        twilioCallSid: `CA${Math.random().toString(36).substring(2, 15)}`,
        callerId: caller.id,
        phoneNumber: caller.phoneNumber!,
        direction: 'INBOUND',
        status,
        startTime,
        endTime: status === 'COMPLETED' ? new Date(startTime.getTime() + Math.random() * 600000) : null,
        duration: status === 'COMPLETED' ? Math.floor(Math.random() * 600) : null,
        intent,
        resolved: Math.random() > 0.3,
      },
    });

    // Add some messages
    await prisma.callMessage.createMany({
      data: [
        {
          callSessionId: session.id,
          role: 'SYSTEM',
          content: 'Call started',
        },
        {
          callSessionId: session.id,
          role: 'USER',
          content: getSampleUserMessage(intent),
        },
        {
          callSessionId: session.id,
          role: 'ASSISTANT',
          content: getSampleAssistantResponse(intent),
        },
      ],
    });

    callSessions.push(session);
  }
  console.log(`✅ Created ${callSessions.length} sample call sessions`);

  // Create sample appointments
  const appointmentTypes = ['VENDOR_MEETING', 'INTERVIEW', 'DELIVERY', 'GENERAL'];
  const appointments = [];

  for (let i = 0; i < 10; i++) {
    const daysAhead = Math.floor(Math.random() * 14);
    const caller = callers[Math.floor(Math.random() * callers.length)];
    const scheduledFor = new Date();
    scheduledFor.setDate(scheduledFor.getDate() + daysAhead);
    scheduledFor.setHours(10 + Math.floor(Math.random() * 6));
    scheduledFor.setMinutes(0);

    const appointment = await prisma.appointment.create({
      data: {
        callerId: caller.id,
        contactName: `${caller.firstName} ${caller.lastName}`,
        contactPhone: caller.phoneNumber!,
        contactEmail: caller.email,
        scheduledFor,
        duration: [30, 60, 90][Math.floor(Math.random() * 3)],
        type: appointmentTypes[Math.floor(Math.random() * appointmentTypes.length)] as any,
        purpose: 'Sample appointment for demo purposes',
        status: 'SCHEDULED',
      },
    });
    appointments.push(appointment);
  }
  console.log(`✅ Created ${appointments.length} sample appointments`);

  // Create sample FAQ entries
  const faqs = [
    {
      question: 'What are your headquarters hours?',
      answer: 'Our headquarters are open Monday through Friday, 9:00 AM to 5:00 PM MST. We are closed on weekends and major holidays.',
      category: 'General',
      keywords: ['hours', 'open', 'closed', 'time'],
    },
    {
      question: 'Where is P.F. Chang\'s headquarters located?',
      answer: 'Our corporate headquarters is located at 7676 N Scottsdale Rd, Scottsdale, AZ 85253.',
      category: 'General',
      keywords: ['location', 'address', 'where', 'headquarters'],
    },
    {
      question: 'How do I apply for a job?',
      answer: 'Please visit our careers page at pfchangs.com/careers to view open positions and submit your application.',
      category: 'Employment',
      keywords: ['job', 'career', 'hiring', 'apply', 'employment'],
    },
  ];

  for (const faq of faqs) {
    await prisma.faqEntry.create({
      data: faq,
    });
  }
  console.log(`✅ Created ${faqs.length} FAQ entries`);

  console.log('✨ Seeding complete!');
  console.log('\nAdmin Login:');
  console.log('  Email: admin@pfchangs.com');
  console.log('  Password: admin123');
}

function getSampleUserMessage(intent: string): string {
  const messages: Record<string, string[]> = {
    info_request: ['What are your hours?', 'Where are you located?', 'Is the office open today?'],
    appointment: ['I need to schedule a meeting', 'Can I visit next week?', 'I\'d like to set up an appointment'],
    employment: ['Are you hiring?', 'How do I apply for a job?', 'Do you have any open positions?'],
    vendor: ['I\'m a food supplier', 'I\'d like to become a vendor', 'Who handles purchasing?'],
    transfer: ['Can I speak to HR?', 'Transfer me to the finance department', 'I need to talk to someone in marketing'],
  };
  const options = messages[intent] || ['Hello, I have a question'];
  return options[Math.floor(Math.random() * options.length)];
}

function getSampleAssistantResponse(intent: string): string {
  const responses: Record<string, string> = {
    info_request: 'Our headquarters are open Monday through Friday, 9:00 AM to 5:00 PM MST.',
    appointment: 'I\'d be happy to help you schedule an appointment. May I have your name and contact information?',
    employment: 'For employment inquiries, please visit our careers page at pfchangs.com/careers.',
    vendor: 'For vendor inquiries, I can connect you with our operations team. May I have your company name?',
    transfer: 'I\'ll transfer you to that department right away.',
  };
  return responses[intent] || 'How can I help you today?';
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
