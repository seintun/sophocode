import { createOpenAI } from '@ai-sdk/openai';

const openaiBase = createOpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: (() => {
    const key = process.env.OPENROUTER_API_KEY;
    if (!key) {
      throw new Error('OPENROUTER_API_KEY is not set. Please check your environment variables.');
    }
    return key;
  })(),
});

// OpenRouter doesn't support the Responses API (v3 default).
// Force chat completions via .chat() so all routes stay on /v1/chat/completions.
export const openrouter = Object.assign((modelId: string) => openaiBase.chat(modelId), {
  chat: openaiBase.chat,
  completion: openaiBase.completion,
  responses: () => {
    throw new Error(
      'OpenRouter does not support the Responses API. Use .chat() or .completion() instead.',
    );
  },
  embedding: openaiBase.embedding,
  image: openaiBase.image,
  speech: openaiBase.speech,
});
