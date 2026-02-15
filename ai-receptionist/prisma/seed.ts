import { PrismaClient, CallStatus, OrderType, OrderStatus } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

// P.F. Chang's catering menu items
const CATERING_ITEMS = [
  { name: "Chang's Lettuce Wraps (Tray of 24)", price: 89.99 },
  { name: "Mongolian Beef Family Style", price: 65.99 },
  { name: "Kung Pao Chicken (Half Pan)", price: 78.99 },
  { name: "Lo Mein Noodles (Full Pan)", price: 54.99 },
  { name: "Fried Rice (Full Pan)", price: 44.99 },
  { name: "Chang's Spicy Chicken (Half Pan)", price: 72.99 },
  { name: "Dynamite Shrimp (Tray of 30)", price: 119.99 },
  { name: "Dim Sum Platter (48 pieces)", price: 149.99 },
  { name: "Asian Caesar Salad (Serves 12)", price: 42.99 },
  { name: "Wonton Soup (3 Gallons)", price: 64.99 },
  { name: "Beverage Package (per person)", price: 8.99 },
  { name: "Dessert Platter (Serves 20)", price: 79.99 },
  { name: "Spring Roll Platter (36 pieces)", price: 94.99 },
  { name: "Crispy Honey Shrimp (Half Pan)", price: 109.99 },
  { name: "Ginger Chicken with Broccoli (Full Pan)", price: 68.99 },
];

const ORDER_TYPES: OrderType[] = ['CATERING', 'CATERING', 'CORPORATE_EVENT', 'BULK_ORDER', 'VENDOR_PURCHASE', 'GIFT_CARD_BULK'];
const ORDER_STATUSES: OrderStatus[] = ['COMPLETED', 'COMPLETED', 'COMPLETED', 'CONFIRMED', 'DELIVERED', 'PENDING', 'CANCELLED'];

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateOrderItems(): Array<{ name: string; quantity: number; unitPrice: number }> {
  const count = 2 + Math.floor(Math.random() * 5); // 2-6 items
  const items: Array<{ name: string; quantity: number; unitPrice: number }> = [];
  const used = new Set<number>();

  for (let i = 0; i < count; i++) {
    let idx: number;
    do { idx = Math.floor(Math.random() * CATERING_ITEMS.length); } while (used.has(idx));
    used.add(idx);
    const item = CATERING_ITEMS[idx];
    items.push({ name: item.name, quantity: 1 + Math.floor(Math.random() * 4), unitPrice: item.price });
  }
  return items;
}

async function main() {
  console.log('🌱 Seeding database...');

  // Clean existing data
  await prisma.order.deleteMany();
  await prisma.callMessage.deleteMany();
  await prisma.chatMessage.deleteMany();
  await prisma.callMetrics.deleteMany();
  await prisma.chatSession.deleteMany();
  await prisma.callSession.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.caller.deleteMany();

  // Create admin user
  const hashedPassword = await hash('admin123', 10);
  await prisma.user.upsert({
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
  console.log('✅ Created admin user: admin@pfchangs.com');

  // Create callers - mix of corporate accounts
  const callers = await Promise.all([
    prisma.caller.create({
      data: { phoneNumber: '+14807771234', firstName: 'Sarah', lastName: 'Martinez', email: 'smartinez@marriott.com', company: 'Marriott Scottsdale Resort' },
    }),
    prisma.caller.create({
      data: { phoneNumber: '+14808882345', firstName: 'David', lastName: 'Chen', email: 'dchen@google.com', company: 'Google Phoenix Office' },
    }),
    prisma.caller.create({
      data: { phoneNumber: '+14809993456', firstName: 'Lisa', lastName: 'Thompson', email: 'lthompson@asu.edu', company: 'Arizona State University' },
    }),
    prisma.caller.create({
      data: { phoneNumber: '+14801112345', firstName: 'Michael', lastName: 'Rodriguez', email: 'mrodriguez@wellsfargo.com', company: 'Wells Fargo AZ' },
    }),
    prisma.caller.create({
      data: { phoneNumber: '+14802223456', firstName: 'Emily', lastName: 'Patel', email: 'epatel@honeywell.com', company: 'Honeywell Aerospace' },
    }),
    prisma.caller.create({
      data: { phoneNumber: '+14803334567', firstName: 'James', lastName: 'Wilson', email: 'jwilson@scottsdalechamber.com', company: 'Scottsdale Chamber of Commerce' },
    }),
    prisma.caller.create({
      data: { phoneNumber: '+14804445678', firstName: 'Rachel', lastName: 'Kim', email: 'rkim@deloitte.com', company: 'Deloitte Phoenix' },
    }),
    prisma.caller.create({
      data: { phoneNumber: '+14805556789', firstName: 'Tom', lastName: 'Baker', email: 'tbaker@gmail.com', company: null },
    }),
  ]);
  console.log(`✅ Created ${callers.length} callers`);

  // Create call sessions over 30 days
  const intents = ['catering_order', 'catering_order', 'info_request', 'appointment', 'employment', 'vendor', 'transfer', 'catering_order'];
  const statuses: CallStatus[] = ['COMPLETED', 'COMPLETED', 'COMPLETED', 'COMPLETED', 'IN_PROGRESS', 'FAILED'];

  const callSessions = [];
  for (let i = 0; i < 60; i++) {
    const daysAgo = Math.floor(Math.random() * 30);
    const caller = randomItem(callers);
    const intent = randomItem(intents);
    const status: CallStatus = randomItem(statuses) as CallStatus;
    const hour = 8 + Math.floor(Math.random() * 10); // 8am-6pm

    const startTime = new Date();
    startTime.setDate(startTime.getDate() - daysAgo);
    startTime.setHours(hour, Math.floor(Math.random() * 60), 0, 0);

    const duration = status === 'COMPLETED' ? 60 + Math.floor(Math.random() * 540) : null; // 1-10 min

    const session = await prisma.callSession.create({
      data: {
        twilioCallSid: `CA${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 8)}`,
        callerId: caller.id,
        phoneNumber: caller.phoneNumber!,
        direction: 'INBOUND',
        status,
        startTime,
        endTime: duration ? new Date(startTime.getTime() + duration * 1000) : null,
        duration,
        intent,
        resolved: status === 'COMPLETED' ? Math.random() > 0.15 : false,
      },
    });

    await prisma.callMessage.createMany({
      data: [
        { callSessionId: session.id, role: 'SYSTEM', content: 'Call started' },
        { callSessionId: session.id, role: 'USER', content: getSampleUserMessage(intent) },
        { callSessionId: session.id, role: 'ASSISTANT', content: getSampleAssistantResponse(intent) },
      ],
    });

    callSessions.push(session);
  }
  console.log(`✅ Created ${callSessions.length} call sessions`);

  // Create orders linked to catering calls
  const cateringCalls = callSessions.filter(s => s.intent === 'catering_order' && s.status === 'COMPLETED');
  let orderCount = 0;

  for (let i = 0; i < cateringCalls.length; i++) {
    // ~80% of catering calls result in an order
    if (Math.random() > 0.8) continue;

    const call = cateringCalls[i];
    const items = generateOrderItems();
    const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const tax = subtotal * 0.086; // AZ tax
    const deliveryFee = subtotal > 1000 ? 0 : 25 + Math.floor(Math.random() * 50);
    const discount = subtotal > 2000 ? subtotal * 0.1 : 0;
    const total = subtotal + tax + deliveryFee - discount;
    const type = randomItem(ORDER_TYPES) as OrderType;
    const status = randomItem(ORDER_STATUSES) as OrderStatus;
    const guestCount = type === 'CATERING' || type === 'CORPORATE_EVENT'
      ? 10 + Math.floor(Math.random() * 190)
      : null;

    const eventDate = new Date(call.startTime);
    eventDate.setDate(eventDate.getDate() + 3 + Math.floor(Math.random() * 11));

    orderCount++;
    await prisma.order.create({
      data: {
        orderNumber: `PFC-2026-${String(orderCount).padStart(4, '0')}`,
        callSessionId: call.id,
        callerId: call.callerId,
        type,
        status,
        items,
        subtotal: Math.round(subtotal * 100) / 100,
        tax: Math.round(tax * 100) / 100,
        deliveryFee: Math.round(deliveryFee * 100) / 100,
        discount: Math.round(discount * 100) / 100,
        total: Math.round(total * 100) / 100,
        guestCount,
        eventDate,
        timeToOrder: 60 + Math.floor(Math.random() * 420), // 1-8 min into call
        createdAt: call.startTime,
      },
    });
  }

  // Also add some orders not linked to calls (walk-in / web)
  for (let i = 0; i < 8; i++) {
    const daysAgo = Math.floor(Math.random() * 30);
    const caller = randomItem(callers);
    const items = generateOrderItems();
    const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const tax = subtotal * 0.086;
    const deliveryFee = subtotal > 1000 ? 0 : 25 + Math.floor(Math.random() * 50);
    const discount = subtotal > 2000 ? subtotal * 0.1 : 0;
    const total = subtotal + tax + deliveryFee - discount;
    const type = randomItem(ORDER_TYPES) as OrderType;

    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - daysAgo);

    orderCount++;
    await prisma.order.create({
      data: {
        orderNumber: `PFC-2026-${String(orderCount).padStart(4, '0')}`,
        callerId: caller.id,
        type,
        status: randomItem(ORDER_STATUSES) as OrderStatus,
        items,
        subtotal: Math.round(subtotal * 100) / 100,
        tax: Math.round(tax * 100) / 100,
        deliveryFee: Math.round(deliveryFee * 100) / 100,
        discount: Math.round(discount * 100) / 100,
        total: Math.round(total * 100) / 100,
        guestCount: type === 'CATERING' || type === 'CORPORATE_EVENT' ? 10 + Math.floor(Math.random() * 90) : null,
        createdAt,
      },
    });
  }
  console.log(`✅ Created ${orderCount} orders`);

  // Create appointments
  for (let i = 0; i < 12; i++) {
    const daysAhead = Math.floor(Math.random() * 14);
    const caller = randomItem(callers);
    const scheduledFor = new Date();
    scheduledFor.setDate(scheduledFor.getDate() + daysAhead);
    scheduledFor.setHours(10 + Math.floor(Math.random() * 6), 0, 0, 0);

    await prisma.appointment.create({
      data: {
        callerId: caller.id,
        contactName: `${caller.firstName} ${caller.lastName}`,
        contactPhone: caller.phoneNumber!,
        contactEmail: caller.email,
        scheduledFor,
        duration: randomItem([30, 60, 90]),
        type: randomItem(['VENDOR_MEETING', 'INTERVIEW', 'DELIVERY', 'GENERAL'] as const),
        purpose: randomItem([
          'Quarterly catering review meeting',
          'New vendor onboarding',
          'Corporate event planning',
          'Interview for operations role',
          'Monthly supply delivery',
        ]),
        status: 'SCHEDULED',
      },
    });
  }
  console.log('✅ Created 12 appointments');

  console.log('✨ Seeding complete!');
  console.log('\nAdmin Login:');
  console.log('  Email: admin@pfchangs.com');
  console.log('  Password: admin123');
}

function getSampleUserMessage(intent: string): string {
  const messages: Record<string, string[]> = {
    catering_order: [
      'I need to place a catering order for 50 people for next Thursday',
      'We need lunch catered for a corporate event, about 75 guests',
      "Can I order Chang's lettuce wraps and entrees for our office party?",
      'I want to set up a recurring catering order for our weekly meetings',
      "We're hosting a conference and need food for 120 attendees",
    ],
    info_request: ['What are your hours?', 'Where are you located?', 'Do you offer catering services?'],
    appointment: ['I need to schedule a vendor meeting', "Can I visit next week to discuss our account?"],
    employment: ['Are you hiring?', 'How do I apply for a job?'],
    vendor: ["I'm a food supplier looking to partner", 'Who handles purchasing decisions?'],
    transfer: ['Can I speak to the events coordinator?', 'Transfer me to catering please'],
  };
  const options = messages[intent] || ['Hello, I have a question'];
  return randomItem(options);
}

function getSampleAssistantResponse(intent: string): string {
  const responses: Record<string, string> = {
    catering_order: "I'd love to help you with your catering order! We have several packages available. Can you tell me more about the event date, number of guests, and any dietary preferences?",
    info_request: 'Our headquarters are open Monday through Friday, 9:00 AM to 5:00 PM MST at 7676 N Scottsdale Rd.',
    appointment: "I'd be happy to schedule that for you. What day and time work best?",
    employment: 'For employment inquiries, please visit pfchangs.com/careers for current openings.',
    vendor: 'For vendor partnerships, I can connect you with our procurement team.',
    transfer: "I'll transfer you right away. One moment please.",
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
