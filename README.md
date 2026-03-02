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
# Build single index.html file in project root
npm run build
```

Build output:
- Creates `/index.html` with all CSS/JS inlined
- Single-file artifact ready for Pi deployment
- Minified and optimized (typically ~26KB)
- Build completes in under 10 seconds

### Deployment Workflow

The dashboard uses a **Git-based deployment** model - no manual file copying required:

```bash
# 1. Build the production artifact
npm run build

# 2. Commit both source and built artifact
git add src/ index.html
git commit -m "feat: your changes here"

# 3. Push to GitHub
git push origin main

# 4. Raspberry Pi auto-pulls on restart (or manually trigger)
ssh pi@github-dashboard.local "cd ~/dashboard && git pull origin main && sudo systemctl restart kiosk.service"
```

**Important:** The Pi expects the built `index.html` file in the repository root. Always commit both your source changes in `/src` and the built artifact.

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
