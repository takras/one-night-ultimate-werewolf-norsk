// "Forstyrrelse i tiden" (ripple) events, based on the One Night wiki's
// Ripples page (wiki/Ripples _ One Night Wiki _ Fandom.html). Announcements
// are recorded as fragment clips (audioType 'fragment'), referenced by a
// fixed id rather than tied to one character.
//
// weight: default percentage from the wiki. Together with
// RIPPLE_NONE_WEIGHT the weights add up to 100, so a ripple is ONE weighted
// pick (not independent rolls per type). The wiki says these are the app's
// defaults and can be changed - edit the numbers here to do the same.
//
// sequence: what's spliced after the ripple's own clip, in order. 'player'
// stands for a random seat number (spoken with the player_N clips), any
// other string is a fixed connector fragment id. All seat numbers within
// one ripple are distinct. `playerCount: [min, max]` instead means "a random
// number of seats in that range" (the wiki says "some players").
//
// The "action" ripples (Steal, Witch, ...) do NOT require the matching role
// to be in the game: the app just tells a seated player to perform it.

export const RIPPLE_NONE_WEIGHT = 20;

export const RIPPLE_EVENTS = [
  { id: 'ripple_intro', norwegianLabel: 'Tidsbølge-intro ("Det har vært en tidsbølge!")' },
  { id: 'ripple_connector_target', norwegianLabel: 'Bindeord: "Målet er..."' },
  { id: 'ripple_connector_targets', norwegianLabel: 'Bindeord: "Målene er..."' },
  { id: 'ripple_connector_swap', norwegianLabel: 'Bindeord: "Spillerne som kan byttes om, er..."' },

  { id: 'ripple_one_minute', norwegianLabel: '1 minutt igjen', weight: 5 },
  { id: 'ripple_time_loop', norwegianLabel: 'Tidssløyfe', weight: 5 },
  { id: 'ripple_time_loop_one_awake', norwegianLabel: 'Tidssløyfe - én spiller holder øynene åpne', weight: 5, sequence: ['player'] },
  { id: 'ripple_insomniac', norwegianLabel: 'Søvnløs - se eget kort (1-3 spillere)', weight: 5, playerCount: [1, 3] },
  { id: 'ripple_may_not_speak', norwegianLabel: 'Ikke lov å snakke (1-3 spillere)', weight: 5, playerCount: [1, 3] },
  { id: 'ripple_face_away', norwegianLabel: 'Snu deg bort (1-3 spillere)', weight: 5, playerCount: [1, 3] },
  { id: 'ripple_troublemaker', norwegianLabel: 'Bråkmaker-handling', weight: 5, sequence: ['player', 'ripple_connector_swap', 'player', 'player'] },
  { id: 'ripple_steal', norwegianLabel: 'Røver-handling', weight: 5, sequence: ['player', 'ripple_connector_target', 'player'] },
  { id: 'ripple_witch', norwegianLabel: 'Heks-handling', weight: 5, sequence: ['player', 'ripple_connector_target', 'player'] },
  { id: 'ripple_view_one', norwegianLabel: 'Mystisk ulv-handling (se ett kort)', weight: 5, sequence: ['player', 'ripple_connector_target', 'player'] },
  { id: 'ripple_view_two', norwegianLabel: 'Se to kort', weight: 5, sequence: ['player', 'ripple_connector_targets', 'player', 'player'] },
  { id: 'ripple_reveal', norwegianLabel: 'Trollmann-handling (flipp et kort)', weight: 5, sequence: ['player', 'ripple_connector_target', 'player'] },
  { id: 'ripple_dual_view', norwegianLabel: 'To spillere ser på samme kort', weight: 5, sequence: ['player', 'player', 'ripple_connector_target', 'player'] },
  { id: 'ripple_two_hand_vote', norwegianLabel: 'To-hånds stemme (1-3 spillere)', weight: 5, playerCount: [1, 3] },
  { id: 'ripple_dual_shuffle', norwegianLabel: 'Vis og bland kort (2 spillere)', weight: 5, sequence: ['player', 'player'] },
  { id: 'ripple_drunk', norwegianLabel: 'Dranker-handling', weight: 5, sequence: ['player'] },

  // 0% by default per the wiki - raise the weight to enable. (The wiki's
  // "Repeat Role" ripple is not implemented: it needs a clip per role name.)
  { id: 'ripple_vote_for_app', norwegianLabel: 'Stem på appen', weight: 0 },
  { id: 'ripple_i_am_an_alien', norwegianLabel: '"Jeg er et romvesen" (1-3 spillere)', weight: 0, playerCount: [1, 3] },
];

// Expands a ripple into the ordered list of 'player' / connector fragment
// ids that follow its own clip
export function rippleSequence(ripple) {
  if (ripple.playerCount) {
    const [min, max] = ripple.playerCount;
    const n = min + Math.floor(Math.random() * (max - min + 1));
    return Array.from({ length: n }, () => 'player');
  }
  return ripple.sequence || [];
}

// One weighted pick over every ripple plus "none". `guaranteed` (the Oracle
// said yes) leaves "none" out, so the pick is proportional among the real
// ripples. Returns null when no ripple happens.
export function pickRipple(guaranteed = false) {
  const pool = RIPPLE_EVENTS.filter(r => r.weight > 0);
  const total = pool.reduce((s, r) => s + r.weight, 0) + (guaranteed ? 0 : RIPPLE_NONE_WEIGHT);
  let roll = Math.random() * total;
  for (const ripple of pool) {
    roll -= ripple.weight;
    if (roll < 0) return ripple;
  }
  return null;
}
