import { streamText, convertToModelMessages } from 'ai';
import { openrouter } from '@/lib/ai/provider';
import { MODELS } from '@/lib/ai/models';
import { buildCoachPrompt } from '@/lib/ai/prompts/coach';
import { buildInterviewerPrompt } from '@/lib/ai/prompts/interviewer';
import { handleApiError } from '@/lib/errors/api';
import { withRateLimit } from '@/lib/ratelimit';
import { type NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';

async function handler(req: NextRequest): Promise<Response> {
  try {
    if (!process.env.OPENROUTER_API_KEY) {
      return new Response('AI features temporarily unavailable', { status: 503 });
    }

    const body = await req.json();
    const { messages, mode, title, statement, pattern, difficulty, sessionId } = body;

    // Validate required fields
    const missingFields: string[] = [];
    if (!Array.isArray(messages)) missingFields.push('messages');
    if (!title || typeof title !== 'string') missingFields.push('title');
    if (!statement || typeof statement !== 'string') missingFields.push('statement');
    if (!pattern || typeof pattern !== 'string') missingFields.push('pattern');
    if (!difficulty || typeof difficulty !== 'string') missingFields.push('difficulty');

    if (missingFields.length > 0) {
      const errorMsg = `Missing required fields: ${missingFields.join(', ')}`;
      return new Response(JSON.stringify({ error: errorMsg, missingFields }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (mode !== 'coach' && mode !== 'interviewer') {
      return new Response('Invalid mode. Must be "coach" or "interviewer".', { status: 400 });
    }

    const promptInput = { title, statement, pattern, difficulty };
    const { system } =
      mode === 'coach' ? buildCoachPrompt(promptInput) : buildInterviewerPrompt(promptInput);

    const result = streamText({
      model: openrouter(MODELS.reasoning),
      system,
      messages: await convertToModelMessages(messages),
      onFinish: async ({ text }) => {
        if (!sessionId) return;

        try {
          // Save the last user message and the assistant message
          const lastUserMessage = messages[messages.length - 1];

          await prisma.$transaction([
            // Save USER message if it doesn't exist
            prisma.sessionMessage.create({
              data: {
                sessionId,
                role: 'USER',
                content: lastUserMessage.content,
              },
            }),
            // Save ASSISTANT response
            prisma.sessionMessage.create({
              data: {
                sessionId,
                role: 'ASSISTANT',
                content: text,
              },
            }),
          ]);
        } catch (err) {
          console.error('[api/ai/chat] Failed to persist messages:', err);
        }
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    return handleApiError(new Response('', { status: 500 }), error, 'POST /api/ai/chat');
  }
}

export const POST = withRateLimit(handler);
