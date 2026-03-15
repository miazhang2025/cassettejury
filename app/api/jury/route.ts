import { NextRequest, NextResponse } from 'next/server';
import { AIRequest, AIResponse } from '@/types/ai';
import { juries, getJuriesByIds } from '@/config/juries';
import { buildJurySystemPrompt, buildUserPrompt } from '@/config/prompts';

export async function POST(request: NextRequest) {
  try {
    const body: AIRequest = await request.json();
    console.log('API /jury received request body:', body);
    
    const { question, juryIds, apiKey } = body;

    // Validate required fields
    console.log('Validation check:');
    console.log('- question present:', !!question, 'value:', question);
    console.log('- juryIds present:', !!juryIds, 'isArray:', Array.isArray(juryIds), 'length:', juryIds?.length);
    console.log('- apiKey present:', !!apiKey);
    
    if (!question) {
      console.log('VALIDATION FAILED: Missing question');
      return NextResponse.json(
        { error: 'Missing required field: question' },
        { status: 400 }
      );
    }
    
    if (!juryIds || !Array.isArray(juryIds) || juryIds.length === 0) {
      console.log('VALIDATION FAILED: Missing or empty juryIds');
      return NextResponse.json(
        { error: 'Missing required field: juryIds (must be non-empty array)' },
        { status: 400 }
      );
    }
    
    if (!apiKey) {
      console.log('VALIDATION FAILED: Missing apiKey');
      return NextResponse.json(
        { error: 'Missing required field: apiKey' },
        { status: 400 }
      );
    }

    if (!apiKey.startsWith('sk-ant-')) {
      console.log('VALIDATION FAILED: Invalid API key format');
      return NextResponse.json(
        { error: 'Invalid API key format. Key should start with sk-ant-' },
        { status: 400 }
      );
    }

    console.log('All validations passed. Processing request...');

    // Get selected jury members
    const selectedJuries = getJuriesByIds(juryIds);

    if (selectedJuries.length === 0) {
      return NextResponse.json(
        { error: 'No valid jury members found' },
        { status: 400 }
      );
    }

    // Build prompts
    const systemPrompt = buildJurySystemPrompt(selectedJuries);
    const userPrompt = buildUserPrompt(question);

    // Call Anthropic Claude API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-1-20250805',
        max_tokens: 2000,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Anthropic API error response:', response.status, errorText);
      
      let errorMessage = 'Failed to get response from Claude API';
      
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.error?.message) {
          errorMessage = errorJson.error.message;
        }
      } catch (e) {
        // If it's not JSON, just use the text in details
      }
      
      return NextResponse.json(
        { 
          error: errorMessage,
          status: response.status,
          details: errorText.length < 500 ? errorText : 'See server logs for full error'
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Extract the JSON response from Claude
    const content = data.content[0].text;

    // Parse the JSON response
    let parsedResponse: AIResponse;
    try {
      parsedResponse = JSON.parse(content);
    } catch (e) {
      console.error('Failed to parse Claude response as JSON:', content);
      return NextResponse.json(
        { error: 'Failed to parse Claude response', details: content },
        { status: 500 }
      );
    }

    return NextResponse.json(parsedResponse);
  } catch (error) {
    console.error('Error in jury API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
