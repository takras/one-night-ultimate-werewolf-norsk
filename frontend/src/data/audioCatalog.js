import axios from 'axios';
import staticManifest from './audioManifest.json';

// In local dev the admin panel's backend is running and has the freshest
// data (including anything just recorded/uploaded); on a static host there's
// no backend at all, so this falls back to the manifest generated at build
// time from whatever's committed in public/audio. Some static hosts return
// a 200 with index.html for unknown routes instead of a real 404 (verified
// this with `vite preview`), so a successful request isn't proof of a real
// API - the response shape has to be checked too, not just catch() alone.
export async function getAudioCatalog() {
  try {
    const response = await axios.get('/api/audio', { timeout: 3000 });
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return staticManifest;
  } catch (err) {
    return staticManifest;
  }
}
