// The full list of recordings a complete voice needs, grouped for the voice
// studio (VoiceStudio). Mirrors what the game can actually play: roles with
// a fixed line (activation + end), the variants of roles whose narration is
// picked at random (only those that can occur, i.e. a weight above 0), the
// spliced-in fragments, and the game-phase clips.
//
// Each clip: { id, type, label, say, note } where id/type are the clip's
// characterId/audioType in the audio catalog.

import characterConfig from './characters.json';
import { getEnglishScript, getEnglishFragmentScript, GAME_PHASE_SCRIPTS_EN } from './narrationScriptsEn';
import { SINGLE_TARGET_FRAGMENTS, MAX_PLAYER_NUMBER_FRAGMENTS, playerNumberFragmentId } from './targetFragments';
import { RIPPLE_EVENTS } from './rippleEvents';
import { BLOB_FRAGMENTS } from './blobFragments';
import { ORACLE_RESPONSES } from './oracleResponses';

// Zerb shares Groob's wake-up (one recording), duplicates (varulv_1/2) share one
const groupId = (id) => (id === 'zerb' ? 'groob_alien' : id.replace(/_\d+$/, ''));

function roleClips(id, label) {
  const clips = [];
  const activation = getEnglishScript(id, 'activation');
  const end = getEnglishScript(id, 'end');
  clips.push({ id, type: 'activation', label: `${label} - wake up`, say: activation?.say || '', note: activation?.note || null });
  clips.push({ id, type: 'end', label: `${label} - close eyes`, say: end?.say || '', note: end?.note || null });
  return clips;
}

export function buildRequiredSections() {
  const sections = [];

  sections.push({
    id: 'phase',
    title: 'Game phases',
    clips: Object.entries(GAME_PHASE_SCRIPTS_EN).map(([id, s]) => ({
      id,
      type: id,
      label: id.replace(/_/g, ' '),
      say: s.say,
      note: s.note || null,
    })),
  });

  const games = { werewolf: 'Werewolf roles', daybreak: 'Daybreak roles', alien: 'Alien roles' };
  const byGame = { werewolf: [], daybreak: [], alien: [] };
  const seen = new Set();

  characterConfig.characters.forEach((char) => {
    if (char.noNightAction) return;
    const gid = groupId(char.id);
    if (seen.has(gid)) return;
    seen.add(gid);
    const game = (char.games && char.games[0]) || 'werewolf';
    const name = char.audioNameEnglish || char.name;
    const list = byGame[game] || (byGame[game] = []);

    if (char.narrationVariants) {
      char.narrationVariants
        .filter((v) => v.weight > 0)
        .forEach((v) => list.push(...roleClips(v.id, v.name)));
    } else {
      const clips = roleClips(gid, name);
      list.push(...(char.noEndAudio ? clips.filter((c) => c.type !== 'end') : clips));
    }
    (char.audioVariants || []).forEach((v) => list.push(...roleClips(v.id, v.name)));
  });

  Object.entries(games).forEach(([game, title]) => {
    if (byGame[game].length) sections.push({ id: `roles_${game}`, title, clips: byGame[game] });
  });

  const fragment = (id, label) => {
    const s = getEnglishFragmentScript(id);
    return { id, type: 'fragment', label, say: s?.say || '', note: s?.note || null };
  };

  sections.push({
    id: 'targets',
    title: 'Target phrases',
    clips: SINGLE_TARGET_FRAGMENTS.map((f) => fragment(f.id, f.id.replace(/_/g, ' '))),
  });
  sections.push({
    id: 'numbers',
    title: 'Player numbers',
    clips: Array.from({ length: MAX_PLAYER_NUMBER_FRAGMENTS }, (_, i) =>
      fragment(playerNumberFragmentId(i + 1), `Player ${i + 1}`)
    ),
  });
  sections.push({
    id: 'ripples',
    title: 'Ripples (random time events)',
    clips: RIPPLE_EVENTS.filter((r) => r.weight === undefined || r.weight > 0).map((r) =>
      fragment(r.id, r.id.replace(/^ripple_/, '').replace(/_/g, ' '))
    ),
  });
  sections.push({
    id: 'blob',
    title: 'Blob phrases',
    clips: BLOB_FRAGMENTS.map((f) => fragment(f.id, f.id.replace(/_/g, ' '))),
  });
  sections.push({
    id: 'oracle',
    title: 'Oracle responses',
    clips: [
      ...ORACLE_RESPONSES.map((r) => fragment(r.id, r.id.replace(/^oracle_(resp_)?/, '').replace(/_/g, ' '))),
    ],
  });

  return sections;
}

export const clipKey = (clip) => `${clip.id}/${clip.type}`;
