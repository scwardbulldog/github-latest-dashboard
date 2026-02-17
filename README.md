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

### Local Development

Simply open `index.html` in your web browser:

```bash
# Open directly in browser
open index.html

# Or use a simple HTTP server
python -m http.server 8000
# Then visit http://localhost:8000
```

### TV Display

1. Open `index.html` in a web browser on the computer connected to your office TV
2. Press F11 (or your browser's fullscreen shortcut) to enter fullscreen mode
3. The dashboard will auto-refresh every 5 minutes

### Raspberry Pi Kiosk Deployment

For a dedicated 24/7 kiosk setup, deploy the dashboard on a **Raspberry Pi 3B** that auto-boots directly to the fullscreen dashboard.

**Features:**
- Auto-boot to fullscreen dashboard on power-on
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
