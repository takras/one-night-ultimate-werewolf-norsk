// Norwegian narration scripts, sourced from instruksjoner.txt (base game)
// and instruksjoner_alien.txt (Alien expansion), shown in the admin panel
// next to whichever recording is selected so the narrator knows what to
// say. Entries with no verified source text are marked explicitly instead
// of inventing rulebook wording.
export const NO_SCRIPT_FOUND = 'Ingen bekreftet tekst funnet i skriptet for denne rollen ennå. Skriv/les inn egen tekst.';
export const NO_FIXED_SCRIPT = 'Ingen fast tekst - dette er fritt valgt lyd/musikk uten manus.';

// characterId (base id, same as used in the play order) -> activation/end text
export const CHARACTER_SCRIPTS = {
  // Werewolf / Daybreak (instruksjoner.txt)
  vakt: {
    activation: 'Vakt, våkn opp. Du kan legge en skjoldbrikke på en annen spillers kort.',
    end: 'Vakt, lukk øynene.',
  },
  dobbeltgjenger: {
    activation: 'Dobbeltgjenger, våkn opp. Se på en annen spillers kort. Du er nå også den rollen. Hvis den rollen har en handling på natten, gjør den nå.',
    end: 'Dobbeltgjenger, lukk øynene.',
  },
  varulv: {
    activation: 'Varulver, våkn opp. Se etter andre varulver. Hvis du er alene, kikk i stedet på et av kortene i midten.\n\n[Hvis Drømmeulv er med i spillet, brukes i stedet: "Varulver, unntatt drømmeulv, våkn opp. Se etter andre varulver. Drømmeulv, stikk ut tommelen så de andre varulvene kan se den." - se rollen Drømmeulv.]',
    end: 'Varulver, lukk øynene.\n\n[Med Drømmeulv: "Drømmeulv, bort med tommelen. Varulver, lukk øynene."]',
  },
  droemme_ulv: {
    activation: '[Del av Varulv-blokken, ikke egen oppvåkning:] Varulver, unntatt drømmeulv, våkn opp. Se etter andre varulver. Drømmeulv, stikk ut tommelen så de andre varulvene kan se den.',
    end: 'Drømmeulv, bort med tommelen. Varulver, lukk øynene.',
  },
  alfa_ulv: {
    activation: 'Alfa ulv, våkn opp. Du skal bytte Varulv-kortet i midten med en annen spillers kort.',
    end: 'Alfa ulv, lukk øynene.',
  },
  mystisk_ulv: {
    activation: 'Mystisk ulv, våkn opp. Du kan se på en annen spillers kort.',
    end: 'Mystisk ulv, lukk øynene.',
  },
  undersaatt: {
    activation: 'Undersått, våkn opp. Varulver, hold frem tommelen deres, så undersåtten kan se hvem dere er.',
    end: 'Varulver, fjern tomlene. Undersått, lukk øynene.',
  },
  frimurer: {
    activation: NO_SCRIPT_FOUND,
    end: NO_SCRIPT_FOUND,
  },
  klarsynt: {
    activation: 'Klarsynt, våkn opp. Du kan se på en annen spillers kort, eller to av kortene i midten.',
    end: 'Klarsynt, lukk øynene.',
  },
  roever: {
    activation: 'Røver, våkn opp. Du kan bytte ditt eget kort med en annen spillers kort. Hvis du gjorde det, se på ditt nye kort.',
    end: 'Røver, lukk øynene.',
  },
  heks: {
    activation: 'Heks, våkn opp. Du kan se på et av kortene i midten. Hvis du gjør det, må du bytte det kortet med en annen spillers kort.',
    end: 'Heks, lukk øynene.',
  },
  braakmaker: {
    activation: 'Bråkmaker, våkn opp. Du kan bytte om kortene til to andre spillere.',
    end: 'Bråkmaker, lukk øynene.',
  },
  landsbyidiiot: {
    activation: 'Landsbyidiot, våkn opp. Du kan flytte på alle spilleres kort utenom ditt eget, alle til venstre eller alle til høyre.',
    end: 'Landsbyidiot, lukk øynene.',
  },
  dranker: {
    activation: 'Dranker, våkn opp og bytt kortet ditt med ett i midten, uten å se på det.',
    end: 'Dranker, lukk øynene.',
  },
  soevnloes: {
    activation: 'Søvnløs, gjesp, våkn opp. Se på kortet ditt.',
    end: 'Søvnløs, lukk øynene.',
  },
  klarsynt_laerling: {
    activation: 'Klarsynt lærling, våkn opp. Du kan se på et av kortene i midten.',
    end: 'Klarsynt lærling, lukk øynene.',
  },
  paranormal_etterforsker: {
    activation: 'Paranormal etterforsker, våkn opp. Du kan se på opp til to kort til andre spillere. Hvis du ser en varulv eller garver, må du stoppe, og du er nå blitt det du så, en varulv eller garver.',
    end: 'Paranormal etterforsker, lukk øynene.',
  },
  avsloerer: {
    activation: 'Trollmann, våkn opp. Du kan flippe over en annen spillers kort. Hvis det var en Varulv eller garver, flipp det tilbake igjen.',
    end: 'Trollmann, lukk øynene.',
  },
  kurator: {
    activation: 'Kurator, våkn opp. Du kan legge en skatt-brikke skjult ned på en annen spillers kort.',
    end: 'Kurator, lukk øynene.',
  },
  garver_laerling: {
    activation: NO_SCRIPT_FOUND,
    end: NO_SCRIPT_FOUND,
  },
  aura_klarsynt: {
    activation: NO_SCRIPT_FOUND,
    end: NO_SCRIPT_FOUND,
  },

  // Alien (instruksjoner_alien.txt)
  oracle: {
    activation: 'Orakel, våkn opp og svar på følgende spørsmål. [Vent 5 sekunder, selv om spilleren svarer før den tid.]\n\n'
      + 'Hvert spørsmål under stilles uavhengig av de andre (flere kan stilles i samme Orakel-tur). Ca. 30% av tiden gir appen en respons som avviser/motsier spillerens svar - nøyaktig ordlyd for dette er ikke bekreftet.\n\n'
      + '"Se på kortene i midten?" (10%)\n  Ja: "Hva er så ille med å være et orakel? Behold kortet ditt."\n  Nei: "Selvfølgelig ikke. Behold kortet ditt."\n\n'
      + '"Hvilket tall tenker jeg på?" (75%) [Vis tallene 1-10 som knapper.]\n  Feil: "Feil! Du vinner bare hvis du ikke dør. Alle andre: dere vinner hvis Orakelet dør."\n  Riktig: [ikke bekreftet]\n\n'
      + '"Vil du garantere en ripple?" (5%)\n  Ja: "OK, det blir en ripple."\n  Nei: "Seriøst, hvorfor ikke? OK, greit."\n\n'
      + '"Vil du bli med på romvesen-laget?" (15%)\n  Ja: [ikke bekreftet]\n  Nei: "Bra for deg. Bli værende på menneske-laget."\n\n'
      + '"Vil du bli med på varulv-laget?" (15%)\n  Ja: [ikke bekreftet]\n  Nei: [ikke bekreftet]',
    end: 'Orakel, lukk øynene.',
  },
  alien: {
    activation: 'Romvesner, våkn opp.\n\nÉn av følgende, tilfeldig valgt av appen (se de enkelte variantene i rollelisten for nøyaktig tekst per variant):\n'
      + '  Én romvesen ser i hemmelighet på et kort (30%)\n  Alle romvesner ser i hemmelighet på et kort (30%)\n'
      + '  Bare stirr på hverandre (15%)\n  Vis kortene til hverandre (10%)\n'
      + '  Se på spilleren til venstre for deg (5%)\n  Se på spilleren til høyre for deg (5%)\n\n'
      + '--- Ku (mens romvesnene fortsatt er våkne) ---\n[Ku lukker øynene HER, mens Romvesnene ennå ikke har lukket sine.]\n'
      + 'Ku, våkn opp og hold frem knyttneven. [Hvis en romvesen sitter ved siden av Ku, tipper en av dem kua ved å trykke på knyttneven hennes.]\n'
      + 'Ku, legg ned neven. Ku, lukk øynene.',
    end: 'Romvesner, lukk øynene.',
  },
  synthetic_alien: {
    activation: '[Synthetic Alien våkner sammen med romvesnene (se "alien") - ingen egen replikk for ham utover det.]',
    end: '[Ingen egen "lukk øynene"-replikk - lukkes sammen med romvesnene.]',
  },
  cow: {
    activation: '[Del av Romvesner-blokken, ikke egen oppvåkning - se "alien":] Ku, våkn opp og hold frem knyttneven. Ku, legg ned neven. Ku, lukk øynene.',
    end: 'Ku, lukk øynene.',
  },
  groob_alien: {
    activation: 'Groob og Zerb, våkn opp. Se på hverandre.',
    end: 'Groob og Zerb, lukk øynene.',
  },
  zerb: {
    activation: 'Groob og Zerb, våkn opp. Se på hverandre.',
    end: 'Groob og Zerb, lukk øynene.',
  },
  leader: {
    activation: 'Leder, våkn opp.\nRomvesner, stikk ut tommelen. Romvesner, legg ned tommelen.\nZerb og Groob, hvis dere så hverandre, stikk ut tommelen igjen.\n'
      + 'Leder, hvis du ser Zerb og Groob: du kan bare vinne hvis [én av dem / begge to] (tilfeldig valgt av appen) forblir i live.\nLegg ned tomlene.',
    end: 'Leder, lukk øynene.',
  },
  psychic: {
    activation: 'Psykisk, våkn opp. Se på ett kort fra [en gjenbrukbar målfrase settes inn her etter avspilling, f.eks. "en tilfeldig valgt spiller med partallsnummer"].',
    end: 'Psykisk, lukk øynene.',
  },
  rascal: {
    activation: 'Rakker, våkn opp. Én av følgende, tilfeldig valgt av appen (se de enkelte variantene i rollelisten for nøyaktig tekst per variant):\n'
      + '  Bråkmaker-variant (40%): Bytt om kortene til to spillere.\n'
      + '  Røver-variant (30%): Du kan stjele en spillers kort. [Rakkeren blir IKKE rollen og ser ikke på det stjålne kortet.]\n'
      + '  Heks-variant (30%): Gi et kort fra midten til en annen spiller.',
    end: 'Rakker, lukk øynene.',
  },
  exposer: {
    activation: 'Avslører, våkn opp. Snu [ett / to / tre] kort i midten (se de enkelte variantene i rollelisten for nøyaktig antall).',
    end: 'Avslører, lukk øynene.',
  },
  blob: {
    activation: '[Blobb våkner ikke - ingen "våkn opp"/"lukk øynene" trengs. Teksten avhenger av antall spillere; velges IKKE automatisk av appen ennå, så les den som passer runden:]\n\n'
      + 'A (ved 8+ spillere): Spilleren på hver side av deg er nå del av blobben. Hold deg selv og dem i live for å vinne.\n\n'
      + 'B (ved 10 spillere): De fire spillerne til [høyre/venstre] for deg (tilfeldig valgt) er nå blobben. Hold deg selv og dem i live for å vinne.\n\n'
      + 'C (ved 5 spillere): Spilleren til høyre for deg er nå blobben. Hold deg selv og dem i live for å vinne.',
    end: '[Ingen "lukk øynene"-replikk - Blobb våkner aldri.]',
  },
  mortician: {
    activation: 'Begravelsesagent, våkn opp. Du kan se på kortet til [se de enkelte variantene i rollelisten for nøyaktig tekst per variant: 1 kort 70%, 2 kort 25%, "later som" 5%].',
    end: 'Begravelsesagent, lukk øynene.',
  },
};

// Synthetic ids for audioVariants (Doppelgänger) and narrationVariants
// (Rascal/Alien/Exposer/Mortician) - each behaves like its own character
// in the admin dropdown, so gets its own script entry.
export const VARIANT_SCRIPTS = {
  dobbeltgjenger_undersaatt: {
    activation: 'Dobbeltgjenger, hvis du nå er en Undersått, fortsett å ha øynene åpne. Ellers, lukk dem. Varulver, stikk ut tommelen deres så Dobbeltgjenger-undersåtten kan se den.',
    end: 'Varulver, bort med tommelen deres. Dobbeltgjenger, lukk øynene.',
  },
  dobbeltgjenger_soevnloes: {
    activation: 'Dobbeltgjenger, hvis du så på Søvnløs sitt kort, våkn opp nå og se på kortet ditt.',
    end: 'Dobbeltgjenger, lukk øynene.',
  },
  dobbeltgjenger_avsloerer: {
    activation: 'Dobbeltgjenger, hvis du så på Trollmann-kortet, våkn opp, og flipp et kort. Hvis det kortet er en varulv eller garver, flipp det tilbake. Du er fortsatt Dobbeltgjenger-trollmann.',
    end: 'Dobbeltgjenger, lukk øynene.',
  },
  dobbeltgjenger_kurator: {
    activation: 'Dobbeltgjenger, hvis du så på Kurator-kortet, våkn opp og legg en skatt-brikke skjult på et hvilket som helst kort.',
    end: 'Dobbeltgjenger, lukk øynene.',
  },

  alien_view_secretly: { activation: 'Romvesner: én av dere ser i hemmelighet på et kort.', end: 'Romvesner, lukk øynene.' },
  alien_all_view: { activation: 'Romvesner: alle ser i hemmelighet på et kort.', end: 'Romvesner, lukk øynene.' },
  alien_stare: { activation: 'Romvesner: bare stirr på hverandre.', end: 'Romvesner, lukk øynene.' },
  alien_show_cards: { activation: 'Romvesner: vis kortene til hverandre.', end: 'Romvesner, lukk øynene.' },
  alien_look_left: { activation: 'Romvesner, se på spilleren til venstre for deg.', end: 'Romvesner, lukk øynene.' },
  alien_look_right: { activation: 'Romvesner, se på spilleren til høyre for deg.', end: 'Romvesner, lukk øynene.' },

  rascal_troublemaker: {
    activation: 'Rakker: bytt om kortene til [gjenbrukbar målfrase - to spillere, tilfeldig valgt av appen].',
    end: 'Rakker, lukk øynene.',
  },
  rascal_robber: {
    activation: 'Rakker: du kan stjele kortet til [gjenbrukbar målfrase]. Du blir IKKE den rollen og ser ikke på det stjålne kortet.',
    end: 'Rakker, lukk øynene.',
  },
  rascal_witch: {
    activation: 'Rakker: gi et kort fra midten til [gjenbrukbar målfrase].',
    end: 'Rakker, lukk øynene.',
  },

  exposer_one_card: { activation: 'Avslører, snu ett kort i midten.', end: 'Avslører, lukk øynene.' },
  exposer_two_cards: { activation: 'Avslører, snu to kort i midten.', end: 'Avslører, lukk øynene.' },
  exposer_three_cards: { activation: 'Avslører, snu tre kort i midten.', end: 'Avslører, lukk øynene.' },

  mortician_one_card: {
    activation: 'Begravelsesagent, du kan se på ett kort: en av naboene dine, naboen til høyre, eller deg selv. [Nøyaktig hvem er ikke bekreftet - trolig undervarianter av dette utfallet.]',
    end: 'Begravelsesagent, lukk øynene.',
  },
  mortician_two_cards: {
    activation: 'Begravelsesagent, du kan se på begge naboene dine sine kort.',
    end: 'Begravelsesagent, lukk øynene.',
  },
  mortician_pretend: {
    activation: '[Ikke bekreftet hva dette faktisk innebærer - trolig later Begravelsesagenten som om hen ser på et kort uten å faktisk gjøre det.] Begravelsesagent, du kan late som du ser på et kort.',
    end: 'Begravelsesagent, lukk øynene.',
  },
};

export const GAME_PHASE_SCRIPTS = {
  game_start: 'Det er natt og tid for nattens herjinger. Alle sammen, lukk øynene deres.',
  night_end: 'Hold øynene igjen, alle sammen. Strekk ut hånden deres og finn kortet deres, og beveg litt på det.\nAlle sammen, det er morgen. Våkn opp.',
  discussion_instruction: NO_SCRIPT_FOUND + ' (fritt valgt intro til diskusjonsfasen, f.eks. forklar at spillerne nå skal diskutere og finne ut hvem som er skurk).',
  discussion_end: 'Tiden er ute! Alle sammen: 3, 2, 1, Stem!',
};

// "...continuation" phrasing for the reusable target fragments, meant to be
// spliced onto the end of an activation sentence (see targetFragments.js
// for the admin-facing labels used to pick which one to record)
export const FRAGMENT_SCRIPTS = {
  target_even: '...en tilfeldig valgt spiller med partallsnummer.',
  target_odd: '...en tilfeldig valgt spiller med oddetallsnummer.',
  target_left: '...spilleren til venstre for deg.',
  target_right: '...spilleren til høyre for deg.',
  target_lower: '...en spiller med lavere nummer enn deg.',
  target_any: '...en hvilken som helst spiller.',
};

export function getCharacterScript(characterId, audioType) {
  const entry = CHARACTER_SCRIPTS[characterId] || VARIANT_SCRIPTS[characterId];
  if (!entry) return NO_SCRIPT_FOUND;
  return entry[audioType] || NO_SCRIPT_FOUND;
}

export function getFragmentScript(fragmentId) {
  if (FRAGMENT_SCRIPTS[fragmentId]) return FRAGMENT_SCRIPTS[fragmentId];
  const playerMatch = /^player_(\d+)$/.exec(fragmentId || '');
  if (playerMatch) return `Spiller ${playerMatch[1]}.`;
  return NO_SCRIPT_FOUND;
}
