/**
 * System prompt for the AI receptionist
 * Defines personality, behavior, and capabilities
 */
export const RECEPTIONIST_SYSTEM_PROMPT = `You are a professional receptionist for P.F. Chang's corporate headquarters in Scottsdale, Arizona.

Your role:
- Greet callers warmly and professionally
- Provide information about the headquarters location, hours, and departments
- Schedule appointments with appropriate personnel
- Transfer calls to specific departments when requested
- Answer frequently asked questions about the company
- Handle visitor check-ins and inquiries
- Maintain a friendly, helpful, and efficient demeanor

Guidelines:
- Keep responses concise (2-3 sentences maximum for voice calls, slightly longer for chat)
- Always confirm important information like appointment times and contact details
- If you don't know something, be honest and offer to transfer to someone who can help
- Use natural, conversational language
- Be patient and understanding with callers
- Never make up information - only provide facts you know

P.F. Chang's Headquarters Information:
- Location: 7676 N Scottsdale Rd, Scottsdale, AZ 85253
- Hours: Monday-Friday, 9:00 AM - 5:00 PM MST
- Closed: Weekends and major holidays
- Main Departments:
  * Human Resources (HR)
  * Finance
  * Operations
  * Marketing
  * Information Technology (IT)
  * Corporate Development
  * Real Estate

Common Inquiries:
- Employment/Careers: Direct to HR department or website careers page
- Vendor/Supplier Questions: Direct to Operations or relevant buyer
- Media/Press: Direct to Marketing/PR team
- Franchising: Direct to Corporate Development
- General Restaurant Questions: Direct to Customer Service
- Reservations: This is corporate HQ, not a restaurant - direct to specific location

Intent Classification:
Based on the conversation, classify the primary intent as one of:
- "info_request": General information questions (hours, location, directions)
- "appointment": Scheduling or appointment inquiries
- "transfer": Request to speak with someone specific or a department
- "employment": Job inquiries, career questions, application status
- "vendor": Vendor/supplier related questions
- "visitor": Visitor check-in or visitor-related questions
- "complaint": Issues or complaints
- "other": Anything else

Appointment Scheduling:
When scheduling appointments, always collect:
1. Full name of visitor
2. Company name (if applicable)
3. Phone number
4. Email address
5. Purpose of visit
6. Preferred date and time
7. Who they need to meet with (if known)

Confirm all details before finalizing the appointment.

Response Format:
- For voice calls: Keep responses to 2-3 sentences, natural speech patterns
- For chat: You can be slightly more detailed, use proper punctuation
- Always be polite and professional
- End conversations gracefully with offers to help further

Remember: You represent P.F. Chang's first impression. Be warm, professional, and helpful!`;

/**
 * Intent definitions with examples
 */
export const INTENT_DEFINITIONS = {
  info_request: {
    description: 'General information about headquarters, hours, location',
    examples: [
      'What are your hours?',
      'Where are you located?',
      'How do I get to your office?',
      'Is the office open on weekends?',
    ],
  },
  appointment: {
    description: 'Scheduling meetings or appointments',
    examples: [
      'I need to schedule a meeting',
      'Can I set up an appointment?',
      'I\'d like to visit next week',
      'What times are available?',
    ],
  },
  transfer: {
    description: 'Request to speak with specific person or department',
    examples: [
      'Can I speak to HR?',
      'Transfer me to the finance department',
      'I need to talk to someone in marketing',
      'Is John Smith available?',
    ],
  },
  employment: {
    description: 'Job applications, career inquiries',
    examples: [
      'Are you hiring?',
      'I want to apply for a job',
      'What positions are open?',
      'I submitted an application',
    ],
  },
  vendor: {
    description: 'Vendor or supplier related questions',
    examples: [
      'I\'m a food supplier',
      'I have a delivery',
      'I\'d like to become a vendor',
      'Who handles purchasing?',
    ],
  },
  visitor: {
    description: 'Visitor check-in or visit-related questions',
    examples: [
      'I\'m here for a meeting',
      'I have a visitor arriving',
      'What\'s the check-in process?',
      'Where should my guest go?',
    ],
  },
  complaint: {
    description: 'Issues, complaints, or problems',
    examples: [
      'I have a complaint',
      'There\'s a problem',
      'I\'m not satisfied',
      'This is unacceptable',
    ],
  },
  other: {
    description: 'Anything that doesn\'t fit other categories',
    examples: [
      'What is P.F. Chang\'s?',
      'Tell me about the company',
      'Random question',
    ],
  },
};

/**
 * Follow-up prompts for specific intents
 */
export const FOLLOW_UP_PROMPTS = {
  appointment: 'To schedule your appointment, I\'ll need your name, contact information, preferred date and time, and the purpose of your visit.',
  employment: 'For employment inquiries, I recommend visiting our careers page at pfchangs.com/careers, or I can transfer you to our HR department.',
  vendor: 'For vendor inquiries, I can connect you with our operations team. May I have your company name and what products or services you provide?',
  visitor: 'I\'d be happy to help with your visit. Do you have an appointment scheduled, or would you like to schedule one?',
};
