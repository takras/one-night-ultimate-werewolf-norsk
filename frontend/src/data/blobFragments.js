// Blob's "who joins the blob" text depends on player count (wiki: Blob), so
// it's composed from the base activation clip + one of these phrases + a
// shared ending, instead of one fixed recording.
//
// Number of OTHER players in the blob, by total player count:
//   3 -> 0, 4 -> 1, 5-6 -> 2, 7-8 -> 3, 9+ -> 4
// They're the players to the left OR right of the Blob, and when that
// number is even it can also be split half to each side. A single player
// reuses the target_left / target_right fragments from the target phrases.
export const BLOB_FRAGMENTS = [
  { id: 'blob_alone', norwegianLabel: 'Blobb: alene (3 spillere) ("Du er alene i blobben. Hold deg selv i live for å vinne.")' },
  { id: 'blob_both_1', norwegianLabel: 'Blobb: spilleren på hver side ("Spilleren på hver side av deg")' },
  { id: 'blob_both_2', norwegianLabel: 'Blobb: to spillere på hver side ("De to spillerne på hver side av deg")' },
  { id: 'blob_left_2', norwegianLabel: 'Blobb: to til venstre ("De to spillerne til venstre for deg")' },
  { id: 'blob_right_2', norwegianLabel: 'Blobb: to til høyre ("De to spillerne til høyre for deg")' },
  { id: 'blob_left_3', norwegianLabel: 'Blobb: tre til venstre ("De tre spillerne til venstre for deg")' },
  { id: 'blob_right_3', norwegianLabel: 'Blobb: tre til høyre ("De tre spillerne til høyre for deg")' },
  { id: 'blob_left_4', norwegianLabel: 'Blobb: fire til venstre ("De fire spillerne til venstre for deg")' },
  { id: 'blob_right_4', norwegianLabel: 'Blobb: fire til høyre ("De fire spillerne til høyre for deg")' },
  { id: 'blob_ending', norwegianLabel: 'Blobb: avslutning ("...er nå også del av blobben. Hold deg selv og dem i live for å vinne.")' },
];

// Which fragment ids to play after the Blob's activation clip, in order
export function blobFragmentSequence(playerCount) {
  const others = playerCount <= 3 ? 0 : playerCount === 4 ? 1 : playerCount <= 6 ? 2 : playerCount <= 8 ? 3 : 4;
  if (others === 0) return ['blob_alone'];

  const left = Math.random() < 0.5;
  if (others === 1) return [left ? 'target_left' : 'target_right', 'blob_ending'];
  if (others % 2 === 0 && Math.random() < 0.5) {
    return [others === 2 ? 'blob_both_1' : 'blob_both_2', 'blob_ending'];
  }
  return [`blob_${left ? 'left' : 'right'}_${others}`, 'blob_ending'];
}
