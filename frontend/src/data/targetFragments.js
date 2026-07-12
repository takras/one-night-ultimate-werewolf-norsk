// Short, reusable "target" narration clips (audioType 'fragment') that get
// spliced onto the end of an activation clip at playback time, instead of
// re-recording a full sentence for every possible target. Used by roles
// whose characters.json entry (or chosen narrationVariant) has a
// `targetType` of 'single', 'left', or 'right'.
export const SINGLE_TARGET_FRAGMENTS = [
  { id: 'target_even', norwegianLabel: 'Tilfeldig spiller med partallsnummer' },
  { id: 'target_odd', norwegianLabel: 'Tilfeldig spiller med oddetallsnummer' },
  { id: 'target_left', norwegianLabel: 'Spilleren til venstre' },
  { id: 'target_right', norwegianLabel: 'Spilleren til høyre' },
  { id: 'target_lower', norwegianLabel: 'Spiller med lavere nummer enn deg' },
  { id: 'target_any', norwegianLabel: 'Hvilken som helst spiller' },
];

export const MAX_PLAYER_NUMBER_FRAGMENTS = 12;

export function playerNumberFragmentId(n) {
  return `player_${n}`;
}

// Resolves a targetType ('single' | 'left' | 'right') to the fragment id
// that should be spliced in. 'single' picks randomly among the six above;
// 'left'/'right' are fixed (used when the variant itself already commits
// to a direction, e.g. the Alien "look left" variant).
export function pickTargetFragmentId(targetType) {
  if (targetType === 'left') return 'target_left';
  if (targetType === 'right') return 'target_right';
  const fragment = SINGLE_TARGET_FRAGMENTS[Math.floor(Math.random() * SINGLE_TARGET_FRAGMENTS.length)];
  return fragment.id;
}
