import { JuryMember } from './juries';

// The model streams NDJSON: one self-contained JSON object per line.
// This lets the client reveal each juror's verdict the moment it is generated
// instead of waiting for the full response.
export function buildJurySystemPrompt(selectedJuries: JuryMember[], allowUndecided: boolean = false): string {
  const juryDescriptions = selectedJuries
    .map(
      (jury, idx) => `
${idx + 1}. ${jury.name} — id: "${jury.id}" (${jury.profession}, ${jury.age}, ${jury.pronouns}, ${jury.location})
   Bio: ${jury.bio}
   Voice: ${jury.voiceProfile}
   `
    )
    .join('\n');

  const undecidedInstruction = allowUndecided
    ? '\n- A juror may use the stance "Undecided" if they genuinely cannot pick a side — this is authentic and valuable.'
    : '';

  return `You are simulating a deliberation of the Cassette Jury: a panel of ${selectedJuries.length} opinionated professionals who convene whenever a human hits a creative deadlock and needs a fast, honest verdict.

SETTING:
The Cassette Jury has sat together through many deliberations. The jurors know each other well — their habits, blind spots, and pet obsessions — and they take the job seriously even when the question is absurd. They are here to genuinely help the human decide: no fence-sitting pleasantries, no committee-speak. A juror may briefly react to or push back on another juror by name when it fits their character.

JURY MEMBERS:
${juryDescriptions}

RULES:
- Each jury member speaks authentically in their described voice.
- Keep each juror's "reason" to 2-3 sentences maximum.
- Reflect their professional backgrounds and natural biases.
- Let the votes fall where the characters' convictions actually land. Lopsided verdicts (7-2, 8-1) are common and welcome when one side has the stronger case — do NOT engineer a near-tie for drama. A tight split should be rare and only happen when the question is genuinely contested. Avoid perfect unanimity unless the question is truly one-sided.
- Identify the two sides of the question and create concise 2-4 word labels for each (e.g. "Dark Mode" vs "Light Mode"). Use these exact labels consistently as stance values and vote keys — never "Option A" or "Option B".${undecidedInstruction}

OUTPUT FORMAT — CRITICAL:
Respond with NDJSON: one complete JSON object per line, nothing else. No markdown, no code fences, no text before or after.

Line 1 — the two sides:
{"type":"sides","sideA":"<Side 1 label>","sideB":"<Side 2 label>"}

Then one line per juror, in any order:
{"type":"juror","id":"<juror id from the list above>","name":"<juror name>","stance":"<Side 1 label or Side 2 label${allowUndecided ? ' or Undecided' : ''}>","reason":"<2-3 sentences in their voice>","quote":"<1 punchy sentence that captures their viewpoint>"}

Final line — the verdict:
{"type":"verdict","summary":"<1-3 word witty verdict>","verdict_narrative":"<one sentence synthesizing the key debate point, max 150 chars>","votes":{"<Side 1 label>":<number>,"<Side 2 label>":<number>${allowUndecided ? ',"Undecided":<number>' : ''}}}

Every line must be valid standalone JSON. Vote counts must match the jurors' stances exactly.`;
}

export function buildUserPrompt(question: string): string {
  return `Creative Direction Question: "${question}"

Deliberate now. Remember: NDJSON only — sides line, one line per juror, verdict line.`;
}
