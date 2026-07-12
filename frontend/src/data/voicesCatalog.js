import axios from 'axios';
import staticVoices from './voices.json';

// Same live-then-fallback pattern as audioCatalog.js: dev has a backend
// with the freshest voice list (including anything just added in the admin
// panel), a static host falls back to whatever was committed at build time.
export async function getVoices() {
  try {
    const response = await axios.get('/api/voices', { timeout: 3000 });
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return staticVoices;
  } catch (err) {
    return staticVoices;
  }
}
