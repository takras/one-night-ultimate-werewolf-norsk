// The Oracle's question is shown on screen with answer buttons (see
// GameScreen). The Oracle has ORACLE_SELECT_SECONDS to pick; picking early
// changes nothing (the step always takes the full time, so nobody can tell
// when - or whether - a choice was made). With no pick the app chooses at
// random. The app then answers out loud with one or more recorded clips
// (audioType 'fragment', ids below), after which the Oracle gets the
// role's normal action time.

export const ORACLE_SELECT_SECONDS = 5;

// Every clip the Oracle step can play, for the admin panel and scripts
export const ORACLE_RESPONSES = [
  { id: 'oracle_join_wake', label: 'Orakel: våkner sammen med laget sitt', script: 'Orakel, våkn opp og bli med laget ditt.' },
  { id: 'oracle_join_sleep', label: 'Orakel: lukker øynene (etter lagbytte)', script: 'Orakel, lukk øynene.' },
  { id: 'oracle_resp_stay_human', label: 'Orakel: blir på menneske-laget', script: 'Bra for deg. Bli værende på menneske-laget.' },
  { id: 'oracle_resp_werewolf_yes', label: 'Orakel: bytter til varulv-laget', script: 'Du er nå på varulv-laget. Du våkner sammen med varulvene.' },
  { id: 'oracle_resp_alien_yes', label: 'Orakel: bytter til romvesen-laget', script: 'Du er nå på romvesen-laget. Du våkner sammen med romvesnene.' },
  { id: 'oracle_resp_alien_exchange_yes', label: 'Orakel: romvesnene må bytte kort', script: 'Romvesnenes kraft denne runden er å bytte kort.' },
  { id: 'oracle_resp_alien_exchange_nothing', label: 'Orakel: romvesen-bytte, ingenting skjer', script: 'Ingenting skjer.' },
  { id: 'oracle_resp_alien_exchange_minion', label: 'Orakel: undersått for romvesnene', script: 'Du er nå en slags undersått for romvesnene, men uten å se dem.' },
  { id: 'oracle_resp_exchange_yes', label: 'Orakel: bytt med et kort i midten', script: 'Bytt kortet ditt med et kort i midten, uten å se på det.' },
  { id: 'oracle_resp_exchange_nevermind', label: 'Orakel: likevel ikke bytte', script: 'Likevel ikke. Behold kortet ditt.' },
  { id: 'oracle_resp_keep_card', label: 'Orakel: behold kortet', script: 'Behold kortet ditt.' },
  { id: 'oracle_resp_center_1', label: 'Orakel: se ett kort i midten', script: 'Du får se ett kort i midten.' },
  { id: 'oracle_resp_center_2', label: 'Orakel: se to kort i midten', script: 'Du får se to kort i midten.' },
  { id: 'oracle_resp_center_3', label: 'Orakel: se tre kort i midten', script: 'Du får se tre kort i midten.' },
  { id: 'oracle_resp_center_no', label: 'Orakel: nei til å se i midten', script: 'Selvfølgelig ikke. Behold kortet ditt.' },
  { id: 'oracle_resp_ripple_yes', label: 'Orakel: tidsbølge garantert', script: 'OK, det blir en tidsbølge.' },
  { id: 'oracle_resp_ripple_no', label: 'Orakel: ingen garanti for tidsbølge', script: 'Seriøst, hvorfor ikke? OK, greit.' },
  { id: 'oracle_resp_even', label: 'Orakel: partallsnummer', script: 'Orakelet har et partallsnummer.' },
  { id: 'oracle_resp_odd', label: 'Orakel: oddetallsnummer', script: 'Orakelet har et oddetallsnummer.' },
  { id: 'oracle_resp_player_see', label: 'Orakel: ser på spillers kort (etterfølges av spillernummer)', script: 'Orakelet ser på kortet til spiller:' },
  { id: 'oracle_resp_number_correct', label: 'Orakel: gjettet tallet riktig', script: 'Riktig! Du får være våken resten av natten.' },
  { id: 'oracle_resp_number_wrong', label: 'Orakel: gjettet tallet feil', script: 'Feil! Du vinner bare hvis du ikke dør. Alle andre vinner hvis Orakelet dør.' },
];

const pick = (list) => list[Math.floor(Math.random() * list.length)];
const weighted = (entries) => {
  let roll = Math.random() * entries.reduce((s, [, w]) => s + w, 0);
  for (const [value, w] of entries) {
    roll -= w;
    if (roll < 0) return value;
  }
  return entries[0][0];
};

// Answers the Oracle can pick between, per question. 'yes'/'no' and
// 'even'/'odd' are labelled in the UI; numbers show as themselves.
export function oracleOptionValues(variantId, maxPlayer) {
  if (variantId === 'oracle_even_odd') return ['even', 'odd'];
  if (variantId === 'oracle_number') return Array.from({ length: 10 }, (_, i) => String(i + 1));
  if (variantId === 'oracle_player_number') {
    return Array.from({ length: Math.max(1, maxPlayer) }, (_, i) => String(i + 1));
  }
  return ['yes', 'no'];
}

// Clip ids the app speaks for the chosen answer, in order. Some answers have
// a random twist from the wiki (the app may overrule the Oracle).
export function oracleResponseSequence(variantId, choice, maxPlayer) {
  switch (variantId) {
    case 'oracle_change_team_werewolf':
      return [choice === 'yes' ? 'oracle_resp_werewolf_yes' : 'oracle_resp_stay_human'];
    case 'oracle_change_team_alien':
      return [choice === 'yes' ? 'oracle_resp_alien_yes' : 'oracle_resp_stay_human'];
    case 'oracle_alien_exchange':
      if (choice === 'yes') return ['oracle_resp_alien_exchange_yes'];
      return [pick(['oracle_resp_alien_exchange_nothing', 'oracle_resp_alien_exchange_minion'])];
    case 'oracle_exchange':
      if (choice === 'no') return ['oracle_resp_keep_card'];
      return [Math.random() < 0.8 ? 'oracle_resp_exchange_yes' : 'oracle_resp_exchange_nevermind'];
    case 'oracle_center':
      if (choice === 'no') return ['oracle_resp_center_no'];
      return [`oracle_resp_center_${weighted([[1, 40], [2, 40], [3, 20]])}`];
    case 'oracle_ripple':
      return [choice === 'yes' ? 'oracle_resp_ripple_yes' : 'oracle_resp_ripple_no'];
    case 'oracle_even_odd':
      return [choice === 'even' ? 'oracle_resp_even' : 'oracle_resp_odd'];
    case 'oracle_player_number': {
      // Sometimes the app sends the Oracle to a different card than asked
      let n = Number(choice);
      if (maxPlayer > 1 && Math.random() < 0.3) {
        const others = Array.from({ length: maxPlayer }, (_, i) => i + 1).filter(x => x !== n);
        n = pick(others);
      }
      return ['oracle_resp_player_see', `player_${n}`];
    }
    case 'oracle_number': {
      const secret = 1 + Math.floor(Math.random() * 10);
      return [Number(choice) === secret ? 'oracle_resp_number_correct' : 'oracle_resp_number_wrong'];
    }
    default:
      return [];
  }
}
