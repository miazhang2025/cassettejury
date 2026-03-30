import { NextRequest, NextResponse } from 'next/server';
import { StyleAnchor, defaultStyleAnchor } from '@/config/styleAnchor';
import fs from 'fs';
import path from 'path';

const STYLE_ANCHOR_PATH = path.join(process.cwd(), 'public', 'style-anchor.json');

function getStyleAnchor(): StyleAnchor {
  try {
    if (fs.existsSync(STYLE_ANCHOR_PATH)) {
      const data = fs.readFileSync(STYLE_ANCHOR_PATH, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading style anchor:', error);
  }
  return defaultStyleAnchor;
}

export async function GET() {
  try {
    const styleAnchor = getStyleAnchor();
    return NextResponse.json(styleAnchor, { status: 200 });
  } catch (error) {
    console.error('Get style anchor error:', error);
    return NextResponse.json(
      { message: 'Failed to get style anchor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const styleAnchor: StyleAnchor = await request.json();

    // Validate required fields
    if (
      !styleAnchor.version ||
      !styleAnchor.rendering_style ||
      !styleAnchor.lighting ||
      !styleAnchor.color_palette ||
      !styleAnchor.character_framing ||
      !Array.isArray(styleAnchor.prohibited_elements) ||
      !Array.isArray(styleAnchor.reference_prompts)
    ) {
      return NextResponse.json(
        { message: 'Invalid style anchor format' },
        { status: 400 }
      );
    }

    // Add timestamp
    const updatedAnchor = {
      ...styleAnchor,
      last_updated: new Date().toISOString(),
    };

    // Ensure directory exists
    const dir = path.dirname(STYLE_ANCHOR_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Write to file
    fs.writeFileSync(STYLE_ANCHOR_PATH, JSON.stringify(updatedAnchor, null, 2));

    return NextResponse.json(
      { 
        message: 'Style anchor updated successfully',
        styleAnchor: updatedAnchor
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Save style anchor error:', error);
    return NextResponse.json(
      { message: 'Failed to save style anchor' },
      { status: 500 }
    );
  }
}
