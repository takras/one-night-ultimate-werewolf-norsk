// Short, reusable "target" narration clips (audioType 'fragment') that get
// spliced onto the end of an activation clip at playback time, instead of
// re-recording a full sentence for every possible target. Used by roles
// whose characters.json entry (or chosen narrationVariant) has a
// `targetType` of 'single', 'left', or 'right'.
export const SINGLE_TARGET_FRAGMENTS = [
  { id: 'target_even', norwegianLabel: 'Spiller med partallsnummer' },
  { id: 'target_odd', norwegianLabel: 'Spiller med oddetallsnummer' },
  { id: 'target_left', norwegianLabel: 'Spilleren til venstre' },
  { id: 'target_right', norwegianLabel: 'Spilleren til høyre' },
  { id: 'target_lower', norwegianLabel: 'Spiller med lavere nummer enn deg' },
  { id: 'target_higher', norwegianLabel: 'Spiller med høyere nummer enn deg' },
  { id: 'target_neighbors', norwegianLabel: 'Begge naboene dine' },
  { id: 'target_any', norwegianLabel: 'Hvilken som helst spiller' },
  { id: 'target_center', norwegianLabel: 'Et kort i midten (kun Romvesen-visning)', viewOnly: true },
  { id: 'target_specific', norwegianLabel: 'Psykisk: spilleren med et bestemt nummer (etterfølges av spillernummer)', psychicOnly: true },
  { id: 'target_specific_two', norwegianLabel: 'Psykisk: to spillere med bestemte numre (etterfølges av to spillernummer)', psychicOnly: true },
];

// Psychic targets (wiki: neighbors, odd, even, or players of specified
// numbers; the wiki says the list may be incomplete, so the left/right/
// lower/higher phrases from the real app are kept too)
const PSYCHIC_TARGET_IDS = ['target_even', 'target_odd', 'target_neighbors', 'target_left', 'target_right', 'target_lower', 'target_higher'];

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
  // 'view' (Alien view outcomes) may also target the center; 'single' may not
  const pool = targetType === 'view'
    ? SINGLE_TARGET_FRAGMENTS.filter(f => !f.psychicOnly)
    : SINGLE_TARGET_FRAGMENTS.filter(f => !f.viewOnly && !f.psychicOnly);
  return pool[Math.floor(Math.random() * pool.length)].id;
}

// Full list of fragment ids to splice after an activation clip. Usually
// just one target phrase; for the Psychic ('psychic' type) a "specified
// numbers" outcome is followed by the picked player-number clips too.
// cardCount is how many cards the role may view (Psychic: 1, or 2 via the
// randomization screen); maxPlayer is the highest seat number in the game.
export function pickTargetFragmentSequence(targetType, cardCount = 1, maxPlayer = 0) {
  if (targetType !== 'psychic') return [pickTargetFragmentId(targetType)];

  const options = PSYCHIC_TARGET_IDS.length + (maxPlayer >= cardCount ? 1 : 0);
  const roll = Math.floor(Math.random() * options);
  if (roll < PSYCHIC_TARGET_IDS.length) return [PSYCHIC_TARGET_IDS[roll]];

  const pool = Array.from({ length: Math.min(maxPlayer, MAX_PLAYER_NUMBER_FRAGMENTS) }, (_, i) => i + 1);
  const picked = [];
  for (let i = 0; i < cardCount && pool.length > 0; i++) {
    picked.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
  }
  return [cardCount >= 2 ? 'target_specific_two' : 'target_specific', ...picked.map(playerNumberFragmentId)];
}
