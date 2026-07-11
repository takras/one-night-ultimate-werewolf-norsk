# Quick Start Guide

## 📁 Project Created Successfully!

All files have been scaffolded and are ready to run. Here's what was created:

### Frontend (React + Vite)
- ✅ `frontend/src/App.jsx` — Main app component with routing
- ✅ `frontend/src/components/HomeScreen.jsx` — Character selection screen
- ✅ `frontend/src/components/GameScreen.jsx` — Automatic game playback with wake lock
- ✅ `frontend/src/components/AdminPanel.jsx` — Audio upload/recording interface
- ✅ `frontend/vite.config.js` — Build configuration with API proxy
- ✅ All CSS files with dark mystical theme

### Backend (Express.js)
- ✅ `backend/server.js` — Express app with CORS
- ✅ `backend/routes/characters.js` — Character endpoints + play order logic
- ✅ `backend/routes/audio.js` — Audio upload/download endpoints
- ✅ `backend/routes/game.js` — Game initialization endpoints
- ✅ `backend/config/characters.json` — All 30 characters with metadata

### Configuration
- ✅ `package.json` — Root package with convenient npm scripts
- ✅ `.gitignore` — Git configuration
- ✅ `README.md` — Full documentation
- ✅ `.env.example` — Environment variables template

---

## 🚀 Installation & Running

### Step 1: Install Dependencies
```bash
# In the project root, run:
npm run install-all

# Or manually:
cd frontend && npm install
cd ../backend && npm install
```

### Step 2: Start Development Servers
```bash
# In the project root, run:
npm run dev

# Or in separate terminals:
npm run dev:backend    # Terminal 1 - Backend on :5000
npm run dev:frontend   # Terminal 2 - Frontend on :3000
```

### Step 3: Open in Browser
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api/health

---

## 📋 What's Ready Now

| Feature | Status | Notes |
|---------|--------|-------|
| Home Screen (Character Selection) | ✅ Ready | All ~30 characters display, multi-copy logic works |
| Game Screen (Auto Playback) | ✅ Ready | Timer, auto-advance, wake lock enabled |
| Admin Panel (Audio Upload) | ✅ Ready | Record or upload audio per character |
| Character Metadata | ✅ Ready | Play order, multi-copies, complex flags |
| Backend API | ✅ Ready | All endpoints functional |
| UI Styling | ✅ Ready | Dark mystical theme throughout |

---

## 🎯 Next Steps (Optional Enhancements)

### 1. **Add Background Music & Sound Effects**
   - Place `.mp3` files in `public/music/`
   - Update `GameScreen.jsx` to play ambient sounds
   - Use `backgroundMusicRef` to loop during gameplay

### 2. **Upload Character Audio**
   - Click ⚙️ Admin button
   - For each character:
     - Select character
     - Record audio or upload file
     - Mark as "complex" if needed
   - Test in game

### 3. **Customize Settings** (Optional)
   - Edit `backend/config/characters.json` to adjust character metadata
   - Modify `HomeScreen.css` for custom color scheme
   - Update player count logic in `HomeScreen.jsx` if game rules change

### 4. **Deploy** (Future)
   - Build frontend: `npm run build`
   - Deploy to hosting service (Vercel, Netlify, Firebase, etc.)
   - Set up backend on cloud (Heroku, Railway, AWS, etc.)

---

## 🎮 How to Use the App

### Home Screen
1. **Select Roles** — Click character cards to toggle selection
2. **Adjust Duration** — Slider for seconds per character (default 5s)
3. **Mark Complex** — Check "2x time" for complex roles (when selected)
4. **Start Game** — Button shows "START GAME - X Players" (X = selected + 3)

### Game Screen
- Fully automatic — no interaction needed
- Timer counts down per character
- Next character shown in preview
- Game ends automatically, displays completion message

### Admin Panel (⚙️ Button)
- **Record Audio:**
  1. Select character
  2. Click "Start Recording"
  3. Speak the prompt
  4. Click "Stop Recording"
  5. Preview & Upload

- **Upload File:**
  1. Click "choose file to upload"
  2. Select MP3, WAV, or WebM file
  3. Click upload

---

## 🔧 Troubleshooting

### Dependencies not installing?
```bash
# Clear cache and retry
rm -rf node_modules package-lock.json
npm run install-all
```

### Port 3000 or 5000 already in use?
```bash
# Change port in frontend/vite.config.js or backend/server.js
# Or kill the process using the port
```

### Audio not playing in game?
- Upload audio files in admin panel first
- Check browser console for errors
- Ensure files are valid audio format

### Device won't stay awake?
- Wake Lock API is browser-dependent
- Works best on Chrome/Edge, supported on Firefox/Safari
- Mobile devices have better support than desktop

---

## 📞 Support

Refer to the full `README.md` for:
- API endpoint documentation
- Architecture overview
- Technology stack details
- Browser compatibility
- Future enhancement ideas

---

## ✨ You're All Set!

The app is ready to develop and test. Start with:
```bash
npm run dev
# Then open http://localhost:3000
```

Happy testing! 🎭
