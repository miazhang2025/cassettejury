import { CharacterDraft, RefinedCharacter } from '@/types/app';

/**
 * Convert draft character to slug for ID (e.g., "John Doe" -> "john")
 */
export function nameToId(name: string): string {
  return name
    .toLowerCase()
    .split(/\s+/)[0] // Take first word only
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 10); // Limit to 10 chars
}

/**
 * API call to refine character via Claude
 */
export async function refineCharacterWithClaude(
  draft: CharacterDraft,
  apiKey: string
): Promise<RefinedCharacter> {
  const systemPrompt = `You are an expert character designer. You're helping create a diverse cast of jury members for a satirical design feedback session. Based on a draft character concept, you will generate a complete, refined character profile.

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
    throw new Error(`Claude API error: ${error.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  const content = data.content[0].text;

  // Parse JSON response
  const refinedData = JSON.parse(content);

  return {
    id: refinedData.id || nameToId(draft.name),
    name: draft.name,
    pronouns: refinedData.pronouns || 'They/Them',
    age: draft.age || 30,
    location: refinedData.location || 'Undisclosed',
    profession: draft.profession || 'Undisclosed',
    bio: refinedData.bio || draft.bio,
    color: draft.color,
    silhouette: refinedData.silhouette || 'Blob-shaped presence',
  };
}

/**
 * API call to generate images via Google Gemini Nano (via Nano Banana)
 */
export async function generateImagesWithGeminiNano(
  character: RefinedCharacter,
  apiKey: string
): Promise<string[]> {
  const prompt = `This is the character concept of a blob jury scene. 

Character: ${character.name} (${character.profession})
Bio: ${character.bio}
Appearance: ${character.silhouette}
Color: ${character.color}

Generate a 3D claymation character in a clean background. The character should be blob-shaped and match the described appearance. Create 4 distinct visual variations of this same character, showing different expressions or poses. Make them suitable for a modern design jury scene.

Each image should be 1:1 square format, rendered in vibrant 3D claymation style.`;

  const response = await fetch('https://api.endpoints.antml.ai/text2img', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: prompt,
      num_images: 4,
      guidance_scale: 7.5,
      num_inference_steps: 30,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Gemini Nano API error: ${error.error || 'Unknown error'}`);
  }

  const data = await response.json();
  
  // Expected response format: { images: [base64_string, ...] } or { urls: [...] }
  if (data.images && Array.isArray(data.images)) {
    return data.images.map((img: string) =>
      img.startsWith('data:') ? img : `data:image/png;base64,${img}`
    );
  } else if (data.urls && Array.isArray(data.urls)) {
    return data.urls;
  } else {
    throw new Error('Unexpected response format from image generation API');
  }
}

/**
 * API call to generate 3D mesh via Tripo AI
 */
export async function generateMeshWithTripoAI(
  imageUrl: string,
  character: RefinedCharacter,
  apiKey: string
): Promise<{ glbUrl: string }> {
  const response = await fetch('https://api.tripo.ai/v1/requests', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model_version: 'default',
      input: {
        image_url: imageUrl,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Tripo AI API error: ${error.error || 'Unknown error'}`);
  }

  const data = await response.json();

  // Tripo AI returns a request ID; we'd need to poll for completion
  // For now, return the request ID as a placeholder
  if (data.data?.result?.model?.[0]) {
    return {
      glbUrl: data.data.result.model[0],
    };
  } else {
    throw new Error('No model data in Tripo AI response');
  }
}

/**
 * Format character object as TypeScript code for juries.ts
 */
export function formatCharacterAsTypeScript(character: RefinedCharacter): string {
  return `{
    id: '${character.id}',
    name: '${character.name}',
    pronouns: '${character.pronouns}',
    age: ${character.age},
    location: '${character.location}',
    profession: '${character.profession}',
    bio: '${character.bio.replace(/'/g, "\\'")}',
    color: '${character.color}',
    silhouette: '${character.silhouette.replace(/'/g, "\\'")}',
    voiceProfile: 'To be determined',
  }`;
}
