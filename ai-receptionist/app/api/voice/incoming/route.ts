import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createGatherTwiML } from '@/lib/twilio';

export async function POST(request: Request) {
  try {
    // Parse Twilio's form data
    const formData = await request.formData();
    const callSid = formData.get('CallSid') as string;
    const from = formData.get('From') as string;
    const to = formData.get('To') as string;

    console.log(`📞 Incoming call from ${from} (CallSid: ${callSid})`);

    // Look up or create caller
    let caller = await prisma.caller.findUnique({
      where: { phoneNumber: from },
    });

    if (!caller) {
      caller = await prisma.caller.create({
        data: {
          phoneNumber: from,
        },
      });
      console.log(`✅ Created new caller: ${from}`);
    }

    // Create call session
    const callSession = await prisma.callSession.create({
      data: {
        twilioCallSid: callSid,
        callerId: caller.id,
        phoneNumber: from,
        direction: 'INBOUND',
        status: 'IN_PROGRESS',
        startTime: new Date(),
      },
    });

    // Log system message
    await prisma.callMessage.create({
      data: {
        callSessionId: callSession.id,
        role: 'SYSTEM',
        content: `Call initiated from ${from}`,
      },
    });

    console.log(`✅ Created call session: ${callSession.id}`);

    // Greet the caller and gather input
    const greeting = `Hello and welcome to P.F. Chang's corporate headquarters in Scottsdale. How may I help you today?`;

    // Use environment-aware URL for production/development
    const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL || 'http://localhost:3000';
    const gatherUrl = `${baseUrl}/api/voice/gather`;
    const twiml = createGatherTwiML(greeting, gatherUrl);

    return new Response(twiml, {
      headers: {
        'Content-Type': 'application/xml',
      },
    });
  } catch (error) {
    console.error('Error handling incoming call:', error);

    // Return a friendly error message to the caller
    const errorTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna">We're sorry, but we're experiencing technical difficulties. Please try again later.</Say>
  <Hangup/>
</Response>`;

    return new Response(errorTwiml, {
      headers: {
        'Content-Type': 'application/xml',
      },
    });
  }
}
