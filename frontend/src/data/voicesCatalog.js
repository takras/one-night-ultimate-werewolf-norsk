import axios from 'axios';
import staticVoices from './voices.json';
import { listLocalVoices } from '../utils/localVoices';

// Same live-then-fallback pattern as audioCatalog.js: dev has a backend
// with the freshest voice list (including anything just added in the admin
// panel), a static host falls back to whatever was committed at build time.
export async function getVoices() {
  const [shipped, local] = await Promise.all([getShippedVoices(), listLocalVoices().catch(() => [])]);
  // Voices recorded on this device are marked so the picker can say so
  return [...shipped, ...local.map((v) => ({ ...v, name: `${v.name} (${v.language}, this device)`, local: true }))];
}

async function getShippedVoices() {
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
