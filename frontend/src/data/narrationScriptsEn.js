// English source scripts for contributors recording their own voice in
// another language (see VoiceStudio). `say` is what to read out, translated
// naturally into the contributor's language; `note` is context that is NOT
// read aloud (when the clip plays, what gets spliced after it, ...).
//
// The Norwegian scripts in narrationScripts.js stay the reference for the
// original recordings; keep the two in step when wording changes.

const closeEyes = (who) => `${who}, close your eyes.`;

// activation/end per role id (base ids as used in the play order) and per
// variant id. `end` defaults to "<who>, close your eyes." where `who` is set.
const ROLES = {
  vakt: { who: 'Bodyguard', a: 'Bodyguard, wake up. You may place a shield token on another player\'s card.' },
  dobbeltgjenger: { who: 'Doppelgänger', a: 'Doppelgänger, wake up. Look at another player\'s card. You are now also that role. If that role has a night action, do it now.' },
  varulv: {
    a: 'Werewolves, wake up and look for other werewolves. If you are alone, look at one of the center cards instead.',
    e: 'Werewolves, close your eyes.',
    n: 'If a Dream Wolf is in the game, the real lines are: "Werewolves, except the Dream Wolf, wake up and look for other werewolves. Dream Wolf, stick out your thumb so the other werewolves can see it." and at the end "Dream Wolf, put your thumb away. Werewolves, close your eyes."',
  },
  droemme_ulv: {
    a: 'Werewolves, except the Dream Wolf, wake up and look for other werewolves. Dream Wolf, stick out your thumb so the other werewolves can see it.',
    e: 'Dream Wolf, put your thumb away. Werewolves, close your eyes.',
    n: 'Used instead of the normal Werewolf lines when a Dream Wolf is in the game.',
  },
  alfa_ulv: { who: 'Alpha Wolf', a: 'Alpha Wolf, wake up. Swap the center Werewolf card with another player\'s card.' },
  mystisk_ulv: { who: 'Mystic Wolf', a: 'Mystic Wolf, wake up. You may look at another player\'s card.' },
  undersaatt: {
    a: 'Minion, wake up. Werewolves, stick out your thumbs so the Minion can see who you are.',
    e: 'Werewolves, put your thumbs away. Minion, close your eyes.',
  },
  frimurer: { a: 'Masons, wake up and look for the other Mason.', e: 'Masons, close your eyes.' },
  klarsynt: { who: 'Seer', a: 'Seer, wake up. You may look at another player\'s card, or at two of the center cards.' },
  roever: { who: 'Robber', a: 'Robber, wake up. You may swap your card with another player\'s card. If you did, look at your new card.' },
  heks: { who: 'Witch', a: 'Witch, wake up. You may look at one of the center cards. If you do, you must swap it with another player\'s card.' },
  braakmaker: { who: 'Troublemaker', a: 'Troublemaker, wake up. You may swap the cards of two other players.' },
  landsbyidiiot: { who: 'Village Idiot', a: 'Village Idiot, wake up. You may move everyone else\'s card, all to the left or all to the right.' },
  dranker: { who: 'Drunk', a: 'Drunk, wake up and swap your card with one in the center, without looking at it.' },
  soevnloes: { who: 'Insomniac', a: 'Insomniac, yawn and wake up. Look at your card.' },
  klarsynt_laerling: { who: 'Apprentice Seer', a: 'Apprentice Seer, wake up. You may look at one of the center cards.' },
  paranormal_etterforsker: {
    who: 'Paranormal Investigator',
    a: 'Paranormal Investigator, wake up. You may look at up to two other players\' cards. If you see a Werewolf or Tanner, stop - you have now become what you saw.',
  },
  avsloerer: {
    who: 'Revealer',
    a: 'Revealer, wake up. You may flip another player\'s card face up. If it is a Werewolf or Tanner, flip it back face down.',
    n: 'This is the Daybreak "Revealer" (Norwegian: Avslører/Trollmann in the base game).',
  },
  kurator: { who: 'Curator', a: 'Curator, wake up. You may place a token face down on another player\'s card.' },
  garver_laerling: {
    a: 'Tanner\'s Apprentice, wake up. Tanner, stick out your thumb so the Tanner\'s Apprentice can see who you are.',
    e: 'Tanner, put your thumb away. Tanner\'s Apprentice, close your eyes.',
  },
  aura_klarsynt: {
    a: 'Aura Seer, wake up. Everyone: if you have looked at or moved any card, stick out your thumb so the Aura Seer can see it.',
    e: 'Everyone, put your thumbs away. Aura Seer, close your eyes.',
  },
  oracle: { who: 'Oracle', a: 'Oracle, wake up and answer the following question.' },
  alien: { who: 'Aliens', a: 'Aliens, wake up.' },
  cow: {
    a: 'Cow, stick out your fist. Aliens, if one of you is sitting next to the Cow, tap her on the fist.',
    e: 'Cow, put your fist down. Aliens, close your eyes.',
    n: 'The Cow does not wake up - she keeps her eyes closed and just sticks out her fist. When the Cow is in the game, the Aliens\' own "close your eyes" is skipped and this line closes their eyes instead.',
  },
  groob_alien: {
    a: 'Groob and Zerb, wake up. Look at each other.',
    e: 'Groob and Zerb, close your eyes.',
    n: 'One shared line for both roles.',
  },
  leader: {
    a: 'Leader, wake up. Aliens, stick out your thumbs so the Leader can see you. Zerb and Groob, if you saw each other tonight, point at each other instead, with your eyes closed.',
    e: 'Aliens, put your thumbs down. Zerb and Groob, put your hands down. Leader, close your eyes.',
  },
  psychic: { who: 'Psychic', a: 'Psychic, wake up. Look at one card from...', n: 'A target phrase clip is spliced on after this (e.g. "...a player with an even number"). Record those under "Target phrases".' },
  rascal: { who: 'Rascal', a: 'Rascal, wake up.' },
  exposer: { who: 'Exposer', a: 'Exposer, wake up.' },
  blob: {
    a: 'Blob, wake up.',
    n: 'Only this opening line. Who joins the Blob is spliced on afterwards from the "Blob phrases" clips. There is no separate end line.',
  },
  mortician: { who: 'Mortician', a: 'Mortician, wake up.' },
};

const VARIANTS = {
  dobbeltgjenger_undersaatt: {
    a: 'Doppelgänger, if you are now a Minion, keep your eyes open. Otherwise, close them. Werewolves, stick out your thumbs so the Doppelgänger-Minion can see them.',
    e: 'Werewolves, put your thumbs away. Doppelgänger, close your eyes.',
    n: 'Plays after the Werewolves\' turn, only when a Doppelgänger and a Minion are both in the game.',
  },
  dobbeltgjenger_soevnloes: { who: 'Doppelgänger', a: 'Doppelgänger, if you looked at the Insomniac card, wake up now and look at your card.' },
  dobbeltgjenger_avsloerer: {
    who: 'Doppelgänger',
    a: 'Doppelgänger, if you looked at the Revealer card, wake up and flip a card. If that card is a Werewolf or Tanner, flip it back. You are still the Doppelgänger-Revealer.',
  },
  dobbeltgjenger_kurator: {
    who: 'Doppelgänger',
    a: 'Doppelgänger, if you looked at the Curator card, wake up and place a token face down on any card.',
  },

  oracle_change_team_werewolf: { who: 'Oracle', a: 'Oracle, wake up. Do you want to join the werewolf team?', n: 'The Oracle answers on screen; the app then answers out loud (see "Oracle responses").' },
  oracle_change_team_alien: { who: 'Oracle', a: 'Oracle, wake up. Do you want to join the alien team?', n: 'The Oracle answers on screen; the app then answers out loud.' },
  oracle_exchange: { who: 'Oracle', a: 'Oracle, wake up. Do you want to swap your card with a center card, without looking at it?', n: 'The Oracle answers on screen; the app then answers out loud.' },
  oracle_center: { who: 'Oracle', a: 'Oracle, wake up. Do you want to look at three of the center cards?', n: 'The Oracle answers on screen; the app then says how many cards they actually get to see.' },
  oracle_ripple: { who: 'Oracle', a: 'Oracle, wake up. Do you want to guarantee a ripple?', n: '"Ripple" is the in-game name for a random time event. Use whatever your language\'s official translation is, or a clear equivalent.' },
  oracle_even_odd: { who: 'Oracle', a: 'Oracle, wake up. Is your player number even or odd?', n: 'The answer is announced to everyone.' },
  oracle_player_number: { who: 'Oracle', a: 'Oracle, wake up. Which player number do you want to see the card of?', n: 'The app then announces which card the Oracle looks at (not always the one asked for).' },
  oracle_number: { who: 'Oracle', a: 'Oracle, wake up. Which number between 1 and 10 am I thinking of?', n: 'This is also the fallback question when no other question fits the game.' },

  alien_view_secretly: { who: 'Aliens', a: 'Aliens, wake up. One of you secretly looks at...', n: 'A target phrase is spliced on after this (e.g. "...a player with an even number").' },
  alien_all_view: { who: 'Aliens', a: 'Aliens, wake up. All of you secretly look at...', n: 'A target phrase is spliced on after this.' },
  alien_stare: { who: 'Aliens', a: 'Aliens, wake up. Just stare at each other.' },
  alien_show_cards: { who: 'Aliens', a: 'Aliens, wake up. Show your cards to each other.' },
  alien_pass_left: { who: 'Aliens', a: 'Aliens, wake up. Everyone gives their card to the alien on their left.' },
  alien_pass_right: { who: 'Aliens', a: 'Aliens, wake up. Everyone gives their card to the alien on their right.' },
  alien_timer: { who: 'Aliens', a: 'Aliens, wake up. The time for the discussion is halved this round.' },

  psychic_one_card: { who: 'Psychic', a: 'Psychic, wake up. You may look at one card from...', n: 'A target phrase is spliced on after this (neighbors, even, odd, a specific player number...).' },

  rascal_troublemaker: { who: 'Rascal', a: 'Rascal, wake up. Swap the cards of two players.', n: 'The two player numbers are announced afterwards using the player-number clips.' },
  rascal_robber: { who: 'Rascal', a: 'Rascal, wake up. You may steal the card of...', n: 'A target phrase is spliced on after this. The Rascal does NOT become that role and does not look at the stolen card.' },
  rascal_witch: { who: 'Rascal', a: 'Rascal, wake up. Give a card from the center to...', n: 'A target phrase is spliced on after this.' },

  exposer_one_card: { who: 'Exposer', a: 'Exposer, wake up. You may flip one center card face up, or not. You may not flip any other number.' },
  exposer_two_cards: { who: 'Exposer', a: 'Exposer, wake up. You may flip two center cards face up, or not. You may not flip fewer.' },
  exposer_three_cards: { who: 'Exposer', a: 'Exposer, wake up. You may flip three center cards face up, or not. You may not flip fewer.' },

  mortician_one_card: { who: 'Mortician', a: 'Mortician, wake up. You may look at the card of one of your neighbors - you choose which.' },
  mortician_neighbor_left: { who: 'Mortician', a: 'Mortician, wake up. You may look at the card of your neighbor...', n: 'A target phrase is spliced on after this: "the player to your left".' },
  mortician_neighbor_right: { who: 'Mortician', a: 'Mortician, wake up. You may look at the card of your neighbor...', n: 'A target phrase is spliced on after this: "the player to your right".' },
  mortician_own_card: { who: 'Mortician', a: 'Mortician, wake up. You may look at your own card.' },
  mortician_two_cards: { who: 'Mortician', a: 'Mortician, wake up. You may look at the cards of both your neighbors.' },
  mortician_pretend: { who: 'Mortician', a: 'Mortician, wake up. You may pretend to look at a card.' },
};
// Every Alien variant ends the same way
['alien_view_secretly', 'alien_all_view', 'alien_stare', 'alien_show_cards', 'alien_pass_left', 'alien_pass_right', 'alien_timer'].forEach(id => {
  VARIANTS[id].e = 'Aliens, close your eyes.';
});

export function getEnglishScript(characterId, audioType) {
  const entry = ROLES[characterId] || VARIANTS[characterId];
  if (!entry) return null;
  if (audioType === 'activation') return { say: entry.a, note: entry.n || null };
  return { say: entry.e || (entry.who ? closeEyes(entry.who) : null), note: null };
}

export const GAME_PHASE_SCRIPTS_EN = {
  game_start: { say: 'It is night, time for the night\'s mischief. Everyone, close your eyes.' },
  night_end: {
    say: 'Keep your eyes closed, everyone. Reach out and find your card, and move it around a little.\nEveryone, it is morning. Wake up.',
    note: 'Plays after the last role has closed their eyes.',
  },
  discussion_instruction: {
    say: 'Free wording: tell the players it is time to discuss and find out who the villain is.',
    note: 'Plays right before the discussion timer starts.',
  },
  discussion_end: { say: 'Time is up! Everyone: 3, 2, 1, vote!' },
};

export const FRAGMENT_SCRIPTS_EN = {
  target_even: { say: '...a player with an even number.', note: 'Spliced onto the end of the role\'s line.' },
  target_odd: { say: '...a player with an odd number.', note: 'Spliced onto the end of the role\'s line.' },
  target_left: { say: '...the player to your left.', note: 'Spliced onto the end of the role\'s line.' },
  target_right: { say: '...the player to your right.', note: 'Spliced onto the end of the role\'s line.' },
  target_lower: { say: '...a player with a lower number than you.', note: 'Spliced onto the end of the role\'s line.' },
  target_higher: { say: '...a player with a higher number than you.', note: 'Spliced onto the end of the role\'s line.' },
  target_neighbors: { say: '...both of your neighbors.', note: 'Spliced onto the end of the role\'s line.' },
  target_any: { say: '...any player.', note: 'Spliced onto the end of the role\'s line.' },
  target_center: { say: '...one of the center cards.', note: 'Only used for the Aliens\' "view" outcomes.' },
  target_specific: { say: '...the player with number:', note: 'Followed by one player-number clip.' },
  target_specific_two: { say: '...the players with numbers:', note: 'Followed by two player-number clips.' },

  ripple_intro: { say: 'There has been a ripple in time!', note: 'Always plays first when a ripple happens.' },
  ripple_connector_target: { say: 'The target is:', note: 'Followed by a player number.' },
  ripple_connector_targets: { say: 'The targets are:', note: 'Followed by player numbers.' },
  ripple_connector_swap: { say: 'The players who can be swapped are:', note: 'Followed by player numbers.' },
  ripple_one_minute: { say: 'You only have 1 minute left before you must vote.' },
  ripple_time_loop: { say: 'Time loop! The night repeats, and what the roles do may be different this time.' },
  ripple_time_loop_one_awake: { say: 'Time loop! The night repeats, but one player must keep their eyes open for the rest of the night. The player is:', note: 'Followed by a player number.' },
  ripple_insomniac: { say: 'The following players may secretly look at their own card:', note: 'Followed by 1-3 player numbers.' },
  ripple_may_not_speak: { say: 'The following players may not speak until after the vote:', note: 'Followed by 1-3 player numbers.' },
  ripple_face_away: { say: 'The following players must turn away from the table until the vote is over:', note: 'Followed by 1-3 player numbers.' },
  ripple_troublemaker: { say: 'Troublemaker action! The player may swap the cards of two other players. The player is:', note: 'Followed by a player number, then the "players who can be swapped" clip and two numbers.' },
  ripple_steal: { say: 'Robber action! The player may steal another player\'s card and look at their new card. The player is:', note: 'Followed by a player number, then "The target is:" and a number.' },
  ripple_witch: { say: 'Witch action! The player may look at a center card and must swap it with another player\'s card. The player is:', note: 'Followed by a player number, then "The target is:" and a number.' },
  ripple_view_one: { say: 'Mystic Wolf action! The player may look at another player\'s card. The player is:', note: 'Followed by a player number, then "The target is:" and a number.' },
  ripple_view_two: { say: 'The player may look at the cards of two other players. The player is:', note: 'Followed by a player number, then "The targets are:" and two numbers.' },
  ripple_reveal: { say: 'Revealer action! The player may flip another player\'s card. If it was a Werewolf or Tanner, it is flipped back. The player is:', note: 'Followed by a player number, then "The target is:" and a number.' },
  ripple_dual_view: { say: 'Two players may together look at the same player\'s card. The players are:', note: 'Followed by two player numbers, then "The target is:" and a number.' },
  ripple_two_hand_vote: { say: 'The following players vote with both hands, and therefore have two votes:', note: 'Followed by 1-3 player numbers.' },
  ripple_dual_shuffle: { say: 'Two players show their cards to each other without looking at their own, then shuffle them. The players are:', note: 'Followed by two player numbers.' },
  ripple_drunk: { say: 'Drunk action! The player must swap their card with a center card, without looking at it. The player is:', note: 'Followed by a player number.' },

  blob_alone: { say: 'You are alone in the Blob. Keep yourself alive to win.' },
  blob_both_1: { say: 'The player on each side of you', note: 'Followed by "...are now also part of the Blob..." (blob_ending).' },
  blob_both_2: { say: 'The two players on each side of you', note: 'Followed by blob_ending.' },
  blob_left_2: { say: 'The two players to your left', note: 'Followed by blob_ending.' },
  blob_right_2: { say: 'The two players to your right', note: 'Followed by blob_ending.' },
  blob_left_3: { say: 'The three players to your left', note: 'Followed by blob_ending.' },
  blob_right_3: { say: 'The three players to your right', note: 'Followed by blob_ending.' },
  blob_left_4: { say: 'The four players to your left', note: 'Followed by blob_ending.' },
  blob_right_4: { say: 'The four players to your right', note: 'Followed by blob_ending.' },
  blob_ending: { say: '...are now also part of the Blob. Keep yourself and them alive to win.', note: 'Always the last part of the Blob\'s line.' },

  oracle_join_wake: { say: 'Oracle, wake up and join your team.', note: 'Plays right after the team\'s own wake-up line, when the Oracle chose to join that team.' },
  oracle_join_sleep: { say: 'Oracle, close your eyes.', note: 'Plays right before the team\'s own "close your eyes" line.' },
  oracle_resp_stay_human: { say: 'Good for you. Stay on the village team.' },
  oracle_resp_werewolf_yes: { say: 'You are now on the werewolf team. You wake up with the werewolves.' },
  oracle_resp_alien_yes: { say: 'You are now on the alien team. You wake up with the aliens.' },
  oracle_resp_alien_exchange_yes: { say: 'The aliens\' power this round is to swap cards.' },
  oracle_resp_alien_exchange_nothing: { say: 'Nothing happens.' },
  oracle_resp_alien_exchange_minion: { say: 'You are now a kind of minion for the aliens, but you do not see them.' },
  oracle_resp_exchange_yes: { say: 'Swap your card with a center card, without looking at it.' },
  oracle_resp_exchange_nevermind: { say: 'Actually, never mind. Keep your card.' },
  oracle_resp_keep_card: { say: 'Keep your card.' },
  oracle_resp_center_1: { say: 'You get to look at one card in the center.' },
  oracle_resp_center_2: { say: 'You get to look at two cards in the center.' },
  oracle_resp_center_3: { say: 'You get to look at three cards in the center.' },
  oracle_resp_center_no: { say: 'Of course not. Keep your card.' },
  oracle_resp_ripple_yes: { say: 'OK, there will be a ripple.' },
  oracle_resp_ripple_no: { say: 'Seriously, why not? OK, fine.' },
  oracle_resp_even: { say: 'The Oracle has an even player number.' },
  oracle_resp_odd: { say: 'The Oracle has an odd player number.' },
  oracle_resp_player_see: { say: 'The Oracle looks at the card of player:', note: 'Followed by a player number.' },
  oracle_resp_number_correct: { say: 'Correct! You get to stay awake for the rest of the night.' },
  oracle_resp_number_wrong: { say: 'Wrong! You only win if you do not die. Everyone else wins if the Oracle dies.' },
};

export function getEnglishFragmentScript(fragmentId) {
  if (FRAGMENT_SCRIPTS_EN[fragmentId]) return FRAGMENT_SCRIPTS_EN[fragmentId];
  const playerMatch = /^player_(\d+)$/.exec(fragmentId || '');
  if (playerMatch) {
    return { say: `Player ${playerMatch[1]}.`, note: 'Spliced in after phrases that end with a colon. Say it as your language would call out a player number.' };
  }
  return null;
}
