import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { AIRequest } from '@/types/ai';
import { getJuriesByIds } from '@/config/juries';
import { buildJurySystemPrompt, buildUserPrompt } from '@/config/prompts';

export const runtime = 'nodejs';

// Streams the jury deliberation back to the client as NDJSON
// (one JSON object per line: a "sides" line, one "juror" line per member,
// and a final "verdict" line — see config/prompts.ts for the protocol).
export async function POST(request: NextRequest) {
  try {
    const body: AIRequest = await request.json();
    const { question, juryIds, apiKey: rawApiKey, allowUndecided = false } = body;

    // The client sends '__env__' as a sentinel for the hosted key;
    // the real key is resolved here so it never leaves the server.
    let apiKey = rawApiKey;
    if (rawApiKey === '__env__') {
      const envKey = process.env.ANTHROPIC_API_KEY;
      if (!envKey) {
        return NextResponse.json(
          { error: 'Server is not configured with an API key. Contact the admin.' },
          { status: 500 }
        );
      }
      apiKey = envKey;
    }

    if (!question || typeof question !== 'string') {
      return NextResponse.json({ error: 'Missing required field: question' }, { status: 400 });
    }
    if (!juryIds || !Array.isArray(juryIds) || juryIds.length === 0) {
      return NextResponse.json(
        { error: 'Missing required field: juryIds (must be non-empty array)' },
        { status: 400 }
      );
    }
    if (!apiKey) {
      return NextResponse.json({ error: 'Missing required field: apiKey' }, { status: 400 });
    }
    if (!apiKey.startsWith('sk-ant-')) {
      return NextResponse.json(
        { error: 'Invalid API key format. Key should start with sk-ant-' },
        { status: 400 }
      );
    }

    const selectedJuries = getJuriesByIds(juryIds);
    if (selectedJuries.length === 0) {
      return NextResponse.json({ error: 'No valid jury members found' }, { status: 400 });
    }

    const client = new Anthropic({ apiKey });

    const stream = client.messages.stream({
      model: 'claude-opus-4-8',
      max_tokens: 16000,
      thinking: { type: 'adaptive' },
      system: buildJurySystemPrompt(selectedJuries, allowUndecided),
      messages: [{ role: 'user', content: buildUserPrompt(question) }],
    });

    const encoder = new TextEncoder();

    const ndjson = new ReadableStream<Uint8Array>({
      async start(controller) {
        // Buffer model text and forward only complete, valid JSON lines so the
        // client never has to handle partial JSON.
        let buffer = '';

        const flushLines = (final: boolean) => {
          const lines = buffer.split('\n');
          buffer = final ? '' : lines.pop() ?? '';
          for (const line of lines.concat(final && buffer ? [buffer] : [])) {
            const trimmed = line.trim();
            if (!trimmed) continue;
            try {
              JSON.parse(trimmed);
              controller.enqueue(encoder.encode(trimmed + '\n'));
            } catch {
              // Skip non-JSON noise (e.g. stray prose) rather than break the stream.
            }
          }
        };

        try {
          for await (const event of stream) {
            if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
              buffer += event.delta.text;
              flushLines(false);
            }
          }
          await stream.finalMessage();
          flushLines(true);
          controller.close();
        } catch (err) {
          const message =
            err instanceof Anthropic.APIError
              ? err.message
              : 'Failed to get response from Claude API';
          controller.enqueue(
            encoder.encode(JSON.stringify({ type: 'error', error: message }) + '\n')
          );
          controller.close();
        }
      },
    });

    return new Response(ndjson, {
      headers: {
        'Content-Type': 'application/x-ndjson; charset=utf-8',
        'Cache-Control': 'no-cache',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (error) {
    if (error instanceof Anthropic.APIError) {
      return NextResponse.json({ error: error.message }, { status: error.status ?? 500 });
    }
    console.error('Error in jury API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
