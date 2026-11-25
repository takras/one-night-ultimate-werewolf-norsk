// Finds where the actual sound starts and ends in a decoded clip, so clips
// that get spliced together can be played without their silent lead-in and
// tail (recordings often have a second or more of dead air at both ends).
// Non-destructive: the files stay as recorded, only the played slice changes.

const SILENCE_THRESHOLD = 0.01; // about -40 dB
const PADDING_SECONDS = 0.04; // keeps breaths/consonants from being clipped

export function trimBounds(buffer) {
  const channels = Array.from({ length: buffer.numberOfChannels }, (_, i) => buffer.getChannelData(i));
  const length = buffer.length;
  const loud = (i) => channels.some(ch => Math.abs(ch[i]) > SILENCE_THRESHOLD);

  let first = 0;
  while (first < length && !loud(first)) first++;
  if (first >= length) return { start: 0, duration: buffer.duration }; // all silent: leave as is

  let last = length - 1;
  while (last > first && !loud(last)) last--;

  const pad = Math.round(PADDING_SECONDS * buffer.sampleRate);
  const startSample = Math.max(0, first - pad);
  const endSample = Math.min(length, last + 1 + pad);
  return {
    start: startSample / buffer.sampleRate,
    duration: (endSample - startSample) / buffer.sampleRate,
  };
}
