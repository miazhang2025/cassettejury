export interface StyleAnchor {
  version: string;
  rendering_style: string;
  lighting: string;
  color_palette: string;
  character_framing: string;
  prohibited_elements: string[];
  reference_prompts: string[];
  last_updated: string;
}

export const defaultStyleAnchor: StyleAnchor = {
  version: '1.0.0',
  rendering_style:
    'Claymation-inspired 3D blob characters with soft, rounded forms. Matte finish with subtle depth. Stylized cartoon aesthetic with expressive features.',
  lighting:
    'Warm, diffused overhead lighting with soft shadows. Golden hour color temperature. No harsh shadows or dramatic contrast.',
  color_palette:
    'Vibrant, saturated colors with complementary harmony. Primary colors are bold but not neon. Background colors should be muted to make characters pop.',
  character_framing:
    '3/4 view angle, centered composition. Character should fill 60-70% of frame. Neutral or subtle gradient background. Full body or bust shot.',
  prohibited_elements: ['photorealism', 'harsh shadows', 'complex backgrounds', 'CGI realism', 'anime style', 'pixel art'],
  reference_prompts: [
    'A claymation-style blob character with vibrant color, expressive cartoon eyes, warm lighting, centered composition, neutral background.',
  ],
  last_updated: new Date().toISOString(),
};
