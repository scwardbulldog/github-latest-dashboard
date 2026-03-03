# GitHub Updates Office Dashboard

A single-page web dashboard designed to run full-screen on a large office TV, displaying the latest updates from GitHub across three sources.

## Features

- **GitHub Blog** - Latest blog posts from the official GitHub blog
- **GitHub Changelog** - Product updates and feature announcements
- **GitHub Status** - Real-time status and incident information
- **Auto-refresh** - Updates every 5 minutes automatically
- **Full-screen optimized** - Designed for large TV displays with high contrast and large fonts

## Data Sources

1. **GitHub Blog** - RSS feed via rss2json.com API
2. **GitHub Changelog** - RSS feed via rss2json.com API  
3. **GitHub Status** - REST API from githubstatus.com

## Usage

### Prerequisites

- **Node.js** v16 or higher (required for development only)
- **npm** v7 or higher (comes with Node.js)
- **Git** for version control

Install Node.js from [nodejs.org](https://nodejs.org/) if you haven't already.

### Development Workflow

**First-time setup:**
```bash
# Install dependencies
npm install
```

**Local development with hot reload:**
```bash
# Start Vite dev server at http://localhost:5173
npm run dev
```

The dev server provides:
- **Hot Module Replacement (HMR)** - CSS and JS changes appear instantly without page reload
- **Fast refresh** - Immediate feedback during development
- **Error overlay** - Build errors displayed in browser

Make changes to files in the `/src` directory:
- `/src/index.html` - HTML structure
- `/src/css/main.css` - Styles and GitHub Primer design tokens
- `/src/js/*.js` - JavaScript modules and components

Changes will appear automatically in your browser.

**Production build:**
```bash
# Build to dist/ folder and copy to root for Pi deployment
npm run build
```

Build output:
- Creates `/dist/` folder with build artifacts (gitignored)
- Copies final `/index.html` to project root for Pi deployment
- Single-file artifact with all CSS/JS inlined
- Minified and optimized (typically ~65KB with carousel code)
- Build completes in under 1 second

**Build Architecture (Option B):**
- **Source files:** `/src/` (where you edit)
- **Build artifacts:** `/dist/` (temporary, gitignored)
- **Deployment file:** `/index.html` (committed to root for Pi)

This architecture separates source from build while maintaining simple Pi deployment (no build step on Pi).

### Deployment Workflow

The dashboard uses a **Git-based deployment** model - no manual file copying or build step on Pi:

```bash
# 1. Make changes in src/ directory
# Edit src/index.html, src/js/*.js, src/css/*.css

# 2. Build the production artifact
npm run build
# This builds to dist/ and copies index.html to root

# 3. Commit both source and built artifact
git add src/ index.html
git commit -m "feat: your changes here"

# 4. Push to GitHub
git push origin main

# 5. Raspberry Pi auto-pulls on restart (or manually trigger)
ssh pi@github-dashboard.local "cd ~/dashboard && git pull origin main && sudo systemctl restart kiosk.service"
```

**Architecture Notes:**
- **Development:** All changes made in `/src/` directory
- **Build process:** Vite builds to `/dist/` (temporary), copies `index.html` to root
- **Pi deployment:** Only needs `index.html` at root (no Node.js or build tools required)
- **Git tracking:** Both `/src/` (source) and `/index.html` (built artifact) are committed
- **Ignored:** `/dist/` folder is gitignored (build output only)

**Why this architecture?**
This "Option B" approach balances Vite best practices (clean dist/ builds) with Pi deployment simplicity (no build step needed). The Pi stays lean and reliable with just Python's http.server.

### Local Testing (without dev server)

To test the built artifact locally before deploying:

```bash
# Build first
npm run build

# Serve built file with Python
python3 -m http.server 8000
# Visit http://localhost:8000

# Or open directly in browser
open index.html
```

### TV Display

1. Open `index.html` in a web browser on the computer connected to your office TV
2. Press F11 (or your browser's fullscreen shortcut) to enter fullscreen mode
3. The dashboard will auto-refresh every 5 minutes

### Raspberry Pi Kiosk Deployment

For a dedicated 24/7 kiosk setup, deploy the dashboard on a **Raspberry Pi 3B** that auto-boots directly to the fullscreen dashboard.

**Features:**
- Auto-boot to fullscreen dashboard on power-on
- **Git-based deployment** - Automatically pulls latest code from GitHub on restart
- **Zero-touch updates** - Push to GitHub, restart Pi, changes appear automatically
- Screen sleep and screensaver disabled
- Mouse cursor hidden
- Auto-recovery from power outages
- Auto-restart on crashes
- 24/7 reliable operation

**Quick Start:**
1. Flash Raspberry Pi OS Lite to SD card using [Raspberry Pi Imager](https://www.raspberrypi.com/software/)
2. Follow the complete step-by-step guide: **[docs/raspberry-pi-setup.md](docs/raspberry-pi-setup.md)**
3. Connect Pi to your office TV via HDMI
4. Power on and enjoy hands-free operation

**Deployment Workflow:**
```bash
# 1. Make changes to dashboard
# 2. Push to GitHub
git push origin main

# 3. Restart kiosk on Pi (via SSH)
ssh pi@github-dashboard.local "sudo systemctl restart kiosk.service"

# Dashboard automatically pulls and displays latest code!
```

**Hardware Requirements:**
- Raspberry Pi 3B (1GB RAM minimum)
- 16GB+ microSD card (32GB recommended)
- 5V 3A power supply (official Pi adapter recommended)
- HDMI cable and TV

See the [complete deployment guide](docs/raspberry-pi-setup.md) for detailed instructions, troubleshooting, and maintenance procedures.

### Customization

You can modify the following constants in the JavaScript section:

- `REFRESH_INTERVAL` - Change auto-refresh frequency (default: 5 minutes)
- Number of items displayed per section (currently set to 10)
- Colors and styling in the CSS section

## Browser Compatibility

Works with all modern browsers:
- Chrome/Edge (recommended)
- Firefox
- Safari

## License

MIT
