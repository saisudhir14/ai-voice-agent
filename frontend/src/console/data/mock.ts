import type { LatencyBreakdown } from '../charts'

export type AgentStatus = 'live' | 'draft' | 'paused'

export type Agent = {
  id: string
  name: string
  industry: string
  status: AgentStatus
  calls: number
  avgDur: number
  successRate: number
  lastCall: string
  voice: string
  llm: string
  updated: string
}

export type Conversation = {
  id: string
  agent: string
  agentId: string
  from: string
  started: string
  duration: number
  outcome: string
  sentiment: 'positive' | 'neutral' | 'negative' | '—'
  cost: number
  latency: number
  turns: number
}

export type PhoneNumber = {
  id: string
  number: string
  label: string
  agent: string
  region: string
  provider: string
  status: 'active' | 'unassigned'
  monthly: number
  usage: string
}

export type ApiKey = {
  id: string
  label: string
  env: 'production' | 'staging' | 'development'
  created: string
  lastUsed: string
  creator: string
  scopes: string[]
}

export type Voice = {
  id: string
  provider: string
  name: string
  gender: string
  lang: string
  latency: number
}

export type Industry = {
  slug: string
  name: string
  desc: string
}

export type TranscriptTurn = {
  role: 'agent' | 'caller'
  t: string
  text: string
  latency?: number
}

export const AGENTS: Agent[] = [
  {
    id: 'ag_01HX',
    name: 'Zenith Support',
    industry: 'Customer Support',
    status: 'live',
    calls: 2847,
    avgDur: 183,
    successRate: 94.2,
    lastCall: '2m ago',
    voice: 'Cartesia / Sonic Nova',
    llm: 'claude-sonnet-4.5',
    updated: 'Apr 17, 2026',
  },
  {
    id: 'ag_02KL',
    name: 'Apex Sales Qualifier',
    industry: 'Sales',
    status: 'live',
    calls: 1203,
    avgDur: 247,
    successRate: 68.4,
    lastCall: '14m ago',
    voice: 'ElevenLabs / Aria',
    llm: 'gpt-4o',
    updated: 'Apr 16, 2026',
  },
  {
    id: 'ag_03MN',
    name: 'Helix Triage RN',
    industry: 'Healthcare',
    status: 'live',
    calls: 4521,
    avgDur: 312,
    successRate: 91.0,
    lastCall: 'Live now',
    voice: 'Cartesia / Sonic Sage',
    llm: 'claude-sonnet-4.5',
    updated: 'Apr 18, 2026',
  },
  {
    id: 'ag_04PQ',
    name: 'Meridian Reservations',
    industry: 'Hospitality',
    status: 'live',
    calls: 892,
    avgDur: 145,
    successRate: 88.1,
    lastCall: '1h ago',
    voice: 'Cartesia / Sonic Luna',
    llm: 'claude-haiku-4.5',
    updated: 'Apr 15, 2026',
  },
  {
    id: 'ag_05RS',
    name: 'Vanta Collections',
    industry: 'Finance',
    status: 'draft',
    calls: 14,
    avgDur: 91,
    successRate: 71.0,
    lastCall: '2d ago',
    voice: 'ElevenLabs / Drew',
    llm: 'gpt-4o',
    updated: 'Apr 14, 2026',
  },
  {
    id: 'ag_06TU',
    name: 'Parcel Logistics Dispatch',
    industry: 'Logistics',
    status: 'paused',
    calls: 678,
    avgDur: 128,
    successRate: 84.7,
    lastCall: '3h ago',
    voice: 'Cartesia / Sonic Nova',
    llm: 'claude-sonnet-4.5',
    updated: 'Apr 12, 2026',
  },
  {
    id: 'ag_07VW',
    name: 'Lumen Scheduling',
    industry: 'Healthcare',
    status: 'live',
    calls: 3102,
    avgDur: 168,
    successRate: 96.3,
    lastCall: '8m ago',
    voice: 'Cartesia / Sonic Sage',
    llm: 'claude-haiku-4.5',
    updated: 'Apr 18, 2026',
  },
  {
    id: 'ag_08XY',
    name: 'North Star Concierge',
    industry: 'Hospitality',
    status: 'draft',
    calls: 0,
    avgDur: 0,
    successRate: 0,
    lastCall: '—',
    voice: 'ElevenLabs / Aria',
    llm: 'gpt-4o',
    updated: 'Apr 18, 2026',
  },
]

export const CONVERSATIONS: Conversation[] = [
  { id: 'cv_91A2', agent: 'Helix Triage RN', agentId: 'ag_03MN', from: '+1 (415) 555-0182', started: 'Apr 18, 14:42', duration: 287, outcome: 'Resolved', sentiment: 'positive', cost: 0.41, latency: 612, turns: 14 },
  { id: 'cv_91B3', agent: 'Zenith Support', agentId: 'ag_01HX', from: '+1 (206) 555-0147', started: 'Apr 18, 14:38', duration: 193, outcome: 'Resolved', sentiment: 'positive', cost: 0.28, latency: 580, turns: 9 },
  { id: 'cv_91C4', agent: 'Apex Sales Qualifier', agentId: 'ag_02KL', from: '+44 20 7946 0813', started: 'Apr 18, 14:35', duration: 341, outcome: 'Qualified', sentiment: 'neutral', cost: 0.52, latency: 721, turns: 16 },
  { id: 'cv_91D5', agent: 'Meridian Reservations', agentId: 'ag_04PQ', from: '+1 (312) 555-0194', started: 'Apr 18, 14:30', duration: 112, outcome: 'Booked', sentiment: 'positive', cost: 0.18, latency: 534, turns: 6 },
  { id: 'cv_91E6', agent: 'Zenith Support', agentId: 'ag_01HX', from: '+1 (718) 555-0103', started: 'Apr 18, 14:24', duration: 428, outcome: 'Escalated', sentiment: 'negative', cost: 0.64, latency: 698, turns: 21 },
  { id: 'cv_91F7', agent: 'Helix Triage RN', agentId: 'ag_03MN', from: '+1 (602) 555-0228', started: 'Apr 18, 14:18', duration: 201, outcome: 'Resolved', sentiment: 'positive', cost: 0.31, latency: 604, turns: 11 },
  { id: 'cv_91G8', agent: 'Apex Sales Qualifier', agentId: 'ag_02KL', from: '+1 (408) 555-0171', started: 'Apr 18, 14:12', duration: 94, outcome: 'Disqualified', sentiment: 'neutral', cost: 0.14, latency: 655, turns: 5 },
  { id: 'cv_91H9', agent: 'Lumen Scheduling', agentId: 'ag_07VW', from: '+1 (503) 555-0159', started: 'Apr 18, 14:06', duration: 156, outcome: 'Booked', sentiment: 'positive', cost: 0.24, latency: 521, turns: 8 },
  { id: 'cv_91I0', agent: 'Zenith Support', agentId: 'ag_01HX', from: '+1 (917) 555-0187', started: 'Apr 18, 13:58', duration: 67, outcome: 'Missed', sentiment: '—', cost: 0.02, latency: 0, turns: 1 },
  { id: 'cv_91J1', agent: 'Meridian Reservations', agentId: 'ag_04PQ', from: '+1 (305) 555-0122', started: 'Apr 18, 13:51', duration: 221, outcome: 'Booked', sentiment: 'positive', cost: 0.33, latency: 567, turns: 10 },
]

export const NUMBERS: PhoneNumber[] = [
  { id: 'pn_001', number: '+1 (415) 555-0100', label: 'US / Main Support', agent: 'Zenith Support', region: 'US-West', provider: 'Twilio', status: 'active', monthly: 2.00, usage: '12,402 min' },
  { id: 'pn_002', number: '+1 (212) 555-0200', label: 'US / Healthcare Triage', agent: 'Helix Triage RN', region: 'US-East', provider: 'Twilio', status: 'active', monthly: 2.00, usage: '18,914 min' },
  { id: 'pn_003', number: '+44 20 7946 0800', label: 'UK / Sales Outbound', agent: 'Apex Sales Qualifier', region: 'EU-West', provider: 'Telnyx', status: 'active', monthly: 1.50, usage: '4,221 min' },
  { id: 'pn_004', number: '+1 (312) 555-0300', label: 'US / Reservations', agent: 'Meridian Reservations', region: 'US-Central', provider: 'Twilio', status: 'active', monthly: 2.00, usage: '6,108 min' },
  { id: 'pn_005', number: '+1 (503) 555-0400', label: 'US / Scheduling', agent: 'Lumen Scheduling', region: 'US-West', provider: 'Vonage', status: 'active', monthly: 1.75, usage: '9,332 min' },
  { id: 'pn_006', number: '+61 2 8066 0900', label: 'AU / Concierge (unassigned)', agent: '—', region: 'APAC', provider: 'Twilio', status: 'unassigned', monthly: 3.00, usage: '0 min' },
]

export const API_KEYS: ApiKey[] = [
  { id: 'sk_live_...9fAb', label: 'Production (Backend)', env: 'production', created: 'Mar 04, 2026', lastUsed: '2m ago', creator: 'Sai Patel', scopes: ['agents:read', 'agents:write', 'calls:read', 'calls:write'] },
  { id: 'sk_live_...7kLm', label: 'Realtime WebSocket Gateway', env: 'production', created: 'Feb 19, 2026', lastUsed: '18s ago', creator: 'Sai Patel', scopes: ['calls:write', 'realtime'] },
  { id: 'sk_test_...2pQr', label: 'Staging CI', env: 'staging', created: 'Jan 28, 2026', lastUsed: '1h ago', creator: 'Jordan Kim', scopes: ['agents:read', 'agents:write', 'calls:read'] },
  { id: 'sk_test_...4vXz', label: 'Developer — Local (Jordan)', env: 'development', created: 'Feb 02, 2026', lastUsed: '3d ago', creator: 'Jordan Kim', scopes: ['*'] },
]

export const VOICES: Voice[] = [
  { id: 'cartesia_sonic_nova', provider: 'Cartesia', name: 'Sonic Nova', gender: 'F', lang: 'en-US', latency: 90 },
  { id: 'cartesia_sonic_sage', provider: 'Cartesia', name: 'Sonic Sage', gender: 'M', lang: 'en-US', latency: 92 },
  { id: 'cartesia_sonic_luna', provider: 'Cartesia', name: 'Sonic Luna', gender: 'F', lang: 'en-US', latency: 88 },
  { id: 'eleven_aria', provider: 'ElevenLabs', name: 'Aria', gender: 'F', lang: 'en-US', latency: 165 },
  { id: 'eleven_drew', provider: 'ElevenLabs', name: 'Drew', gender: 'M', lang: 'en-US', latency: 170 },
  { id: 'playht_jennifer', provider: 'PlayHT', name: 'Jennifer', gender: 'F', lang: 'en-US', latency: 210 },
]

export const INDUSTRIES: Industry[] = [
  { slug: 'customer-support', name: 'Customer Support', desc: 'Tier 1 deflection, FAQ, ticket intake' },
  { slug: 'sales', name: 'Sales & Qualification', desc: 'Outbound prospecting, BANT qualification' },
  { slug: 'healthcare', name: 'Healthcare', desc: 'Triage, scheduling, prior auth, refills' },
  { slug: 'hospitality', name: 'Hospitality', desc: 'Reservations, concierge, cancellations' },
  { slug: 'finance', name: 'Finance & Collections', desc: 'Balance inquiry, payments, collections' },
  { slug: 'logistics', name: 'Logistics', desc: 'Dispatch, driver check-in, ETA updates' },
  { slug: 'legal', name: 'Legal Intake', desc: 'Client intake, conflict check, scheduling' },
  { slug: 'custom', name: 'Blank / Custom', desc: 'Start from scratch' },
]

export const LIVE_TRANSCRIPT: TranscriptTurn[] = [
  { role: 'agent', t: '00:02', text: "Hi, this is Helix from Meridian Health. I'm an AI assistant — how can I help you today?", latency: 612 },
  { role: 'caller', t: '00:08', text: "Hi, yeah, my daughter has a fever of about 102 and she's been coughing all night." },
  { role: 'agent', t: '00:14', text: "I'm sorry to hear that. I'll help you triage this quickly. Can you tell me her age and whether she has any chronic conditions?", latency: 584 },
  { role: 'caller', t: '00:22', text: "She's four. No conditions, no allergies." },
  { role: 'agent', t: '00:26', text: 'Thank you. Is she breathing normally, or does she seem to be struggling — flaring her nostrils, pulling in at the ribs?', latency: 601 },
  { role: 'caller', t: '00:35', text: 'Breathing seems normal. Just the cough and the fever.' },
  { role: 'agent', t: '00:39', text: "Good. Based on what you've shared, this sounds like a same-day visit rather than an emergency. I can book you with Dr. Lin at 2:40 PM today, or with our nurse practitioner at 1:15.", latency: 647 },
  { role: 'caller', t: '00:52', text: "1:15 works. That's at the Broadway location, right?" },
  { role: 'agent', t: '00:56', text: "Correct — 2200 Broadway, Suite 3. I'm confirming that now.", latency: 523 },
]

// Deterministic seeded PRNG (mulberry32) so demo fixtures are reproducible
// and free of the non-crypto Math.random() pattern flagged by static analysis.
const mulberry32 = (seed: number): (() => number) => {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const rand = mulberry32(0x1a771ce)

const genSpark = (n: number, base: number, variance: number): number[] =>
  Array.from({ length: n }, (_, i) => base + Math.sin(i / 2.2) * variance * 0.4 + Math.cos(i / 1.7) * variance * 0.3 + (rand() - 0.5) * variance * 0.4)

export const SPARKS = {
  calls: [14, 18, 22, 19, 24, 28, 31, 27, 33, 38, 42, 39, 44, 48, 52, 49, 56, 61, 58, 64, 69, 72, 68, 74],
  latency: [620, 605, 588, 612, 598, 576, 582, 594, 568, 572, 556, 549, 562, 554, 541, 538, 545, 531, 528, 535, 521, 518, 524, 509],
  cost: genSpark(24, 0.35, 0.15),
  success: [91.2, 92.1, 91.8, 92.4, 93.1, 92.8, 93.5, 94.0, 93.6, 94.2, 94.5, 94.8, 94.3, 94.9, 95.2, 95.0, 94.6, 95.1, 95.4, 95.2, 95.6, 95.8, 95.5, 95.9],
}

export const LATENCY_ROWS: LatencyBreakdown[] = Array.from({ length: 40 }, () => ({
  stt: 80 + Math.floor(rand() * 60),
  llm: 200 + Math.floor(rand() * 180),
  tts: 90 + Math.floor(rand() * 80),
  net: 30 + Math.floor(rand() * 40),
}))
