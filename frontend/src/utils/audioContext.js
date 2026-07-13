// iOS Safari (and WebKit-based mobile browsers generally) silently ignore
// JS writes to <audio>.volume - only the hardware volume buttons affect
// output. Routing playback through a Web Audio GainNode instead works
// around this, but the AudioContext must be created/resumed synchronously
// inside a real user-gesture handler on iOS, or it stays suspended (silent)
// forever. A single shared instance, unlocked from the "Start Game" click,
// avoids needing a fresh gesture for every game played in the session.
let sharedContext = null;

export function unlockAudioContext() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;
  if (!sharedContext) {
    sharedContext = new AudioContextClass();
  }
  if (sharedContext.state === 'suspended') {
    sharedContext.resume().catch(() => {});
  }
  return sharedContext;
}

export function getAudioContext() {
  return sharedContext;
}
