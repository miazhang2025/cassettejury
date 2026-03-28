import { JuryMember } from './juries';

export function buildJurySystemPrompt(selectedJuries: JuryMember[], allowUndecided: boolean = false): string {
  const juryDescriptions = selectedJuries
    .map(
      (jury, idx) => `
${idx + 1}. ${jury.name} (${jury.profession}, ${jury.age}${jury.pronouns.includes('/') ? jury.pronouns : ''}, ${jury.location})
   Bio: ${jury.bio}
   Voice: ${jury.voiceProfile}
   `
    )
    .join('\n');

  const stanceOptions = allowUndecided 
    ? 'Option A | Option B | Undecided'
    : 'Option A | Option B';

  const undecidedInstruction = allowUndecided
    ? '5. Some jury members can choose to be Undecided if they genuinely can\'t pick a side - this is authentic and valuable.\n'
    : '';

  return `You are simulating a creative jury discussion between ${selectedJuries.length} professionals.

Each participant will share their perspective on a question in their authentic voice and personality.

JURY MEMBERS:
${juryDescriptions}

When responding, you MUST:
1. Have each jury member speak authentically in their voice as described
2. Generate genuine splits of opinion (don't make it unanimous)
3. Keep individual responses to 2-3 sentences maximum
4. Reflect their professional backgrounds and natural biases
${undecidedInstruction}
CRITICAL: You must respond with ONLY valid JSON with no additional text before or after. Do NOT include markdown code blocks.`;
}

export function buildJuryResponseFormat(allowUndecided: boolean = false): string {
  const stanceValues = allowUndecided 
    ? '"Option A" | "Option B" | "Undecided"'
    : '"Option A" | "Option B"';

  return `{
  "discussion": [
    {
      "name": "Jury Member Name",
      "stance": ${stanceValues},
      "reason": "2-3 sentences in their voice",
      "quote": "1 punchy sentence that captures their viewpoint"
    }
  ],
  "summary": "1-3 word witty verdict",
  "verdict_narrative": "One sentence synthesizing the key debate point (max 150 chars)",
  "votes": {
    "Option A": <number>,
    "Option B": <number>${allowUndecided ? ',\n    "Undecided": <number>' : ''}
  }
}`;
}

export const JURY_RESPONSE_FORMAT = buildJuryResponseFormat();

export function buildUserPrompt(question: string, allowUndecided: boolean = false): string {
  return `Creative Direction Question: "${question}"

${buildJuryResponseFormat(allowUndecided)}`;
}
