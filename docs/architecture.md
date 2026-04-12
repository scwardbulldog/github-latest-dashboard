# Architecture

This document describes the internal architecture of the GitHub Updates Dashboard.

## Component Overview

The dashboard is built with a **component-based architecture** using vanilla JavaScript ES modules:

```
/src/js/
  ├── main.js                     # Application entry point & orchestration
  ├── config-loader.js            # User configuration loading (config.json)
  ├── carousel-controller.js      # Page rotation (30s timer)
  ├── item-highlighter.js         # Item highlighting (8s timer)
  ├── detail-panel.js            # Detail view rendering
  ├── api-client.js              # Data fetching with retry/cache
  ├── persistent-alert.js        # Cross-page outage indicator
  └── utils.js                   # Shared utilities (formatDate, stripHtml, truncate)
```

## Component Responsibilities

### ConfigLoader (`config-loader.js`)
- Loads user configuration from `/config.json` on startup
- Provides fallback defaults if config file not found
- Validates configuration values
- Exports helper functions for retrieving config values
- Supports partial configuration (only specify what you want to change)

### CarouselController (`carousel-controller.js`)
- Rotates between Blog/Changelog/Status pages every 30 seconds
- Manages smooth fade transitions (300ms duration)
- Exposes `onPageChange` callback for component coordination
- Provides `start()`, `stop()`, `goToPage()` methods

### ItemHighlighter (`item-highlighter.js`)
- Highlights items within current page every 8 seconds
- Resets when page changes (listens to CarouselController)
- Exposes `onItemHighlight` callback for detail panel updates
- Provides `start()`, `stop()`, `reset()` methods

### DetailPanel (`detail-panel.js`)
- Displays full content of currently highlighted item
- Renders title, author, date, description
- Updates automatically via ItemHighlighter callback

### APIClient (`api-client.js`)
- Fetches from 3 APIs (Blog, Changelog, Status)
- Implements retry logic (3 attempts with exponential backoff: 1s, 2s, 4s)
- In-memory caching (5-minute duration)
- Per-column error isolation (Blog fails → Changelog/Status still work)
- Cached fallback when offline

### PersistentAlert (`persistent-alert.js`)
- Cross-page outage indicator (survives page rotation)
- Shows when using cached data during network issues
- Auto-hides when connectivity restored

### Utils (`utils.js`)
- `formatDate()` - ISO timestamps to relative time ("2 hours ago")
- `stripHtml()` - Safe HTML tag removal
- `truncate()` - Character truncation with ellipsis

## File Structure

```
github-latest-dashboard/
├── src/                          # Source files (EDIT THESE)
│   ├── index.html               # HTML structure (source)
│   ├── js/                      # JavaScript modules
│   │   ├── main.js
│   │   ├── config-loader.js
│   │   ├── carousel-controller.js
│   │   ├── item-highlighter.js
│   │   ├── detail-panel.js
│   │   ├── api-client.js
│   │   ├── persistent-alert.js
│   │   └── utils.js
│   └── css/                     # CSS stylesheets
│       ├── main.css             # GitHub Primer tokens
│       ├── layout.css           # Grid and split-view layout
│       ├── components.css       # Item cards, detail panel
│       └── reset.css            # CSS reset
├── public/                       # Static assets (copied to dist/)
│   ├── config.json              # User configuration (optional)
│   └── img/                     # Images
├── index.html                    # Built artifact (DO NOT EDIT - but MUST be committed)
├── package.json                  # Dependencies and scripts
├── vite.config.js               # Vite build configuration
├── README.md                     # Project overview
├── docs/                         # Additional documentation
│   ├── architecture.md          # This file
│   ├── configuration.md         # Configuration guide
│   ├── contributing.md          # Development patterns
│   ├── deployment.md            # Deployment procedures
│   ├── troubleshooting.md       # Common issues
│   ├── testing-guide.md         # Testing procedures
│   └── raspberry-pi-setup.md    # Pi deployment guide
├── deploy/                       # Pi deployment files
│   ├── systemd/                 # systemd service files
│   └── openbox/                 # Openbox kiosk config
└── test/                         # Testing utilities
    ├── memory-monitor.js        # Memory leak detection
    ├── health-check.js          # Dashboard health validation
    ├── validate-primer-colors.js # Design token compliance
    └── *.md                     # Test documentation
```

### Critical File Editing Rules

- ❌ **NEVER EDIT** `/index.html` at project root (build artifact)
- ✅ **ALWAYS EDIT** `/src/index.html`, `/src/js/*.js`, `/src/css/*.css`
- 🔨 **After editing source, run** `npm run build` to regenerate root index.html
- ⚠️ **Unlike typical projects:** The built `index.html` MUST be committed to git (required for Pi deployment)

## State Management

**No Framework** - Pure vanilla JavaScript with:
- **setInterval timers** - Independent timers for carousel (30s), item highlighting (8s), API refresh (5min)
- **Direct callbacks** - Components communicate via function callbacks (no events, no pub/sub)
- **Timer cleanup** - All timers cleaned up in `stop()` methods to prevent memory leaks
- **State independence** - Timers run independently of API refresh (no interruption)
- **Component coordination** - `CarouselController.onPageChange` → `ItemHighlighter.reset()`

### Data Flow

```
API Client (5min interval)
  ↓ fetchBlog(), fetchChangelog(), fetchStatus()
  ↓ Retry logic (3x) + Cache
  ↓
Main.js (receives data)
  ↓ Renders to DOM
  ↓
CarouselController (30s timer)
  ↓ Page rotation
  ↓ onPageChange callback
  ↓
ItemHighlighter (8s timer)
  ↓ Item highlighting
  ↓ onItemHighlight callback
  ↓
DetailPanel (reactive)
  ↓ Displays item details
```

## ES Module Pattern

```javascript
// Named exports (ALWAYS use for classes/functions)
export class CarouselController { }
export function fetchBlogData() { }

// Import with .js extension (REQUIRED for ES modules)
import { CarouselController } from './carousel-controller.js';
import { formatDate } from './utils.js';
```

**Why .js extensions required?** ES modules in browsers require explicit file extensions. If omitted, you'll get:
```
Uncaught TypeError: Failed to resolve module specifier './utils'
```

This differs from CommonJS (Node.js `require()`) which auto-resolves extensions. ES modules are explicit by design.

## GitHub Primer Design System

**MANDATORY** - All visual design MUST use GitHub Primer design tokens:

### Colors

ALWAYS use `var(--color-*)` tokens:

```css
/* ✅ Correct */
color: var(--color-fg-default);
background: var(--color-canvas-default);

/* ❌ Wrong */
color: #c9d1d9;
background: #0d1117;
```

### Spacing

ALWAYS use `var(--space-*)` tokens or 8px multiples:

```css
/* ✅ Correct */
margin: var(--space-4);        /* 16px */
padding: var(--space-3);       /* 12px */

/* ❌ Wrong */
margin: 16px;
padding: 12px;
```

### Typography

ALWAYS use `var(--fontsize-*)` tokens:

```css
/* ✅ Correct */
font-size: var(--fontsize-large);

/* ❌ Wrong */
font-size: 20px;
```

### Why Mandatory?

- Ensures visual consistency with GitHub's design system
- Easier theme changes
- Accessibility compliance (WCAG 2.1 AAA)

### Validation

Run `npm run test:validate` to check for design token violations:

```bash
npm run test:validate

# Success output:
✓ No hardcoded colors found
✓ All spacing uses base-8 or Primer tokens

# Failure output:
✗ Found 11 hardcoded colors in src/css/main.css
✗ Found 24 non-base-8 spacing values
See details above for specific violations
```

## Build Architecture

The project uses **Vite** with a custom build configuration:

- **Source files:** `/src/` (where you edit)
- **Build artifacts:** `/dist/` (temporary, gitignored)
- **Deployment file:** `/index.html` (committed to root for Pi)

This "Option B" architecture balances Vite best practices (clean dist/ builds) with Pi deployment simplicity (no build step needed on Pi).

### Why This Architecture?

1. **Separation of concerns:** Source code separate from build artifacts
2. **Modern tooling:** Vite provides hot reload during development
3. **Pi simplicity:** No Node.js required on Pi (serves pre-built HTML)
4. **Git-based deployment:** Pi can pull and serve without build step
5. **Single-file output:** All CSS/JS inlined for reliability

## Technology Stack

- **HTML5, CSS3, Vanilla JavaScript (ES6+)** - ES2020 target for Chromium 84 compatibility
- **Vite** - Modern bundler with dev server and hot reload
- **No frameworks** - Pure vanilla JS with ES modules
- **External APIs:**
  - RSS2JSON API (rss2json.com) - GitHub Blog & Changelog feeds
  - GitHub Status API (githubstatus.com) - Status incidents

### Deployment Environment

- **Hardware:** Raspberry Pi 3B (1GB RAM, quad-core ARM)
- **OS:** Raspberry Pi OS Lite (64-bit)
- **Browser:** Chromium 84 (kiosk mode, fullscreen)
- **Web Server:** Python 3 http.server (port 8000)
- **File Transfer:** Git-based auto-pull on Pi restart

### Development Environment

- **Node.js** v18+ (required for Vite)
- **npm** v7+ (package management)
- **Modern browser** for testing (Chrome, Firefox, Safari)

## Performance Considerations

### Pi 3B Constraints

- **1GB RAM** - Avoid memory leaks, limit DOM nodes
- **Quad-core ARM Cortex-A53** - Modest CPU, avoid heavy computation
- **Chromium 84** - Older browser, requires `-webkit` prefixes
- **Limited GPU** - Avoid complex animations, heavy CSS effects

### Optimization Strategies

1. **Timer precision without overhead** - Use efficient `setInterval` patterns
2. **Minimal DOM manipulation** - Update only what changed
3. **CSS performance** - Avoid expensive properties (box-shadow, filter, blur)
4. **Memory management** - Clean up timers and event listeners
5. **Caching** - In-memory API cache reduces network requests
6. **Bundle size** - Vite tree-shaking removes unused code

## Related Documentation

- [Contributing Guide](contributing.md) - Development patterns and standards
- [Deployment Guide](deployment.md) - Build and deployment procedures
- [Troubleshooting Guide](troubleshooting.md) - Common issues and solutions
- [Testing Guide](testing-guide.md) - Testing procedures and validation
- [Raspberry Pi Setup](raspberry-pi-setup.md) - Complete Pi deployment guide
