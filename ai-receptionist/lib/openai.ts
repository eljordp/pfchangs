import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  console.warn('Warning: OPENAI_API_KEY not set. AI features will not work.');
}

export const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  : null;

// Use GPT-4 Turbo for fast, intelligent responses
export const AI_MODEL = 'gpt-4-turbo';

// Alternative: Use GPT-4o for even faster responses
// export const AI_MODEL = 'gpt-4o';
