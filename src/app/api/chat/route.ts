import { systemPrompt } from "@/app/api/chat/prompt";
import { createOpenAI } from '@ai-sdk/openai';
import { CoreMessage } from "ai";
import { checkRateLimit } from "@/lib/rate-limiter";
import { prisma } from "@/lib/prisma";
import { LanguageModelV1Prompt, LanguageModelV1Message } from '@ai-sdk/provider';
import { verifyJWT } from '@/lib/jwt';

interface MessagePart {
  type: 'text' | 'image';
  text?: string;
  url?: string;
}

type ChatMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string | MessagePart[];
};

function extractCodeBlocks(content: string): string {
  const codeBlockRegex = /```[\s\S]*?```/g;
  const matches = content.match(codeBlockRegex);
  if (!matches) return '';
  return matches.join('\n');
}

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response('Unauthorized', { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const payload = await verifyJWT(token);
    if (!payload) {
      return new Response('Unauthorized', { status: 401 });
    }

    const chats = await prisma.chat.findMany({
      where: { userId: payload.id },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    return Response.json({ chats });
  } catch (error) {
    console.error('Error fetching chats:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response('Unauthorized', { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const payload = await verifyJWT(token);
    if (!payload) {
      return new Response('Unauthorized', { status: 401 });
    }

    const canProceed = await checkRateLimit(payload.id);
    if (!canProceed) {
      return new Response('Rate limit exceeded', { status: 429 });
    }

    const { messages }: { messages: ChatMessage[] } = await req.json();
    const slicedMessages = messages.slice(-5);

    const hasImageMessage = slicedMessages.some(msg => {
      if (Array.isArray(msg.content)) {
        return msg.content.some(item => item.type === 'image');
      }
      return false;
    });

    const formattedMessages: LanguageModelV1Message[] = slicedMessages.map(msg => {
      if (msg.role === 'system') {
        return {
          role: 'system',
          content: Array.isArray(msg.content)
            ? msg.content.map(part => part.type === 'text' ? part.text : '').join(' ')
            : msg.content as string
        };
      }

      if (msg.role === 'assistant') {
        const content = Array.isArray(msg.content)
          ? msg.content.map(part => {
              if (part.type === 'text') {
                return {
                  type: 'text' as const,
                  text: part.text || ''
                };
              }
              return {
                type: 'text' as const,
                text: ''
              };
            })
          : [{
              type: 'text' as const,
              text: msg.content as string
            }];

        return {
          role: 'assistant',
          content
        };
      }

      // User messages
      const content = Array.isArray(msg.content)
        ? msg.content.map(part => {
            if (part.type === 'text') {
              return {
                type: 'text' as const,
                text: part.text || ''
              };
            }
            if (part.type === 'image') {
              return {
                type: 'image' as const,
                image: new URL((part as any).source_url || ''),
                mimeType: 'image/jpeg'
              };
            }
            return {
              type: 'text' as const,
              text: ''
            };
          })
        : [{
            type: 'text' as const,
            text: msg.content as string
          }];

      return {
        role: 'user',
        content
      };
    });

    const lastMessage = slicedMessages[slicedMessages.length - 1];
    const lastMessageContent = typeof lastMessage.content === 'string' ?
      lastMessage.content :
      (lastMessage.content as MessagePart[])
        .filter(part => part.type === 'text')
        .map(part => part.text || '')
        .join('');

    const storedChat = await prisma.chat.create({
      data: {
        userId: payload.id,
        messages: JSON.stringify(slicedMessages.map(msg => ({
          role: msg.role,
          content: typeof msg.content === 'string' ? msg.content :
            Array.isArray(msg.content) ? (msg.content as MessagePart[])
              .filter(part => part.type === 'text')
              .map(part => part.text || '')
              .join('') : ''
        }))),
        code: extractCodeBlocks(lastMessageContent)
      }
    });

    // Mock OpenAI response for testing
    const mockResponse = {
      role: 'assistant',
      content: `Here's a simple Hello World program:

\`\`\`python
print("Hello, World!")
\`\`\`

This program will output "Hello, World!" to the console when run. Would you like me to explain how it works?`
    };

    // Store the chat in the database with mock response
    const chatMessages: ChatMessage[] = formattedMessages.map(msg => ({
      role: msg.role as 'user' | 'assistant' | 'system',
      content: typeof msg.content === 'string' ? msg.content :
        Array.isArray(msg.content) ? (msg.content as MessagePart[])
          .filter(part => part.type === 'text')
          .map(part => part.text || '')
          .join('') : ''
    }));

    const finalMessage: ChatMessage = {
      role: 'assistant',
      content: mockResponse.content
    };

    const chat = await prisma.chat.create({
      data: {
        userId: payload.id,
        messages: JSON.stringify([...chatMessages, finalMessage]),
        code: extractCodeBlocks(mockResponse.content)
      }
    });

    // Create a ReadableStream to simulate streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const chunks = mockResponse.content.split(' ');
        for (const chunk of chunks) {
          controller.enqueue(encoder.encode(chunk + ' '));
          await new Promise(resolve => setTimeout(resolve, 100)); // Simulate delay
        }
        controller.close();
      }
    });

    return new Response(stream);
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
