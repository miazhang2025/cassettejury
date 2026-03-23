import { NextRequest, NextResponse } from 'next/server';
import { RefinedCharacter } from '@/types/app';

interface ImagesRequestBody {
  character: RefinedCharacter;
  apiKey: string;
}

const MOOD_PROMPTS = [
  'Create a cute claymation-style character blob with a happy, smiling expression. The character should have expressive, friendly eyes and a warm, inviting appearance. Use rounded, soft shapes. Professional digital art style.',
  'Create a cute claymation-style character blob with a confident, approachable expression. The character should have bright eyes and an assured, friendly appearance. Use rounded, soft shapes. Professional digital art style.',
];

export async function POST(request: NextRequest) {
  try {
    const body: ImagesRequestBody = await request.json();
    const { character, apiKey } = body;

    if (!apiKey) {
      return NextResponse.json({ message: 'API key is required' }, { status: 400 });
    }

    const images: string[] = [];
    let fallbackToSvg = false;

    // Try to generate real images using Google Gemini 3.1 Flash Image Preview
    for (let i = 0; i < 2; i++) {
      try {
        const prompt = MOOD_PROMPTS[i];
        const colorDescription = character.color || '#6366f1';

        const fullPrompt = `${prompt} Color palette should be dominated by ${colorDescription}. Character should look like a blob/orb with a sclaymation aesthetic in a clean background. `;

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: fullPrompt,
                    },
                  ],
                },
              ],
            }),
          }
        );

        if (!response.ok) {
          console.warn(`Gemini API response not OK for image ${i + 1}: ${response.status}`);
          fallbackToSvg = true;
          break;
        }

        const data = await response.json();

        if (data.candidates?.[0]?.content?.parts?.[0]?.inlineData) {
          const inlineData = data.candidates[0].content.parts[0].inlineData;
          const base64Image = inlineData.data;
          const mimeType = inlineData.mime_type || 'image/png';
          images.push(`data:${mimeType};base64,${base64Image}`);
        } else {
          console.warn(`No inlineData in Gemini response for image ${i + 1}`);
          fallbackToSvg = true;
          break;
        }
      } catch (error) {
        console.warn(`Error generating image ${i + 1} with Gemini:`, error);
        fallbackToSvg = true;
        break;
      }
    }

    // Fallback to SVG if Gemini API fails or returns unexpected format
    if (fallbackToSvg || images.length === 0) {
      console.log('Falling back to SVG placeholder images');
      images.length = 0; // Clear partial results
      for (let i = 0; i < 2; i++) {
        images.push(generateClayImage(character.color, String(i + 1), character.name));
      }
    }

    return NextResponse.json({ images }, { status: 200 });
  } catch (error) {
    console.error('Generate images error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return NextResponse.json(
      { message: `Failed to generate images: ${errorMessage}` },
      { status: 500 }
    );
  }
}

/**
 * Generate a claymation-style SVG blob character
 * Replace with actual image generation API in production
 */
function generateClayImage(color: string, variant: string, name: string): string {
  const positions = [
    { x: 512, y: 480 }, // Neutral
    { x: 520, y: 450 }, // Slightly up
    { x: 490, y: 520 }, // Slightly down
    { x: 540, y: 480 }, // Slightly right
  ];

  const pos = positions[parseInt(variant) - 1] || positions[0];

  const eyeOffsets = [
    { l: 20, r: 20 }, // Eyes wide
    { l: 15, r: 15 }, // Eyes normal
    { l: 25, r: 25 }, // Eyes squinted
    { l: 18, r: 18 }, // Eyes confused
  ];

  const eyes = eyeOffsets[parseInt(variant) - 1] || eyeOffsets[0];

  const mouthPaths = [
    'M 480 560 Q 512 590 540 560', // Happy smile
    'M 480 550 Q 512 580 540 550', // Neutral
    'M 480 570 Q 512 560 540 570', // Angry frown
    'M 475 560 Q 512 565 545 560', // Smirk
  ];

  const mouth = mouthPaths[parseInt(variant) - 1] || mouthPaths[0];

  const rgb = hexToRgb(color);
  const lighter = rgb 
    ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.6)` 
    : 'rgba(100,150,200,0.6)';
  const darker = rgb 
    ? `rgba(${Math.max(0, rgb.r - 30)}, ${Math.max(0, rgb.g - 30)}, ${Math.max(0, rgb.b - 30)}, 0.9)` 
    : 'rgba(50,80,150,0.9)';

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="1024" height="1024" fill="#F5F5F2"/>
  
  <!-- Soft shadow -->
  <ellipse cx="512" cy="750" rx="320" ry="60" fill="rgba(0,0,0,0.1)"/>
  
  <!-- Main blob body with 3D effect -->
  <defs>
    <radialGradient id="blobGrad" cx="35%" cy="35%">
      <stop offset="0%" style="stop-color:${lighter};stop-opacity:1" />
      <stop offset="70%" style="stop-color:${color};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${darker};stop-opacity:1" />
    </radialGradient>
    <filter id="claySmoothness" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="2"/>
    </filter>
  </defs>
  
  <!-- Blob shape (organic, rounded) -->
  <path d="M 512 200 Q 650 220 680 350 Q 700 450 650 580 Q 600 680 512 700 Q 420 680 380 580 Q 330 450 350 350 Q 380 220 512 200 Z" 
        fill="url(#blobGrad)" filter="url(#claySmoothness)"/>
  
  <!-- Left side shading for depth -->
  <path d="M 400 320 Q 360 380 370 480 Q 380 520 420 560" 
        fill="none" stroke="rgba(0,0,0,0.15)" stroke-width="40" stroke-linecap="round"/>
  
  <!-- Eyes - white background -->
  <circle cx="${pos.x - eyes.l}" cy="450" r="45" fill="white" opacity="0.9"/>
  <circle cx="${pos.x + eyes.r}" cy="450" r="45" fill="white" opacity="0.9"/>
  
  <!-- Eyes - pupils -->
  <circle cx="${pos.x - eyes.l}" cy="460" r="24" fill="#1a1a1a"/>
  <circle cx="${pos.x + eyes.r}" cy="460" r="24" fill="#1a1a1a"/>
  
  <!-- Eyes - highlights -->
  <circle cx="${pos.x - eyes.l - 8}" cy="450" r="10" fill="white" opacity="0.7"/>
  <circle cx="${pos.x + eyes.r - 8}" cy="450" r="10" fill="white" opacity="0.7"/>
  
  <!-- Mouth -->
  <path d="${mouth}" stroke="#1a1a1a" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  
  <!-- Variant number indicator -->
  <text x="512" y="950" font-size="28" font-family="Arial, sans-serif" text-anchor="middle" fill="#888" font-weight="bold">
    Variation ${variant}
  </text>
</svg>`;

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

function hexToRgb(color: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}
