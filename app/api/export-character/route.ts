import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { RefinedCharacter } from '@/types/app';

interface ExportRequestBody {
  character: RefinedCharacter;
  imageUrl: string;
  meshUrl: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ExportRequestBody = await request.json();
    const { character, imageUrl, meshUrl } = body;

    // Validate character object
    if (!character.id || !character.name || !character.bio || !character.color) {
      return NextResponse.json(
        { message: 'Invalid character data. Missing required fields.' },
        { status: 400 }
      );
    }

    // Path to juries.ts
    const juriesPath = path.join(process.cwd(), 'config', 'juries.ts');

    // Read current juries.ts
    let juriesContent = fs.readFileSync(juriesPath, 'utf-8');

    // Create the new character object as TypeScript code
    const newCharacterCode = `  {
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
  },`;

    // Find the position to insert (before the closing bracket of the array)
    const lastCommaIndex = juriesContent.lastIndexOf('  },');
    if (lastCommaIndex === -1) {
      throw new Error('Could not parse juries.ts structure');
    }

    // Insert after the last character object
    const insertPosition = juriesContent.indexOf('\n', lastCommaIndex) + 1;
    const updatedContent =
      juriesContent.slice(0, insertPosition) + newCharacterCode + juriesContent.slice(insertPosition);

    // Write back to juries.ts
    fs.writeFileSync(juriesPath, updatedContent, 'utf-8');

    // Optionally: Save generated assets
    // For now, we'll just acknowledge they exist
    console.log(`Character exported: ${character.id}`);
    console.log(`Image URL: ${imageUrl}`);
    console.log(`Mesh URL: ${meshUrl}`);

    return NextResponse.json(
      {
        message: `Character "${character.name}" has been successfully added to juries.ts!`,
        character,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Export error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return NextResponse.json(
      {
        message: `Failed to export character: ${errorMessage}`,
      },
      { status: 500 }
    );
  }
}
