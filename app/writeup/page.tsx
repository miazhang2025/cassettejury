import type { Metadata } from 'next';
import { juries } from '@/config/juries';

export const metadata: Metadata = {
  title: 'Cassette Jury — Project Write-up',
};

const promptBoxHTML = `<span class="wj-prompt-white">{</span><br>
&nbsp;&nbsp;<span class="wj-prompt-key">"discussion"</span><span class="wj-prompt-white">: [{</span><br>
&nbsp;&nbsp;&nbsp;&nbsp;<span class="wj-prompt-key">"name"</span><span class="wj-prompt-white">:</span>&nbsp;&nbsp;&nbsp;&nbsp;<span class="wj-prompt-comment">// jury member name</span><br>
&nbsp;&nbsp;&nbsp;&nbsp;<span class="wj-prompt-key">"stance"</span><span class="wj-prompt-white">:</span>&nbsp;&nbsp;&nbsp;<span class="wj-prompt-comment">// "&lt;Side 1&gt;" | "&lt;Side 2&gt;"</span><br>
&nbsp;&nbsp;&nbsp;&nbsp;<span class="wj-prompt-key">"reason"</span><span class="wj-prompt-white">:</span>&nbsp;&nbsp;&nbsp;<span class="wj-prompt-comment">// 2–3 sentences in their voice</span><br>
&nbsp;&nbsp;&nbsp;&nbsp;<span class="wj-prompt-key">"quote"</span><span class="wj-prompt-white">:</span>&nbsp;&nbsp;&nbsp;&nbsp;<span class="wj-prompt-comment">// 1 punchy sentence</span><br>
&nbsp;&nbsp;<span class="wj-prompt-white">}</span> <span class="wj-prompt-comment">/* × jurors */</span><span class="wj-prompt-white">],</span><br>
&nbsp;&nbsp;<span class="wj-prompt-key">"summary"</span><span class="wj-prompt-white">:</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="wj-prompt-comment">// 1–3 word witty verdict</span><br>
&nbsp;&nbsp;<span class="wj-prompt-key">"verdict_narrative"</span><span class="wj-prompt-white">:</span>&nbsp;<span class="wj-prompt-comment">// one synthesis sentence</span><br>
&nbsp;&nbsp;<span class="wj-prompt-key">"votes"</span><span class="wj-prompt-white">: {</span><br>
&nbsp;&nbsp;&nbsp;&nbsp;<span class="wj-prompt-key">"&lt;Side 1 label&gt;"</span><span class="wj-prompt-white">:</span>&nbsp;<span class="wj-prompt-comment">// count</span><br>
&nbsp;&nbsp;&nbsp;&nbsp;<span class="wj-prompt-key">"&lt;Side 2 label&gt;"</span><span class="wj-prompt-white">:</span>&nbsp;<span class="wj-prompt-comment">// count</span><br>
&nbsp;&nbsp;<span class="wj-prompt-white">}</span><br>
<span class="wj-prompt-white">}</span>`;

const styles = `
  .wj {
    --red: #9B0808;
    --red-light: #C41616;
    --red-pale: #fdf2f2;
    --cream: #E5E5E1;
    --cream-dark: #D4D4CF;
    --ink: #1a1a1a;
    --ink-mid: #4a4a4a;
    --ink-muted: #8a8a8a;
    --border: rgba(155, 8, 8, 0.15);
    font-family: 'IBM Plex Mono', monospace;
    background: var(--cream);
    color: var(--ink);
    font-size: 16px;
    line-height: 1.75;
    min-height: 100vh;
  }
  .wj * { box-sizing: border-box; }

  /* HEADER */
  .wj-header {
    border-bottom: 1px solid var(--border);
    padding: 56px 0 48px;
    text-align: center;
    background: var(--cream);
    position: relative;
    overflow: hidden;
  }
  .wj-header::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: repeating-linear-gradient(
      0deg,
      transparent,
      transparent 39px,
      rgba(155, 8, 8, 0.04) 39px,
      rgba(155, 8, 8, 0.04) 40px
    );
    pointer-events: none;
  }
  .wj-header-kicker {
    font-size: 11px;
    letter-spacing: 0.18em;
    color: var(--red);
    text-transform: uppercase;
    margin-bottom: 16px;
    position: relative;
  }
  .wj-header h1 {
    font-family: 'Blaka', serif;
    font-size: clamp(52px, 8vw, 88px);
    font-weight: 400;
    color: var(--red);
    line-height: 1.0;
    position: relative;
  }
  .wj-header h1 em {
    color: var(--red);
    font-style: normal;
  }
  .wj-header-tagline {
    margin-top: 20px;
    font-size: 13px;
    color: var(--ink-mid);
    max-width: 520px;
    margin-left: auto;
    margin-right: auto;
    position: relative;
  }
  .wj-header-meta {
    display: flex;
    justify-content: center;
    gap: 32px;
    margin-top: 32px;
    flex-wrap: wrap;
    position: relative;
  }
  .wj-header-meta span {
    font-size: 11px;
    letter-spacing: 0.1em;
    color: var(--ink-muted);
    text-transform: uppercase;
  }
  .wj-header-meta span b {
    color: var(--ink);
  }

  /* LAYOUT */
  .wj-container {
    max-width: 780px;
    margin: 0 auto;
    padding: 0 32px;
  }
  .wj section {
    padding: 72px 0 0;
  }
  .wj section:last-child {
    padding-bottom: 96px;
  }

  /* SECTION HEADERS */
  .wj-section-label {
    font-size: 10px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--red);
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .wj-section-label::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--border);
  }
  .wj h2 {
    font-family: 'Bayon', sans-serif;
    font-size: 36px;
    font-weight: 400;
    line-height: 1.15;
    margin-bottom: 20px;
    letter-spacing: 0.02em;
  }
  .wj h3 {
    font-family: 'Bayon', sans-serif;
    font-size: 22px;
    font-weight: 400;
    margin: 36px 0 12px;
    color: var(--ink-mid);
    letter-spacing: 0.02em;
  }
  .wj p {
    color: var(--ink-mid);
    margin-bottom: 16px;
    font-size: 13px;
  }
  .wj p strong {
    color: var(--ink);
  }

  /* PULL QUOTE */
  .wj-pull-quote {
    border-left: 3px solid var(--red);
    padding: 20px 0 20px 28px;
    margin: 36px 0;
  }
  .wj-pull-quote p {
    font-size: 17px;
    line-height: 1.6;
    color: var(--ink);
    margin: 0;
    font-style: italic;
  }

  /* DIVIDER */
  .wj-divider {
    height: 1px;
    background: var(--border);
    margin: 56px 0 0;
  }

  /* FLOW DIAGRAM */
  .wj-diagram-wrap {
    background: white;
    border: 1px solid var(--cream-dark);
    border-radius: 12px;
    padding: 32px 24px;
    margin: 32px 0;
    overflow-x: auto;
  }
  .wj-diagram-title {
    font-size: 10px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--ink-muted);
    margin-bottom: 20px;
  }

  /* USER FLOW */
  .wj-flow {
    display: flex;
    align-items: center;
    gap: 0;
    min-width: 580px;
  }
  .wj-flow-step {
    flex: 1;
    text-align: center;
  }
  .wj-flow-bubble {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 8px;
    font-size: 13px;
  }
  .wj-flow-bubble.wj-red { background: var(--red); color: white; }
  .wj-flow-bubble.wj-pale { background: var(--red-pale); color: var(--red); border: 1px solid rgba(155, 8, 8, 0.2); }
  .wj-flow-label {
    font-size: 12px;
    font-weight: 500;
    color: var(--ink);
    line-height: 1.3;
  }
  .wj-flow-sub {
    font-size: 10px;
    color: var(--ink-muted);
    margin-top: 3px;
  }
  .wj-flow-arrow {
    width: 32px;
    flex-shrink: 0;
    text-align: center;
    color: var(--red);
    font-size: 18px;
    padding-bottom: 24px;
  }

  /* AI STACK TABLE */
  .wj-ai-stack {
    width: 100%;
    border-collapse: collapse;
    margin: 24px 0;
    font-size: 13px;
  }
  .wj-ai-stack thead tr {
    border-bottom: 2px solid var(--ink);
  }
  .wj-ai-stack th {
    text-align: left;
    padding: 8px 16px 10px 0;
    font-size: 10px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--ink-muted);
    font-weight: 400;
  }
  .wj-ai-stack td {
    padding: 12px 16px 12px 0;
    border-bottom: 1px solid var(--cream-dark);
    vertical-align: top;
    color: var(--ink-mid);
    font-size: 12px;
  }
  .wj-ai-stack td:first-child {
    font-size: 12px;
    color: var(--red);
    white-space: nowrap;
    padding-right: 24px;
  }
  .wj-ai-stack td:nth-child(2) {
    font-weight: 500;
    color: var(--ink);
  }
  .wj-ai-stack tr:last-child td { border-bottom: none; }

  /* JURY GRID */
  .wj-jury-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1px;
    background: var(--cream-dark);
    border: 1px solid var(--cream-dark);
    border-radius: 8px;
    overflow: hidden;
    margin: 24px 0;
  }
  .wj-jury-card {
    background: white;
    padding: 16px;
  }
  .wj-jury-name {
    font-size: 13px;
    color: var(--ink);
    margin-bottom: 4px;
    display: flex;
    align-items: center;
    gap: 6px;
    font-weight: 500;
  }
  .wj-jury-role {
    font-size: 11px;
    color: var(--ink-muted);
    margin-bottom: 6px;
    padding-left: 14px;
  }
  .wj-jury-trait {
    font-size: 12px;
    color: var(--ink-mid);
    line-height: 1.4;
    padding-left: 14px;
    font-style: italic;
  }
  .wj-jury-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    display: inline-block;
    flex-shrink: 0;
  }

  /* TECH PILLARS */
  .wj-pillars {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    margin: 28px 0;
  }
  .wj-pillar {
    background: white;
    border: 1px solid var(--cream-dark);
    border-top: 3px solid var(--red);
    border-radius: 8px;
    padding: 20px 18px;
  }
  .wj-pillar-num {
    font-size: 10px;
    color: var(--red);
    letter-spacing: 0.1em;
    margin-bottom: 8px;
  }
  .wj-pillar-title {
    font-weight: 500;
    font-size: 13px;
    color: var(--ink);
    margin-bottom: 8px;
    line-height: 1.3;
  }
  .wj-pillar-body {
    font-size: 12px;
    color: var(--ink-muted);
    line-height: 1.6;
  }

  /* PROMPT BOX */
  .wj-prompt-box {
    background: #1a1a1a;
    border-radius: 8px;
    padding: 24px 28px;
    margin: 0;
    font-size: 13px;
    line-height: 2.2;
    color: #ddd;
  }
  .wj-prompt-comment { color: #666; }
  .wj-prompt-key { color: #c0a060; }
  .wj-prompt-white { color: #ddd; }

  /* FAN ART */
  .wj-fanart-section {
    text-align: center;
  }
  .wj-fanart-img {
    max-width: 100%;
    width: 700px;
    border-radius: 8px;
    display: block;
    margin: 0 auto 16px;
  }
  .wj-fanart-caption {
    font-size: 11px;
    color: var(--ink-muted);
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin: 0;
  }

  /* FOOTER */
  .wj-footer {
    border-top: 1px solid var(--border);
    padding: 40px 0;
    text-align: center;
  }
  .wj-footer p {
    font-size: 11px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--ink-muted);
    margin: 0;
  }
  .wj-footer strong { color: var(--red); }

  /* VIDEO */
  .wj-video-wrap {
    margin: 40px 0 0;
    border-radius: 10px;
    overflow: hidden;
    line-height: 0;
  }
  .wj-video-wrap video {
    width: 100%;
    height: auto;
    max-height: 50vh;
    display: block;
  }

  /* CTA BUTTON */
  .wj-cta-btn {
    display: inline-block;
    font-size: 11px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #ffffff;
    text-decoration: none;
    background-color: #9B0808;
    padding: 10px 20px;
    border-radius: 6px;
    transition: background-color 0.2s ease, transform 0.15s ease;
  }
  .wj-cta-btn:hover {
    background-color: #6B0505;
    transform: translateY(-1px);
  }

  /* VIDEO + CTA ROW */
  .wj-video-cta-row {
    display: flex;
    gap: 32px;
    align-items: center;
    margin-top: 40px;
  }

  /* RESPONSIVE */
  @media (max-width: 600px) {
    .wj-pillars { grid-template-columns: 1fr; }
    .wj-header h1 { font-size: 44px; }
    .wj-jury-grid { grid-template-columns: 1fr 1fr; }
    .wj-header-meta { flex-direction: column; gap: 8px; }
    .wj-container { padding: 0 20px; }
    .wj-video-cta-row { flex-direction: column; align-items: center; }
    .wj-video-cta-row .wj-video-wrap { width: 100%; }
  }
`;

export default function WriteupPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="wj">

        {/* ── HEADER ── */}
        <div className="wj-header">
          <div className="wj-header-kicker">New Media / Interactive Experience</div>
          <h1>Cassette <em>Jury</em></h1>
          <p className="wj-header-tagline">
            A pocket jury for your creative decisions. AI juries, one creative verdict, zero focus groups.
          </p>
          <div className="wj-header-meta">
            <span><b>Medium</b>&nbsp; Web / WebGL</span>
            <span><b>Stack</b>&nbsp; Next.js · Three.js · Claude API</span>
            <span><b>Characters</b>&nbsp; {juries.length}</span>
          </div>
        </div>

        <div className="wj-container">

          {/* ── VIDEO + CTA ── */}
          <div className="wj-video-cta-row">
            <div style={{ flexShrink: 0 }}>
              <a href="/" className="wj-cta-btn">
                ← Go to the jury
              </a>
            </div>
            <div className="wj-video-wrap" style={{ flex: 1, margin: 0 }}>
              <video autoPlay muted loop playsInline>
                <source src="/cassete%20jury.mp4" type="video/mp4" />
              </video>
            </div>
          </div>

          {/* ── 01 CONCEPT ── */}
          <section>
            <div className="wj-section-label">01 &nbsp;Concept</div>
            <h2>The focus group you can fit in your pocket</h2>
            <p>
              You&apos;re mid-project. Writing a script and stuck between two lines. Designing a flow and not sure if users need that extra prompt. Preparing a pitch and genuinely unsure whether the black trousers or the blue ones read better on stage. You need an outside perspective — not another AI that just agrees with you, but something closer to a small room of opinionated people who will actually push back.
            </p>
            <p>
              That room is <strong>Cassette Jury</strong>. {juries.length} AI-simulated characters, each with their own profession, personality, and agenda, packed into a wooden box and ready to deliberate on demand. Submit any open-ended creative question, watch them argue — physically, as gooey 3D blob characters — and receive a verdict.
            </p>
            <div className="wj-pull-quote">
              <p>
                &ldquo;It is not a replacement for real user research. It is something more honest: a fast, irreverent, and oddly useful way to hear perspectives you hadn&apos;t considered, from people you couldn&apos;t have assembled, in the thirty seconds you actually have.&rdquo;
              </p>
            </div>
            <p>
              The name comes from the form factor. A small group of people — a focus group — compressed into something you can carry in your pocket. Like a cassette tape. Hence: <strong>Cassette Jury</strong>.
            </p>
          </section>

          {/* ── 02 EXPERIENCE ── */}
          <div className="wj-divider"></div>
          <section>
            <div className="wj-section-label">02 &nbsp;Experience</div>
            <h2>How it works</h2>
            <div className="wj-diagram-wrap">
              <div className="wj-diagram-title">User journey — five states</div>
              <div className="wj-flow">
                <div className="wj-flow-step">
                  <div className="wj-flow-bubble wj-red">01</div>
                  <div className="wj-flow-label">Select your jury</div>
                  <div className="wj-flow-sub">Choose of all</div>
                </div>
                <div className="wj-flow-arrow">→</div>
                <div className="wj-flow-step">
                  <div className="wj-flow-bubble wj-pale">02</div>
                  <div className="wj-flow-label">Submit your question</div>
                  <div className="wj-flow-sub">Open-ended</div>
                </div>
                <div className="wj-flow-arrow">→</div>
                <div className="wj-flow-step">
                  <div className="wj-flow-bubble wj-pale">03</div>
                  <div className="wj-flow-label">Jury deliberates</div>
                  <div className="wj-flow-sub">Blobs fight</div>
                </div>
                <div className="wj-flow-arrow">→</div>
                <div className="wj-flow-step">
                  <div className="wj-flow-bubble wj-pale">04</div>
                  <div className="wj-flow-label">Verdict revealed</div>
                  <div className="wj-flow-sub">With vote split</div>
                </div>
                <div className="wj-flow-arrow">→</div>
                <div className="wj-flow-step">
                  <div className="wj-flow-bubble wj-pale">05</div>
                  <div className="wj-flow-label">Hover each blob</div>
                  <div className="wj-flow-sub">Their reasoning</div>
                </div>
              </div>
            </div>
            <p>
              The experience is designed to be self-explanatory — no tutorial, no onboarding. The wooden box, the blobby characters, the fighting animation: all of it communicates what to do before a word is read. Each juror has a distinct physical presence that reflects their personality.
            </p>
            <p>
              Once the AI returns its verdict, hovering each blob reveals their individual reasoning — written entirely in their own voice, in character, with no two sounding alike.
            </p>
          </section>

          {/* ── 03 CHARACTERS ── */}
          <div className="wj-divider"></div>
          <section>
            <div className="wj-section-label">03 &nbsp;Characters</div>
            <h2>Meet the jury</h2>
            <p>
              A diverse cast covering a deliberate spread of profession, worldview, age, and communication style. The ensemble is designed so that most questions produce a genuine split — no monoculture, no echo chamber.
            </p>
            <div className="wj-jury-grid">
              {juries.map((jury) => (
                <div key={jury.id} className="wj-jury-card">
                  <div className="wj-jury-name">
                    <span className="wj-jury-dot" style={{ background: jury.color }}></span>
                    {jury.name}
                  </div>
                  <div className="wj-jury-role">{jury.profession} · {jury.location} · {jury.age}</div>
                  <div className="wj-jury-trait">&ldquo;{jury.bio}&rdquo;</div>
                </div>
              ))}
            </div>
          </section>

          {/* ── 04 AI ARCHITECTURE ── */}
          <div className="wj-divider"></div>
          <section>
            <div className="wj-section-label">04 &nbsp;AI Architecture</div>
            <h2>AI as structural backbone</h2>
            <p>
              AI is not a feature layer in Cassette Jury — it is the engine behind the entire system, operating across three distinct domains: jury simulation, character design, and visual asset generation. The same character data object that gives each juror their voice also shapes their visual silhouette and drives their 3D blob form.
            </p>
            <div className="wj-pillars">
              <div className="wj-pillar">
                <div className="wj-pillar-num">01 &nbsp;/&nbsp; VERDICT ENGINE</div>
                <div className="wj-pillar-title">Jury simulation &amp; prompt engineering</div>
                <div className="wj-pillar-body">Anthropic Claude API. Modular prompt assembly. Structured JSON output. Few-shot templates. Dynamic instruction flags.</div>
              </div>
              <div className="wj-pillar">
                <div className="wj-pillar-num">02 &nbsp;/&nbsp; CHARACTER DESIGN</div>
                <div className="wj-pillar-title">AI character &amp; art generation</div>
                <div className="wj-pillar-body">Claude as expert character designer. Google Gemini image generation. Prompt-anchored claymation style consistency.</div>
              </div>
              <div className="wj-pillar">
                <div className="wj-pillar-num">03 &nbsp;/&nbsp; 3D PIPELINE</div>
                <div className="wj-pillar-title">Procedural mesh generation</div>
                <div className="wj-pillar-body">Images → Tripo AI image-to-3D conversion → GLB export. Loaded into WebGL scene via Three.js.</div>
              </div>
            </div>

            <h3>The verdict engine</h3>
            <p>
              The Anthropic Claude API drives the jury simulation. Each character is defined in a structured dataset with a <strong>voiceProfile</strong> field — the prompt-critical field that encodes behavioral instructions directly. This separation means any character can be updated or swapped without touching the prompt logic.
            </p>
            <p>
              The system prompt enforces a strict JSON output contract. Per-member fields include stance, reasoning, and a direct quote. The top-level response includes a witty summary, a verdict narrative, and a numeric vote split per side.
            </p>
            <div className="wj-diagram-wrap">
              <div className="wj-diagram-title">JSON output contract — schema</div>
              <div
                className="wj-prompt-box"
                dangerouslySetInnerHTML={{ __html: promptBoxHTML }}
              />
            </div>

            <h3>Character design pipeline</h3>
            <p>
              A second Claude invocation acts as an expert character designer. Given a raw user draft, it synthesises a canonical character profile in a single structured pass — generating the silhouette description, pronouns, location, and expanded bio. That <strong>silhouette</strong> field — written in natural language — then feeds directly into the Gemini image generation prompt.
            </p>
            <p>
              Google Gemini produces two mood-variant images per character. Claymation-style visual consistency is enforced entirely through prompt-level style anchoring — no manual post-processing, no LoRA, no fine-tuning. Selected images are then passed to <strong>Tripo AI</strong> for image-to-3D conversion, producing a fully textured GLB mesh ready to load into the WebGL scene.
            </p>
            <div className="wj-diagram-wrap">
              <div className="wj-diagram-title">Art creation pipeline — text → image → 3D mesh</div>
              <div className="wj-flow" style={{ minWidth: '500px' }}>
                <div className="wj-flow-step">
                  <div className="wj-flow-bubble wj-red" style={{ fontSize: '11px' }}>TEXT</div>
                  <div className="wj-flow-label">Silhouette field</div>
                  <div className="wj-flow-sub">Natural language</div>
                </div>
                <div className="wj-flow-arrow">→</div>
                <div className="wj-flow-step">
                  <div className="wj-flow-bubble wj-pale" style={{ fontSize: '11px' }}>CLAUDE</div>
                  <div className="wj-flow-label">Character profile</div>
                  <div className="wj-flow-sub">Structured pass</div>
                </div>
                <div className="wj-flow-arrow">→</div>
                <div className="wj-flow-step">
                  <div className="wj-flow-bubble wj-pale" style={{ fontSize: '11px' }}>GEMINI</div>
                  <div className="wj-flow-label">2D image ×2</div>
                  <div className="wj-flow-sub">Mood variants</div>
                </div>
                <div className="wj-flow-arrow">→</div>
                <div className="wj-flow-step">
                  <div className="wj-flow-bubble wj-pale" style={{ fontSize: '11px' }}>TRIPO</div>
                  <div className="wj-flow-label">3D mesh GLB</div>
                  <div className="wj-flow-sub">Image-to-3D</div>
                </div>
                <div className="wj-flow-arrow">→</div>
                <div className="wj-flow-step">
                  <div className="wj-flow-bubble wj-pale" style={{ fontSize: '11px' }}>SCENE</div>
                  <div className="wj-flow-label">Live in Three.js</div>
                  <div className="wj-flow-sub">WebGL</div>
                </div>
              </div>
            </div>

            <table className="wj-ai-stack">
              <thead>
                <tr>
                  <th>Model</th>
                  <th>Role</th>
                  <th>Output</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Claude (Anthropic)</td>
                  <td>Jury verdict engine</td>
                  <td>Structured JSON with per-juror stances and reasoning</td>
                </tr>
                <tr>
                  <td>Claude (Anthropic)</td>
                  <td>Character designer</td>
                  <td>Canonical character profiles from raw drafts</td>
                </tr>
                <tr>
                  <td>Gemini (Google)</td>
                  <td>Image generation</td>
                  <td>Two mood-variant PNG images per character</td>
                </tr>
                <tr>
                  <td>Tripo AI</td>
                  <td>Image-to-3D conversion</td>
                  <td>Textured GLB mesh per character from 2D reference image</td>
                </tr>
              </tbody>
            </table>
          </section>

          {/* ── 05 RENDERING & PHYSICS ── */}
          <div className="wj-divider"></div>
          <section>
            <div className="wj-section-label">05 &nbsp;Rendering &amp; Physics</div>
            <h2>The scene</h2>
            <p>
              The 3D scene is built in Three.js with a custom React hook (<strong>useThreeJsScene</strong>) that isolates all WebGL lifecycle from the component tree — direct imperative control. Each blob&apos;s GLB is loaded via GLTFLoader, cached to prevent redundant requests, and rendered with <strong>MeshToonMaterial</strong> for cel-shading. Morph targets from the GLB are preserved for blendshape-driven facial animation.
            </p>
            <p>
              Physics is a fully custom Euler integration loop running at ~60fps. During the fight sequence, each blob is pulled toward a randomly assigned target with force capped at 25 units, elastic push-apart forces trigger on collision, and hard box bounds reflect velocity at the walls. Gravity is intentionally disabled during fighting to keep blobs airborne. Camera shake runs as a sinusoidal oscillator with dynamic frequency variation.
            </p>
            <p>
              The particle system uses a pre-allocated pool of 200 billboard quads. Two emission modes run in parallel during combat: ambient smoke at one particle per blob every six frames, and impact bursts of two to three particles at near-collision midpoints. Each particle carries its own lifetime, velocity, and opacity fade curve, billboarding via <strong>mesh.lookAt(camera)</strong> per frame.
            </p>
          </section>

          {/* ── 06 WHY IT MATTERS ── */}
          <div className="wj-divider"></div>
          <section>
            <div className="wj-section-label">06 &nbsp;Why it matters</div>
            <h2>A toy with an actual point</h2>
            <p>
              Cassette Jury exists in the gap between &ldquo;I need feedback&rdquo; and &ldquo;I have time and money to get it.&rdquo; It doesn&apos;t replace the real thing. It fills a specific and common moment: the thirty seconds between an idea and a decision, when you just need to hear a perspective that isn&apos;t your own.
            </p>
            <p>
              The technical ambition — the AI simulation, the character pipeline, the physics, the 3D rendering — is in service of one thing: making that thirty-second conversation feel like it actually happened. The blobs fight because real disagreement is physical. The verdict is a single line because that&apos;s all you need. The characters are opinionated because that&apos;s the only way the feedback is useful.
            </p>
            <div className="wj-pull-quote">
              <p>&ldquo;No prototype, no focus group, no budget required.&rdquo;</p>
            </div>
          </section>

          {/* ── BOTTOM CTA ── */}
          <div className="wj-divider"></div>
          <div style={{ paddingTop: '56px', paddingBottom: '16px', textAlign: 'center' }}>
            <a
              href="/"
              style={{ display: 'inline-block', fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#ffffff', textDecoration: 'none', backgroundColor: '#9B0808', padding: '10px 20px', borderRadius: '6px' }}
            >
              ← Go to the jury
            </a>
          </div>

          {/* ── FAN ART ── */}
          <div className="wj-divider"></div>
          <section className="wj-fanart-section">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/jury_fan_art.png"
              alt="Cassette Jury fan art"
              className="wj-fanart-img"
            />
            <p className="wj-fanart-caption">Thanks to Debbie Gao for creating this pic</p>
          </section>

        </div>

        {/* ── FOOTER ── */}
        <div className="wj-footer">
          <div className="wj-container">
            <p>
              <strong>Cassette Jury</strong>&nbsp;·&nbsp;New Media / Interactive Experience&nbsp;·&nbsp;Built by Mia & Ingrid in 2026
            </p>
          </div>
        </div>

      </div>
    </>
  );
}
