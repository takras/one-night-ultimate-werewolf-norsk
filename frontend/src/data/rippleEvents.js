// "Forstyrrelse i tiden" (ripple) event announcements, recorded as fragment
// clips (audioType 'fragment', same as target phrases/player numbers) since
// they're the same shape: short, reusable, referenced by a fixed id rather
// than tied to one character. See instruksjoner_alien.txt, "RIPPLE-EFFEKTER".
//
// requiresCharacterId: this ripple can only be picked if that role is in
// the selected roster (Bråkmaker/Heks "wake again" only make sense if that
// role exists this game).
// playerNumbersNeeded: how many distinct player_N fragments to splice on
// after the ripple's own clip (randomly chosen from the seated players).
export const RIPPLE_EVENTS = [
  { id: 'ripple_intro', norwegianLabel: 'Ripple-intro ("Det har vært en ripple i tiden!")' },
  { id: 'ripple_time_loop', norwegianLabel: 'Tidssløyfe' },
  { id: 'ripple_one_minute_left', norwegianLabel: '1 minutt igjen' },
  { id: 'ripple_no_talking', norwegianLabel: 'Ikke lov å snakke' },
  { id: 'ripple_turn_away', norwegianLabel: 'Snu deg bort (1 spiller)', playerNumbersNeeded: 1 },
  { id: 'ripple_troublemaker_again', norwegianLabel: 'Bråkmaker våkner igjen', requiresCharacterId: 'braakmaker' },
  { id: 'ripple_witch_again', norwegianLabel: 'Heks våkner igjen', requiresCharacterId: 'heks' },
  { id: 'ripple_view_own_card_one', norwegianLabel: 'Se eget kort - 1 spiller', playerNumbersNeeded: 1 },
  { id: 'ripple_view_own_card_two', norwegianLabel: 'Se eget kort - 2 spillere', playerNumbersNeeded: 2 },
  { id: 'ripple_two_handed_vote', norwegianLabel: 'To-hånds stemme' },
  { id: 'ripple_you_are_alien', norwegianLabel: 'Du er et romvesen' },
];

// Baseline chance a ripple happens at all, overridden to 100% when the
// Oracle player answered "yes" to "vil du garantere en ripple?"
export const RIPPLE_CHANCE = 0.2;

// Every non-intro ripple was recorded at an equal 5% share in the source
// material, so once the ineligible (missing-role) ones are filtered out,
// picking uniformly among what's left reproduces the same proportions.
export function eligibleRippleEvents(selectedCharacterIds) {
  return RIPPLE_EVENTS.filter(r => r.id !== 'ripple_intro').filter(
    r => !r.requiresCharacterId || selectedCharacterIds.includes(r.requiresCharacterId)
  );
}
