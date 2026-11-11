# 📺 Random Video Player

A sleek, self-hosted web app built with Next.js 16 to play random episodes from your local TV show collections on demand.

Designed for couch-friendly viewing, local media servers, or home NAS setups (Synology, TrueNAS, unRAID, Windows, Linux).

---

## ✨ Features

- **Show Selector Hub (`/`)**: Flashy, modern Netflix/streaming-style cards with cover artwork, episode count badges, smooth hover effects, and ambient glow.
- **Random Episode Roulette (`/[show]`)**: Instantly picks and plays a random episode from the chosen show on page load or button click.
- **Full Season / Subfolder Support**: Scans subfolders recursively (e.g., `Season 1`, `Season 2`, `S01`, `S02`), so your show folder structure can stay organized while still picking from all available episodes.
- **Fullscreen Theater Mode**:
  - Auto-hiding **Next** button and **← Shows** navigation.
  - Video range-request streaming (`206 Partial Content`) for instant seeking and smooth scrubbing.
  - Formats supported: `.mp4`, `.mkv`, `.webm`, `.mov`, `.avi`, `.m4v`.
- **Complete Episode Browser**: Scroll down below the player to view the full library of episodes for that show and play any specific file directly.
- **Standalone & NAS Ready**: Pre-configured for lightweight standalone deployment with built-in startup scripts (`start.sh` / `start.bat`).

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/djmarcos88/random-video-player.git
cd random-video-player
npm install
```

### 2. Configure Shows (`shows.json`)

Shows are configured in [`shows.json`](shows.json) at the root of the project:

```json
[
  {
    "path": "simpsons",
    "title": "The Simpsons",
    "image": "/shows/simpsons.jpg",
    "folder": "C:\\Users\\yourname\\Videos\\The Simpsons"
  },
  {
    "path": "futurama",
    "title": "Futurama",
    "image": "/shows/futurama.jpg",
    "folder": "/volume1/video/Futurama"
  }
]
```

- `path`: URL subpath for the show (e.g., `simpsons` → `http://localhost:5150/simpsons`).
- `title`: Display title shown on cards and the player.
- `image`: Path to the poster/cover image (place custom images in `public/shows/`).
- `folder`: Absolute path to the folder on your host machine or NAS.

> **Tip:** `shows.json` is read at runtime, so you can add new shows or change directories anytime without rebuilding!

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:5150](http://localhost:5150) in your browser.

---

## 📦 Production & Deployment (NAS / Server)

### Local Production Build

```bash
npm run build
npm run start
```

### Deploying to a NAS / Remote Server

Run the deploy build script:

```bash
npm run deploy
```

This compiles a self-contained Next.js standalone bundle into `./dist/` containing:
- Standalone Node.js server (`server.js`)
- Static assets & cover images (`public/`)
- Current show configuration (`shows.json`)
- Launch scripts (`start.sh` for Linux/NAS, `start.bat` for Windows)

Copy the `./dist` folder to your target device and run:

**Linux / Synology NAS / Docker host:**
```bash
sh start.sh
```

**Windows Host:**
```cmd
start.bat
```

The server runs by default on port `5150` (configurable via `PORT` environment variable).

---

## 🛠️ Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org) (App Router, Turbopack)
- **UI:** [React 19](https://react.dev), [Tailwind CSS v4](https://tailwindcss.com)
- **Streaming:** Native Node.js stream pipeline with HTTP `Range` header support
