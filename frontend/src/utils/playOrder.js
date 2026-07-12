import characterConfig from '../data/characters.json';

// Duplicate roles (varulv_1/varulv_2, frimurer_1/2, ...) share one group id
function baseCharacterId(id) {
  return id.replace(/_\d+$/, '');
}

// Doppelgänger records separate audio per game situation (minion phase,
// wake-ups after Insomniac/Exposer/Curator), declared as audioVariants
function findAudioVariant(variantId) {
  for (const character of characterConfig.characters) {
    const variant = (character.audioVariants || []).find((v) => v.id === variantId);
    if (variant) return variant;
  }
  return null;
}

// Build play order from selected characters
export function buildPlayOrder(selectedIds, baseDuration, complexCharacters) {
  const order = [];
  const selectedSet = new Set(selectedIds);
  const addedGroups = new Set();

  // Iterate through play order positions
  characterConfig.playOrder.forEach((entry) => {
    const position = entry.position;
    const characterIds = entry.characterIds || [entry.characterId];

    // Add all selected characters at this position; duplicates of the same
    // role (e.g. two Werewolves) get a single entry and play their audio once
    characterIds.forEach((charId) => {
      if (selectedSet.has(charId)) {
        const groupId = baseCharacterId(charId);
        if (addedGroups.has(groupId)) return;
        addedGroups.add(groupId);

        const character = characterConfig.characters.find((c) => c.id === charId);
        const isComplex = characterIds
          .filter((id) => baseCharacterId(id) === groupId && selectedSet.has(id))
          .some((id) => complexCharacters.includes(id));
        const duration = isComplex ? baseDuration * 2 : baseDuration;

        order.push({
          characterId: groupId,
          characterName: character.norwegianName,
          characterNameEnglish: character.name,
          image: character.image,
          position: position,
          duration: duration,
          isComplex: isComplex,
        });

        // Doppelgänger + Minion: the base slot keeps its normal activation,
        // but the minion phase audio replaces the normal end and gets its
        // own end audio afterwards (3 audio clips in total)
        if (charId === 'dobbeltgjenger' && selectedSet.has('undersaatt')) {
          order[order.length - 1].skipEndAudio = true;
          const variant = findAudioVariant('dobbeltgjenger_undersaatt');
          order.push({
            characterId: 'dobbeltgjenger_undersaatt',
            characterName: variant?.norwegianName || 'Dobbeltgjenger: Undersått-fase',
            characterNameEnglish: variant?.name || 'Doppelgänger: Minion phase',
            image: character.image,
            position: position,
            duration: duration,
            isComplex: isComplex,
          });
        }
      }
    });

    // Handle Dobbeltgjenger conditional positioning
    if (entry.conditionalNext && selectedSet.has('dobbeltgjenger')) {
      const characterId = entry.characterId;
      if (selectedSet.has(characterId)) {
        const character = characterConfig.characters.find((c) => c.id === 'dobbeltgjenger');
        const target = characterConfig.characters.find((c) => c.id === characterId);
        const isComplex = complexCharacters.includes('dobbeltgjenger');
        const duration = isComplex ? baseDuration * 2 : baseDuration;

        // Each conditional wake-up has its own recorded audio
        const variantId = `dobbeltgjenger_${characterId}`;
        const variant = findAudioVariant(variantId);

        order.push({
          characterId: variantId,
          characterName: variant?.norwegianName || `${character.norwegianName}-${target.norwegianName}`,
          characterNameEnglish: variant?.name || `${character.name}-${target.name}`,
          image: character.image,
          position: position,
          duration: duration,
          isComplex: isComplex,
          variant: characterId,
        });
      }
    }
  });

  return order;
}

// Calculate total duration in seconds
export function calculateTotalDuration(playOrder) {
  return playOrder.reduce((total, entry) => total + entry.duration, 0);
}

export function getCharacters() {
  return characterConfig.characters;
}
