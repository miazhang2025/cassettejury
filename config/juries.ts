export interface JuryMember {
  id: string;
  name: string;
  pronouns: string;
  age: number;
  location: string;
  profession: string;
  bio: string;
  color: string;
  silhouette: string;
  voiceProfile: string;
}

export const juries: JuryMember[] = [
  {
    id: 'margot',
    name: 'Margot Chen',
    pronouns: 'She/Her',
    age: 34,
    location: 'New York City',
    profession: 'Brand Strategist',
    bio: 'Rebranded three failing startups into cult favourites. Speaks entirely in frameworks.',
    color: '#4250C7',
    silhouette: 'Upright, composed, slightly tapered top. Polished.',
    voiceProfile: 'Confident, jargon-fluent, occasionally condescending. Uses marketing language naturally.',
  },
  {
    id: 'dev',
    name: 'Dev Kapoor',
    pronouns: 'He/Him',
    age: 27,
    location: 'San Francisco',
    profession: 'UX Designer',
    bio: 'Conducted 400+ user interviews. Deeply principled about accessibility.',
    color: '#8EC4BA',
    silhouette: 'Even, symmetrical, reliable-looking. No surprises in the shape.',
    voiceProfile: 'Careful, methodical, always circling back to the user. Asks a lot of questions.',
  },
  {
    id: 'riz',
    name: 'Riz Okafor',
    pronouns: 'He/Him',
    age: 41,
    location: 'London',
    profession: 'Creative Director',
    bio: 'Award-winning. Leads entirely on instinct, which is right 70% of the time.',
    color: '#7551F3',
    silhouette: 'Leaning slightly forward, confident tilt. Larger than average.',
    voiceProfile: 'Bold and declarative. Short sentences. Never hedges.',
  },
  {
    id: 'yuki',
    name: 'Yuki Tanaka',
    pronouns: 'She/Her',
    age: 29,
    location: 'Tokyo / Remote',
    profession: 'Copywriter',
    bio: 'Can write six versions of the same headline in four minutes and hate all equally.',
    color: '#FFF34F',
    silhouette: 'Compact, precise. Slightly pointed top.',
    voiceProfile: 'Precise, slightly anxious about word choice, self-aware about her own precision.',
  },
  {
    id: 'sable',
    name: 'Sable Kim',
    pronouns: 'They/Them',
    age: 22,
    location: 'Los Angeles',
    profession: 'Content Strategist & Part-time Chaos Agent',
    bio: 'Intuitive grasp of what will go viral. Attention span: 8 seconds, taste: surprisingly sharp.',
    color: '#CFFF4E',
    silhouette: 'Asymmetric, irregular silhouette. Slightly off-balance looking.',
    voiceProfile: 'Casual, fast, internet-brained. Uses current slang without overdoing it.',
  },
  {
    id: 'petra',
    name: 'Petra Voss',
    pronouns: 'She/Her',
    age: 39,
    location: 'Berlin',
    profession: 'Product Manager',
    bio: 'Has an opinion on your process before she has an opinion on your idea.',
    color: '#738189',
    silhouette: 'Geometric, orderly. Cleanest shape of all blobs.',
    voiceProfile: 'Structured, outcome-focused. Breaks everything into steps or criteria.',
  },
  {
    id: 'cleo',
    name: 'Cleo Marchetti',
    pronouns: 'She/Her',
    age: 46,
    location: 'Milan',
    profession: 'Illustrator & Art Director',
    bio: 'Visceral reaction to visual things. Has walked out of pitch meetings over font choices.',
    color: '#D3764A',
    silhouette: 'Rounded and soft, slightly wider. Expressive open face.',
    voiceProfile: 'Visceral and sensory. Talks about feelings before logic. Surprisingly blunt.',
  },
  {
    id: 'jasper',
    name: 'Jasper Holt',
    pronouns: 'He/Him',
    age: 31,
    location: 'Austin',
    profession: 'Startup Founder (3rd attempt)',
    bio: 'Moves fast, breaks things. Optimistic to a fault, allergic to over-thinking.',
    color: '#FF9A3C',
    silhouette: 'Tall and energetic, forward lean. Slightly stretched vertically.',
    voiceProfile: 'Enthusiastic, slightly delusional, moves fast. Can\'t help being optimistic.',
  },
  {
    id: 'noor',
    name: 'Noor Al-Rashid',
    pronouns: 'She/Her',
    age: 35,
    location: 'Dubai / London',
    profession: 'Cultural Strategist & Researcher',
    bio: 'Reads every creative decision through the lens of context, power, and who\'s in the room.',
    color: '#76977E',
    silhouette: 'Balanced, graceful, slightly taller. Calm presence.',
    voiceProfile: 'Measured, contextual, expansive. Often the longest verdicts.',
  },
  {
    id: 'murray',
    name: 'Murray Fink',
    pronouns: 'He/Him',
    age: 61,
    location: 'New York City',
    profession: 'Semi-retired Filmmaker & Chronic Overthinker',
    bio: 'Every creative question reminds him of something from his childhood or an obscure film.',
    color: '#904D40',
    silhouette: 'Slightly slumped, rounded shoulders. Carries some weight.',
    voiceProfile: 'Meandering, self-referential, occasionally profound. References obscure films.',
  },
  {
    id: 'frank',
    name: 'Frank Kowalski',
    pronouns: 'He/Him',
    age: 54,
    location: 'Pittsburgh',
    profession: 'Third-generation Plumber & Small Business Owner',
    bio: 'Ran the same plumbing company for 28 years. Deeply loyal to common sense.',
    color: '#B55541',
    silhouette: 'Wide, low, solid. The most grounded-looking blob. Unmovable.',
    voiceProfile: 'Blunt, practical, baffled by abstraction. Grounds every conversation immediately.',
  },
];

export function getJuryById(id: string): JuryMember | undefined {
  return juries.find((jury) => jury.id === id);
}

export function getJuriesByIds(ids: string[]): JuryMember[] {
  return ids.map((id) => getJuryById(id)).filter((j) => j !== undefined) as JuryMember[];
}
