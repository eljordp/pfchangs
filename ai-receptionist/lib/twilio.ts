import twilio from 'twilio';

if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
  console.warn('Warning: Twilio credentials not set. Voice features will not work.');
}

export const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

/**
 * Validates that a request actually came from Twilio
 * @param url The full URL that Twilio called
 * @param params The POST parameters from the request
 * @param signature The X-Twilio-Signature header value
 * @returns true if the request is valid, false otherwise
 */
export function validateTwilioRequest(
  url: string,
  params: Record<string, any>,
  signature: string
): boolean {
  if (!process.env.TWILIO_AUTH_TOKEN) {
    console.error('Cannot validate Twilio request: TWILIO_AUTH_TOKEN not set');
    return false;
  }

  return twilio.validateRequest(
    process.env.TWILIO_AUTH_TOKEN,
    signature,
    url,
    params
  );
}

/**
 * Creates TwiML response for gathering speech input
 * @param message The message to say to the caller
 * @param gatherUrl The URL to post the gathered input to
 * @returns TwiML XML string
 */
export function createGatherTwiML(message: string, gatherUrl: string): string {
  const response = new twilio.twiml.VoiceResponse();

  const gather = response.gather({
    input: ['speech'],
    speechTimeout: 'auto',
    speechModel: 'phone_call',
    enhanced: true,
    action: gatherUrl,
    method: 'POST',
  });

  gather.say({
    voice: 'Polly.Joanna',
    language: 'en-US',
  }, message);

  // If no input received, repeat the message
  response.say({
    voice: 'Polly.Joanna',
    language: 'en-US',
  }, "I didn't receive any input. Please try again.");

  response.redirect(gatherUrl);

  return response.toString();
}

/**
 * Creates TwiML response with a simple message
 * @param message The message to say
 * @returns TwiML XML string
 */
export function createSayTwiML(message: string): string {
  const response = new twilio.twiml.VoiceResponse();
  response.say({
    voice: 'Polly.Joanna',
    language: 'en-US',
  }, message);
  return response.toString();
}

/**
 * Creates TwiML response that hangs up the call
 * @param goodbye Optional goodbye message
 * @returns TwiML XML string
 */
export function createHangupTwiML(goodbye?: string): string {
  const response = new twilio.twiml.VoiceResponse();
  if (goodbye) {
    response.say({
      voice: 'Polly.Joanna',
      language: 'en-US',
    }, goodbye);
  }
  response.hangup();
  return response.toString();
}
