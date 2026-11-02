export const SECTIONS = [
  { id: 'surface', index: '01', label: 'The Ocean Above', short: 'Surface', depth: 0, zone: 'Sunlight Zone' },
  { id: 'beneath', index: '02', label: 'Crossing the Surface', short: 'Beneath', depth: 12, zone: 'Sunlight Zone' },
  { id: 'reef', index: '03', label: 'The Living Ocean', short: 'Reef', depth: 40, zone: 'Sunlight Zone' },
  { id: 'glow', index: '04', label: 'The Bioluminescent World', short: 'Glow', depth: 1000, zone: 'Midnight Zone' },
  { id: 'abyss', index: '05', label: 'The Abyss', short: 'Abyss', depth: 6000, zone: 'Abyssal Zone' },
  { id: 'beyond', index: '06', label: 'The Journey Continues', short: 'Beyond', depth: 10935, zone: 'Hadal Zone' },
];

export function zoneFor(depth) {
  if (depth < 200) return 'Sunlight Zone';
  if (depth < 1000) return 'Twilight Zone';
  if (depth < 4000) return 'Midnight Zone';
  if (depth < 6000) return 'Abyssal Zone';
  return 'Hadal Zone';
}

/** Depth (m) for a continuous section phase, eased so descent accelerates. */
export function depthForPhase(phase) {
  const i = Math.min(SECTIONS.length - 1, Math.floor(phase));
  const f = phase - i;
  const a = SECTIONS[i].depth;
  const b = SECTIONS[Math.min(SECTIONS.length - 1, i + 1)].depth;
  const eased = f * f * (3 - 2 * f);
  return a + (b - a) * eased;
}
