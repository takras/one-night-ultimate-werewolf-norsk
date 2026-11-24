// Roles/variants whose narration is spliced together with fragment clips
// (target phrases, player numbers, Blob phrases) -> the fragment the admin
// panel jumps to ("Lydkategori" -> target phrases) so it's clear where the
// rest of the recording lives. Keys are admin role ids (overview roles
// included).
export const FRAGMENT_LINKS = {
  blob: 'blob_alone',
  psychic: 'target_even',
  psychic_one_card: 'target_even',
  psychic_two_cards: 'target_specific_two',
  alien: 'target_even',
  alien_view_secretly: 'target_even',
  alien_all_view: 'target_even',
  rascal: 'target_even',
  rascal_robber: 'target_even',
  rascal_witch: 'target_even',
  mortician: 'target_left',
  mortician_neighbor_left: 'target_left',
  mortician_neighbor_right: 'target_right',
};
