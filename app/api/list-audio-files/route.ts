import { NextRequest, NextResponse } from 'next/server';
import { readdir } from 'fs/promises';
import path from 'path';

const ALLOWED_FOLDERS = ['/sfx', '/music', '/fighting', '/gibberish', '/result'];
const AUDIO_EXTENSIONS = ['.mp3', '.wav', '.ogg', '.m4a'];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const folder = searchParams.get('folder');

    if (!folder) {
      return NextResponse.json({ error: 'folder parameter is required' }, { status: 400 });
    }

    // Validate folder path to prevent directory traversal
    if (!ALLOWED_FOLDERS.includes(folder)) {
      return NextResponse.json({ error: 'folder not allowed' }, { status: 403 });
    }

    const publicDir = path.join(process.cwd(), 'public', folder);
    const files = await readdir(publicDir);

    // Filter for audio files only
    const audioFiles = files
      .filter((file) => AUDIO_EXTENSIONS.some((ext) => file.toLowerCase().endsWith(ext)))
      .map((file) => `${folder}/${file}`)
      .sort();

    return NextResponse.json({ files: audioFiles });
  } catch (error) {
    console.error('Error listing audio files:', error);
    return NextResponse.json({ files: [] });
  }
}
