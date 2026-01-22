// Content seed data - fallback when DB is empty

export interface SeedTrack {
  id: string;
  slug: string;
  name: string;
  is_free: boolean;
  sort: number;
}

export interface SeedScenario {
  id: string;
  track_id: string;
  title: string;
  description: string;
  difficulty: number;
  sort: number;
}

export interface SeedPrompt {
  id: string;
  scenario_id: string;
  prompt_type: 'rewrite' | 'tone_rewrite' | 'cloze' | 'short_reply';
  prompt_text: string;
  target_tone: string | null;
  reference_notes: string | null;
  tags: string[];
  use_cases: string[];
}

export const SEED_TRACKS: SeedTrack[] = [
  {
    id: 'track_office_basics',
    slug: 'office-basics',
    name: 'Office Basics',
    is_free: true,
    sort: 1,
  },
  {
    id: 'track_pm_standups',
    slug: 'pm-standups',
    name: 'PM Standups & Updates',
    is_free: false,
    sort: 2,
  },
  {
    id: 'track_sales_discovery',
    slug: 'sales-discovery',
    name: 'Sales Discovery Calls',
    is_free: false,
    sort: 3,
  },
];

export const SEED_SCENARIOS: SeedScenario[] = [
  // Office Basics (Free)
  {
    id: 'scenario_email_basics',
    track_id: 'track_office_basics',
    title: 'Email Essentials',
    description: 'Master professional email writing for everyday workplace communication.',
    difficulty: 1,
    sort: 1,
  },
  {
    id: 'scenario_meeting_requests',
    track_id: 'track_office_basics',
    title: 'Meeting Requests',
    description: 'Learn to schedule meetings professionally and respectfully.',
    difficulty: 1,
    sort: 2,
  },
  {
    id: 'scenario_status_updates',
    track_id: 'track_office_basics',
    title: 'Status Updates',
    description: 'Write clear and concise status updates for your team.',
    difficulty: 2,
    sort: 3,
  },
  // PM Standups (Paid)
  {
    id: 'scenario_daily_standup',
    track_id: 'track_pm_standups',
    title: 'Daily Standup',
    description: 'Deliver effective standup updates that keep the team aligned.',
    difficulty: 2,
    sort: 1,
  },
  {
    id: 'scenario_blocker_escalation',
    track_id: 'track_pm_standups',
    title: 'Blocker Escalation',
    description: 'Communicate blockers clearly without sounding negative.',
    difficulty: 3,
    sort: 2,
  },
  // Sales Discovery (Paid)
  {
    id: 'scenario_discovery_questions',
    track_id: 'track_sales_discovery',
    title: 'Discovery Questions',
    description: 'Ask the right questions to uncover customer needs.',
    difficulty: 2,
    sort: 1,
  },
  {
    id: 'scenario_objection_handling',
    track_id: 'track_sales_discovery',
    title: 'Objection Handling',
    description: 'Respond professionally to common sales objections.',
    difficulty: 3,
    sort: 2,
  },
];

export const SEED_PROMPTS: SeedPrompt[] = [
  // Email Essentials
  {
    id: 'prompt_email_1',
    scenario_id: 'scenario_email_basics',
    prompt_type: 'rewrite',
    prompt_text: 'Rewrite this email to sound more professional:\n\n"Hey, I need that report ASAP. Where is it??"',
    target_tone: null,
    reference_notes: 'Good rewrite: "Hi [Name], Could you please send me the status update on the report? I\'d appreciate having it by [time] if possible. Thanks!"',
    tags: ['email', 'professional', 'urgent'],
    use_cases: ['requesting updates', 'following up'],
  },
  {
    id: 'prompt_email_2',
    scenario_id: 'scenario_email_basics',
    prompt_type: 'tone_rewrite',
    prompt_text: 'Rewrite this in a POLITE tone:\n\n"You didn\'t answer my question in the last email."',
    target_tone: 'polite',
    reference_notes: 'The original sounds accusatory. A polite version acknowledges the other person\'s time.',
    tags: ['email', 'tone', 'polite'],
    use_cases: ['following up', 'clarification'],
  },
  {
    id: 'prompt_email_3',
    scenario_id: 'scenario_email_basics',
    prompt_type: 'cloze',
    prompt_text: 'Fill in the blank:\n\n"I wanted to _____ with you regarding the project timeline."',
    target_tone: null,
    reference_notes: 'Common collocations: "touch base", "follow up", "check in"',
    tags: ['email', 'collocation'],
    use_cases: ['following up'],
  },
  // Meeting Requests
  {
    id: 'prompt_meeting_1',
    scenario_id: 'scenario_meeting_requests',
    prompt_type: 'rewrite',
    prompt_text: 'Rewrite this meeting request to be more professional:\n\n"We need to talk about the project. When are you free?"',
    target_tone: null,
    reference_notes: 'A good meeting request includes: purpose, suggested times, expected duration.',
    tags: ['meeting', 'scheduling'],
    use_cases: ['scheduling meetings'],
  },
  {
    id: 'prompt_meeting_2',
    scenario_id: 'scenario_meeting_requests',
    prompt_type: 'short_reply',
    prompt_text: 'Your colleague asks: "Can we reschedule our 2pm meeting to tomorrow?"\n\nWrite a brief, professional response accepting the change.',
    target_tone: null,
    reference_notes: 'Keep it brief but friendly. Confirm the new time.',
    tags: ['meeting', 'rescheduling'],
    use_cases: ['rescheduling'],
  },
  // Status Updates
  {
    id: 'prompt_status_1',
    scenario_id: 'scenario_status_updates',
    prompt_type: 'rewrite',
    prompt_text: 'Rewrite this status update to be clearer:\n\n"Working on stuff. Having some issues but will figure it out."',
    target_tone: null,
    reference_notes: 'Good status updates are specific about: what was done, what\'s in progress, any blockers.',
    tags: ['status', 'clarity'],
    use_cases: ['status updates', 'team communication'],
  },
  {
    id: 'prompt_status_2',
    scenario_id: 'scenario_status_updates',
    prompt_type: 'tone_rewrite',
    prompt_text: 'Rewrite this in a NEUTRAL tone (not too negative, not too positive):\n\n"The project is a disaster. We\'re way behind and nothing is working."',
    target_tone: 'neutral',
    reference_notes: 'Neutral tone acknowledges challenges without being alarmist.',
    tags: ['status', 'tone', 'neutral'],
    use_cases: ['status updates'],
  },
  // Daily Standup (Paid)
  {
    id: 'prompt_standup_1',
    scenario_id: 'scenario_daily_standup',
    prompt_type: 'rewrite',
    prompt_text: 'Improve this standup update:\n\n"Yesterday I did meetings. Today more meetings. No blockers."',
    target_tone: null,
    reference_notes: 'Good standups: specific accomplishments, clear plans, proactive about blockers.',
    tags: ['standup', 'specific'],
    use_cases: ['daily standup'],
  },
  {
    id: 'prompt_standup_2',
    scenario_id: 'scenario_daily_standup',
    prompt_type: 'short_reply',
    prompt_text: 'Your manager asks in standup: "Any updates on the API integration?"\n\nProvide a concise, professional update. The integration is 60% complete.',
    target_tone: null,
    reference_notes: 'Be specific about progress and next steps.',
    tags: ['standup', 'progress'],
    use_cases: ['daily standup', 'progress updates'],
  },
  // Blocker Escalation (Paid)
  {
    id: 'prompt_blocker_1',
    scenario_id: 'scenario_blocker_escalation',
    prompt_type: 'rewrite',
    prompt_text: 'Rewrite this blocker message to be more constructive:\n\n"I can\'t do my work because the design team hasn\'t finished their part."',
    target_tone: null,
    reference_notes: 'Focus on the situation, not blame. Suggest solutions.',
    tags: ['blocker', 'escalation', 'constructive'],
    use_cases: ['blocker communication'],
  },
  {
    id: 'prompt_blocker_2',
    scenario_id: 'scenario_blocker_escalation',
    prompt_type: 'tone_rewrite',
    prompt_text: 'Rewrite in a DIRECT but professional tone:\n\n"I think maybe we might have a small issue that could potentially cause some delays..."',
    target_tone: 'direct',
    reference_notes: 'Direct communication saves time. Be clear about the issue and impact.',
    tags: ['blocker', 'tone', 'direct'],
    use_cases: ['blocker communication'],
  },
  // Discovery Questions (Paid)
  {
    id: 'prompt_discovery_1',
    scenario_id: 'scenario_discovery_questions',
    prompt_type: 'rewrite',
    prompt_text: 'Rewrite this sales question to be more open-ended:\n\n"Do you have budget for this project?"',
    target_tone: null,
    reference_notes: 'Open-ended questions invite more detailed responses.',
    tags: ['sales', 'discovery', 'questions'],
    use_cases: ['sales calls', 'discovery'],
  },
  {
    id: 'prompt_discovery_2',
    scenario_id: 'scenario_discovery_questions',
    prompt_type: 'short_reply',
    prompt_text: 'A prospect says: "We\'re currently using a competitor\'s product."\n\nWrite a follow-up question to learn more about their experience.',
    target_tone: null,
    reference_notes: 'Stay curious, not defensive. Learn about their needs.',
    tags: ['sales', 'discovery', 'competitor'],
    use_cases: ['sales calls', 'discovery'],
  },
  // Objection Handling (Paid)
  {
    id: 'prompt_objection_1',
    scenario_id: 'scenario_objection_handling',
    prompt_type: 'short_reply',
    prompt_text: 'A prospect says: "Your price is too high compared to alternatives."\n\nWrite a professional response that acknowledges the concern.',
    target_tone: null,
    reference_notes: 'Acknowledge, clarify, then differentiate.',
    tags: ['sales', 'objection', 'pricing'],
    use_cases: ['sales calls', 'objection handling'],
  },
  {
    id: 'prompt_objection_2',
    scenario_id: 'scenario_objection_handling',
    prompt_type: 'tone_rewrite',
    prompt_text: 'Rewrite in a CONFIDENT but not pushy tone:\n\n"Trust me, our product is definitely the best choice for you."',
    target_tone: 'confident',
    reference_notes: 'Confidence comes from evidence, not assertions.',
    tags: ['sales', 'tone', 'confident'],
    use_cases: ['sales calls', 'objection handling'],
  },
];

// Get all content organized by track
export function getAllContent() {
  return {
    tracks: SEED_TRACKS,
    scenarios: SEED_SCENARIOS,
    prompts: SEED_PROMPTS,
  };
}

// Get free content only
export function getFreeContent() {
  const freeTracks = SEED_TRACKS.filter(t => t.is_free);
  const freeTrackIds = freeTracks.map(t => t.id);
  const freeScenarios = SEED_SCENARIOS.filter(s => freeTrackIds.includes(s.track_id));
  const freeScenarioIds = freeScenarios.map(s => s.id);
  const freePrompts = SEED_PROMPTS.filter(p => freeScenarioIds.includes(p.scenario_id));

  return {
    tracks: freeTracks,
    scenarios: freeScenarios,
    prompts: freePrompts,
  };
}

// Get a random prompt (optionally filtered by free content)
export function getRandomPrompt(freeOnly: boolean = false) {
  const prompts = freeOnly ? getFreeContent().prompts : SEED_PROMPTS;
  return prompts[Math.floor(Math.random() * prompts.length)];
}

// Get prompts by scenario
export function getPromptsByScenario(scenarioId: string) {
  return SEED_PROMPTS.filter(p => p.scenario_id === scenarioId);
}

// Get scenario by ID
export function getScenarioById(scenarioId: string) {
  return SEED_SCENARIOS.find(s => s.id === scenarioId);
}

// Get track by ID
export function getTrackById(trackId: string) {
  return SEED_TRACKS.find(t => t.id === trackId);
}

// Get prompt by ID
export function getPromptById(promptId: string) {
  return SEED_PROMPTS.find(p => p.id === promptId);
}

// Check if content is free
export function isContentFree(promptId: string): boolean {
  const prompt = getPromptById(promptId);
  if (!prompt) return false;

  const scenario = getScenarioById(prompt.scenario_id);
  if (!scenario) return false;

  const track = getTrackById(scenario.track_id);
  return track?.is_free ?? false;
}
