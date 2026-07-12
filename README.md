# One Night Ultimate Werewolf - Game Assistant

A web-based companion app for the board game "One Night Ultimate Werewolf" that manages character selection, game sequencing, and timed audio playback with a mystical medieval atmosphere.

## Features

- **Character Selection Grid** - Select from ~30 available characters with multi-copy support
- **Automatic Game Playback** - Fully automatic sequencing with configurable duration per character
- **Audio Management** - Record or upload character audio via admin panel
- **Mystical Atmosphere** - Background music and ambient sound effects
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Device Wake Lock** - Prevents device from sleeping during gameplay
- **Web Audio API** - In-browser recording support

## Project Structure

```
one-night-werewolf/
├── frontend/                    # React/Vite frontend app - fully static, deployable on its own
│   ├── src/
│   │   ├── components/          # React components (AdminPanel is dev-only, excluded from prod builds)
│   │   ├── data/
│   │   │   ├── characters.json  # Single source of truth for character/play-order config
│   │   │   └── audioManifest.json  # Generated at build time from public/audio/
│   │   ├── utils/
│   │   │   ├── playOrder.js     # Client-side play-order algorithm (no backend needed)
│   │   │   └── assetUrl.js      # GitHub Pages base-path-aware asset URLs
│   │   ├── App.jsx
│   │   └── index.css
│   ├── public/
│   │   ├── audio/                # Character/game/noise/music audio files (committed to git)
│   │   └── karakterer/           # Character images
│   ├── scripts/generate-audio-manifest.js  # Scans public/audio/, writes src/data/audioManifest.json
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── backend/                # Express API - local dev only, powers the admin panel
│   ├── routes/              # Character listing + audio record/upload/delete
│   ├── server.js
│   └── package.json
├── .github/workflows/deploy-pages.yml  # Builds and deploys frontend/ to GitHub Pages
└── package.json             # Root package.json (runs both dev servers together)
```

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

```bash
# Install all dependencies
npm run install-all

# Or install manually:
cd frontend && npm install
cd ../backend && npm install
```

### Development

```bash
# Start both frontend and backend in development mode
npm run dev

# Or run separately:
# Terminal 1:
npm run dev:backend

# Terminal 2:
npm run dev:frontend
```

The frontend will be available at `http://localhost:3001`
The backend API runs on `http://localhost:5000`

## Deployment (GitHub Pages)

The frontend is a fully static site - it doesn't call the backend at all once
built. Character data and the play order are bundled at build time, and the
audio catalog is pre-generated as `src/data/audioManifest.json`. The **Admin
button and panel only exist in dev builds** (recording/uploading needs the
backend), so the deployed site is just the character selection and game
screens.

Pushing to `main` triggers `.github/workflows/deploy-pages.yml`, which builds
`frontend/` and publishes it via GitHub Pages. One-time setup: in the repo's
**Settings → Pages**, set **Source** to **GitHub Actions**.

To add/change audio without deploying from an admin session elsewhere, run
the backend + admin panel locally (`npm run dev`), record/upload as normal -
files land directly in `frontend/public/audio/` - then commit and push. The
build step regenerates the manifest automatically from whatever's committed.

The GitHub Pages base path is set in `frontend/vite.config.js` (currently
`/one-night-ultimate-werewolf-norsk/`, matching the repo name); update it if
the repo is ever renamed or moved.

## Usage

### Home Screen

1. **Select Characters** - Click character cards to select roles
2. **Configure Duration** - Adjust the slider for seconds per character
3. **Toggle Complexity** - Mark characters as "2x time" if needed
4. **Start Game** - Click "Start Game" to begin (shows player count: selected + 3)

### Game Screen

- Automatic playback starts immediately
- Timer counts down for each character
- Device stays awake via Wake Lock API
- Next character preview shown
- Game completes automatically and returns to home

### Admin Panel

1. Click **Admin** in the header
2. **Record Audio:**
   - Select a character
   - Mark as complex if needed
   - Click "Start Recording"
   - Speak the character's prompt
   - Click "Stop Recording"
   - Preview and upload

3. **Upload Audio File:**
   - Click "choose file to upload"
   - Select audio file (MP3, WAV, WebM)

4. **View Uploaded Files:**
   - See all uploaded audio with metadata
   - Preview audio with the preview button
   - Delete audio with the delete button

## Character Configuration

The play order is defined in `frontend/src/data/characters.json` (the
backend reads the same file for the admin panel, so there's one source of
truth):

- **Positions 0-11**: Main game sequence
- **Multi-copy Roles**: Frimurer (2x), Landsbyboer (3x), Varulv (2x)
- **Independent Selections**: Alfaulv, Mystisk ulv (position 2)
- **Conditional Entries**: Dobbeltgjenger activates at positions 1, 9, 10, 11 when respective characters are selected

## API Endpoints (backend, local dev only)

The play order is computed client-side in the frontend
(`frontend/src/utils/playOrder.js`) - there's no play-order API anymore.

### Characters
- `GET /api/characters` - Get all characters
- `GET /api/characters/:id` - Get single character

### Audio
- `GET /api/audio` - List uploaded audio files
- `GET /api/audio/:characterId/metadata` - Get audio metadata
- `POST /api/audio/upload` - Upload new audio (multipart form-data)
- `DELETE /api/audio/:characterId/:audioType` - Delete a specific clip

## Audio File Storage

- Audio files uploaded via admin panel are stored directly in
  `frontend/public/audio/` - Vite serves them at `/audio/{filename}` in dev
  and bundles them into the static build for production
- Metadata stored as `{characterId}.json` in the same directory
- Supported formats: MP3, WAV, WebM, M4A (WAV must be PCM - ADPCM-encoded
  WAV files are rejected on upload since browsers can't decode them)

## Technology Stack

- **Frontend:**
  - React 18.2
  - Vite (build tool)
  - CSS3 (custom, no framework)
  - Axios (HTTP client)
  - Web Audio API (recording)
  - Wake Lock API (device sleep prevention)

- **Backend:**
  - Express.js 4.18
  - Multer (file upload)
  - CORS (cross-origin support)
  - Node.js ES modules

## Browser Support

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome/Edge | Yes | Full support including Wake Lock |
| Firefox | Yes | Full support |
| Safari | Yes | Limited Wake Lock (iOS 16.4+) |
| Mobile Chrome | Yes | Recommended for device wake lock |

## Future Enhancements

- [ ] Game history/statistics
- [ ] Custom game rules
- [ ] Export/import configurations
- [ ] Docker containerization for the backend

## Troubleshooting

### Audio not playing
- Ensure audio files are uploaded in admin panel
- Check browser console for errors
- Verify file format is supported

### Wake Lock not working
- Not all browsers support Wake Lock API
- App gracefully falls back on unsupported browsers
- Mobile devices have better support

### Microphone recording issues
- Grant microphone permission when prompted
- Check browser settings allow microphone access
- Ensure HTTPS in production (required for Web Audio API)

## License

MIT

## Support

For issues or questions, create an issue in the repository.
