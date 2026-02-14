import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createGatherTwiML, createHangupTwiML } from '@/lib/twilio';
import { generateAIResponse } from '@/lib/ai/response-generator';

export async function POST(request: Request) {
  try {
    // Parse Twilio's form data
    const formData = await request.formData();
    const callSid = formData.get('CallSid') as string;
    const speechResult = formData.get('SpeechResult') as string;
    const digits = formData.get('Digits') as string;

    const userInput = speechResult || digits || '';

    console.log(`🎤 User said: "${userInput}" (CallSid: ${callSid})`);

    // Find the call session
    const callSession = await prisma.callSession.findUnique({
      where: { twilioCallSid: callSid },
    });

    if (!callSession) {
      console.error(`Call session not found for CallSid: ${callSid}`);
      const errorTwiml = createHangupTwiML('I apologize, but I cannot find your call session. Please try calling again.');
      return new Response(errorTwiml, {
        headers: { 'Content-Type': 'application/xml' },
      });
    }

    // Save user message
    await prisma.callMessage.create({
      data: {
        callSessionId: callSession.id,
        role: 'USER',
        content: userInput,
      },
    });

    // Generate AI response
    const aiResponse = await generateAIResponse(userInput, callSession.id);

    console.log(`🤖 AI responds: "${aiResponse.reply}" (Intent: ${aiResponse.intent})`);

    // Save AI response
    await prisma.callMessage.create({
      data: {
        callSessionId: callSession.id,
        role: 'ASSISTANT',
        content: aiResponse.reply,
      },
    });

    // Update call session with intent
    await prisma.callSession.update({
      where: { id: callSession.id },
      data: {
        intent: aiResponse.intent,
        resolved: aiResponse.intent !== 'other',
      },
    });

    // Check if we should transfer or end the call
    if (aiResponse.shouldTransfer) {
      const transferTwiml = createHangupTwiML('I\'ll transfer you now. Please hold.');
      return new Response(transferTwiml, {
        headers: { 'Content-Type': 'application/xml' },
      });
    }

    // Check if conversation seems complete
    const lowerReply = aiResponse.reply.toLowerCase();
    if (
      lowerReply.includes('goodbye') ||
      lowerReply.includes('have a great day') ||
      lowerReply.includes('thank you for calling')
    ) {
      const hangupTwiml = createHangupTwiML(aiResponse.reply);
      return new Response(hangupTwiml, {
        headers: { 'Content-Type': 'application/xml' },
      });
    }

    // Continue the conversation - gather more input
    const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL || 'http://localhost:3000';
    const gatherUrl = `${baseUrl}/api/voice/gather`;
    const twiml = createGatherTwiML(aiResponse.reply, gatherUrl);

    return new Response(twiml, {
      headers: { 'Content-Type': 'application/xml' },
    });
  } catch (error) {
    console.error('Error handling voice gather:', error);

    const errorTwiml = createHangupTwiML('I apologize, but I\'m experiencing technical difficulties. Please try calling again later.');
    return new Response(errorTwiml, {
      headers: { 'Content-Type': 'application/xml' },
    });
  }
}
