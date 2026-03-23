# Character Generator Admin Tool

This is a multi-step art development pipeline for creating new jury member characters. The tool guides you through character creation, AI refinement, image generation, 3D modeling, and automatic integration into the app.

## Access

The character generator is located at: **`/admin/character-generator`**

## Setup (Required Before Use)

### 1. Configure API Keys

Edit `.env.local` and add your API keys. All three are required:

```bash
NEXT_PUBLIC_CLAUDE_API_KEY=sk-ant-your_claude_key_here
NEXT_PUBLIC_GOOGLE_NANO_BANANA_KEY=your_google_gemini_api_key_here
NEXT_PUBLIC_TRIPO_AI_KEY=your_tripo_ai_api_key_here
```

**How to get each key:**

- **Claude API Key**: Visit [console.anthropic.com](https://console.anthropic.com) → API Keys → Create new key
  - Should start with `sk-ant-`
  - Used for character refinement and bio expansion

- **Google Gemini Nano API Key**: Visit [Google Cloud Console](https://console.cloud.google.com)
  - Enable the Imagen/Gemini API
  - Create API credentials
  - Used for generating 4 character images via Nano Banana endpoint

- **Tripo AI API Key**: Visit [Tripo AI Platform](https://www.tripo3d.ai)
  - Sign up or log in
  - Get API key from dashboard
  - Used for converting images to 3D models with 5000 polycount

### 2. Start Development Server

```bash
npm run dev
```

Visit: `http://localhost:3000/admin/character-generator`

---

## Workflow

### Step 1: Draft Character
**What you do:** Fill in basic character information
- **Name** (required): Full name of your character
- **Age** (optional): Numeric age
- **Profession** (optional): Job title or role
- **Gender/Pronouns** (optional): Free text (e.g., "She/Her", "They/Them")
- **Bio** (required): 1-2 sentence description of personality, expertise, quirks
- **Color** (required): Hex color code for the blob character (color picker provided)

**Example:**
```
Name: Riley Chen
Age: 28
Profession: Data Scientist & Skeptic
Gender: They/Them
Bio: Obsessed with data-driven insights and finding flaws in logic. Can't make a decision without a spreadsheet.
Color: #FF6B35
```

### Step 2: Refine with Claude
**What it does:** Claude AI enhances your character with:
- **ID**: Auto-generated slug (e.g., "riley" from "Riley Chen")
- **Pronouns**: Generated based on your input
- **Location**: Created to fit the character's profession
- **Silhouette**: Visual description of the blob shape (posture, size, expression)
- **Bio**: Expanded version maintaining tone/personality

**What you can do:** Review and manually edit any field

### Step 3: Generate Images
**What it does:** Google Gemini Nano creates 4 variations of your character as claymation 3D renders
- **Style**: Vibrant 3D claymation in clean background
- **Format**: 1024×1024 square images
- **Variations**: 4 distinct poses/expressions
- **Time**: Usually 30-60 seconds

**What you can do:** Regenerate images or proceed with the current set

### Step 4: Select Image
**What you do:** Choose your favorite image from the 4 generated
- Click on the image you prefer (shows "✓ Selected" overlay)
- This image will be used for 3D model generation

### Step 5: Generate 3D Mesh
**What it does:** Tripo AI converts your selected image into a 3D model
- **Format**: GLB (GLTF Binary) model file
- **Topology**: Smart mesh with ~5000 polygons
- **Texture**: Auto-generated from the source image
- **Time**: Usually 2-5 minutes

**What you can do:** Regenerate if needed, or proceed

### Step 6: Final Review & Export
**What you see:** Complete character profile with:
- All generated data fields
- Selected character image
- 3D model info (polycount, format, status)
- TypeScript code preview

**What you can do:**
- **Copy Code**: Copy the TypeScript object to clipboard
- **Download JSON**: Download character data as JSON file
- **Add to juries.ts**: Auto-export character to the active jury list
- **Create Another**: Reset and start over

---

## Output

When you click "Add to juries.ts", the character is automatically added to `/config/juries.ts` and becomes immediately available in:
- Jury selector on the landing page
- Jury experience scene
- Any feature that uses `getJuryById()` or `getJuriesByIds()`

**Character Template Added:**
```typescript
{
  id: 'riley',
  name: 'Riley Chen',
  pronouns: 'They/Them',
  age: 28,
  location: 'San Francisco',
  profession: 'Data Scientist & Skeptic',
  bio: 'Obsessed with data-driven insights and finding flaws in logic. Can\'t make a decision without a spreadsheet.',
  color: '#FF6B35',
  silhouette: 'Compact, precise. Slightly pointed top.',
  voiceProfile: 'To be determined', // Manually add later if needed
}
```

**Note:** `voiceProfile` is set to "To be determined" and should be manually edited to match the character's speaking style.

---

## Generated Assets

After export, the following are created/stored:
- **Character data**: Appended to `/config/juries.ts`
- **Images**: Referenced from Google Gemini Nano API (URL-based, not stored locally)
- **3D Model**: Stored via Tripo AI (URL-based link provided)

---

## Troubleshooting

### "API key not configured" Error
- Check `.env.local` file exists in project root
- Ensure keys are prefixed with `NEXT_PUBLIC_`
- Restart dev server after adding keys

### Claude Refinement Fails
- Verify Claude API key starts with `sk-ant-`
- Check your Anthropic account has available API quota
- Try refreshing and refining again

### Image Generation Times Out
- Google Gemini Nano can take 30-60 seconds
- Check internet connection
- Verify `NEXT_PUBLIC_GOOGLE_NANO_BANANA_KEY` is valid

### 3D Model Generation Stuck
- Tripo AI processing can take 2-5 minutes
- The tool will show a "polling" status
- If still pending after 5 min, try regenerating

### Export to juries.ts Fails
- Ensure `/config/juries.ts` file exists (it should)
- Check file permissions in `/config/` directory
- Try exporting again

---

## Tips & Best Practices

1. **Bio Quality**: The bio is key. More specific bios lead to better Claude refinement and more distinctive image generation
2. **Color Contrast**: Choose colors that aren't too similar to existing jury members (see `/config/juries.ts` for existing colors)
3. **Profession Specificity**: More specific professions lead to better location and personality generation
4. **Image Selection**: Look for the image with best expression and pose match to the character concept
5. **Manual Edits**: Don't hesitate to manually edit the refined character—it's YOUR character!

---

## File Structure

```
/app/admin/
  /character-generator/
    page.tsx              # Main multi-step orchestrator

/components/CharacterGenerator/
  DraftStep.tsx           # Step 1: Form input
  RefineStep.tsx          # Step 2: Claude refinement
  ImagesStep.tsx          # Step 3: Image generation
  SelectImageStep.tsx     # Step 4: Image selection
  MeshStep.tsx            # Step 5: 3D mesh generation
  ReviewStep.tsx          # Step 6: Final review & export

/app/api/
  refine-character/       # Claude integration endpoint
  generate-images/        # Gemini Nano integration endpoint
  generate-mesh/          # Tripo AI integration endpoint
  export-character/       # Write to juries.ts endpoint

/utils/
  characterGenerator.ts   # Helper functions and prompts
```

---

## Next Steps

1. Replace API key placeholders in `.env.local`
2. Start the dev server: `npm run dev`
3. Navigate to `/admin/character-generator`
4. Create your first character!

Enjoy building your jury! 🎨
