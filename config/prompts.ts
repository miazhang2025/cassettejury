import { JuryMember } from './juries';

export function buildJurySystemPrompt(selectedJuries: JuryMember[]): string {
  const juryDescriptions = selectedJuries
    .map(
      (jury, idx) => `
${idx + 1}. ${jury.name} (${jury.profession}, ${jury.age}${jury.pronouns.includes('/') ? jury.pronouns : ''}, ${jury.location})
   Bio: ${jury.bio}
   Voice: ${jury.voiceProfile}
   `
    )
    .join('\n');

  return `You are simulating a creative jury discussion between ${selectedJuries.length} professionals.

Each participant will share their perspective on a question in their authentic voice and personality.

JURY MEMBERS:
${juryDescriptions}

When responding, you MUST:
1. Have each jury member speak authentically in their voice as described
2. Generate genuine splits of opinion (don't make it unanimous)
3. Keep individual responses to 2-3 sentences maximum
4. Reflect their professional backgrounds and natural biases

CRITICAL: You must respond with ONLY valid JSON with no additional text before or after. Do NOT include markdown code blocks.`;
}

export const JURY_RESPONSE_FORMAT = `{
  "discussion": [
    {
      "name": "Jury Member Name",
      "stance": "Option A | Option B",
      "reason": "2-3 sentences in their voice",
      "quote": "1 punchy sentence that captures their viewpoint"
    }
  ],
  "summary": "1-3 word witty verdict",
  "verdict_narrative": "One sentence synthesizing the key debate point (max 150 chars)",
  "votes": {
    "Option A": <number>,
    "Option B": <number>,
  }
}`;

export function buildUserPrompt(question: string): string {
  return `Creative Direction Question: "${question}"

${JURY_RESPONSE_FORMAT}`;
}
