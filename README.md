<p align="center">
  <img src="https://img.shields.io/badge/Electron-40.x-47848F?style=flat-square&logo=electron&logoColor=white" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Tone.js-15-EF4444?style=flat-square" />
  <img src="https://img.shields.io/badge/FastAPI-0.115-009688?style=flat-square&logo=fastapi&logoColor=white" />
  <img src="https://img.shields.io/badge/VST3-Supported-8B5CF6?style=flat-square" />
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=flat-square" />
</p>

<h1 align="center">Crescent Studio</h1>

<p align="center">
  <strong>AI-powered beat generation studio with real-time effects and VST3 plugin support.</strong>
</p>

<p align="center">
  Generate beats with ElevenLabs AI &middot; Separate stems &middot; Mix in real-time &middot; Process through VST3 plugins
</p>

---

## Overview

Crescent Studio is a desktop music production tool that combines AI beat generation with professional mixing capabilities. Generate full beats from text prompts, separate them into stems, apply real-time effects, and process audio through your installed VST3 plugins — all from a single interface.

### Key Features

- **AI Beat Generation** — Generate beats across 12+ genres using ElevenLabs Music API
- **Stem Separation** — Automatically split beats into 6 individual stems (drums, bass, melody, etc.)
- **Real-time Effects** — 12 built-in Tone.js effects with instant parameter control (EQ, Reverb, Compressor, Delay, Distortion, Chorus, Phaser, and more)
- **VST3 Plugin Support** — Scan, load, and render audio through any installed VST3 plugin via pedalboard
- **Composition Planning** — Preview AI-generated composition plans before spending credits
- **Sound Effects Lab** — Generate one-shot sound effects from text descriptions
- **Multi-track Arranger** — Arrange regions across a timeline with zoom and snap
- **Desktop App** — Native Electron shell with automatic backend management

## Architecture

```
┌──────────────────────────────────────────────────┐
│                  Electron Shell                   │
│                                                   │
│  ┌─────────────────────────────────────────────┐  │
│  │              React Frontend                  │  │
│  │                                              │  │
│  │  Player → [EQ] → [Reverb] → ... → Channel   │  │
│  │          Real-time Tone.js FX chain          │  │
│  └────────────────────┬────────────────────────┘  │
│                       │ REST API                   │
│  ┌────────────────────┴────────────────────────┐  │
│  │            FastAPI Backend                    │  │
│  │                                              │  │
│  │  ElevenLabs API  ·  pedalboard VST3 engine   │  │
│  └──────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────┘
```

## Getting Started

### Prerequisites

- **Node.js** 18+
- **Python** 3.11+
- **ElevenLabs API Key** — [Get one here](https://elevenlabs.io/)

### Installation

```bash
git clone https://github.com/lukebancroft4-max/crescent-studio.git
cd crescent-studio
```

**Backend:**

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate   # or .venv\Scripts\activate on Windows
pip install -r requirements.txt
```

Create a `.env` file in the `backend/` directory:

```
ELEVENLABS_API_KEY=your_api_key_here
```

**Frontend:**

```bash
cd frontend
npm install
```

### Running

**Web mode** (browser):

```bash
# Terminal 1 — backend
cd backend && .venv/bin/python -m uvicorn main:app --port 8000

# Terminal 2 — frontend
cd frontend && npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

**Desktop mode** (Electron):

```bash
cd frontend
npm run electron:dev
```

The backend starts automatically. A native window opens with the full app.

## Usage

### Generate a Beat

1. Open **Studio** from the sidebar
2. Select genre, mood, key, BPM, duration, and instruments
3. Click **Generate** — the AI creates a beat and automatically separates stems
4. Use the **Stem Mixer** to adjust volume, mute, or solo individual tracks

### Apply Real-time Effects

1. After stems are loaded, click the **FX** button on any track
2. Select the **Effects** tab
3. Choose an effect from the dropdown (Reverb, Delay, Distortion, etc.)
4. Adjust parameters with sliders — changes are heard instantly
5. Stack multiple effects per stem

### Use VST3 Plugins

1. Navigate to the **Plugins** page and click **Scan for Plugins**
2. Go back to **Studio**, expand a track's FX panel, and select the **VST3** tab
3. Add plugins from the dropdown, adjust parameters
4. Click **Render Through VST3 Chain** — the stem is processed offline and reloaded

### Composition Planning

1. In Studio, click **Plan** instead of Generate
2. Preview the AI-generated composition structure (free, no credits used)
3. Click **Generate from Plan** to create the beat

## Project Structure

```
crescent-studio/
├── backend/
│   ├── main.py              # FastAPI app + routes
│   ├── generator.py         # ElevenLabs API integration
│   ├── plugin_scanner.py    # VST3 scanning + audio processing
│   ├── plugin_router.py     # Plugin API endpoints
│   ├── models.py            # Pydantic request/response models
│   ├── presets.py           # Genre/mood/instrument presets
│   ├── midi_converter.py    # Audio → MIDI conversion
│   ├── audio_processor.py   # Beat detection + normalization
│   └── requirements.txt
├── frontend/
│   ├── electron/
│   │   ├── main.js          # Electron main process
│   │   └── preload.js       # Context bridge
│   ├── src/
│   │   ├── api/client.js    # API client functions
│   │   ├── stores/          # Zustand state management
│   │   │   ├── audioStore.js
│   │   │   ├── effectChainStore.js
│   │   │   ├── pluginStore.js
│   │   │   ├── vstChainStore.js
│   │   │   ├── arrangerStore.js
│   │   │   └── settingsStore.js
│   │   ├── components/      # Reusable UI components
│   │   │   ├── TrackMixer.jsx
│   │   │   ├── EffectRack.jsx
│   │   │   ├── VstPluginRack.jsx
│   │   │   ├── ControlsPanel.jsx
│   │   │   ├── GlobalTransport.jsx
│   │   │   └── ...
│   │   ├── pages/           # Route pages
│   │   │   ├── StudioPage.jsx
│   │   │   ├── LibraryPage.jsx
│   │   │   ├── ArrangerPage.jsx
│   │   │   ├── PluginsPage.jsx
│   │   │   ├── SfxLabPage.jsx
│   │   │   └── SettingsPage.jsx
│   │   └── layouts/
│   │       └── AppShell.jsx
│   ├── vite.config.js
│   └── package.json
└── scripts/
    └── build.sh             # Production build pipeline
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/generate` | Generate a beat from parameters |
| `POST` | `/api/plan` | Create a composition plan (free) |
| `POST` | `/api/generate-from-plan` | Generate from composition plan |
| `POST` | `/api/separate/{beat_id}` | Separate beat into stems |
| `POST` | `/api/sfx` | Generate sound effect from text |
| `GET` | `/api/stems/{beat_id}` | List stems for a beat |
| `GET` | `/api/export/audio/{beat_id}` | Download beat audio |
| `GET` | `/api/export/midi/{beat_id}` | Download MIDI |
| `POST` | `/api/plugins/scan` | Scan for VST3 plugins |
| `GET` | `/api/plugins/list` | List discovered plugins |
| `POST` | `/api/plugins/process` | Process stem through VST3 chain |
| `GET` | `/api/history` | Beat generation history |
| `GET` | `/api/status` | API status check |

## Available Effects

| Effect | Parameters |
|--------|-----------|
| EQ3 | Low, Mid, High, Low Freq, High Freq |
| Reverb | Decay, Wet, Pre-delay |
| Compressor | Threshold, Ratio, Attack, Release |
| Delay | Delay Time, Feedback, Wet |
| Distortion | Amount, Wet |
| Chorus | Frequency, Delay, Depth, Wet |
| Phaser | Frequency, Octaves, Base Freq, Wet |
| Ping Pong Delay | Delay Time, Feedback, Wet |
| BitCrusher | Bits, Wet |
| Tremolo | Frequency, Depth, Wet |
| AutoFilter | Frequency, Base Freq, Octaves, Wet |
| AutoPanner | Frequency, Depth, Wet |

## Building for Distribution

```bash
bash scripts/build.sh
```

Produces platform-specific packages in `frontend/release/`:
- **Linux** — AppImage
- **macOS** — DMG
- **Windows** — NSIS installer

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Desktop Shell | Electron 40 |
| Frontend | React 19, Zustand, Tailwind CSS 4, Tone.js 15 |
| Audio Visualization | wavesurfer.js 7 |
| Backend | FastAPI, uvicorn |
| AI Generation | ElevenLabs Music API v1 |
| VST3 Processing | Spotify pedalboard |
| Audio Analysis | librosa, soundfile, numpy |
| Build | Vite 7, electron-builder, PyInstaller |

## License

MIT
