import { NextRequest, NextResponse } from 'next/server';
import { CharacterDraft } from '@/types/app';

interface RefineRequestBody {
  draft: CharacterDraft;
  apiKey: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: RefineRequestBody = await request.json();
    const { draft, apiKey } = body;

    if (!apiKey) {
      return NextResponse.json({ message: 'API key is required' }, { status: 400 });
    }

    // Fetch the current Style Anchor
    let styleAnchor: any = null;
    try {
      const styleAnchorResponse = await fetch(
        `${process.env.NODE_ENV === 'production' ? 'https://' + request.headers.get('host') : 'http://localhost:3000'}/api/admin/style-anchor`
      );
      if (styleAnchorResponse.ok) {
        styleAnchor = await styleAnchorResponse.json();
      }
    } catch (styleError) {
      console.warn('Could not fetch style anchor:', styleError);
    }

    // Build the system prompt with Style Anchor injection
    let systemPrompt = `You are an expert character designer. You're helping create a diverse cast of jury members for a satirical design feedback session. Based on a draft character concept, you will generate a complete, refined character profile.

Return ONLY a valid JSON object with this exact structure (no markdown, no extra text):
{
  "id": "slug-based-id",
  "pronouns": "She/Her, He/Him, They/Them, etc",
  "location": "City, Country",
  "silhouette": "Brief visual description of blob shape and presence",
  "bio": "Expanded bio (2-3 sentences)"
}

Rules:
- ID must be a lowercase slug (max 10 chars), derived from the first name
- Generate pronouns based on the user's input gender (or make a choice if not provided)
- Create a location that fits the character's profession
- Silhouette should describe a blob character's visual appearance (shape, posture, size, presence)
- Keep bio vivid and personality-driven`;

    // Inject Style Anchor constraints if available
    if (styleAnchor) {
      systemPrompt += `

STYLE ANCHOR (follow these rules strictly):
RENDERING STYLE: ${styleAnchor.rendering_style}

LIGHTING: ${styleAnchor.lighting}

COLOR PALETTE: ${styleAnchor.color_palette}

CHARACTER FRAMING: ${styleAnchor.character_framing}

PROHIBITED ELEMENTS (never include): ${styleAnchor.prohibited_elements.join(', ')}

REFERENCE STYLE (ensure similarity to these approved styles):
${styleAnchor.reference_prompts.join('\n')}`;
    }

    const userPrompt = `Create a refined character profile based on this draft:
Name: ${draft.name}
${draft.age ? `Age: ${draft.age}` : ''}
${draft.profession ? `Profession: ${draft.profession}` : ''}
${draft.gender ? `Gender/Pronouns: ${draft.gender}` : ''}
Bio: ${draft.bio}
Color: ${draft.color}`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-1-20250805',
        max_tokens: 1000,
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
      const error = await response.json();
      return NextResponse.json(
        { message: `Claude API error: ${error.error?.message || 'Unknown error'}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const content = data.content[0].text;

    // Parse JSON response
    const refinedData = JSON.parse(content);

    return NextResponse.json(
      {
        id: refinedData.id || draft.name.toLowerCase().split(' ')[0],
        name: draft.name,
        pronouns: refinedData.pronouns || 'They/Them',
        age: draft.age || 30,
        location: refinedData.location || 'Undisclosed',
        profession: draft.profession || 'Undisclosed',
        bio: refinedData.bio || draft.bio,
        color: draft.color,
        silhouette: refinedData.silhouette || 'Blob-shaped presence',
        style_version: styleAnchor?.version || 'default',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Refine character error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return NextResponse.json(
      { message: `Failed to refine character: ${errorMessage}` },
      { status: 500 }
    );
  }
}
