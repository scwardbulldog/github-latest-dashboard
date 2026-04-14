# R&D Tools Updates Office Dashboard

A single-page web dashboard designed to run full-screen on a large office TV, displaying the latest updates from developer tools and platforms.

## Features

- **GitHub Blog** - Latest blog posts
- **GitHub Changelog** - Product updates and feature announcements
- **GitHub Status** - Real-time status and incident information with uptime tracker
  - Tracks days since last major GitHub incident affecting developer services
  - Filters for relevant services: Actions, Copilot, API, Pull Requests, Issues, Git Operations, etc.
  - Excludes non-essential services: GitHub Pages, GitHub Wiki (not yet used by team)
- **Auto-refresh** - Updates every 5 minutes automatically
- **Auto-rotating pages** - Cycles through Blog → Changelog → Status every 30 seconds
- **Item highlighting** - Highlights and showcases individual items every 8 seconds
- **Detail panel** - Full content display for highlighted items
- **Configurable** - Customize timing, pages, and item counts via `config.json`
- **Optimized for viewing** - Large fonts and high contrast, readable from 10-15 feet

## Quick Links

📚 **Documentation**
- [Architecture](docs/architecture.md) - Component structure and design patterns
- [Configuration Guide](docs/configuration.md) - Customize settings via config.json
- [Contributing Guide](docs/contributing.md) - Development patterns and coding standards
- [Deployment Guide](docs/deployment.md) - Build and deployment procedures
- [Troubleshooting Guide](docs/troubleshooting.md) - Common issues and solutions
- [Testing Guide](docs/testing-guide.md) - Validation and burn-in testing
- [Raspberry Pi Setup](docs/raspberry-pi-setup.md) - Complete kiosk deployment guide

## Quick Start

Get the dashboard running locally in 5 minutes:

```bash
# Clone repository
git clone https://github.com/scwardbulldog/github-latest-dashboard.git
cd github-latest-dashboard

# Install dependencies
npm install

# Start development server
npm run dev
# Visit http://localhost:5173
```

Changes to `/src/` files appear instantly with hot reload.

## Prerequisites

- **Node.js** v18+ (development only)
- **npm** v7+ (comes with Node.js)
- **Git** for version control
- **Python 3.11+** (Pi deployment only, pre-installed on Pi OS)

Install Node.js from [nodejs.org](https://nodejs.org/)

## Development

### Daily Development

```bash
npm run dev          # Start dev server with hot reload
# Make changes in /src/ directory
npm run build        # Build for production
```

**Important:** Always edit files in `/src/` directory, never the root `/index.html` (build artifact).

### Available Scripts

```bash
npm run dev          # Development server (localhost:5173)
npm run build        # Build production artifact
npm run preview      # Preview built artifact
npm run test:validate    # Check design token compliance
npm run test:health      # Dashboard health check
npm run test:memory      # Memory leak detection (24+ hours)
npm run test:burn-in     # Complete burn-in test suite
```

See [Testing Guide](docs/testing-guide.md) for detailed testing procedures.

## Deployment

### Git-Based Deployment

```bash
# 1. Build
npm run build

# 2. Commit source and artifact
git add src/ index.html
git commit -m "feat: your changes"

# 3. Push to GitHub
git push origin main

# 4. Restart Pi kiosk (pulls automatically)
ssh pi@github-dashboard.local "sudo systemctl restart kiosk.service"
```

See [Deployment Guide](docs/deployment.md) for complete procedures.

## Raspberry Pi Kiosk

For 24/7 office display:

1. Flash Raspberry Pi OS Lite to SD card
2. Follow **[Raspberry Pi Setup Guide](docs/raspberry-pi-setup.md)**
3. Connect to TV via HDMI
4. Power on - dashboard auto-starts

**Hardware Requirements:**
- Raspberry Pi 3B (1GB RAM)
- 16GB+ microSD card
- 5V 3A power supply
- HDMI cable and TV

## Configuration

Customize the dashboard without code changes by creating a `config.json` file:

```json
{
  "refreshInterval": 300000,
  "pages": ["blog", "changelog", "status"],
  "pageIntervals": {
    "default": 30000,
    "blog": 60000
  },
  "itemsPerFeed": {
    "default": 5,
    "blog": 10
  }
}
```

**Configuration Options:**
- `refreshInterval` - API refresh interval in milliseconds (default: 300000 / 5 minutes)
- `pages` - Which pages to show and their order
- `pageIntervals` - How long to display each page
- `itemIntervals` - How long to highlight each item
- `itemsPerFeed` - Number of items to display per feed

See [Configuration Guide](docs/configuration.md) for full details.

## Browser Compatibility

- **Primary:** Chromium 84 on Raspberry Pi 3B
- **Development:** Chrome, Firefox, Safari (all modern browsers)

## License

MIT
