// Norwegian narration scripts, sourced from instruksjoner.txt (base game)
// and instruksjoner_alien.txt (Alien expansion), shown in the admin panel
// next to whichever recording is selected so the narrator knows what to
// say. Entries with no verified source text are marked explicitly instead
// of inventing rulebook wording.
export const NO_SCRIPT_FOUND =
  "Ingen bekreftet tekst funnet i skriptet for denne rollen ennå. Skriv/les inn egen tekst.";
export const NO_FIXED_SCRIPT =
  "Ingen fast tekst - dette er fritt valgt lyd/musikk uten manus.";

// characterId (base id, same as used in the play order) -> activation/end text
export const CHARACTER_SCRIPTS = {
  // Werewolf / Daybreak (instruksjoner.txt)
  vakt: {
    activation:
      "Vakt, våkn opp. Du kan legge en skjoldbrikke på en annen spillers kort.",
    end: "Vakt, lukk øynene.",
  },
  dobbeltgjenger: {
    activation:
      "Dobbeltgjenger, våkn opp. Se på en annen spillers kort. Du er nå også den rollen. Hvis den rollen har en handling på natten, gjør den nå.",
    end: "Dobbeltgjenger, lukk øynene.",
  },
  varulv: {
    activation:
      'Varulver, våkn opp. Se etter andre varulver. Hvis du er alene, kikk i stedet på et av kortene i midten.\n\n[Hvis Drømmeulv er med i spillet, brukes i stedet: "Varulver, unntatt drømmeulv, våkn opp. Se etter andre varulver. Drømmeulv, stikk ut tommelen så de andre varulvene kan se den." - se rollen Drømmeulv.]',
    end: 'Varulver, lukk øynene.\n\n[Med Drømmeulv: "Drømmeulv, bort med tommelen. Varulver, lukk øynene."]',
  },
  droemme_ulv: {
    activation:
      "[Del av Varulv-blokken, ikke egen oppvåkning:] Varulver, unntatt drømmeulv, våkn opp. Se etter andre varulver. Drømmeulv, stikk ut tommelen så de andre varulvene kan se den.",
    end: "Drømmeulv, bort med tommelen. Varulver, lukk øynene.",
  },
  alfa_ulv: {
    activation:
      "Alfa ulv, våkn opp. Du skal bytte Varulv-kortet i midten med en annen spillers kort.",
    end: "Alfa ulv, lukk øynene.",
  },
  mystisk_ulv: {
    activation: "Mystisk ulv, våkn opp. Du kan se på en annen spillers kort.",
    end: "Mystisk ulv, lukk øynene.",
  },
  undersaatt: {
    activation:
      "Undersått, våkn opp. Varulver, hold frem tommelen deres, så undersåtten kan se hvem dere er.",
    end: "Varulver, fjern tomlene. Undersått, lukk øynene.",
  },
  frimurer: {
    activation: NO_SCRIPT_FOUND,
    end: NO_SCRIPT_FOUND,
  },
  klarsynt: {
    activation:
      "Klarsynt, våkn opp. Du kan se på en annen spillers kort, eller to av kortene i midten.",
    end: "Klarsynt, lukk øynene.",
  },
  roever: {
    activation:
      "Røver, våkn opp. Du kan bytte ditt eget kort med en annen spillers kort. Hvis du gjorde det, se på ditt nye kort.",
    end: "Røver, lukk øynene.",
  },
  heks: {
    activation:
      "Heks, våkn opp. Du kan se på et av kortene i midten. Hvis du gjør det, må du bytte det kortet med en annen spillers kort.",
    end: "Heks, lukk øynene.",
  },
  braakmaker: {
    activation:
      "Bråkmaker, våkn opp. Du kan bytte om kortene til to andre spillere.",
    end: "Bråkmaker, lukk øynene.",
  },
  landsbyidiiot: {
    activation:
      "Landsbyidiot, våkn opp. Du kan flytte på alle spilleres kort utenom ditt eget, alle til venstre eller alle til høyre.",
    end: "Landsbyidiot, lukk øynene.",
  },
  dranker: {
    activation:
      "Dranker, våkn opp og bytt kortet ditt med ett i midten, uten å se på det.",
    end: "Dranker, lukk øynene.",
  },
  soevnloes: {
    activation: "Søvnløs, gjesp, våkn opp. Se på kortet ditt.",
    end: "Søvnløs, lukk øynene.",
  },
  klarsynt_laerling: {
    activation:
      "Klarsynt lærling, våkn opp. Du kan se på et av kortene i midten.",
    end: "Klarsynt lærling, lukk øynene.",
  },
  paranormal_etterforsker: {
    activation:
      "Paranormal etterforsker, våkn opp. Du kan se på opp til to kort til andre spillere. Hvis du ser en varulv eller garver, må du stoppe, og du er nå blitt det du så, en varulv eller garver.",
    end: "Paranormal etterforsker, lukk øynene.",
  },
  avsloerer: {
    activation:
      "Trollmann, våkn opp. Du kan flippe over en annen spillers kort. Hvis det var en Varulv eller garver, flipp det tilbake igjen.",
    end: "Trollmann, lukk øynene.",
  },
  kurator: {
    activation:
      "Kurator, våkn opp. Du kan legge en skatt-brikke skjult ned på en annen spillers kort.",
    end: "Kurator, lukk øynene.",
  },
  garver_laerling: {
    activation:
      "Garvers lærling, våkn opp. Garver, stikk ut tommelen din så Garvers lærling kan se den og hvem du er.",
    end: "Garver, bort med tommelen. Garvers lærling, lukk øynene.",
  },
  aura_klarsynt: {
    activation:
      "Aura klarsynt, våkn opp. Alle sammen: hvis du har sett på eller flyttet på noen som helst kort, stikk ut tommelen din, så Aura klarsynt kan se den.",
    end: "Alle sammen, bort med tomlene. Aura klarsynt, lukk øynene.",
  },

  // Alien (instruksjoner_alien.txt)
  oracle: {
    activation:
      "Orakel, våkn opp og svar på følgende spørsmål. [Vent 5 sekunder, selv om spilleren svarer før den tid. Svarer Orakelet ikke (også hvis kortet ligger i midten), velger appen svaret. Appen velger ETT av spørsmålene i rollelisten (oracle_*-variantene) etter wikiens sannsynligheter. Spørsmålet kan med vilje være misvisende, så Orakelet bør vente på instruksjonene fremfor å handle ut fra spørsmålet.]",
    end: "Orakel, lukk øynene.",
  },
  alien: {
    activation:
      "Romvesner, våkn opp.\n\nÉn av følgende, tilfeldig valgt av appen (sannsynligheter fra wikien - se de enkelte variantene i rollelisten for nøyaktig tekst per variant):\n" +
      "  Én romvesen ser i hemmelighet på et kort (30%)\n  Alle romvesner ser i hemmelighet på et kort (30%)\n" +
      "  Bare stirr på hverandre (15%)\n  Vis kortene til hverandre (10%)\n" +
      "  Alle gir kortet sitt til romvesenet til venstre (5%)\n  Alle gir kortet sitt til romvesenet til høyre (5%)\n" +
      "  Halvert tid (5%)\n  Nytt romvesen (0%)\n  Romvesen-hjelper (0%)\n\n" +
      "[Synthetic Alien og Groob/Zerb våkner sammen med romvesnene. Er romvesen med i spillet, kan det også bli en tidsbølge.]\n\n" +
      "--- Ku (mens romvesnene fortsatt er våkne) ---\n[Ku våkner ikke - hun har øynene lukket og stikker bare ut neven. Er Ku med, lukker romvesnene øynene først etter henne - se Ku.]",
    end: "Romvesner, lukk øynene.",
  },
  synthetic_alien: {
    activation:
      '[Synthetic Alien våkner sammen med romvesnene (se "alien") - ingen egen replikk for ham utover det.]',
    end: '[Ingen egen "lukk øynene"-replikk - lukkes sammen med romvesnene.]',
  },
  cow: {
    activation:
      "Ku, stikk ut knyttneven. Romvesner, hvis en av dere sitter ved siden av kua, tipp henne på knyttneven. [Ku våkner ikke - hun har øynene lukket og stikker bare ut neven.]",
    end: "Ku, legg ned neven. Romvesner, lukk øynene. [Når Ku er med, spilles ikke Romvesnenes egen slutt-lyd før dette, siden de må være våkne mens Ku stikker ut neven.]",
  },
  groob_alien: {
    activation: "Groob og Zerb, våkn opp. Se på hverandre.",
    end: "Groob og Zerb, lukk øynene.",
  },
  zerb: {
    activation: "Groob og Zerb, våkn opp. Se på hverandre.",
    end: "Groob og Zerb, lukk øynene.",
  },
  leader: {
    activation:
      "Leder, våkn opp. Romvesner, stikk ut tommelen så Lederen kan se dere. Zerb og Groob, hvis dere så hverandre i natt, peker dere på hverandre i stedet, med lukkede øyne.\n" +
      "Romvesner, legg ned tommelen. Zerb og Groob, legg ned hendene.\n\n" +
      "[Regler for Leder: vinner med landsbyen, UNNTATT hvis både Zerb og Groob er med - da vinner Leder bare hvis begge overlever. Landsbyen taper hvis ALLE romvesner stemmer på Leder.]",
    end: "Leder, lukk øynene.",
  },
  psychic: {
    activation:
      'Psykisk, våkn opp. Se på ett kort fra [en gjenbrukbar målfrase settes inn her etter avspilling, f.eks. "en spiller med partallsnummer" - mulige mål: naboer, partall, oddetall, spesifikke spillernummer. Psykisk kan ikke se sitt eget kort].',
    end: "Psykisk, lukk øynene.",
  },
  rascal: {
    activation:
      "Rakker, våkn opp. Én av følgende, tilfeldig valgt av appen (se de enkelte variantene i rollelisten for nøyaktig tekst per variant):\n" +
      "  Bråkmaker-variant (40%): Bytt om kortene til to spillere.\n" +
      "  Røver-variant (30%): Du kan stjele en spillers kort. [Rakkeren blir IKKE rollen og ser ikke på det stjålne kortet.]\n" +
      "  Heks-variant (30%): Gi et kort fra midten til en annen spiller.\n" +
      "  Landsbyidiot-variant (0%): Flytt alle kort unntatt ditt eget, til venstre eller høyre.\n" +
      "  Dranker-variant (0%): Bytt kortet ditt med et kort i midten uten å se på det.\n" +
      "  [Landsbyidiot og Dranker er bare mulige via tilfeldighetsverktøyet i appen, derfor 0% som standard. Appen kan også begrense hvilke spillernumre Rakkeren kan bruke kraften på.]",
    end: "Rakker, lukk øynene.",
  },
  exposer: {
    activation:
      "Avslører, våkn opp. Snu [ett / to / tre] kort i midten (75% / 20% / 5%). Du kan velge å snu nøyaktig dette antallet, eller la være - ikke et annet antall.",
    end: "Avslører, lukk øynene.",
  },
  blob: {
    activation:
      'Blobb, våkn opp. [Kun denne åpningslinjen - hvem som blir del av blobben spleises automatisk inn etterpå fra egne fragment-opptak (Lydkategori: «Målfraser (tilfeldige spillere)», gruppen med Blobb-fraser). Antall andre i blobben: 3 spillere 0, 4 spillere 1, 5-6 spillere 2, 7-8 spillere 3, 9+ spillere 4. Er antallet partall, kan de også deles likt på begge sider.]',
    end: '[Ingen egen "slutt"-lyd trengs - avslutningslinjen er del av fragment-sekvensen over.]',
  },
  mortician: {
    activation:
      'Begravelsesagent, våkn opp. Du kan se på kortet til [se de enkelte variantene i rollelisten for nøyaktig tekst per variant: nabo etter eget valg 25%, nabo til venstre 12,5%, nabo til høyre 12,5%, eget kort 20%, begge naboer 25%, "later som" 5%].',
    end: "Begravelsesagent, lukk øynene.",
  },
};

// Synthetic ids for audioVariants (Doppelgänger) and narrationVariants
// (Rascal/Alien/Exposer/Mortician) - each behaves like its own character
// in the admin dropdown, so gets its own script entry.
export const VARIANT_SCRIPTS = {
  dobbeltgjenger_undersaatt: {
    activation:
      "Dobbeltgjenger, hvis du nå er en Undersått, fortsett å ha øynene åpne. Ellers, lukk dem. Varulver, stikk ut tommelen deres så Dobbeltgjenger-undersåtten kan se den.",
    end: "Varulver, bort med tommelen deres. Dobbeltgjenger, lukk øynene.",
  },
  dobbeltgjenger_soevnloes: {
    activation:
      "Dobbeltgjenger, hvis du så på Søvnløs sitt kort, våkn opp nå og se på kortet ditt.",
    end: "Dobbeltgjenger, lukk øynene.",
  },
  dobbeltgjenger_avsloerer: {
    activation:
      "Dobbeltgjenger, hvis du så på Trollmann-kortet, våkn opp, og flipp et kort. Hvis det kortet er en varulv eller garver, flipp det tilbake. Du er fortsatt Dobbeltgjenger-trollmann.",
    end: "Dobbeltgjenger, lukk øynene.",
  },
  dobbeltgjenger_kurator: {
    activation:
      "Dobbeltgjenger, hvis du så på Kurator-kortet, våkn opp og legg en skatt-brikke skjult på et hvilket som helst kort.",
    end: "Dobbeltgjenger, lukk øynene.",
  },

  oracle_change_team_werewolf: {
    activation:
      "Orakel, våkn opp. Vil du bli med på varulv-laget? [Ja: Orakel-kortet blir en Varulv, og Orakelet våkner sammen med varulvene - som en Dobbeltgjenger som ble Varulv. Orakelet er fortsatt Orakel og laget hennes vinner selv om hun dør. Nei: \"Bra for deg. Bli værende på menneske-laget.\" Sannsynlighet 45% totalt for lagbytte; hvis laget ikke er med i spillet, velges et lag som er det.]",
    end: "Orakel, lukk øynene.",
  },
  oracle_change_team_alien: {
    activation:
      "Orakel, våkn opp. Vil du bli med på romvesen-laget? [Ja: Orakel-kortet blir et Romvesen, og Orakelet våkner sammen med romvesnene. Orakelet er fortsatt Orakel og laget hennes vinner selv om hun dør. Nei: \"Bra for deg. Bli værende på menneske-laget.\"]",
    end: "Orakel, lukk øynene.",
  },
  oracle_alien_exchange: {
    activation:
      "Orakel, våkn opp. Vil du tvinge romvesnene til å bytte kort? [0% som standard; krever flere ulike romvesen-roller. Ja: romvesnenes kraft denne runden er å bytte kort. Nei: appen velger tilfeldig mellom ingenting og at Orakelet blir en slags undersått for romvesnene, uten å se dem.]",
    end: "Orakel, lukk øynene.",
  },
  oracle_exchange: {
    activation:
      "Orakel, våkn opp. Vil du bytte kortet ditt med et kort i midten, uten å se på det? [Dranker-handling (10%). Appen kan si at du likevel ikke skal gjøre det.]",
    end: "Orakel, lukk øynene.",
  },
  oracle_center: {
    activation:
      "Orakel, våkn opp. Vil du se på tre av kortene i midten? [10%. Appen sier deretter hvor mange kort du faktisk får se - ofte færre enn tre. Nei: \"Selvfølgelig ikke. Behold kortet ditt.\"]",
    end: "Orakel, lukk øynene.",
  },
  oracle_ripple: {
    activation:
      "Orakel, våkn opp. Vil du garantere en tidsbølge? [10%, bare hvis romvesen er med. Ja: \"OK, det blir en tidsbølge.\" Nei: \"Seriøst, hvorfor ikke? OK, greit.\" - det kan likevel bli en tidsbølge.]",
    end: "Orakel, lukk øynene.",
  },
  oracle_even_odd: {
    activation:
      "Orakel, våkn opp. Har du et partall eller et oddetall som spillernummer? [10%. Svaret annonseres til alle.]",
    end: "Orakel, lukk øynene.",
  },
  oracle_player_number: {
    activation:
      "Orakel, våkn opp. Hvilket spillernummer vil du se kortet til? [10%. Appen sier enten at du skal se det kortet, eller et annet tilfeldig. Alle får vite hvilket kort Orakelet så.]",
    end: "Orakel, lukk øynene.",
  },
  oracle_number: {
    activation:
      "Orakel, våkn opp. Hvilket tall mellom 1 og 10 tenker jeg på? [5%, og reservevalget hvis et annet spørsmål ikke kan stilles. Riktig: Orakelet får være våken hele natten. Feil: \"Feil! Du vinner bare hvis du ikke dør. Alle andre: dere vinner hvis Orakelet dør.\" Alle beholder nattehandlingene sine, men alle seiersbetingelser overstyres. Ligger Orakelet i midten, vinner spillerne bare med en sirkel-stemme.]",
    end: "Orakel, lukk øynene.",
  },

  alien_view_secretly: {
    activation: "Romvesner, våkn opp. Én av dere ser i hemmelighet på et kort ...",
    end: "Romvesner, lukk øynene.",
  },
  alien_all_view: {
    activation: "Romvesner, våkn opp. Alle ser sammen i hemmelighet på et kort ...",
    end: "Romvesner, lukk øynene.",
  },
  alien_stare: {
    activation: "Romvesner, våkn opp. Bare stirr på hverandre.",
    end: "Romvesner, lukk øynene.",
  },
  alien_show_cards: {
    activation: "Romvesner, våkn opp. Vis kortene til hverandre.",
    end: "Romvesner, lukk øynene.",
  },
  alien_pass_left: {
    activation: "Romvesner, våkn opp. Alle gir kortet sitt til romvesenet til venstre for dere.",
    end: "Romvesner, lukk øynene.",
  },
  alien_pass_right: {
    activation: "Romvesner, våkn opp. Alle gir kortet sitt til romvesenet til høyre for dere.",
    end: "Romvesner, lukk øynene.",
  },
  alien_timer: {
    activation:
      "Romvesner, våkn opp. Tiden for diskusjonen blir halvert i denne runden.",
    end: "Romvesner, lukk øynene.",
  },
  alien_new_alien: {
    activation:
      "Alle sammen, stikk ut en knyttneve. Én spiller blir nå tappet på neven og blir et romvesen. [Sannsynlighet 0% som standard.]",
    end: "Alle sammen, ta ned knyttneven. Romvesner, lukk øynene.",
  },
  alien_helper: {
    activation:
      "Alle sammen, stikk ut en knyttneve. Én spiller blir nå tappet på neven og blir med på romvesen-laget, men er ikke et romvesen - hen er som en undersått for romvesnene. [Sannsynlighet 0% som standard.]",
    end: "Alle sammen, ta ned knyttneven. Romvesner, lukk øynene.",
  },

  psychic_one_card: {
    activation:
      "Psykisk, våkn opp. Du kan se på ett kort fra [målfrase spleises inn, f.eks. naboene dine, partallsspillere, oddetallsspillere eller en spiller med bestemt nummer].",
    end: "Psykisk, lukk øynene.",
  },
  psychic_two_cards: {
    activation:
      "Psykisk, våkn opp. Du kan se på to kort fra [målfrase spleises inn]. [Sannsynlighet 0% som standard - bare via tilfeldighetsverktøyet i appen.]",
    end: "Psykisk, lukk øynene.",
  },

  rascal_troublemaker: {
    activation:
      "Rakker, våkn opp. Bytt om kortene til [gjenbrukbar målfrase - to spillere, tilfeldig valgt av appen].",
    end: "Rakker, lukk øynene.",
  },
  rascal_robber: {
    activation:
      "Rakker, våkn opp. Du kan stjele kortet til [gjenbrukbar målfrase]. Du blir IKKE den rollen og ser ikke på det stjålne kortet.",
    end: "Rakker, lukk øynene.",
  },
  rascal_witch: {
    activation: "Rakker, våkn opp. Gi et kort fra midten til [gjenbrukbar målfrase].",
    end: "Rakker, lukk øynene.",
  },

  rascal_village_idiot: {
    activation:
      "Rakker, våkn opp. Du kan flytte på alle spilleres kort utenom ditt eget, alle til venstre eller alle til høyre. [Sannsynlighet 0% som standard.]",
    end: "Rakker, lukk øynene.",
  },
  rascal_drunk: {
    activation:
      "Rakker, våkn opp. Bytt kortet ditt med ett i midten, uten å se på det. [Sannsynlighet 0% som standard.]",
    end: "Rakker, lukk øynene.",
  },

  exposer_one_card: {
    activation: "Avslører, våkn opp. Du kan snu ett kort i midten, eller la være. Du kan ikke snu et annet antall.",
    end: "Avslører, lukk øynene.",
  },
  exposer_two_cards: {
    activation: "Avslører, våkn opp. Du kan snu to kort i midten, eller la være. Du kan ikke snu færre.",
    end: "Avslører, lukk øynene.",
  },
  exposer_three_cards: {
    activation: "Avslører, våkn opp. Du kan snu tre kort i midten, eller la være. Du kan ikke snu færre.",
    end: "Avslører, lukk øynene.",
  },

  mortician_one_card: {
    activation:
      "Begravelsesagent, våkn opp. Du kan se på kortet til en av naboene dine - du velger selv hvilken.",
    end: "Begravelsesagent, lukk øynene.",
  },
  mortician_neighbor_left: {
    activation:
      "Begravelsesagent, våkn opp. Du kan se på kortet til naboen din [målfrase spleises inn: spilleren til venstre for deg].",
    end: "Begravelsesagent, lukk øynene.",
  },
  mortician_neighbor_right: {
    activation:
      "Begravelsesagent, våkn opp. Du kan se på kortet til naboen din [målfrase spleises inn: spilleren til høyre for deg].",
    end: "Begravelsesagent, lukk øynene.",
  },
  mortician_own_card: {
    activation: "Begravelsesagent, våkn opp. Du kan se på ditt eget kort.",
    end: "Begravelsesagent, lukk øynene.",
  },
  mortician_two_cards: {
    activation: "Begravelsesagent, våkn opp. Du kan se på begge naboene dine sine kort.",
    end: "Begravelsesagent, lukk øynene.",
  },
  mortician_pretend: {
    activation:
      "[Ikke bekreftet hva dette faktisk innebærer - trolig later Begravelsesagenten som om hen ser på et kort uten å faktisk gjøre det.] Begravelsesagent, våkn opp. Du kan late som du ser på et kort.",
    end: "Begravelsesagent, lukk øynene.",
  },
};

export const GAME_PHASE_SCRIPTS = {
  game_start:
    "Det er natt og tid for nattens herjinger. Alle sammen, lukk øynene deres.",
  night_end:
    "Hold øynene igjen, alle sammen. Strekk ut hånden deres og finn kortet deres, og beveg litt på det.\nAlle sammen, det er morgen. Våkn opp.",
  discussion_instruction:
    NO_SCRIPT_FOUND +
    " (fritt valgt intro til diskusjonsfasen, f.eks. forklar at spillerne nå skal diskutere og finne ut hvem som er skurk).",
  discussion_end: "Tiden er ute! Alle sammen: 3, 2, 1, Stem!",
};

// "...continuation" phrasing for the reusable target fragments, meant to be
// spliced onto the end of an activation sentence (see targetFragments.js
// for the admin-facing labels used to pick which one to record)
export const FRAGMENT_SCRIPTS = {
  target_even: "...en spiller med partallsnummer.",
  target_odd: "...en spiller med oddetallsnummer.",
  target_left: "...spilleren til venstre for deg.",
  target_right: "...spilleren til høyre for deg.",
  target_lower: "...en spiller med lavere nummer enn deg.",
  target_higher: "...en spiller med høyere nummer enn deg.",
  target_neighbors: "...begge naboene dine.",
  target_any: "...en hvilken som helst spiller.",
  target_center: "...et av kortene i midten.",
  target_specific: "...spilleren med nummer:",
  target_specific_two: "...spillerne med numrene:",
};

// Ripple (Norwegian: "tidsbølge") announcements - see rippleEvents.js (weights
// from the wiki's Ripples page). Clips ending in ":" are followed by spliced-in
// player-number clips ("Spiller N.").
export const RIPPLE_SCRIPTS = {
  ripple_intro: "Det har vært en tidsbølge!",
  ripple_connector_target: "Målet er:",
  ripple_connector_targets: "Målene er:",
  ripple_connector_swap: "Spillerne som kan byttes om, er:",
  ripple_one_minute: "Dere har bare 1 minutt igjen før dere må stemme.",
  ripple_time_loop:
    "Tidssløyfe! Natten gjentas, men noen roller, som Orakelet, våkner ikke igjen, og hva rollene gjør kan igjen være tilfeldig.\n\n" +
    "[Følgende våkner på nytt hvis de er valgt i spillet: Romvesner og Ku, Groob og Zerb, Leder, Psykisk, Rakker, Avslører, Begravelsesagent.]",
  ripple_time_loop_one_awake:
    "Tidssløyfe! Natten gjentas, men én spiller må holde øynene åpne resten av natten. Spilleren er:",
  ripple_insomniac:
    "Følgende spillere kan i hemmelighet se på sitt eget kort:",
  ripple_may_not_speak:
    "Følgende spillere får ikke lov til å snakke før etter avstemningen:",
  ripple_face_away:
    "Følgende spillere må snu seg bort fra bordet helt til avstemningen er ferdig:",
  ripple_troublemaker:
    "Bråkmaker-handling! Spilleren kan bytte om kortene til to andre spillere. Spilleren er:",
  ripple_steal:
    "Røver-handling! Spilleren kan stjele kortet til en annen spiller og se på sitt nye kort. Spilleren er:",
  ripple_witch:
    "Heks-handling! Spilleren kan se på et kort i midten og må bytte det med kortet til en annen spiller. Spilleren er:",
  ripple_view_one:
    "Mystisk ulv-handling! Spilleren kan se på kortet til en annen spiller. Spilleren er:",
  ripple_view_two:
    "Spilleren kan se på kortene til to andre spillere. Spilleren er:",
  ripple_reveal:
    "Trollmann-handling! Spilleren kan flippe over en annen spillers kort. Hvis det var en varulv eller garver, flippes det tilbake. Spilleren er:",
  ripple_dual_view:
    "To spillere kan sammen se på kortet til samme spiller. Spillerne er:",
  ripple_two_hand_vote:
    "Følgende spillere stemmer med begge hender og har dermed to stemmer:",
  ripple_dual_shuffle:
    "To spillere viser kortene sine til hverandre, uten å se på sitt eget, og blander dem deretter. Spillerne er:",
  ripple_drunk:
    "Dranker-handling! Spilleren må bytte kortet sitt med et kort i midten, uten å se på det. Spilleren er:",
  ripple_vote_for_app:
    "Dere kan stemme på appen. Hvis appen får flest stemmer, dør ingen.",
  ripple_i_am_an_alien:
    "Følgende spillere kan bare si «Jeg er et romvesen» helt til alle stemmene er avgitt:",
};

// Blob's "who joins the blob" text, composed at runtime depending on
// player count - see blobFragments.js
export const BLOB_SEQUENCE_SCRIPTS = {
  blob_alone: "Du er alene i blobben. Hold deg selv i live for å vinne.",
  blob_both_1: "Spilleren på hver side av deg",
  blob_both_2: "De to spillerne på hver side av deg",
  blob_left_2: "De to spillerne til venstre for deg",
  blob_right_2: "De to spillerne til høyre for deg",
  blob_left_3: "De tre spillerne til venstre for deg",
  blob_right_3: "De tre spillerne til høyre for deg",
  blob_left_4: "De fire spillerne til venstre for deg",
  blob_right_4: "De fire spillerne til høyre for deg",
  blob_ending:
    "...er nå også del av blobben. Hold deg selv og dem i live for å vinne.",
};

export function getCharacterScript(characterId, audioType) {
  const entry = CHARACTER_SCRIPTS[characterId] || VARIANT_SCRIPTS[characterId];
  if (!entry) return NO_SCRIPT_FOUND;
  return entry[audioType] || NO_SCRIPT_FOUND;
}

export function getFragmentScript(fragmentId) {
  if (FRAGMENT_SCRIPTS[fragmentId]) return FRAGMENT_SCRIPTS[fragmentId];
  if (RIPPLE_SCRIPTS[fragmentId]) return RIPPLE_SCRIPTS[fragmentId];
  if (BLOB_SEQUENCE_SCRIPTS[fragmentId])
    return BLOB_SEQUENCE_SCRIPTS[fragmentId];
  const playerMatch = /^player_(\d+)$/.exec(fragmentId || "");
  if (playerMatch) return `Spiller ${playerMatch[1]}.`;
  return NO_SCRIPT_FOUND;
}
