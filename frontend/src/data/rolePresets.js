// Curated role sets grouped by player count (selected cards - 3 center cards).
// Two of the source sets (originally labeled "4 players") actually total 8
// cards, which computes to 5 players under this app's player-count rule, so
// they're grouped under 5 here to stay consistent with what the app displays
// once applied.
export const rolePresets = [
  // 3 players
  { characterIds: ['roever', 'undersaatt', 'dobbeltgjenger', 'alfa_ulv', 'mystisk_ulv', 'heks'] },
  { characterIds: ['roever', 'garver_1', 'dobbeltgjenger', 'alfa_ulv', 'heks', 'droemme_ulv'] },
  { characterIds: ['varulv_1', 'varulv_2', 'roever', 'garver_1', 'dranker', 'dobbeltgjenger'] },

  // 4 players
  { characterIds: ['varulv_1', 'klarsynt', 'jeger', 'mystisk_ulv', 'klarsynt_laerling', 'avsloerer', 'livvakt'] },
  { characterIds: ['alien_1', 'alien_2', 'synthetic_alien', 'cow', 'psychic', 'rascal', 'exposer'] },

  // 5 players
  { characterIds: ['varulv_1', 'varulv_2', 'roever', 'garver_1', 'dobbeltgjenger', 'alfa_ulv', 'heks', 'kurator'] },
  { characterIds: ['alfa_ulv', 'mystisk_ulv', 'droemme_ulv', 'roever', 'heks', 'landsbyidiiot', 'aura_klarsynt', 'forbannet'] },
  { characterIds: ['varulv_1', 'klarsynt', 'soevnloes', 'mystisk_ulv', 'klarsynt_laerling', 'paranormal_etterforsker', 'heks', 'avsloerer'] },
  { characterIds: ['varulv_1', 'roever', 'braakmaker', 'dobbeltgjenger', 'alfa_ulv', 'heks', 'landsbyidiiot', 'kurator'] },
  { characterIds: ['klarsynt', 'braakmaker', 'garver_1', 'soevnloes', 'alfa_ulv', 'mystisk_ulv', 'paranormal_etterforsker', 'heks'] },

  // 6 players
  { characterIds: ['varulv_1', 'varulv_2', 'landsbyboer_1', 'klarsynt', 'roever', 'braakmaker', 'garver_1', 'dranker', 'undersaatt'] },
  { characterIds: ['roever', 'braakmaker', 'garver_1', 'undersaatt', 'dobbeltgjenger', 'mystisk_ulv', 'paranormal_etterforsker', 'heks', 'droemme_ulv'] },
  { characterIds: ['varulv_1', 'varulv_2', 'klarsynt', 'roever', 'braakmaker', 'undersaatt', 'dobbeltgjenger', 'heks', 'avsloerer'] },
  { characterIds: ['varulv_1', 'varulv_2', 'landsbyboer_1', 'landsbyboer_2', 'landsbyboer_3', 'garver_1', 'frimurer_1', 'frimurer_2', 'dobbeltgjenger'] },

  // 7 players
  { characterIds: ['varulv_1', 'varulv_2', 'landsbyboer_1', 'landsbyboer_2', 'klarsynt', 'roever', 'braakmaker', 'garver_1', 'dranker', 'undersaatt'] },
  { characterIds: ['roever', 'garver_1', 'dranker', 'undersaatt', 'alfa_ulv', 'klarsynt_laerling', 'paranormal_etterforsker', 'heks', 'avsloerer', 'droemme_ulv'] },
].map((preset, index) => ({
  id: `preset_${index + 1}`,
  playerCount: preset.characterIds.length - 3,
  characterIds: preset.characterIds,
}));
