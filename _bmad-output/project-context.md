---
project_name: 'github-latest-dashboard'
user_name: 'Shane'
date: '2026-03-02'
sections_completed: ['technology_stack', 'language_rules', 'component_architecture', 'code_quality', 'deployment_workflow', 'critical_rules']
status: 'complete'
rule_count: 127
optimized_for_llm: true
existing_patterns_found: 15
last_updated: '2026-03-02'
---

# Project Context for AI Agents

_This file contains critical rules and patterns that AI agents must follow when implementing code in this project. Focus on unobvious details that agents might otherwise miss._

---

## Technology Stack & Versions

**Build System (NEW - CRITICAL CHANGE):**
- **Vite** - Modern bundler with dev server and hot reload
- **npm** - Package manager (Node.js on dev machine ONLY, NOT on Pi)
- **ES Modules** - Import/export syntax replacing inline scripts
- **Multi-file source structure** - `/src/js/` and `/src/css/` directories
- **Component-based architecture** - Separate modules for carousel, highlighter, detail panel

**Core Technologies:**
- **HTML5, CSS3, Vanilla JavaScript (ES6+)** - ES2020 target for Chromium 84 compatibility
- **No frameworks** - Pure vanilla JS with ES modules
- **External APIs:**
  - RSS2JSON API (rss2json.com/v1/api.json) - GitHub Blog & Changelog feeds
  - GitHub Status API (githubstatus.com/api/v2/incidents.json)

**Deployment Environment:**
- **Hardware:** Raspberry Pi 3B (1GB RAM, quad-core ARM)
- **OS:** Raspberry Pi OS Lite (64-bit)
- **Browser:** Chromium 84 (kiosk mode, fullscreen)
- **Web Server:** Python 3 http.server (port 8000)
- **File Transfer:** Git-based auto-pull on Pi restart (no manual SCP)

**Build & Deployment Workflow:**
- **Development:** Vite dev server (localhost:5173) with hot module replacement
- **Build:** `npm run build` produces single `index.html` in project root
- **Deployment:** Commit built artifact + source to git, Pi auto-pulls
- **Build Output:** Single HTML file with inlined CSS/JS (no external dependencies on Pi)

**Critical Version Constraints:**
- **Chromium 84** on Pi 3B - Requires `-webkit` prefixes for CSS features like line-clamp
- **ES2020 feature support** - Optional chaining and nullish coalescing available
- **No cutting-edge features** - Avoid Stage 3 proposals or features newer than ES2020
- **Vite output** - MUST produce single `index.html` (Pi expects this entry point)
- **Tree-shaking enabled** - Minimize bundle size for Pi 3B performance constraints

**CSS & JavaScript Compatibility:**
- **CSS:** Modern features (Grid, Flexbox, Custom Properties), -webkit prefixes mandatory for Chromium 84
- **JavaScript:** ES6+ supported (async/await, template literals, Promises, arrow functions, classes)
- **Performance:** Pi 3B limitations - avoid heavy animations, complex box-shadows, large libraries
- **Module system:** ES modules with import/export, no CommonJS, no require()

**Development vs Production Split:**
- **Dev machine:** Node.js + npm + Vite dev server for development
- **Pi deployment:** Zero Node.js, serves built `index.html` via Python http.server
- **Build artifact committed** - Both source (`/src/`) and built file (`index.html`) in repo
- **No build on Pi** - All compilation happens on dev machine before deployment

## Critical Implementation Rules

### Language-Specific Rules (JavaScript/ES Modules)

**Multi-File Architecture (CURRENT):**
- **Source structure:** `/src/js/` for JavaScript modules, `/src/css/` for stylesheets
- **Build output:** Single `index.html` with inlined CSS/JS in project root
- **Component separation:** carousel-controller.js, item-highlighter.js, detail-panel.js, api-client.js, utils.js

**ES Module Patterns (MANDATORY):**

**Import/Export Syntax:**
```javascript
// ALWAYS use named exports for classes and functions
export class CarouselController { }
export function fetchBlogData() { }
export const RSS2JSON_API = 'https://api.rss2json.com/v1/api.json';

// Import with explicit .js extension (required for ES modules)
import { CarouselController } from './carousel-controller.js';
import { formatDate, stripHtml, truncate } from './utils.js';
```

**Component Class Structure:**
- ALWAYS use class syntax for stateful components (CarouselController, ItemHighlighter, DetailPanel)
- Constructor accepts configuration object: `constructor({ interval = 30000 } = {})`
- State stored as class properties: `this.currentPage`, `this.timer`, `this.interval`
- Public methods for control: `start()`, `stop()`, `reset()`, `rotatePage()`
- Callback properties for communication: `this.onPageChange`, `this.onItemChange`
```javascript
export class CarouselController {
  constructor({ interval = 30000, pages = ['blog', 'changelog', 'status'] } = {}) {
    this.interval = interval;
    this.pages = pages;
    this.currentPage = 0;
    this.timer = null;
    this.onPageChange = null; // Callback for page transitions
  }
  
  start() {
    this.timer = setInterval(() => this.rotatePage(), this.interval);
  }
  
  stop() {
    if (this.timer) clearInterval(this.timer);
  }
}
```

**State Management Pattern:**
- Manual state tracking with `setInterval()` timers - NO external libraries
- Component coordination via direct function callbacks (no event bus)
- Timer cleanup mandatory in stop() methods: `if (this.timer) clearInterval(this.timer)`
- State persistence across API refresh cycles (timers independent of data fetches)
- Reset child timers on parent events: `carousel.onPageChange = () => itemHighlighter.reset()`

**API Client Pattern (In-Memory Cache):**
```javascript
// src/js/api-client.js
const cache = {
  blog: { data: null, timestamp: 0 },
  changelog: { data: null, timestamp: 0 },
  status: { data: null, timestamp: 0 }
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function fetchBlog(forceRefresh = false) {
  const now = Date.now();
  
  // Check cache validity
  if (!forceRefresh && cache.blog.data && 
      now - cache.blog.timestamp < CACHE_DURATION) {
    return cache.blog.data;
  }
  
  try {
    const response = await fetch(blogUrl);
    const data = await response.json();
    cache.blog = { data, timestamp: now };
    return data;
  } catch (error) {
    // Return stale cache during network errors (graceful degradation)
    if (cache.blog.data) return cache.blog.data;
    throw error;
  }
}
```

**Retry Logic with Exponential Backoff:**
- 3 retry attempts with delays: 1s, 2s, 4s
- Return stale cached data if all retries fail
- Log errors to console but don't break the UI

**Utility Functions - MUST PRESERVE IN utils.js:**
- `formatDate(dateString)` - Converts ISO dates to relative time ("2 hours ago")
- `stripHtml(html)` - Removes HTML tags using DOM parsing (safe for RSS content)
- `truncate(text, maxLength)` - Hard character truncation with ellipsis
- Export from `src/js/utils.js`, import where needed

**Template Literal HTML Generation:**
```javascript
// ALWAYS use this pattern - innerHTML with template literals
container.innerHTML = data.items.slice(0, 8).map(item => `
    <div class="item blog-item">
        <div class="item-title">
            <a href="${item.link}" target="_blank">${item.title}</a>
        </div>
    </div>
`).join('');
```

**Async/Await Error Handling:**
- Every async function MUST have try/catch with fallback UI
- Per-column error isolation: one API failure doesn't break others
```javascript
async function fetchData() {
    try {
        // API call logic
    } catch (error) {
        console.error('Error:', error);
        container.innerHTML = `<div class="error">Error loading content</div>`;
    }
}
```

**CSS Module Organization:**

**File Structure:**
- `src/css/main.css` - GitHub Primer tokens, CSS custom properties
- `src/css/layout.css` - Grid, flexbox, split-view layouts
- `src/css/carousel.css` - Page transition styles, fade effects
- `src/css/components.css` - Item cards, detail panel, progress bar

**Class Composition Pattern:**
```css
/* Base class for animations and common properties */
.item { /* shared properties */ }

/* Specific classes ADD to base, never replace */
.blog-item { /* blog-specific styling */ }
.changelog-item { /* changelog-specific styling */ }
.status-card { /* status-specific styling */ }
```

**Chromium 84 CSS Compatibility (Pi 3B constraint):**
- **ALWAYS use -webkit prefixes** for:
  - `-webkit-line-clamp` for text truncation
  - `-webkit-box-orient` with display: -webkit-box
- **Avoid:** Complex box-shadows (Pi 3B performance)
- **Prefer:** Simple borders, background colors, opacity-based effects

**API Integration Pattern:**
- **RSS2JSON API:** `${RSS2JSON_API}?rss_url=${encodeURIComponent(RSS_URL)}`
- **Always encode:** Use `encodeURIComponent()` for URL parameters
- **Response validation:** Check `data.status === 'ok'` before processing items
- **Parallel fetching:** Use `Promise.all()` for simultaneous API calls

**Performance Rules for Pi 3B:**
- Item limits: Slice to 7-8 items max per page (fits screen without scroll)
- Animations: CSS transitions only (opacity, background), avoid transforms
- DOM updates: Batch with innerHTML rather than createElement loops
- Timer precision: setInterval sufficient (drift negligible over 24 hours)
- Memory cleanup: Clear intervals, remove event listeners to prevent leaks

**Anti-Patterns to AVOID:**
- ❌ Don't use `var` - always `const` or `let`
- ❌ Don't use CommonJS (`require`) - ES modules only
- ❌ Don't create deep inheritance hierarchies - keep classes flat
- ❌ Don't use arrow functions for class methods if `this` binding needed
- ❌ Don't forget timer cleanup - memory leaks kill 24/7 kiosk
- ❌ Don't add heavy libraries (lodash, moment.js) - use native JS
- ❌ Don't use array methods in hot loops on Pi - use for loops for performance

### Component Architecture & Communication Patterns

**Component-Based Structure (NEW):**
- One class per file - separate concerns, easier testing
- Direct callback communication - no event bus, no pub/sub
- Independent timers with explicit coordination
- Clear lifecycle: constructor → start() → stop() → reset()

**Component File Organization (MANDATORY):**
- `src/js/carousel-controller.js` - Page rotation logic (30s timer)
- `src/js/item-highlighter.js` - Item-level highlighting (8s timer)
- `src/js/detail-panel.js` - Detail view rendering (reactive, no timer)
- `src/js/api-client.js` - Data fetching with caching (5min refresh)
- `src/js/progress-indicator.js` - Rotation progress bar (1s updates)
- `src/js/persistent-alert.js` - Cross-page outage indicator
- `src/js/utils.js` - Shared utilities (formatDate, stripHtml, truncate)
- `src/js/main.js` - Application entry point, component wiring

**Component Communication Pattern:**
```javascript
// src/js/main.js - Direct callback wiring (explicit, traceable)
const carousel = new CarouselController({ interval: 30000 });
const highlighter = new ItemHighlighter({ interval: 8000 });
const detailPanel = new DetailPanel();

// Wire up callbacks for component coordination
carousel.onPageChange = (page) => {
  highlighter.reset();           // Stop item timer, reset to index 0
  const itemCount = getItemCountForPage(page);
  highlighter.start(itemCount);  // Start fresh item timer
  detailPanel.clear();           // Clear detail panel for new page
};

highlighter.onItemChange = (item) => {
  detailPanel.render(item);      // Update detail view with highlighted item
};
```

**Why Direct Callbacks (NO event system):**
- Explicit data flow - easy to trace in debugger
- Clear stack traces - no hidden coupling through events
- Performance - fewer abstractions on Pi 3B
- Simplicity - matches vanilla JS philosophy

**Timer Coordination Rules (CRITICAL):**
- Page timer: 30-second intervals (CarouselController)
- Item timer: 8-second intervals (ItemHighlighter)
- **Page change MUST trigger item timer reset** - prevents state desync
- Timers persist across 5-minute API refresh cycles (independent of data fetches)
- Manual cleanup required: stop() methods MUST call clearInterval()
- No timer drift tolerance needed - 24 hour drift is negligible for kiosk

**Component Lifecycle Pattern:**
```javascript
export class ComponentExample {
  constructor({ interval = 30000 } = {}) {
    // Configuration only - DON'T start timers here
    this.interval = interval;
    this.timer = null;
    this.currentIndex = 0;
    this.onStateChange = null; // Callback property
  }
  
  start() {
    // Begin active operation
    this.timer = setInterval(() => this.tick(), this.interval);
  }
  
  stop() {
    // Pause without destroying state
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
  
  reset() {
    // Stop and return to initial state
    this.stop();
    this.currentIndex = 0;
  }
  
  tick() {
    // Timer callback - update state, notify listeners
    this.currentIndex = (this.currentIndex + 1) % this.maxIndex;
    if (this.onStateChange) {
      this.onStateChange(this.currentIndex);
    }
  }
}
```

**Component Responsibilities:**

**CarouselController (Page Rotation):**
- Manages page rotation state: `this.currentPage` (0-2 for Blog/Changelog/Status)
- 30-second timer for page transitions
- Triggers CSS fade transitions (opacity 0 → 1)
- Notifies ItemHighlighter via `this.onPageChange(page)` callback
- NO direct DOM manipulation - delegates to main.js

**ItemHighlighter (Item Focus):**
- Manages item highlight state: `this.currentItem` (0 to itemCount-1)
- 8-second timer for item rotation
- Updates CSS classes: adds `.item--highlighted`, removes from previous
- Notifies DetailPanel via `this.onItemChange(item)` callback
- Resets when page changes (triggered by CarouselController)

**DetailPanel (Content Display):**
- Reactive component - NO internal timers
- Renders featured item content in right panel (65% width)
- Handles content formatting: title, date, description with stripHtml()
- Driven entirely by ItemHighlighter callbacks
- `render(item)` method updates DOM with new content
- `clear()` method removes content during page transitions

**APIClient (Data Layer):**
- In-memory cache with 5-minute expiration
- Parallel fetching: `Promise.all([fetchBlog(), fetchChangelog(), fetchStatus()])`
- Retry logic: 3 attempts with exponential backoff (1s, 2s, 4s)
- Graceful degradation: returns stale cache during network errors
- NO timers - called by application refresh cycle

**ProgressIndicator (Visual Feedback):**
- Dual-purpose: page rotation progress + data refresh status
- 1-second timer updates progress bar width
- Resets on page change (full cycle = 30 seconds)
- Optional: show "refreshing" state during API calls

**PersistentAlert (Critical Status):**
- Cross-page visibility for active GitHub outages
- Checks status incidents for severity: major/critical
- Displays banner above carousel (persistent, not page-specific)
- Updates when status data refreshes (5-minute cycle)

**Component Anti-Patterns (AVOID):**
- ❌ Don't create shared mutable state between components
- ❌ Don't use global variables for communication
- ❌ Don't create circular dependencies between modules
- ❌ Don't mix concerns (API logic in UI components, UI logic in API client)
- ❌ Don't forget to wire up callbacks in main.js initialization
- ❌ Don't start timers in constructors - use explicit start() methods
- ❌ Don't forget cleanup - memory leaks will crash 24/7 kiosk

### Code Quality & Style Rules

**GitHub Primer Design System (NON-NEGOTIABLE):**
- ALWAYS match GitHub UI/UX exactly - dashboard represents GitHub platform
- GitHub Primer is the authoritative source for ALL visual decisions
- Authenticity over creativity - copy GitHub's actual patterns
- When in doubt, inspect GitHub.com and replicate their implementation

**Color Palette (EXACT VALUES REQUIRED):**
```css
/* src/css/main.css - CSS Custom Properties */
:root {
  --color-canvas-default: #0d1117;      /* Background */
  --color-fg-default: #c9d1d9;          /* Primary text */
  --color-fg-muted: #7d8590;            /* Secondary text */
  --color-border-default: #21262d;      /* Borders/dividers */
  --color-accent-fg: #58a6ff;           /* Links */
  --color-accent-emphasis: #1f6feb;     /* Link hover */
  --color-success-emphasis: #2da44e;    /* Status: operational */
  --color-attention-emphasis: #bf8700;  /* Status: warning */
  --color-danger-emphasis: #cf222e;     /* Status: major/critical */
  --color-done-emphasis: #8250df;       /* Features/highlights */
  --color-canvas-subtle: #161b22;       /* Highlighted backgrounds */
}
```

**Typography (GitHub System Fonts):**
- Font Stack: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif` (GitHub's exact stack)
- Font Weights: 400 (normal), 600 (semibold) - match GitHub exactly, no custom weights
- Letter Spacing: `1px` for uppercase headers (GitHub pattern)
- Line Heights: 1.3-1.5 for TV viewing distance readability
- Font Sizes: 16px minimum for readability from 10-15 feet

**Layout & Spacing (GitHub Primer Scale):**
- Grid gaps: 24px (standard), 32px (between major sections)
- Padding: 20px (body), 24px (sections), 16px (items)
- Border radius: 4px or 6px (subtle, matching GitHub's rounded corners)
- Border width: 1px (standard), 2px (emphasis only)

**CSS File Organization (MANDATORY):**
- `src/css/main.css` - CSS custom properties, reset, global styles, font stack
- `src/css/layout.css` - Grid layouts, flexbox, split-view (35% list / 65% detail)
- `src/css/carousel.css` - Page transitions, fade effects, timing functions
- `src/css/components.css` - Item cards, detail panel, progress bar, alert banners

**Class Naming Conventions:**
```css
/* BEM-inspired with GitHub flavor */
.page { }                    /* Block - top-level component */
.page--active { }            /* Modifier - state or variant */
.page__header { }            /* Element - child of block */

.item { }                    /* Base component class */
.item--highlighted { }       /* State modifier */
.blog-item { }              /* Context-specific variant (extends .item) */
.detail-panel__content { }  /* Nested element */
```

**Transition & Animation Rules:**

**CSS Transitions Only (PREFERRED for Pi 3B):**
```css
/* src/css/carousel.css - Page fade transitions */
.page {
  opacity: 0;
  transition: opacity 300ms ease;
  display: none;
}

.page--active {
  opacity: 1;
  display: block;
}

/* src/css/components.css - Item highlighting */
.item {
  background: var(--color-canvas-default);
  transition: background 200ms ease, font-weight 200ms ease;
}

.item--highlighted {
  background: var(--color-canvas-subtle);
  font-weight: 600;
}
```

**Animation Timing Standards:**
- Page transitions: 300-500ms (smooth but not sluggish)
- Item highlights: 200ms (snappy feedback)
- Progress bar: 1s linear updates (smooth continuous motion)
- All transitions: `ease` or `ease-in-out` (GitHub standard, no custom curves)

**Performance on Pi 3B (CRITICAL):**
- ONLY animate: opacity, background-color, font-weight (GPU-accelerated)
- NEVER animate: transforms, box-shadows, filters (CPU-bound, expensive)
- Target: 30+ FPS on Pi 3B hardware
- Test animations on actual Pi before finalizing

**Naming Conventions:**

**Files:**
- JavaScript: kebab-case (`carousel-controller.js`, `api-client.js`, `utils.js`)
- CSS: kebab-case (`main.css`, `layout.css`, `carousel.css`, `components.css`)
- HTML: `index.html` (entry point for Pi, non-negotiable)

**JavaScript:**
- Classes: PascalCase (`CarouselController`, `ItemHighlighter`, `DetailPanel`)
- Variables: camelCase (`currentPage`, `itemCount`, `lastUpdated`)
- Constants: UPPER_SNAKE_CASE (`RSS2JSON_API`, `CACHE_DURATION`, `REFRESH_INTERVAL`)
- Functions: camelCase verbs (`fetchBlog`, `formatDate`, `startTimer`, `rotatePage`)
- Private by convention: underscore prefix `_privateMethod()` (not enforced, documentation only)

**CSS:**
- Classes: kebab-case (`.blog-item`, `.detail-panel`, `.item--highlighted`)
- IDs: kebab-case (`#blog-content`, `#refresh-progress`, `#persistent-alert`)
- Custom properties: --kebab-case (`--color-fg-default`, `--transition-duration`)

**Comment Patterns:**

**JavaScript:**
```javascript
// Section header for major functional blocks
// ============================================

// Brief inline explanation for non-obvious logic
const timeout = retryCount * 1000; // Exponential backoff: 1s, 2s, 4s

// Document Pi-specific constraints
items.slice(0, 8); // Pi 3B: Limit to 8 items for screen size + performance

/**
 * Multi-line explanation for complex logic (if needed)
 * Explain WHY, not WHAT (code shows what)
 */
```

**CSS:**
```css
/* ============================================
   Section: Page Transitions
   ============================================ */

/* Chromium 84 compatibility - required -webkit prefix */
-webkit-line-clamp: 3;
-webkit-box-orient: vertical;

/* Pi 3B performance: opacity is GPU-accelerated */
transition: opacity 300ms ease;
```

**Anti-Patterns for Style (AVOID):**
- ❌ Don't deviate from GitHub Primer colors - exact hex values required
- ❌ Don't add custom fonts or font weights not used by GitHub
- ❌ Don't use emojis in production UI (acceptable in comments/docs only)
- ❌ Don't create flashy animations - GitHub is minimal and clean
- ❌ Don't use box-shadows with blur - Pi 3B performance killer
- ❌ Don't add external CSS frameworks (Bootstrap, Tailwind) - conflicts with Primer
- ❌ Don't use inline styles - all styling in CSS files
- ❌ Don't use !important unless absolutely necessary (code smell)

### Deployment & Workflow Rules

**Development Workflow (UPDATED):**

**Daily Development Process:**
```bash
# Start Vite dev server with hot module replacement
npm run dev              # Runs on localhost:5173

# Make changes in /src directory
# Browser auto-updates with HMR (Hot Module Replacement)

# Build for deployment (produces index.html in project root)
npm run build

# Optional: Test built artifact locally
python3 -m http.server 8000  # Verify production build works
```

**Vite Build Configuration:**
- Output: Single `index.html` file in project root (Pi entry point)
- CSS/JS inlined: No external file dependencies on Pi
- Tree-shaking: Dead code eliminated automatically
- Minification: Production build minified for performance
- Source maps: Generated for debugging (not deployed to Pi)

**Git-Based Deployment (UPDATED - No Manual SCP):**

**Deployment Process:**
```bash
# 1. Build on dev machine
npm run build

# 2. Stage both source and artifact
git add src/ index.html vite.config.js package.json

# 3. Commit with descriptive message (Conventional Commits)
git commit -m "feat: Add carousel page rotation"
git commit -m "fix: Correct timer cleanup memory leak"
git commit -m "chore: Update dependencies"

# 4. Push to GitHub
git push origin main

# 5. Pi auto-pulls on restart
# Script: /home/pi/update-dashboard.sh runs on boot
# OR manually trigger: ssh pi@github-dashboard.local "cd ~/dashboard && git pull"
```

**Critical Deployment Rules:**
- ALWAYS commit built `index.html` with source changes (Pi needs artifact)
- NEVER push without building first - broken builds break Pi display
- Test build locally before pushing (verify no build errors or console errors)
- Pi expects `index.html` at repo root - don't move or rename it
- Commit both `/src/` source AND `index.html` artifact in same commit

**Raspberry Pi Configuration:**

**File Locations on Pi:**
- Dashboard files: `/home/pi/dashboard/` (git repo checkout)
- Entry point: `/home/pi/dashboard/index.html` (served by Python http.server)
- Update script: `/home/pi/update-dashboard.sh` (runs on boot via systemd)
- Kiosk script: `/home/pi/start-kiosk.sh` (launches Chromium)
- No npm/Node.js on Pi - Pi serves built artifact only

**Systemd Services (DO NOT MODIFY without Pi testing):**
- `dashboard-server.service` - Python http.server, port 8000, auto-starts on boot, depends on network
- `kiosk.service` - Chromium kiosk mode, auto-starts after dashboard-server, depends on X11
- Restart commands:
  - Dashboard server only: `sudo systemctl restart dashboard-server.service`
  - Browser only: `sudo systemctl restart kiosk.service`
  - Both: `sudo systemctl restart dashboard-server kiosk`
  - View logs: `journalctl -u dashboard-server.service -f`

**Update Script (Auto-runs on boot):**
```bash
# /home/pi/update-dashboard.sh
cd /home/pi/dashboard
git fetch origin
git reset --hard origin/main  # Force to match remote (discards any local changes)
# No npm install, no build - serves checked-out index.html artifact
```

**Pi-Specific Constraints:**
- No npm/Node.js on Pi - Build happens on dev machine ONLY
- No write access needed - Dashboard is read-only (no form submissions, no persistence)
- Limited CPU/RAM - Avoid resource-intensive processes on Pi itself
- 24/7 uptime expected - Services configured with `Restart=on-failure`
- WiFi connection - Dashboard continues serving cached content during short outages

**Testing Strategy:**

**Local Testing (Dev Machine):**
1. **Dev server testing:** `npm run dev` - Verify functionality with hot reload at http://localhost:5173
2. **Build testing:** `npm run build` - Check for build errors in terminal output
3. **Artifact testing:** Serve built `index.html` locally with Python http.server, verify no console errors
4. **Browser console:** Check for JavaScript errors, API failures, network issues
5. **Responsive testing:** Not needed (fixed 1920x1080 display), but verify at that resolution

**Pi Testing (Actual Hardware - CRITICAL):**
1. Deploy to Pi and view on TV display (actual production environment)
2. **Distance test:** View from 10-15 feet away (typical TV viewing distance for office)
3. **24-hour soak test:** Leave running overnight, check for memory leaks or performance degradation
4. **Network failure test:** Disconnect WiFi, verify graceful degradation with cached content
5. **API failure test:** Mock API failures, ensure per-column isolation works
6. **Recovery test:** Power cycle Pi, verify services auto-restart correctly

**Version Control:**

**Git Workflow:**
- Main branch: `main` (production branch, deployed to Pi)
- No feature branches currently (small team, direct commits acceptable)
- Commit messages: Conventional Commits format (`feat:`, `fix:`, `chore:`, `docs:`)
- Remote: `github.com/scwardbulldog/github-latest-dashboard`

**What to Commit:**
- ✅ Source files: `/src/**/*` (JavaScript modules, CSS files)
- ✅ Built artifact: `index.html` (production-ready, inlined CSS/JS)
- ✅ Config files: `vite.config.js`, `package.json`, `package-lock.json`
- ✅ Documentation: `README.md`, `/docs/**/*`, `/issues/**/*`
- ✅ Deployment scripts: `/deploy/**/*`
- ✅ BMAD artifacts: `/_bmad-output/**/*`, `/_bmad/**/*`
- ❌ Dependencies: `node_modules/` (in .gitignore)
- ❌ Build cache: `.vite/`, `dist/` or other temp build directories
- ❌ IDE files: `.vscode/`, `.idea/` (unless project-specific settings)
- ❌ OS files: `.DS_Store`, `Thumbs.db`

**Deployment Checklist for AI Agents:**

**Before Pushing to GitHub:**
1. ✅ Run `npm run build` successfully (watch for build errors)
2. ✅ Test built `index.html` locally (no console errors in browser DevTools)
3. ✅ Verify GitHub Primer colors match design spec (exact hex values)
4. ✅ Check Chromium 84 compatibility (required -webkit prefixes present)
5. ✅ Test error states (mock API failures, network issues, empty data)
6. ✅ Verify timer cleanup (no memory leaks - check performance tab after 10+ minute run)
7. ✅ Commit both source and artifact: `git add src/ index.html`
8. ✅ Write descriptive commit message: `git commit -m "feat: X"`
9. ✅ Push to main branch: `git push origin main`

**After Pi Auto-Update (Verify Deployment):**
10. ✅ SSH to Pi or view TV to verify display works correctly
11. ✅ Check browser console for errors (if accessible via remote debugging)
12. ✅ Verify data refreshes properly (wait 5 minutes for API cycle, check timestamp updates)
13. ✅ Test transitions (if carousel: wait 30s for page rotation, 8s for item highlighting)

**Development Environment:**

**Required on Dev Machine:**
- Node.js (v16+ recommended for Vite compatibility)
- npm (comes with Node.js, v7+ recommended)
- Git (version control)
- Code editor (VS Code recommended with ESLint extension)
- Modern browser (Chrome/Edge for DevTools, Chromium 84+ to match Pi)

**NOT Required on Pi:**
- ❌ No Node.js/npm on Pi (build happens on dev machine)
- ❌ No build tools on Pi (serves pre-built artifact)
- ❌ No git commits from Pi (Pi pulls only, never pushes)
- ❌ No development dependencies (only Python http.server needed)

**Documentation Requirements:**
- **README.md:** Keep updated with build instructions and deployment process
- **docs/raspberry-pi-setup.md:** Comprehensive Pi setup guide (DO NOT MODIFY unless deployment changes)
- **Tech specs:** Document in `_bmad-output/implementation-artifacts/` for complex features
- **PRD reference:** `_bmad-output/planning-artifacts/prd.md` for feature requirements

**Deployment Anti-Patterns (AVOID):**
- ❌ Don't push without building first (broken builds break Pi)
- ❌ Don't modify systemd services without Pi testing (can break auto-start)
- ❌ Don't require npm on Pi (breaks deployment model, Pi only runs artifact)
- ❌ Don't rename `index.html` output (Pi expects this exact filename)
- ❌ Don't add external file dependencies (CSS/JS must be inlined by Vite)
- ❌ Don't commit `node_modules/` (wasteful, should be in .gitignore)
- ❌ Don't skip local testing before deploying (wastes Pi deployment cycles)
- ❌ Don't forget to commit both source and artifact together (keeps repo in sync)

## Critical Don't-Miss Rules

**Anti-Patterns to AVOID (UPDATED):**

**❌ NEVER break the GitHub aesthetic:**
- Don't use colors outside GitHub Primer palette (exact hex values required)
- Don't add custom fonts or font weights GitHub doesn't use
- Don't create UI patterns that don't exist on GitHub.com
- Don't use emojis in production UI (acceptable in comments only)

**❌ NEVER ignore Pi 3B performance constraints:**
- Don't add lodash, moment.js, or other heavy libraries (use native JS)
- Don't use complex CSS animations (transforms, 3D effects, particles - CPU killers)
- Don't add box-shadows with blur (use simple borders instead)
- Don't create deep DOM trees (keep structure flat for rendering speed)
- Don't load large images or media files (bandwidth + memory constraints)

**❌ NEVER break the kiosk deployment:**
- Don't rename `index.html` output (Pi expects this exact filename)
- Don't add external file dependencies (CSS/JS must be inlined by Vite)
- Don't require npm/Node.js on the Pi itself (build on dev machine only)
- Don't modify systemd services without testing on actual Pi hardware
- Don't add features requiring user input (dashboard is display-only)
- Don't push without building first (broken builds break Pi display)

**❌ NEVER break timer coordination (NEW - CAROUSEL CRITICAL):**
- Don't start timers in constructors (use explicit start() methods)
- Don't forget to reset item timer when page changes (causes state desync)
- Don't forget clearInterval() in stop() methods (memory leaks)
- Don't create timer conflicts (page and item timers must coordinate via callbacks)
- Don't block timer callbacks with heavy operations (keeps UI responsive)

**❌ NEVER skip error handling:**
- Don't call APIs without try/catch blocks
- Don't update DOM without checking element exists
- Don't assume API responses have expected structure (always validate)
- Don't let errors break entire dashboard (per-column isolation required)
- Don't fail to return stale cached data during network outages

**❌ NEVER create bad module patterns (NEW - ES MODULES):**
- Don't use CommonJS require() (ES modules only)
- Don't create circular dependencies between modules
- Don't forget .js extension in import paths (required for ES modules)
- Don't export default unless single export (prefer named exports)
- Don't mix concerns (API logic in UI components, UI in API client)

### Edge Cases That MUST Be Handled

**API Failure Scenarios:**
```javascript
// ALWAYS handle these cases:
// 1. Network timeout/offline - return stale cache
// 2. API returns non-200 status - retry with backoff
// 3. API returns malformed JSON - catch parse error
// 4. API returns empty items array - show "No data" message
// 5. RSS2JSON service down (data.status !== 'ok') - fallback
// 6. CORS errors - log and show user-friendly error

// Complete pattern with all edge cases:
try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    
    if (data.status !== 'ok' || !data.items || data.items.length === 0) {
        return fallbackToCache() || showNoDataMessage();
    }
    return data;
} catch (error) {
    console.error('API Error:', error);
    return cache.data || showErrorMessage();
}
```

**Timer Edge Cases (NEW - CAROUSEL SPECIFIC):**
- Page transition during item highlight - item timer MUST reset
- API refresh during rotation - timers MUST continue uninterrupted
- Component unmount/remount - timers MUST be cleaned up properly
- Browser tab hidden/visible - timers continue (Pi doesn't hide tabs in kiosk mode)
- Multiple start() calls - prevent by checking `if (this.timer)` before creating new interval

**Data Quality Issues:**
- Missing titles: RSS feeds sometimes have empty title fields - show "Untitled"
- Missing dates: pubDate can be null or malformed - show "Date unknown"
- HTML in content: Always use `stripHtml()` before displaying descriptions
- Very long titles: GitHub changelog titles can exceed 200 characters - use truncate()
- Special characters: Properly handled by template literals (auto-escaped)
- Broken links: href values should be validated or wrapped in try/catch

**Build System Edge Cases (NEW - VITE):**
- Build fails: Don't push - fix errors first, test build locally
- Vite config changes: Test build output before committing
- Missing imports: Build will fail - Vite shows clear error messages
- CSS not inlined: Check Vite config, ensure single output file
- Source maps in production: Not a problem, but can be excluded if desired

**Display/Rendering Edge Cases:**
- TV viewing distance: Text must be readable from 10-15 feet away (16px minimum font size)
- Screen blanking: Handled by kiosk start script (`xset s off`, `xset -dpms`)
- Refresh during display: 5-minute auto-refresh should be smooth (no flicker)
- Resolution mismatches: Dashboard targets 1920x1080 fixed (no responsive design needed)

**Pi-Specific Gotchas:**
- WiFi connection loss: Dashboard serves cached content, shows stale data warning
- SD card corruption: Minimize writes (logs rotated, no file writes from dashboard)
- Thermal throttling: Pi 3B throttles at 80°C - avoid CPU-intensive operations
- Power interruptions: Services auto-restart on boot via systemd
- Memory leaks: Critical for 24/7 operation - always clean up timers and listeners

**Browser-Specific Issues (Chromium 84):**
- `-webkit-line-clamp`: Requires `-webkit-box-orient: vertical` and `display: -webkit-box`
- ES modules: Fully supported in Chromium 84
- Optional chaining `?.`: Supported in Chromium 84
- Nullish coalescing `??`: Supported in Chromium 84
- Private class fields `#field`: NOT supported in Chromium 84 - use convention with underscore

**Security Considerations:**
- Using `.innerHTML` with trusted API data: SAFE (GitHub RSS feeds, Status API)
- No user input fields: SAFE (display-only dashboard)
- No cookies, localStorage, sessions: SAFE (stateless, cache in memory only)
- No sensitive data: SAFE (public GitHub data only)
- API keys: NOT NEEDED (all APIs are public, no authentication required)

**Performance Optimization Must-Dos:**
- Limit items to 7-8 per page (fits screen, reduces DOM size)
- Use `Promise.all()` for parallel API calls (faster than sequential)
- Batch DOM updates with `.innerHTML` (faster than createElement loops)
- CSS transitions over JS animations (GPU-accelerated on Pi)
- 5-minute refresh interval (balances freshness vs. API load)

### Critical "Must Remember" Rules

1. **Build before push:** `npm run build` THEN `git push` - never skip the build step
2. **Preserve utility functions:** Always reuse formatDate(), stripHtml(), truncate() from utils.js
3. **Test on actual TV:** Desktop browser testing insufficient - verify at viewing distance on Pi
4. **Match GitHub exactly:** When in doubt, inspect GitHub.com and copy their approach
5. **Timer cleanup:** Memory leaks will crash 24/7 kiosk - always clearInterval() in stop()
6. **Chromium 84 compatibility:** Check caniuse.com for Chromium 84 support before using features
7. **Component wiring:** Wire callbacks in main.js - don't forget onPageChange, onItemChange
8. **Cache fallbacks:** Return stale cache during errors - something is better than nothing
9. **ES module extensions:** Always include .js extension in import paths
10. **Item timer reset:** When page changes, item timer MUST reset - critical for carousel sync

---

## Usage Guidelines

**For AI Agents:**

- Read this file BEFORE implementing any code in this project
- Follow ALL rules exactly as documented - these prevent known issues
- When in doubt, prefer the more restrictive option for Pi 3B constraints
- Always match GitHub Primer design system colors and patterns exactly
- Test on Pi 3B hardware constraints (simulate if actual Pi unavailable)
- Update this file if new critical patterns emerge during implementation

**For Humans:**

- Keep this file lean and focused on agent needs (avoid obvious rules)
- Update when technology stack changes (e.g., new dependencies, build tools)
- Review when deployment process evolves
- Remove rules that become obvious or outdated over time
- Reference when onboarding new AI agents to the project
- Use as checklist during code reviews

**Document Maintenance:**

- Last updated: 2026-03-02
- Major changes: Multi-file architecture with Vite, ES modules, carousel components
- Next review: When carousel implementation complete and stabilized
- Update trigger: New architectural patterns, performance issues, or Pi deployment changes

**Related Documentation:**
- [prd.md](_bmad-output/planning-artifacts/prd.md) - Product requirements and features
- [architecture.md](_bmad-output/planning-artifacts/architecture.md) - Architecture decisions and component design
- [ux-design-specification.md](_bmad-output/planning-artifacts/ux-design-specification.md) - Design system and UX patterns
- [raspberry-pi-setup.md](docs/raspberry-pi-setup.md) - Comprehensive Pi configuration guide
- [README.md](README.md) - Project overview and quick start
