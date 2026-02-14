import { openai, AI_MODEL } from '../openai';
import { RECEPTIONIST_SYSTEM_PROMPT } from './prompts';
import { prisma } from '../prisma';

export interface AIResponse {
  reply: string;
  intent: string;
  entities?: Record<string, any>;
  shouldTransfer?: boolean;
  shouldScheduleAppointment?: boolean;
}

/**
 * Generate an AI response based on user input and conversation context
 */
export async function generateAIResponse(
  userMessage: string,
  callSessionId?: string,
  chatSessionId?: string
): Promise<AIResponse> {
  try {
    // If OpenAI is not configured, return a fallback response
    if (!openai) {
      console.warn('OpenAI not configured, using fallback response');
      return {
        reply: "I'm here to help. Could you please tell me what you need assistance with today?",
        intent: 'other',
      };
    }

    // Load conversation history
    const history = await loadConversationHistory(callSessionId, chatSessionId);

    // Build messages for GPT-4
    const messages: any[] = [
      { role: 'system', content: RECEPTIONIST_SYSTEM_PROMPT },
      ...history,
      { role: 'user', content: userMessage },
    ];

    // Call OpenAI GPT-4
    const completion = await openai.chat.completions.create({
      model: AI_MODEL,
      messages,
      temperature: 0.7,
      max_tokens: 200, // Keep responses concise for voice
    });

    const assistantReply = completion.choices[0].message.content || 'I apologize, I didn\'t quite understand that. Could you please rephrase?';

    // Classify intent from the response
    const intent = await classifyIntent(userMessage, assistantReply);

    return {
      reply: assistantReply,
      intent: intent.name,
      entities: intent.entities,
      shouldTransfer: intent.name === 'transfer',
      shouldScheduleAppointment: intent.name === 'appointment',
    };
  } catch (error) {
    console.error('Error generating AI response:', error);

    // Fallback response on error
    return {
      reply: "I apologize, I'm having trouble processing that right now. Could you please try again?",
      intent: 'other',
    };
  }
}

/**
 * Load conversation history from database
 */
async function loadConversationHistory(
  callSessionId?: string,
  chatSessionId?: string
): Promise<Array<{ role: string; content: string }>> {
  try {
    if (callSessionId) {
      const messages = await prisma.callMessage.findMany({
        where: { callSessionId },
        orderBy: { timestamp: 'asc' },
        take: 10, // Last 10 messages for context
      });

      return messages
        .filter(m => m.role !== 'SYSTEM')
        .map(m => ({
          role: m.role === 'USER' ? 'user' : 'assistant',
          content: m.content,
        }));
    }

    if (chatSessionId) {
      const messages = await prisma.chatMessage.findMany({
        where: { chatSessionId },
        orderBy: { timestamp: 'asc' },
        take: 10,
      });

      return messages
        .filter(m => m.role !== 'SYSTEM')
        .map(m => ({
          role: m.role === 'USER' ? 'user' : 'assistant',
          content: m.content,
        }));
    }

    return [];
  } catch (error) {
    console.error('Error loading conversation history:', error);
    return [];
  }
}

/**
 * Classify the intent of the conversation
 */
async function classifyIntent(
  userMessage: string,
  assistantReply: string
): Promise<{ name: string; entities: Record<string, any> }> {
  const messageLower = userMessage.toLowerCase();

  // Simple keyword-based intent classification
  // In production, you could use GPT-4 function calling for more accurate classification

  if (messageLower.includes('hour') || messageLower.includes('open') || messageLower.includes('close') || messageLower.includes('location') || messageLower.includes('address')) {
    return { name: 'info_request', entities: {} };
  }

  if (messageLower.includes('appointment') || messageLower.includes('meeting') || messageLower.includes('schedule') || messageLower.includes('visit')) {
    return { name: 'appointment', entities: {} };
  }

  if (messageLower.includes('transfer') || messageLower.includes('speak to') || messageLower.includes('talk to') || messageLower.includes('connect me')) {
    return { name: 'transfer', entities: {} };
  }

  if (messageLower.includes('job') || messageLower.includes('career') || messageLower.includes('hiring') || messageLower.includes('apply')) {
    return { name: 'employment', entities: {} };
  }

  if (messageLower.includes('vendor') || messageLower.includes('supplier') || messageLower.includes('delivery')) {
    return { name: 'vendor', entities: {} };
  }

  if (messageLower.includes('visitor') || messageLower.includes('guest') || messageLower.includes('check in')) {
    return { name: 'visitor', entities: {} };
  }

  if (messageLower.includes('complaint') || messageLower.includes('problem') || messageLower.includes('issue')) {
    return { name: 'complaint', entities: {} };
  }

  return { name: 'other', entities: {} };
}
