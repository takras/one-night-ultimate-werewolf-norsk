# One Night Ultimate Werewolf - Game Assistant

A web-based companion app for the board game "One Night Ultimate Werewolf" that manages character selection, game sequencing, and timed audio playback with a mystical medieval atmosphere.

## Features

- 🎭 **Character Selection Grid** - Select from ~30 available characters with multi-copy support
- ⏱️ **Automatic Game Playback** - Fully automatic sequencing with configurable duration per character
- 🎙️ **Audio Management** - Record or upload character audio via admin panel
- 🌙 **Mystical Atmosphere** - Background music and ambient sound effects
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- 🔒 **Device Wake Lock** - Prevents device from sleeping during gameplay
- 🔌 **Web Audio API** - In-browser recording support

## Project Structure

```
one-night-werewolf/
├── frontend/              # React/Vite frontend app
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── App.jsx
│   │   └── index.css
│   ├── public/            # Static assets
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── backend/               # Express.js API server
│   ├── routes/            # API route handlers
│   ├── config/            # Character metadata
│   ├── server.js
│   └── package.json
├── public/                # Server-side audio storage
│   ├── audio/             # Character audio files
│   └── music/             # Background music & effects
├── karakterer/            # Character images
└── package.json           # Root package.json
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

The frontend will be available at `http://localhost:3000`
The backend API runs on `http://localhost:5000`

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

1. Click **⚙️ Admin** in the header
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
   - Preview audio with 🔊 button
   - Delete audio with 🗑️ button

## Character Configuration

The play order is defined in `backend/config/characters.json`:

- **Positions 0-11**: Main game sequence
- **Multi-copy Roles**: Frimurer (2x), Landsbyboer (3x), Varulv (2x)
- **Independent Selections**: Alfaulv, Mystisk ulv (position 2)
- **Conditional Entries**: Dobbeltgjenger activates at positions 1, 9, 10, 11 when respective characters are selected

## API Endpoints

### Characters
- `GET /api/characters` - Get all characters
- `GET /api/characters/:id` - Get single character
- `POST /api/characters/play-order` - Calculate play order from selections

### Audio
- `GET /api/audio` - List uploaded audio files
- `GET /api/audio/:characterId/metadata` - Get audio metadata
- `POST /api/audio/upload` - Upload new audio (multipart form-data)

### Game
- `GET /api/game/status` - Check service status
- `POST /api/game/initialize` - Initialize new game

## Audio File Storage

- Audio files uploaded via admin panel are stored in `public/audio/`
- Metadata stored as `{characterId}.json` in same directory
- Files are served at `/public/audio/{filename}`
- Supported formats: MP3, WAV, WebM, M4A

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
| Chrome/Edge | ✅ | Full support including Wake Lock |
| Firefox | ✅ | Full support |
| Safari | ✅ | Limited Wake Lock (iOS 16.4+) |
| Mobile Chrome | ✅ | Recommended for device wake lock |

## Future Enhancements

- [ ] Background music integration
- [ ] Random farm sound effects
- [ ] Game history/statistics
- [ ] Custom game rules
- [ ] Export/import configurations
- [ ] Docker containerization
- [ ] Production deployment guide

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
