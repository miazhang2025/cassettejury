import { NextRequest, NextResponse } from 'next/server';
import { RefinedCharacter } from '@/types/app';

interface MeshRequestBody {
  imageUrl: string;
  character: RefinedCharacter;
  apiKey: string;
  model?: 'fast' | 'quality' | 'ultra';
}

export async function POST(request: NextRequest) {
  try {
    const body: MeshRequestBody = await request.json();
    const { imageUrl, character, apiKey, model = 'fast' } = body;

    if (!apiKey) {
      return NextResponse.json({ message: 'API key is required' }, { status: 400 });
    }

    if (!imageUrl) {
      return NextResponse.json({ message: 'Image URL is required' }, { status: 400 });
    }

    // Generate a GLB blob model
    const glbData = generateSimpleGLBBlob(character, model);
    const glbBase64 = glbData.toString('base64');
    const glbUrl = `data:model/gltf-binary;base64,${glbBase64}`;

    return NextResponse.json(
      {
        glbUrl,
        fileName: `${character.id}-model-${model}.glb`,
        message: `3D mesh generated successfully (${model} quality)`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Generate mesh error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return NextResponse.json(
      { message: `Failed to generate mesh: ${errorMessage}` },
      { status: 500 }
    );
  }
}

/**
 * Generate a simple GLB (GLTF Binary) file with a blob shape
 * Creates a basic sphere mesh that can be previewed in 3D viewers
 */
function generateSimpleGLBBlob(character: RefinedCharacter, quality: 'fast' | 'quality' | 'ultra' = 'fast'): Buffer {
  // Create vertices for a blob/sphere shape
  const vertices = createBlobVertices(quality);
  const indices = createBlobIndices(vertices.length);
  const color = hexToRgb(character.color) || { r: 100, g: 150, b: 200 };

  // Create a simple GLB structure
  const glbBuffer = createGLB(vertices, indices, color);
  return glbBuffer;
}

/**
 * Create blob mesh vertices based on quality level
 */
function createBlobVertices(quality: 'fast' | 'quality' | 'ultra'): Float32Array {
  const subdivisions = quality === 'fast' ? 3 : quality === 'quality' ? 4 : 5;
  const radius = 1;
  const vertices: number[] = [];

  // Generate icosphere vertices
  const phi = Math.PI * (3 - Math.sqrt(5)); // golden angle in radians

  for (let i = 0; i < 12 * Math.pow(4, subdivisions - 1); i++) {
    const y = 1 - (i / (12 * Math.pow(4, subdivisions - 1) - 1)) * 2;
    const radiusAtY = Math.sqrt(1 - y * y);

    const theta = phi * i;

    const x = Math.cos(theta) * radiusAtY;
    const z = Math.sin(theta) * radiusAtY;

    // Add some blob-like deformation
    const deformation = 0.1 * Math.sin(i * 0.5);
    vertices.push(x * (radius + deformation), y * radius, z * (radius + deformation));
  }

  return new Float32Array(vertices);
}

/**
 * Create indices for blob mesh
 */
function createBlobIndices(vertexCount: number): Uint16Array {
  const indices: number[] = [];

  // Simple triangle fan from center
  const centerIdx = vertexCount - 1;

  for (let i = 0; i < vertexCount - 1; i++) {
    const next = (i + 1) % (vertexCount - 1);
    indices.push(centerIdx, i, next);
  }

  return new Uint16Array(indices);
}

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Create a GLB file buffer from mesh data
 */
function createGLB(vertices: Float32Array, indices: Uint16Array, color: { r: number; g: number; b: number }): Buffer {
  // GLB structure:
  // 12 byte header
  // JSON chunk
  // BIN chunk

  // Create vertex colors
  const colors = new Uint8Array(vertices.length);
  for (let i = 0; i < colors.length; i += 3) {
    colors[i] = color.r;
    colors[i + 1] = color.g;
    colors[i + 2] = color.b;
  }

  // Create binary data
  const verticesBuffer = Buffer.from(vertices);
  const indicesBuffer = Buffer.from(indices);
  const colorsBuffer = Buffer.from(colors);

  // Combine all binary data
  const binData = Buffer.concat([verticesBuffer, indicesBuffer, colorsBuffer]);

  // Create JSON chunk (glTF structure)
  const gltf = {
    asset: { version: '2.0' },
    scene: 0,
    scenes: [{ nodes: [0] }],
    nodes: [{ mesh: 0 }],
    meshes: [
      {
        primitives: [
          {
            attributes: {
              POSITION: 0,
              COLOR_0: 2,
            },
            indices: 1,
            mode: 4, // TRIANGLES
          },
        ],
      },
    ],
    accessors: [
      {
        bufferView: 0,
        componentType: 5126, // FLOAT
        count: vertices.length / 3,
        type: 'VEC3',
        min: [-1.2, -1.2, -1.2],
        max: [1.2, 1.2, 1.2],
      },
      {
        bufferView: 1,
        componentType: 5125, // UNSIGNED_INT
        count: indices.length,
        type: 'SCALAR',
      },
      {
        bufferView: 2,
        componentType: 5121, // UNSIGNED_BYTE
        count: colors.length / 3,
        type: 'VEC3',
        normalized: true,
      },
    ],
    bufferViews: [
      {
        buffer: 0,
        byteOffset: 0,
        byteLength: verticesBuffer.length,
        target: 34962, // ARRAY_BUFFER
      },
      {
        buffer: 0,
        byteOffset: verticesBuffer.length,
        byteLength: indicesBuffer.length,
        target: 34963, // ELEMENT_ARRAY_BUFFER
      },
      {
        buffer: 0,
        byteOffset: verticesBuffer.length + indicesBuffer.length,
        byteLength: colorsBuffer.length,
        target: 34962, // ARRAY_BUFFER
      },
    ],
    buffers: [{ byteLength: binData.length }],
  };

  const jsonString = JSON.stringify(gltf);
  const jsonBuffer = Buffer.from(jsonString, 'utf8');

  // Pad JSON to 4-byte boundary
  const jsonPadded = Buffer.alloc(Math.ceil(jsonBuffer.length / 4) * 4);
  jsonBuffer.copy(jsonPadded);

  // Create header
  const header = Buffer.alloc(12);
  header.writeUInt32LE(0x46546c67, 0); // 'glTF'
  header.writeUInt32LE(2, 4); // Version 2
  header.writeUInt32LE(12 + 8 + jsonPadded.length + 8 + binData.length, 8); // Total size

  // Create JSON chunk header
  const jsonChunkHeader = Buffer.alloc(8);
  jsonChunkHeader.writeUInt32LE(jsonPadded.length, 0);
  jsonChunkHeader.writeUInt32LE(0x4e4f534a, 4); // 'JSON'

  // Create BIN chunk header
  const binChunkHeader = Buffer.alloc(8);
  binChunkHeader.writeUInt32LE(binData.length, 0);
  binChunkHeader.writeUInt32LE(0x004e4942, 4); // 'BIN'

  // Combine all parts
  return Buffer.concat([header, jsonChunkHeader, jsonPadded, binChunkHeader, binData]);
}

// Helper endpoint to check mesh generation status (for future polling)
export async function GET(request: NextRequest) {
  try {
    const requestId = request.nextUrl.searchParams.get('requestId');

    if (!requestId) {
      return NextResponse.json(
        { message: 'Request ID is required' },
        { status: 400 }
      );
    }

    // Return mock completed status
    return NextResponse.json(
      {
        status: 'completed',
        requestId,
        message: 'Mesh generation complete!',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Check mesh status error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return NextResponse.json(
      { message: `Failed to check mesh status: ${errorMessage}` },
      { status: 500 }
    );
  }
}
