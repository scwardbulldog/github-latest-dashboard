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
