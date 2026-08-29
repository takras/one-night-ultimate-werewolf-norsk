// Blob's target text depends on player count (see instruksjoner_alien.txt,
// "BLOBB"), so it's composed from the base activation clip + one of these
// "who joins the blob" phrases + a shared ending, instead of one fixed
// recording. The 5-player case reuses the existing target_right fragment
// ("spilleren til høyre for deg") since Blob's target there is always the
// same single player to the right - no new recording needed for it.
export const BLOB_FRAGMENTS = [
  { id: 'blob_target_8p', norwegianLabel: 'Blobb: mål ved 8-9 spillere ("Spillerne på hver side av deg")' },
  { id: 'blob_target_10p_left', norwegianLabel: 'Blobb: mål ved 10 spillere, venstre ("De fire spillerne til venstre for deg")' },
  { id: 'blob_target_10p_right', norwegianLabel: 'Blobb: mål ved 10 spillere, høyre ("De fire spillerne til høyre for deg")' },
  { id: 'blob_ending', norwegianLabel: 'Blobb: avslutning ("...er nå også del av blobben. Hold deg selv og dem i live for å vinne.")' },
];
