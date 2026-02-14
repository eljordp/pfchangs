import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    // Parse Twilio's form data
    const formData = await request.formData();
    const callSid = formData.get('CallSid') as string;
    const callStatus = formData.get('CallStatus') as string;
    const callDuration = formData.get('CallDuration') as string;

    console.log(`📊 Call status update: ${callStatus} (CallSid: ${callSid}, Duration: ${callDuration}s)`);

    // Find the call session
    const callSession = await prisma.callSession.findUnique({
      where: { twilioCallSid: callSid },
    });

    if (!callSession) {
      console.warn(`Call session not found for CallSid: ${callSid}`);
      return NextResponse.json({ success: false, error: 'Call session not found' });
    }

    // Map Twilio status to our enum
    const statusMap: Record<string, string> = {
      'ringing': 'RINGING',
      'in-progress': 'IN_PROGRESS',
      'completed': 'COMPLETED',
      'failed': 'FAILED',
      'busy': 'BUSY',
      'no-answer': 'NO_ANSWER',
    };

    const mappedStatus = statusMap[callStatus] || 'COMPLETED';

    // Update call session
    await prisma.callSession.update({
      where: { id: callSession.id },
      data: {
        status: mappedStatus as any,
        ...(callStatus === 'completed' && {
          endTime: new Date(),
          duration: parseInt(callDuration || '0', 10),
        }),
      },
    });

    // If call is completed, create metrics
    if (callStatus === 'completed') {
      const messages = await prisma.callMessage.findMany({
        where: { callSessionId: callSession.id },
      });

      await prisma.callMetrics.create({
        data: {
          callSessionId: callSession.id,
          totalInteractions: messages.length,
          // Add more metrics as needed
        },
      });

      console.log(`✅ Call completed and metrics saved for ${callSid}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error handling status callback:', error);
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 });
  }
}
