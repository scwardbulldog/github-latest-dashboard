# Configuration Guide

This guide explains how to customize the dashboard using the configuration file.

## Overview

The dashboard supports an external configuration file (`config.json`) that allows customization without code changes. This is ideal for:

- **Kiosk deployments** - Different offices can have different settings
- **Raspberry Pi setups** - Easily customize without rebuilding
- **Vercel deployments** - Add config.json to customize the hosted version

## Configuration File Location

Place `config.json` in the `public/` directory (for development) or alongside `index.html` (for production).

```
project/
├── public/
│   └── config.json    # Development (Vite serves this)
├── index.html         # Production artifact
└── config.json        # Production (served alongside index.html)
```

For **Raspberry Pi deployment**, the config file should be in the same directory as `index.html`:

```bash
~/dashboard/
├── index.html
└── config.json
```

## Configuration Options

### Complete Example

```json
{
  "$schema": "./config.schema.json",
  "_comment": "Dashboard configuration - customize without code edits",
  
  "refreshInterval": 300000,
  
  "pages": ["vscode", "visualstudio", "blog", "changelog", "status", "anthropic"],
  
  "pageIntervals": {
    "default": 30000,
    "blog": 80000,
    "changelog": 80000,
    "vscode": 80000,
    "visualstudio": 80000,
    "anthropic": 80000
  },
  
  "itemIntervals": {
    "default": 5333,
    "blog": 16000,
    "changelog": 16000,
    "vscode": 16000,
    "visualstudio": 16000,
    "anthropic": 16000
  },
  
  "itemsPerFeed": {
    "default": 5,
    "blog": 5,
    "changelog": 5,
    "status": 10,
    "vscode": 5,
    "visualstudio": 5,
    "anthropic": 5
  }
}
```

### Option Details

#### `refreshInterval`

API refresh interval in milliseconds.

- **Default:** `300000` (5 minutes)
- **Minimum:** `60000` (1 minute)
- **Description:** How often the dashboard fetches new data from APIs

```json
{
  "refreshInterval": 600000  // 10 minutes
}
```

#### `pages`

Array of page identifiers to display in the carousel.

- **Default:** `["vscode", "visualstudio", "blog", "changelog", "status", "anthropic"]`
- **Valid values:** `"blog"`, `"changelog"`, `"status"`, `"vscode"`, `"visualstudio"`, `"anthropic"`
- **Description:** Controls which pages are shown and their order

```json
{
  "pages": ["blog", "changelog", "status"]  // Only show 3 pages
}
```

#### `pageIntervals`

Page rotation intervals in milliseconds.

- **`default`:** Fallback interval for pages not specified (default: `30000` / 30 seconds)
- **Per-page:** Override for specific pages

```json
{
  "pageIntervals": {
    "default": 30000,     // 30 seconds
    "blog": 60000,        // 60 seconds on blog page
    "status": 45000       // 45 seconds on status page
  }
}
```

#### `itemIntervals`

Item highlighting intervals in milliseconds.

- **`default`:** Fallback interval for items (default: `5333` / ~5.3 seconds)
- **Per-page:** Override for specific pages

```json
{
  "itemIntervals": {
    "default": 8000,      // 8 seconds per item
    "blog": 12000,        // 12 seconds per item on blog
    "changelog": 12000    // 12 seconds per item on changelog
  }
}
```

#### `itemsPerFeed`

Number of items to display per feed.

- **`default`:** Fallback count (default: `5`)
- **Per-feed:** Override for specific feeds
- **Range:** `1` to `20`

```json
{
  "itemsPerFeed": {
    "default": 5,
    "blog": 10,           // Show 10 blog items
    "status": 15          // Show 15 status items
  }
}
```

## Partial Configuration

You only need to specify the values you want to change. Missing values use defaults.

**Minimal config (just change refresh interval):**

```json
{
  "refreshInterval": 600000
}
```

**Show fewer pages:**

```json
{
  "pages": ["blog", "changelog", "status"]
}
```

**Slower rotation for readability:**

```json
{
  "pageIntervals": {
    "default": 60000
  },
  "itemIntervals": {
    "default": 10000
  }
}
```

## Deployment-Specific Notes

### Raspberry Pi

1. Copy `config.json` to `~/dashboard/` alongside `index.html`
2. Restart the dashboard: `sudo systemctl restart kiosk.service`
3. Config loads automatically on startup

```bash
# Example: Deploy custom config
scp config.json pi@github-dashboard.local:~/dashboard/
ssh pi@github-dashboard.local "sudo systemctl restart kiosk.service"
```

### Vercel

1. Add `config.json` to the `public/` directory in your repository
2. Deploy as normal - Vercel will serve the config file
3. For default behavior, no `config.json` is needed

### Local Development

1. Edit `public/config.json`
2. Changes take effect on next page refresh
3. Check browser console for config loading messages:
   ```
   📋 Config: Loaded custom configuration from config.json
   📋 Dashboard configuration loaded:
      - Refresh interval: 300s
      - Pages: vscode, visualstudio, blog, changelog, status, anthropic
      - Default page interval: 30s
      - Default item interval: 5.333s
   ```

## Troubleshooting

### Config Not Loading

1. **Check file location:** Must be in `public/` (dev) or alongside `index.html` (prod)
2. **Check JSON syntax:** Use a JSON validator
3. **Check console:** Look for "📋 Config:" messages

### Invalid Configuration

If the config file has invalid values, the dashboard:
1. Logs a warning to the console
2. Falls back to default values
3. Continues running normally

Example warning:
```
📋 Config: Invalid config.json, using defaults. Errors: ["refreshInterval must be >= 60000"]
```

### Missing Config File

If `config.json` is not found (404), the dashboard:
1. Logs: `📋 Config: No config.json found, using defaults`
2. Uses all default values
3. Runs normally

This is the expected behavior for deployments that don't need customization.

## Related Documentation

- [Architecture Guide](architecture.md) - System design overview
- [Deployment Guide](deployment.md) - Build and deployment procedures
- [Raspberry Pi Setup](raspberry-pi-setup.md) - Complete Pi configuration
