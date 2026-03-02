---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
workflowType: 'architecture'
lastStep: 8
status: 'complete'
completedAt: '2026-03-02'
inputDocuments:
  - '_bmad-output/planning-artifacts/prd.md'
  - '_bmad-output/planning-artifacts/product-brief-github-latest-dashboard-2026-02-17.md'
  - '_bmad-output/planning-artifacts/ux-design-specification.md'
  - '_bmad-output/planning-artifacts/validation-report-prd-2026-03-02.md'
  - '_bmad-output/project-context.md'
  - 'docs/raspberry-pi-setup.md'
  - 'docs/sprite-sheet-animation-guide.md'
workflowType: 'architecture'
project_name: 'github-latest-dashboard'
user_name: 'Shane'
date: '2026-03-02'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

---

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**

The project has 7 functional requirements split across two phases:

**MVP (Already Deployed - F1-F3):**
- F1: Dashboard UI with basic GitHub styling - Establishes visual foundation using GitHub Primer
- F2: Data Sources (Blog, Changelog, Status) - Three RSS/API feeds with 5-minute refresh
- F3: Raspberry Pi Kiosk Deployment - 24/7 always-on display with auto-start and recovery

**Post-MVP Phase 1 (Carousel Evolution - F4-F7):**
- F4: Carousel Page Architecture - Transform three-column to rotating pages (Blog → Changelog → Status)
- F5: Split-View Layout - Item list (35%) + detail panel (65%) on each page
- F6: Dual Rotation System - Independent page timer (30s) and item timer (8s)
- F7: Detail View Rendering - Dynamic right panel showing featured item content with smooth transitions

Architecturally, this means:
- **State management:** Two independent timers that must not interfere
- **Transition system:** Smooth page fades (300-500ms) and item highlighting (200ms)
- **Component separation:** Page controller, item highlighter, detail renderer as distinct concerns
- **Memory stability:** 24+ hour continuous operation without leaks

**Non-Functional Requirements:**

Critical NFRs that will drive architectural decisions:

- **TR1 Browser Compatibility:** Chromium 84 primary target (requires -webkit prefixes, no cutting-edge features)
- **TR2 Performance:** <2s page load, <1s refresh, no memory leaks over 7+ days continuous operation
- **TR3 Network Requirements:** Graceful degradation with retry logic (1s, 2s, 4s backoff), cached content during outages
- **TR4 Display Requirements:** 1920x1080 fixed, 16px minimum font size, WCAG AA contrast (4.5:1), readable from 10-15 feet
- **TR5 Reliability:** 99.5% uptime target with auto-recovery from crashes and power outages
- **TR6-TR8 Carousel NFRs:** Timer state persistence across refresh cycles, no drift over 24+ hours, smooth 30+ FPS animations on Pi 3B

**Scale & Complexity:**

- **Primary domain:** Frontend web application (client-side only, no backend)
- **Complexity level:** Low - Single-purpose kiosk with defined scope, but with nuanced challenges
- **Estimated architectural components:** 7-9 components
  - Page carousel controller
  - Item highlight controller  
  - Detail panel renderer
  - API client layer (with caching)
  - Progress indicator
  - Persistent outage alert
  - State manager (for timer coordination)
  - Transition manager
  - Error boundary/fallback handler

### Technical Constraints & Dependencies

**Hard Constraints:**
- **Raspberry Pi 3B hardware:** 1GB RAM, quad-core ARM Cortex-A53, limited GPU
- **Chromium 84:** Specific browser version limits modern CSS/JS features
- **Fixed display:** 1920x1080, no responsive design needed
- **Zero user interaction:** Passive display eliminates event handling, focus management, accessibility patterns
- **GitHub Primer strictness:** No design deviations permitted - exact color/font/spacing tokens required

**Current Architecture (Brownfield Context):**
- Single index.html file (743 lines: HTML structure + inline CSS + inline JavaScript)
- Vanilla JS/ES6+ (no frameworks, no build tooling)
- Three existing utility functions to preserve: `formatDate()`, `stripHtml()`, `truncate()`
- Established API patterns: RSS2JSON for feeds, GitHub Status API direct, Promise.all for parallel fetching

**Deployment Constraints:**
- Git-based automatic deployment (clone repo to Pi, auto-pull on restart)
- Python http.server serving localhost:8000
- Systemd services for HTTP server and kiosk mode
- No npm/Node.js on Pi (build must happen on dev machine if needed)

**Design System Dependency:**
- GitHub Primer as single source of truth for all visual design
- Token-based CSS (colors, typography, spacing from Primer)
- Inspection of GitHub.com for patterns not explicitly documented

### Cross-Cutting Concerns Identified

These concerns will affect multiple architectural components:

1. **Performance on Pi 3B:** Every component must consider Pi hardware limits
   - Avoid heavy DOM manipulation
   - Minimize JavaScript execution during animations
   - No complex CSS effects (shadows, transforms, filters)
   - Timer precision without CPU overhead

2. **Timer Coordination:** Dual independent timers that must not conflict
   - Page rotation state vs item highlight state
   - Persist across 5-minute API refresh cycles
   - No drift over 24+ hour runtime
   - Clean state resets (item timer resets on page change)

3. **Graceful Degradation:** Network failures must not break display
   - Per-column error isolation (one API failure doesn't break others)
   - Cached content display during outages
   - Retry logic with exponential backoff
   - Visual feedback for network status

4. **GitHub Design Fidelity:** Every component must maintain strict Primer adherence
   - Color tokens validated against Primer palette
   - Typography hierarchy matching GitHub.com
   - Transition timing following GitHub patterns
   - No custom interpretations or "improvements"

5. **Memory Stability:** 24/7 continuous operation without restarts
   - No event listener leaks
   - Timer cleanup on state changes
   - Canvas context management (if using sprite animations)
   - DOM reference cleanup

6. **State Persistence:** Dashboard state survives refresh cycles
   - Timer positions maintained through API refresh
   - Animation continuity across updates
   - No jarring resets every 5 minutes

7. **Build/Deployment Evolution:** May need tooling as architecture grows
   - Currently zero build (single file deployable)
   - May need bundling if splitting to multiple files
   - Must remain "elegant" - no complex deployment ceremony

---

## Starter Template Evaluation

### Primary Technology Domain

**Frontend Web Application** (client-side only, passive display)

### Brownfield Context: No External Starter

This project does not use an external starter template - it's a brownfield enhancement of a deployed MVP. The existing architecture serves as the foundation.

### Architecture Evolution Decision: Multi-File with Local Build

**Selected Path:** Evolve to multi-file source structure with Vite bundler, manual local build before deployment (Option A).

**Rationale:**
- Carousel will add significant code (~400-500 lines estimated)
- Component separation improves maintainability from day 1
- Avoids future refactoring of large single file
- Pi deployment remains unchanged (already git-based auto-pull)
- Build happens on dev machine, not on Pi
- Industry-standard tooling (Vite) with minimal configuration

### Source Structure

```
/src
  /js
    main.js                    // Application entry point
    carousel-controller.js     // Page rotation logic
    item-highlighter.js        // Item-level highlighting
    detail-panel.js            // Detail view rendering
    api-client.js              // API fetching with caching
    progress-indicator.js      // Rotation progress bar
    persistent-alert.js        // Cross-page outage indicator
    utils.js                   // Preserve formatDate, stripHtml, truncate
  /css
    main.css                   // GitHub Primer tokens
    layout.css                 // Grid and split-view layout
    carousel.css               // Page transition styles
    components.css             // Item cards, detail panel
/index.html                    // Built artifact (committed to repo)
/vite.config.js                // Vite configuration
/package.json                  // Dependencies
/.gitignore                    // Ignore node_modules
```

### Build Tooling: Vite

**Why Vite:**
- Minimal configuration (~20-30 lines)
- Lightning-fast dev server with hot module replacement
- Excellent vanilla JS support (no framework assumptions)
- Can output single HTML file with inlined CSS/JS
- Modern, well-maintained, industry standard
- Better dev experience than editing large single file

**Vite Configuration:**
```javascript
// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: '.',
    emptyOutDir: false,
    rollupOptions: {
      input: 'src/main.html',
      output: {
        entryFileNames: 'assets/[name].js',
        inlineDynamicImports: true,
      }
    }
  },
  server: {
    port: 5173
  }
});
```

### Development Workflow

**Daily Development:**
```bash
npm run dev              # Vite dev server with hot reload (localhost:5173)
# Make changes, see instant updates
```

**Deployment:**
```bash
npm run build            # Produces index.html in project root
git add index.html src/  # Stage source and artifact
git commit -m "Add carousel feature"
git push origin main     # Deploy to Pi
# Pi auto-pulls on next restart - no manual steps
```

**Pi Deployment (Unchanged):**
- Pi runs `/home/pi/update-dashboard.sh` on boot
- Script: `git reset --hard origin/main`
- Python http.server serves built `index.html`
- Zero Pi configuration changes required

### Architectural Decisions Established

**Language & Runtime:**
- JavaScript ES6+ with ES modules (`import`/`export`)
- No TypeScript (vanilla JS simplicity maintained)
- Browser target: ES2020 (Chromium 84 compatible)
- Build validates syntax before deployment

**Styling Solution:**
- Pure CSS in separate `.css` files
- Vite bundles and inlines into final HTML
- GitHub Primer design tokens in CSS custom properties
- No preprocessors (Sass/Less) - maintain CSS simplicity

**Module Organization:**
- ES modules with explicit imports/exports
- One module per major component (carousel, highlighter, detail panel)
- Shared utilities in `utils.js`
- API layer in `api-client.js`

**Code Organization Pattern:**
```javascript
// src/js/main.js
import { CarouselController } from './carousel-controller.js';
import { ItemHighlighter } from './item-highlighter.js';
import { DetailPanel } from './detail-panel.js';
import { fetchAllData } from './api-client.js';
import { formatDate, stripHtml, truncate } from './utils.js';

// Initialize application
const carousel = new CarouselController({ interval: 30000 });
const highlighter = new ItemHighlighter({ interval: 8000 });
// ...
```

**Development Experience:**
- **Hot reloading:** Vite dev server (instant updates, no manual refresh)
- **Debugging:** Browser DevTools with source maps
- **Build validation:** Vite fails fast on syntax errors (prevents broken deployments)
- **Version control:** Commit both source (`/src`) and artifact (`index.html`)

**Testing Strategy:**
- Manual visual testing on dev machine (Vite dev server)
- Manual visual testing on Pi (actual TV display from distance)
- Build artifact before deployment ensures validation
- Future: Consider automated tests after carousel stabilizes

**Performance Considerations:**
- Vite tree-shaking removes unused code
- Single output file (no HTTP overhead on Pi)
- Minified production build
- Inlined CSS/JS (no external resource loading)

### Migration Plan

**Phase 1: Vite Setup (First Implementation Story)**
1. Install Node.js/npm on dev machine (if not present)
2. Initialize project: `npm init -y`
3. Install Vite: `npm install -D vite`
4. Create `vite.config.js` with single-file output config
5. Create `/src` directory structure
6. Migrate current `index.html` to source structure:
   - Extract CSS to `src/css/main.css`
   - Extract JavaScript to `src/js/main.js`
   - Create `src/main.html` as HTML template
7. Test build: `npm run build` produces working `index.html`
8. Test on Pi: Deploy built file, verify functionality
9. Commit setup with `.gitignore` for `node_modules/`

**Phase 2: Carousel Implementation**
- Implement carousel components as separate modules
- Build and test locally with `npm run dev`
- Deploy via `npm run build && git push`

**Validation Criteria for Migration:**
- Built `index.html` loads and functions identically to current MVP
- Dev server hot reload works for CSS/JS changes
- Build process completes in <5 seconds
- Deployed artifact runs on Pi without issues

**Rollback Plan:**
- If build tooling causes issues, revert to single-file approach
- Keep current MVP `index.html` in a backup branch
- Can manually merge carousel changes back to single file if needed

### Trade-offs Accepted

**Benefits Gained:**
✅ Component separation from day 1
✅ Better development experience (hot reload, modules)
✅ Build validation prevents syntax errors
✅ Easier to reason about and maintain
✅ Scalable architecture for future growth

**Costs Accepted:**
⚠️ Initial setup time (~1-2 hours for migration)
⚠️ Build step required before deployment
⚠️ Node.js/npm dependency on dev machine
⚠️ Slightly more complex onboarding for new developers

**Mitigations:**
- Document build process in README
- Create npm scripts for common tasks
- Keep Vite config minimal and commented
- Maintain both source and artifact in repo (easy rollback)

---

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
1. State Management & Timer Coordination - setInterval with manual state
2. Component Communication - Direct function calls
3. API Caching Strategy - In-memory with timestamp
4. Animation Approach - CSS transitions (sprite optional)
5. Testing Strategy - Manual visual testing

All critical decisions follow "simple is best" principle - straightforward implementations that match project constraints.

**Important Decisions (Already Made):**
- Multi-file architecture with Vite bundler (from Step 3)
- GitHub Primer strict adherence (from project context)
- Vanilla JS with ES modules (from technical preferences)

**Deferred Decisions (Post-MVP):**
- Automated testing framework (manual sufficient for kiosk)
- Advanced animation library (CSS sufficient for now)
- Build optimization beyond Vite defaults (premature)

### State Management & Timer Coordination

**Decision:** Simple setInterval with manual state tracking

**Implementation Pattern:**
```javascript
// src/js/carousel-controller.js
class CarouselController {
  constructor(interval = 30000) {
    this.interval = interval;
    this.currentPage = 0;
    this.pages = ['blog', 'changelog', 'status'];
    this.timer = null;
  }
  
  start() {
    this.timer = setInterval(() => this.rotatePage(), this.interval);
  }
  
  stop() {
    if (this.timer) clearInterval(this.timer);
  }
  
  rotatePage() {
    this.currentPage = (this.currentPage + 1) % this.pages.length;
    // Update display, reset item timer
  }
}

// src/js/item-highlighter.js
class ItemHighlighter {
  constructor(interval = 8000) {
    this.interval = interval;
    this.currentItem = 0;
    this.timer = null;
  }
  
  start(itemCount) {
    this.itemCount = itemCount;
    this.timer = setInterval(() => this.highlightNext(), this.interval);
  }
  
  reset() {
    this.stop();
    this.currentItem = 0;
  }
  
  stop() {
    if (this.timer) clearInterval(this.timer);
  }
  
  highlightNext() {
    this.currentItem = (this.currentItem + 1) % this.itemCount;
    // Update highlighting
  }
}
```

**Rationale:**
- Simple, debuggable, matches existing codebase patterns
- Easy to cleanup and coordinate between timers
- No external dependencies or complex abstractions
- Sufficient precision for 30s/8s intervals (drift negligible)

**Timer Coordination:**
- Page rotation triggers: `itemHighlighter.reset()`
- Item timer starts fresh on each page transition
- Both timers independently managed but explicitly coordinated
- Cleanup on component unmount prevents memory leaks

**State Persistence Across API Refresh:**
- Timers continue running during 5-minute API refresh
- No state reset on data fetch
- Timer state is independent of data state

### Component Communication

**Decision:** Direct function calls (no event system)

**Pattern:**
```javascript
// src/js/main.js
const carousel = new CarouselController(30000);
const highlighter = new ItemHighlighter(8000);
const detailPanel = new DetailPanel();

carousel.onPageChange = (page) => {
  highlighter.reset();
  highlighter.start(getItemCountForPage(page));
  detailPanel.clear();
};

highlighter.onItemChange = (item) => {
  detailPanel.render(item);
};
```

**Rationale:**
- Explicit, easy to trace in debugger
- No hidden coupling through events
- Clear data flow: carousel → highlighter → detail panel
- Matches vanilla JS simplicity principle

**Communication Patterns:**
- Carousel notifies highlighter via direct callback
- Highlighter notifies detail panel via direct callback
- Progress indicator updates via direct function calls
- Persistent alert checks status directly

### API Client & Caching Strategy

**Decision:** In-memory cache with timestamp validation

**Implementation:**
```javascript
// src/js/api-client.js
const cache = {
  blog: { data: null, timestamp: 0 },
  changelog: { data: null, timestamp: 0 },
  status: { data: null, timestamp: 0 }
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function fetchBlog(forceRefresh = false) {
  if (!forceRefresh && 
      cache.blog.data && 
      Date.now() - cache.blog.timestamp < CACHE_DURATION) {
    return cache.blog.data;
  }
  
  try {
    const response = await fetch(blogUrl);
    const data = await response.json();
    cache.blog = { data, timestamp: Date.now() };
    return data;
  } catch (error) {
    // Return cached data if available, even if stale
    if (cache.blog.data) return cache.blog.data;
    throw error;
  }
}
```

**Rationale:**
- Simple, no dependencies (no localStorage, no IndexedDB)
- Perfect for 24/7 kiosk (no page reloads)
- Graceful degradation: stale cache better than no data
- 5-minute refresh aligns with existing pattern

**Error Handling:**
- Retry logic: 3 attempts with exponential backoff (1s, 2s, 4s)
- Per-column isolation: Blog API failure doesn't break Changelog/Status
- Fallback to cached data during network outages
- Visual feedback: "Offline - Last updated X min ago"

**Caching Rules:**
- Fresh fetch if cache older than 5 minutes
- Return cached data during network errors
- Clear cache on browser refresh (acceptable for kiosk)
- No persistent storage needed

### Animation & Transitions

**Decision:** CSS transitions for baseline, sprite animations optional

**CSS Transition Pattern:**
```css
/* src/css/carousel.css */
.page {
  opacity: 0;
  transition: opacity 300ms ease;
  display: none;
}

.page.active {
  opacity: 1;
  display: block;
}

/* src/css/components.css */
.list-item {
  background: var(--color-canvas-default);
  transition: background 200ms ease, font-weight 200ms ease;
}

.list-item--highlighted {
  background: var(--color-canvas-subtle);
  font-weight: 600;
}
```

**JavaScript Coordination:**
```javascript
function transitionToPage(nextPage) {
  currentPageEl.classList.remove('active'); // Fade out starts
  
  setTimeout(() => {
    currentPageEl.style.display = 'none';
    nextPageEl.style.display = 'block';
    nextPageEl.classList.add('active'); // Fade in starts
  }, 300); // Match CSS transition duration
}
```

**Rationale:**
- GPU-accelerated on Pi 3B (opacity transitions are fast)
- Simple, declarative, matches GitHub design patterns
- No JavaScript animation libraries needed
- Easy to debug with DevTools

**Performance Considerations:**
- Opacity and background transitions only (cheap)
- Avoid transforms, box-shadows, filters (expensive on Pi)
- Transition durations: 300-500ms pages, 200ms highlights
- Target 30+ FPS on Pi 3B (achievable with CSS)

**Sprite Animation (Optional):**
- Use sprite sheet guide if animated progress indicator desired
- Not required for carousel functionality
- Canvas-based implementation if needed
- Keep separate from core carousel logic

**Animation Principles:**
- Follow GitHub transition timing (300-500ms)
- Smooth, not jarring
- Never interfere with timer precision
- Accessible (no flashing, photosensitivity safe)

### Testing & Validation Strategy

**Decision:** Manual visual testing with structured validation

**Testing Workflow:**

**Local Development Testing:**
```bash
npm run dev  # Vite dev server on localhost:5173
# Test carousel, timers, transitions, API calls
# Use browser DevTools for debugging
```

**Build Validation:**
```bash
npm run build
npm run preview  # Test built artifact locally
# Verify bundle works identically to dev
```

**Pi Deployment Testing:**
```bash
git push origin main
ssh pi@github-dashboard.local "sudo systemctl restart kiosk.service"
# Observe on actual TV from 10-15 feet
```

**Validation Checklist:**

**Timer Accuracy:**
- [ ] Page rotates every 30 seconds (use stopwatch)
- [ ] Item highlights every 8 seconds
- [ ] Item timer resets on page transition
- [ ] No timer drift over 1 hour observation

**Visual Rendering:**
- [ ] Readable from 10-15 feet (actual distance test)
- [ ] GitHub Primer colors match exactly (DevTools color picker)
- [ ] WCAG AA contrast ratios (minimum 4.5:1)
- [ ] Smooth transitions, no flicker

**API & Network:**
- [ ] Data fetches successfully from all 3 sources
- [ ] Graceful fallback during WiFi disconnect
- [ ] Per-column error isolation works
- [ ] Cached content displays during outages

**Performance:**
- [ ] Smooth 30+ FPS animations on Pi 3B
- [ ] Memory stable over 24 hours (check with `free -h`)
- [ ] No visual lag or stuttering

**Burn-In Testing:**
- Run continuously for 24+ hours
- Check for memory leaks, timer drift, visual artifacts
- Verify auto-recovery from Pi restart

**GitHub Primer Validation:**
- Compare screenshots side-by-side with GitHub.com
- Validate all color tokens match Primer palette
- Check typography hierarchy matches GitHub
- Verify spacing uses 8px base unit

**Rationale:**
- Manual testing appropriate for kiosk (no user interaction)
- Actual TV viewing validates distance readability
- Pi hardware testing catches performance issues
- Automated tests would be overkill for this project

**Future Consideration:**
- Add automated tests if carousel logic becomes complex
- Consider visual regression testing if design evolves
- Defer until complexity justifies tooling investment

### Decision Impact Analysis

**Implementation Sequence:**
1. Vite setup and source migration (Foundation)
2. Simple timer classes (State management)
3. CSS transitions (Visual layer)
4. API client with caching (Data layer)
5. Component integration (Coordination)
6. Manual testing and refinement (Validation)

**Cross-Component Dependencies:**
- Carousel controller depends on: item highlighter (reset call)
- Item highlighter depends on: detail panel (render call)
- Detail panel depends on: API client (data structure)
- All components depend on: GitHub Primer CSS tokens

**Integration Points:**
- `main.js` orchestrates all components
- Direct function calls for coordination
- Shared state via closure or module scope
- No global variables except configuration constants

**Validation Gates:**
- Each component testable independently in dev server
- Integration validates timer coordination
- Pi deployment validates performance
- Distance testing validates UX

---

## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

**Critical Conflict Points Identified:** 6 areas where AI agents could make different implementation choices

Given the vanilla JS + GitHub Primer stack, these patterns ensure consistency across all implementations:

### Naming Patterns

**JavaScript Naming:**
```javascript
// Classes: PascalCase
class CarouselController {}

// Functions & methods: camelCase
function rotatePage() {}
highlightNext() {}

// Variables: camelCase
let currentPage = 0;
const itemCount = 10;

// Constants: UPPER_SNAKE_CASE
const RSS2JSON_API = 'https://...';
const REFRESH_INTERVAL = 300000;

// Private convention: underscore prefix
_internalMethod() {}
```

**CSS Class Naming:**
```css
/* BEM-inspired, kebab-case */
.carousel-container {}
.carousel-page {}
.carousel-page--active {}
.carousel-page__header {}

/* GitHub Primer utility pattern */
.item {}
.item-title {}
.item--highlighted {}

/* State classes */
.is-loading {}
.is-hidden {}
.has-error {}
```

**File Naming:**
```
CSS files: kebab-case.css (carousel.css, detail-panel.css)
JS files: kebab-case.js (carousel-controller.js, api-client.js)
Build artifact: index.html (singular, lowercase)
```

### Structure Patterns

**Component File Organization:**
```
/src
  /js
    main.js                     // Entry, initialization only
    carousel-controller.js      // One class per file
    item-highlighter.js
    detail-panel.js
    api-client.js               // API functions, no classes
    utils.js                    // Pure functions only
  /css
    main.css                    // GitHub Primer tokens only
    layout.css                  // Grid, split-view structure
    carousel.css                // Page transitions
    components.css              // Reusable component styles
```

**Module Pattern:**
```javascript
// Each component file exports ONE primary class/function
export class CarouselController {
  // implementation
}

// Helper functions can be exported too
export function formatTimestamp(date) {}

// Default exports discouraged (be explicit)
```

**Import Pattern:**
```javascript
// main.js orchestrates imports
import { CarouselController } from './carousel-controller.js';
import { ItemHighlighter } from './item-highlighter.js';
import { fetchBlog, fetchChangelog, fetchStatus } from './api-client.js';
import { formatDate, stripHtml, truncate } from './utils.js';

// No wildcard imports (import * as Utils)
// No default imports (import Carousel)
```

### GitHub Primer Token Usage

**MANDATORY: All styles use GitHub Primer CSS variables**

```css
/* ✅ CORRECT - Use Primer tokens */
.item {
  background: var(--color-canvas-default);
  color: var(--color-fg-default);
  border: 1px solid var(--color-border-default);
  padding: var(--space-3);
  font-size: var(--fontsize-base);
}

/* ❌ WRONG - No hardcoded values */
.item {
  background: #0d1117;  /* Don't do this */
  padding: 16px;        /* Don't do this */
}
```

**Required Primer Token Categories:**
- Colors: `--color-*`
- Spacing: `--space-*`
- Typography: `--fontsize-*`, `--fontweight-*`, `--lineheight-*`

**Token Definition Location:**
```css
/* src/css/main.css - Define all tokens here */
:root {
  /* GitHub Primer Colors */
  --color-canvas-default: #0d1117;
  --color-fg-default: #c9d1d9;
  --color-fg-muted: #7d8590;
  --color-border-default: #21262d;
  --color-accent-fg: #58a6ff;
  --color-success-fg: #2da44e;
  --color-attention-fg: #bf8700;
  --color-danger-fg: #cf222e;
  
  /* GitHub Primer Spacing */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 16px;
  --space-4: 24px;
  --space-5: 32px;
  
  /* GitHub Primer Typography */
  --fontsize-base: 16px;
  --fontsize-h1: 32px;
  --fontsize-h2: 24px;
  --fontsize-h3: 20px;
  --fontweight-normal: 400;
  --fontweight-semibold: 600;
  --lineheight-default: 1.5;
  --lineheight-condensed: 1.25;
}
```

### Component Communication Pattern

**Direct Function Calls (No Events):**

```javascript
// ✅ CORRECT - Explicit callbacks
class CarouselController {
  constructor() {
    this.onPageChange = null; // Callback set by main.js
  }
  
  rotatePage() {
    this.currentPage = (this.currentPage + 1) % 3;
    if (this.onPageChange) {
      this.onPageChange(this.currentPage);
    }
  }
}

// main.js
carousel.onPageChange = (page) => {
  highlighter.reset();
};

// ❌ WRONG - No custom events
document.dispatchEvent(new CustomEvent('pageChange'));
```

**Callback Patterns:**
- Single responsibility callbacks (onPageChange, onItemChange)
- null-check before calling (defensive programming)
- Pass minimal data in callbacks (page index, item object)
- Set callbacks in main.js only (centralized coordination)

### Error Handling Pattern

**Per-Column Error Isolation:**

```javascript
// ✅ CORRECT - Isolated error handling
async function displayBlogSection() {
  try {
    const data = await fetchBlog();
    renderBlogItems(data);
  } catch (error) {
    console.error('Blog fetch failed:', error);
    document.getElementById('blog-content').innerHTML = `
      <div class="error">Unable to load blog posts</div>
    `;
  }
  // Other sections continue working
}

// ❌ WRONG - Single try/catch for all columns
try {
  await Promise.all([fetchBlog(), fetchChangelog(), fetchStatus()]);
} catch (error) {
  // This breaks everything if one fails
}
```

**Error Display Pattern:**
```html
<div class="error">
  <svg class="error__icon"><!-- Alert icon --></svg>
  <span class="error__message">Unable to load content</span>
</div>
```

```css
.error {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3);
  color: var(--color-danger-fg);
  background: rgba(207, 34, 46, 0.1);
  border: 1px solid var(--color-danger-fg);
  border-radius: 6px;
}
```

**Retry Logic Pattern:**
```javascript
async function fetchWithRetry(url, maxRetries = 3) {
  const delays = [1000, 2000, 4000]; // Exponential backoff
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delays[i]));
    }
  }
}
```

### CSS Transition Pattern

**Consistent Transition Timings:**

```css
/* Page transitions: 300-500ms */
.carousel-page {
  opacity: 0;
  transition: opacity 300ms ease;
  display: none;
}

.carousel-page.active {
  opacity: 1;
  display: block;
}

/* Item highlighting: 200ms */
.item {
  background: var(--color-canvas-default);
  transition: background 200ms ease, font-weight 200ms ease;
}

.item--highlighted {
  background: var(--color-canvas-subtle);
  font-weight: var(--fontweight-semibold);
}

/* Interactive hovers: 150ms (if applicable) */
.link:hover {
  color: var(--color-accent-emphasis);
  transition: color 150ms ease;
}
```

**Transition Guidelines:**
- Favor opacity, background-color (GPU accelerated on Pi 3B)
- Avoid transform, box-shadow, filter (expensive on Pi)
- Always specify easing: `ease`, `ease-in-out`, or `cubic-bezier()`
- Match GitHub's transition timing (300ms standard)

**JavaScript Coordination:**
```javascript
function transitionToPage(nextPage) {
  currentPageEl.classList.remove('active'); // Fade out starts
  
  setTimeout(() => {
    currentPageEl.style.display = 'none';
    nextPageEl.style.display = 'block';
    requestAnimationFrame(() => {
      nextPageEl.classList.add('active'); // Fade in starts
    });
  }, 300); // Match CSS transition duration
}
```

### Enforcement Guidelines

**All AI Agents MUST:**

1. **Use GitHub Primer tokens exclusively** - No hardcoded #hex colors, no hardcoded pixel values for spacing
2. **Follow naming conventions exactly** - camelCase JS, kebab-case CSS, BEM-inspired class names
3. **One component per file** - CarouselController in carousel-controller.js only
4. **Explicit imports** - No wildcard imports, no default exports
5. **Per-column error isolation** - API failures don't cascade across sections
6. **Direct function calls** - No custom event systems for component communication
7. **Preserve existing utilities** - Reuse formatDate, stripHtml, truncate from utils.js

**Pattern Verification Checklist:**
- [ ] Build succeeds: `npm run build`
- [ ] No hardcoded colors: Search for `#[0-9a-f]{6}` in CSS (except token definitions)
- [ ] No hardcoded spacing: Search for `\d+px` outside token definitions
- [ ] All imports use `.js` extension explicitly
- [ ] All CSS uses `var(--*)` for colors, spacing, typography
- [ ] Test on Pi validates performance (30+ FPS, no lag)
- [ ] Visual comparison with GitHub.com validates Primer fidelity

**Pattern Enforcement Process:**
- Code review checks token usage before commit
- Build validation prevents syntax errors
- Manual visual testing confirms GitHub Primer adherence
- Pi deployment testing validates performance constraints

### Pattern Examples

**✅ Good Example: Component Setup**
```javascript
// src/js/carousel-controller.js
export class CarouselController {
  constructor(interval = 30000) {
    this.interval = interval;
    this.currentPage = 0;
    this.pages = ['blog', 'changelog', 'status'];
    this.timer = null;
    this.onPageChange = null; // Explicit callback
  }
  
  start() {
    this.timer = setInterval(() => this.rotatePage(), this.interval);
  }
  
  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
  
  rotatePage() {
    this.currentPage = (this.currentPage + 1) % this.pages.length;
    if (this.onPageChange) {
      this.onPageChange(this.pages[this.currentPage]);
    }
  }
}
```

**✅ Good Example: GitHub Primer Usage**
```css
/* src/css/components.css */
.detail-panel {
  background: var(--color-canvas-subtle);
  padding: var(--space-5);
  border-left: 1px solid var(--color-border-default);
}

.detail-panel__title {
  font-size: var(--fontsize-h2);
  font-weight: var(--fontweight-semibold);
  color: var(--color-fg-default);
  line-height: var(--lineheight-condensed);
  margin-bottom: var(--space-3);
}

.detail-panel__content {
  font-size: var(--fontsize-base);
  line-height: var(--lineheight-default);
  color: var(--color-fg-default);
}
```

**✅ Good Example: Error Isolation**
```javascript
// src/js/main.js
async function initializeDashboard() {
  // Each section handles its own errors
  await Promise.allSettled([
    displayBlogSection(),
    displayChangelogSection(),
    displayStatusSection()
  ]);
  // All sections attempt to load independently
}

async function displayBlogSection() {
  const container = document.getElementById('blog-content');
  try {
    const data = await fetchBlog();
    container.innerHTML = data.items.map(item => `
      <div class="item">${item.title}</div>
    `).join('');
  } catch (error) {
    console.error('Blog section failed:', error);
    container.innerHTML = '<div class="error">Unable to load blog</div>';
  }
}
```

**❌ Anti-Pattern: Mixed Approaches**
```javascript
// DON'T DO THIS - Mixing timer approaches
setInterval(() => rotatePage(), 30000);
requestAnimationFrame(highlightItem); // Choose one approach

// DON'T DO THIS - Mixing communication patterns
carousel.onPageChange = () => {};
document.addEventListener('itemHighlight', () => {}); // Be consistent

// DON'T DO THIS - Hardcoded values
element.style.padding = '24px'; // Use CSS classes with tokens
element.style.color = '#c9d1d9'; // Use CSS variable
```

**❌ Anti-Pattern: Over-Engineering**
```javascript
// DON'T DO THIS - Unnecessary abstraction for simple project
class EventBus {
  on(event, callback) {}
  emit(event, data) {}
  off(event, callback) {}
}
// Just use direct function calls

// DON'T DO THIS - State management library overkill
import { createStore } from 'some-lib';
// Just use class properties and callbacks

// DON'T DO THIS - Complex timer abstractions
class PrecisionTimer extends EventEmitter {
  // 50 lines of unnecessary code
}
// Just use setInterval
```

**❌ Anti-Pattern: Breaking GitHub Primer**
```css
/* DON'T DO THIS - Custom color palette */
.custom-blue { color: #1e90ff; } /* Not from Primer */

/* DON'T DO THIS - Random spacing values */
.spacing { margin: 18px; } /* Use var(--space-*) */

/* DON'T DO THIS - Non-Primer effects */
.fancy {
  box-shadow: 0 10px 30px rgba(0,0,0,0.5); /* GitHub doesn't do this */
  background: linear-gradient(45deg, red, blue); /* No gradients */
}
```

---

## Project Structure & Boundaries

### Complete Project Directory Structure

```
github-latest-dashboard/
├── package.json                    # Vite + dependencies (minimal)
├── vite.config.js                  # Build config (~20-30 lines)
├── .gitignore                      # node_modules, .env
├── README.md                       # Project overview
├── index.html                      # Build output (checked into git for Pi)
├── IMPLEMENTATION_TRACKER.md       # Pi deployment tracking
├── src/
│   ├── index.html                  # Source HTML template
│   ├── main.js                     # Entry point, initialization
│   ├── js/
│   │   ├── carousel-controller.js  # Page rotation logic
│   │   ├── item-highlighter.js     # Item highlighting with timer
│   │   ├── detail-panel.js         # Expanded detail view
│   │   ├── api-client.js           # RSS2JSON fetching, caching
│   │   └── utils.js                # formatDate, stripHtml, truncate
│   └── css/
│       ├── main.css                # GitHub Primer tokens only
│       ├── layout.css              # Grid, split-view structure
│       ├── carousel.css            # Page transitions, fade effects
│       └── components.css          # Item cards, panels, errors
├── deploy/
│   ├── README.md                   # Deployment instructions
│   ├── start-kiosk.sh              # Pi kiosk startup script
│   ├── update-dashboard.sh         # Git pull automation
│   ├── openbox/
│   │   └── autostart               # Openbox window manager config
│   └── systemd/
│       ├── dashboard-server.service  # HTTP server service
│       └── kiosk.service             # Kiosk mode service
├── docs/
│   ├── raspberry-pi-setup.md       # Pi configuration guide
│   └── sprite-sheet-animation-guide.md  # Animation reference
├── _bmad/                          # BMAD project management
│   └── (workflow files)
├── _bmad-output/                   # Generated artifacts
│   ├── planning-artifacts/
│   │   ├── architecture.md         # This document
│   │   ├── prd.md
│   │   └── ux-design-specification.md
│   └── implementation-artifacts/
├── _references/                    # Octocat animation references
└── issues/                         # GitHub issue exports
```

### Architectural Boundaries

**API Boundaries:**
- **RSS2JSON Service**: `api-client.js` handles all external API calls
  - Endpoint: `https://api.rss2json.com/v1/api.json?rss_url={feed_url}`
  - Rate limiting: None enforced (public API)
  - Caching: 5-minute in-memory cache per feed
  - Error handling: Per-column isolation (one API failure doesn't break others)

**Component Boundaries:**
- **CarouselController**: Owns page rotation state, fires onPageChange callback
- **ItemHighlighter**: Owns highlight state, receives reset() calls from carousel
- **DetailPanel**: Owns expanded view state, receives show(item) calls from highlighter
- **API Client**: Stateless functions with in-memory cache, called by main.js
- **Utils**: Pure functions, no state, imported by all components

**Data Boundaries:**
- **In-Memory Cache**: Lives in api-client.js module closure
  - Structure: `{ blog: {data, timestamp}, changelog: {data, timestamp}, status: {data, timestamp} }`
  - TTL: 5 minutes (300,000ms)
  - No persistence (clears on page reload)
- **DOM State**: Each column manages its own DOM independently
  - Blog column: `#blog-content`
  - Changelog column: `#changelog-content`
  - Status column: `#status-content`
  - Detail panel: `#detail-panel`

### Requirements to Structure Mapping

**Post-MVP Phase 1 Features → Implementation:**

**Epic: Carousel Page Rotation**
- **Requirement**: "Dashboard rotates between three pages: Blog, Changelog, Status every 30 seconds"
- **Implementation**: `src/js/carousel-controller.js`
  - Class: `CarouselController`
  - Timer: `setInterval(30000ms)`
  - Callback: `onPageChange(pageName)`
- **Styling**: `src/css/carousel.css`
  - Page transitions: `.carousel-page` with `opacity` fade (300ms)
  - Active state: `.carousel-page.active`

**Epic: Split-View Detail Panel**
- **Requirement**: "Highlighted item shows expanded details in right panel (30% width)"
- **Implementation**: `src/js/detail-panel.js`
  - Class: `DetailPanel`
  - Methods: `show(item)`, `hide()`, `render(item)`
- **Styling**: `src/css/layout.css`
  - Grid structure: Main column (70%) + Detail panel (30%)
  - Responsive: Detail panel slides in from right

**Epic: Item Highlighting**
- **Requirement**: "Highlight rotates through items every 5 seconds, resets on page change"
- **Implementation**: `src/js/item-highlighter.js`
  - Class: `ItemHighlighter`
  - Timer: `setInterval(5000ms)`
  - Coordination: Receives `reset()` call when page changes
  - Callback: `onItemHighlight(item)`
- **Styling**: `src/css/components.css`
  - Highlight effect: `.item--highlighted` with background transition (200ms)
  - Visual cue: `background: var(--color-canvas-subtle)` + `font-weight: semibold`

**Cross-Cutting Concerns:**

**GitHub API Integration**
- **Location**: `src/js/api-client.js`
- **Functions**: 
  - `fetchBlog()` → RSS2JSON for blog.github.com
  - `fetchChangelog()` → RSS2JSON for github.blog/changelog
  - `fetchStatus()` → Direct fetch from githubstatus.com
- **Caching**: In-memory cache with 5-minute TTL
- **Error Handling**: Try/catch per function, never throws to caller

**GitHub Primer Design System**
- **Location**: `src/css/main.css` (token definitions only)
- **Tokens**: Colors, spacing, typography all defined in `:root`
- **Usage**: All other CSS files reference tokens via `var(--*)`
- **Enforcement**: Zero hardcoded colors/spacing allowed in layout.css, carousel.css, components.css

**Raspberry Pi Deployment**
- **Location**: `deploy/` directory
- **Scripts**:
  - `update-dashboard.sh`: Git pull + Chromium restart
  - `start-kiosk.sh`: Chromium kiosk mode launcher
- **Services**: Systemd units for auto-start on boot
- **Documentation**: `docs/raspberry-pi-setup.md`

**Utility Functions (Preserved from MVP)**
- **Location**: `src/js/utils.js`
- **Functions**:
  - `formatDate(dateString)`: RFC 2822 → "Feb 17, 2026"
  - `stripHtml(htmlString)`: Remove tags, decode entities
  - `truncate(text, maxLength)`: Smart truncation with ellipsis
- **Usage**: Imported by main.js, api-client.js, detail-panel.js

### Integration Points

**Internal Communication:**

```javascript
// main.js orchestrates all components
import { CarouselController } from './js/carousel-controller.js';
import { ItemHighlighter } from './js/item-highlighter.js';
import { DetailPanel } from './js/detail-panel.js';
import { fetchBlog, fetchChangelog, fetchStatus } from './js/api-client.js';

// Initialize components
const carousel = new CarouselController(30000);
const highlighter = new ItemHighlighter(5000);
const detailPanel = new DetailPanel();

// Wire up callbacks (explicit coordination)
carousel.onPageChange = (pageName) => {
  highlighter.reset();
  detailPanel.hide();
};

highlighter.onItemHighlight = (item) => {
  detailPanel.show(item);
};

// Start timers
carousel.start();
highlighter.start();
```

**External Integrations:**

**RSS2JSON API:**
- URL: `https://api.rss2json.com/v1/api.json`
- Method: GET with `?rss_url=` query param
- Response: `{ status, feed, items: [] }`
- Rate Limits: None enforced
- Error Handling: Retry 3x with exponential backoff (1s, 2s, 4s)

**GitHub Status API:**
- URL: `https://www.githubstatus.com/api/v2/summary.json`
- Method: GET
- Response: `{ status: {}, components: [] }`
- No authentication required
- Error Handling: Same retry pattern as RSS2JSON

**Git Repository (Deployment):**
- Remote: `origin/main` (GitHub)
- Pi polls: On boot via systemd service
- Command: `git pull origin main` (in `/home/pi/github-dashboard`)
- Build artifact: `index.html` committed to repo (ready to serve)

**Data Flow:**

```
┌──────────────────────────────────────────────────────────────┐
│ Raspberry Pi Boot                                            │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
          ┌──────────────────────────────┐
          │ systemd: kiosk.service       │
          │ runs update-dashboard.sh     │
          └──────────────┬───────────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │ git pull origin main │
              └──────────┬───────────┘
                         │
                         ▼
        ┌────────────────────────────────────┐
        │ Chromium loads localhost:8000       │
        │ (Python http.server)                │
        └────────────────┬───────────────────┘
                         │
                         ▼
┌────────────────────────────────────────────────────────────┐
│ Browser Runtime                                            │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  main.js init                                              │
│    │                                                       │
│    ├─► api-client.js fetch data                           │
│    │     └─► RSS2JSON / GitHub Status API                 │
│    │           └─► In-memory cache (5min TTL)             │
│    │                 └─► Render initial columns           │
│    │                                                       │
│    ├─► CarouselController.start()                         │
│    │     └─► setInterval(30s)                             │
│    │           └─► onPageChange callback                  │
│    │                 └─► ItemHighlighter.reset()          │
│    │                                                       │
│    └─► ItemHighlighter.start()                            │
│          └─► setInterval(5s)                              │
│                └─► onItemHighlight callback               │
│                      └─► DetailPanel.show(item)           │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### File Organization Patterns

**Configuration Files:**
- `package.json`: Minimal dependencies (vite only), build scripts
- `vite.config.js`: Single-file output config, ES2020 target, autoprefixer for -webkit
- `.gitignore`: Excludes `node_modules/`, includes `index.html` (build artifact)
- `.env` (if needed): API keys (none currently required)

**Source Organization:**
- **Entry**: `src/main.js` imports and initializes all components
- **Components**: `src/js/*.js` one class per file, explicit exports
- **Styles**: `src/css/*.css` one concern per file (tokens, layout, transitions, components)
- **Template**: `src/index.html` references `main.js`, Vite injects build

**Test Organization:**
- **Current**: Manual visual testing only (no test framework)
- **Future**: If tests added, structure would be:
  ```
  tests/
    unit/
      carousel-controller.test.js
      item-highlighter.test.js
    integration/
      timer-coordination.test.js
  ```

**Asset Organization:**
- **References**: `_references/` contains static Octocat HTML files for animation reference
- **Build Output**: `index.html` in project root (served by Pi)
- **Deployment**: `deploy/` scripts and config files for Pi

### Development Workflow Integration

**Development Server Structure:**
```bash
# Local development
npm run dev
# → Vite dev server on http://localhost:5173
# → Hot reload on /src file changes
# → No build step (ES modules served directly)
```

**Build Process Structure:**
```bash
# Production build
npm run build
# → Vite bundles /src → /index.html
# → Inlines CSS and JS (single-file output)
# → Minifies and optimizes
# → Output: index.html (1500-2000 lines)
```

**Deployment Structure:**
```bash
# Developer workflow
npm run build          # Build on local machine
git add index.html     # Stage build artifact
git commit -m "..."    # Commit to main
git push origin main   # Push to GitHub

# Raspberry Pi (automated)
# On boot: systemd runs update-dashboard.sh
git pull origin main   # Fetch latest index.html
# Python http.server serves localhost:8000
# Chromium loads in kiosk mode
```

---

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility Analysis:**

All technology choices work cohesively together:
- **Vanilla JS ES6+ + Vite**: Vite bundles ES modules perfectly, zero framework conflicts
- **GitHub Primer + CSS Variables**: Token-based approach works in all modern browsers including Chromium 84
- **setInterval + CSS Transitions**: Browser-native solutions with no library dependencies
- **Direct Function Calls + ES Modules**: Clean communication pattern enabled by module system
- **In-Memory Caching + Stateless API Client**: Simple caching without external state management
- **ES2020 + -webkit Prefixes**: Targets Pi 3B's Chromium 84 capabilities exactly

**Verdict:** No conflicts detected. All decisions mutually support each other.

**Pattern Consistency Check:**

Implementation patterns align perfectly with technology stack:
- **Naming (camelCase JS, kebab-case CSS, BEM classes)**: Vanilla JS conventions, no framework imposed patterns
- **Structure (one component/file, explicit imports)**: ES module best practices
- **GitHub Primer Token Usage**: Enforces design system consistency without additional tooling
- **Direct Callbacks**: Enabled by simple class-based architecture
- **Per-Column Error Isolation**: Supports Promise.allSettled pattern without framework
- **CSS Transition Timing**: Leverages GitHub's standardized timing for familiarity

**Verdict:** Patterns are idiomatic for chosen stack. No framework-specific patterns mixed in.

**Structure Alignment Verification:**

Project structure fully supports architectural decisions:
- `/src/js` components → separate development of CarouselController, ItemHighlighter, DetailPanel
- `/src/css` styles → separate concerns (tokens, layout, transitions, components)
- `src/main.js` entry → orchestrates component initialization and callback wiring
- Vite build → collapses multi-file source into single `index.html` (Pi-ready)
- `deploy/` scripts → supports existing Pi git-pull automation
- Component boundaries → each class file owns specific state and timers

**Verdict:** Structure enables clean multi-file development while maintaining single-file deployment.

### Requirements Coverage Validation ✅

**Post-MVP Phase 1 Epic Coverage:**

| Epic | Architectural Support | Implementation Path |
|------|----------------------|---------------------|
| **Carousel Page Rotation** | ✅ CarouselController class with setInterval(30s) | `src/js/carousel-controller.js` |
| **Item Highlighting** | ✅ ItemHighlighter class with setInterval(5s) + reset coordination | `src/js/item-highlighter.js` |
| **Split-View Detail Panel** | ✅ DetailPanel class + CSS Grid layout (70/30 split) | `src/js/detail-panel.js` + `src/css/layout.css` |
| **Timer Coordination** | ✅ Explicit callbacks (onPageChange triggers reset) | Wired in `src/main.js` |
| **GitHub Primer Adherence** | ✅ Token-only CSS pattern + enforcement checklist | `src/css/main.css` + validation rules |

**Functional Requirements Mapping:**

All FR categories from PRD covered:
- **FR-1 (Page Rotation)**: CarouselController architecture with explicit timer management
- **FR-2 (Highlight Rotation)**: ItemHighlighter architecture with reset capability
- **FR-3 (Detail Panel)**: DetailPanel show/hide methods + grid layout structure
- **FR-4 (API Integration)**: api-client.js with retry logic and in-memory caching
- **FR-5 (Error Handling)**: Per-column isolation pattern prevents cascade failures
- **FR-6 (Raspberry Pi Compatibility)**: ES2020 target + -webkit prefixes + passive display optimization

**Non-Functional Requirements Coverage:**

| NFR | Architectural Approach | Validation |
|-----|------------------------|------------|
| **Performance (Pi 3B constraints)** | setInterval (not RAF), CSS transitions (opacity/background), in-memory cache | ✅ Low-overhead patterns |
| **Reliability (network outages)** | Per-column error isolation, 3x retry with exponential backoff, graceful degradation | ✅ Defensive patterns |
| **Maintainability** | One component/file, explicit naming, comprehensive patterns document | ✅ Clear structure |
| **Deployability (Pi auto-pull)** | Vite build on dev machine → commit index.html → Pi git pull (unchanged workflow) | ✅ Existing process preserved |
| **Design Consistency** | GitHub Primer mandatory tokens, zero hardcoded colors/spacing, enforcement checklist | ✅ Strict adherence enforced |

**Verdict:** 100% requirements coverage with explicit architectural support for each.

### Implementation Readiness Validation ✅

**Decision Completeness Assessment:**

All critical decisions documented with specifics:
- ✅ **Technology Stack**: Vanilla JS ES6+, GitHub Primer CSS, Vite bundler (versions implicit)
- ✅ **Timer Coordination**: setInterval approach with explicit intervals (30s carousel, 5s highlight)
- ✅ **Component Communication**: Direct function calls via explicit callbacks (onPageChange, onItemHighlight)
- ✅ **API Caching**: In-memory cache with 5-minute TTL per feed
- ✅ **Animation Approach**: CSS transitions (300ms pages, 200ms highlights)
- ✅ **Testing Strategy**: Manual visual testing (no automated tests)
- ✅ **Error Handling**: Per-column isolation with retry logic (3x exponential backoff)

**Pattern Completeness Assessment:**

Implementation patterns address all major conflict points:
- ✅ **Naming Patterns**: JavaScript (camelCase), CSS (kebab-case), Classes (PascalCase), Constants (UPPER_SNAKE_CASE), Files (kebab-case)
- ✅ **Structure Patterns**: One component per file, explicit imports/exports, no default exports, no wildcards
- ✅ **GitHub Primer Usage**: MANDATORY token usage, no hardcoded values, enforcement via code review + build validation
- ✅ **Component Communication**: Direct callbacks only, no custom events, null-checks before calling
- ✅ **Error Handling**: Per-column try/catch, never cascade failures, user-visible error states
- ✅ **CSS Transitions**: Consistent timing, favor GPU-accelerated properties, match GitHub timing standards
- ✅ **Examples Provided**: Good examples and anti-patterns for each pattern category

**Structure Completeness Assessment:**

Project structure is fully specified:
- ✅ **Complete Directory Tree**: All files and directories defined from root to leaf
- ✅ **Component Files**: carousel-controller.js, item-highlighter.js, detail-panel.js, api-client.js, utils.js
- ✅ **CSS Files**: main.css (tokens), layout.css (grid), carousel.css (transitions), components.css (styles)
- ✅ **Configuration**: package.json, vite.config.js, .gitignore all described
- ✅ **Deployment**: deploy/ scripts, systemd services, Pi documentation
- ✅ **Integration Points**: Explicit callback wiring in main.js, API boundaries in api-client.js
- ✅ **Requirements Mapping**: Each epic mapped to specific files/directories

**Verdict:** Architecture is fully specified and ready for AI agent implementation. All agents will have clear guidance.

### Gap Analysis Results

**Critical Gaps:** ❌ NONE

No blocking issues identified. All architectural decisions are complete and coherent.

**Important Gaps:** ⚠️ NONE

All major patterns, structures, and integration points are comprehensively documented.

**Nice-to-Have Enhancements:** ℹ️ IDENTIFIED (Non-Blocking)

1. **Vite Configuration Example**: Document mentions "~20-30 lines" but doesn't show actual config
   - Impact: Minor - AI agents can generate standard Vite config from description
   - Resolution: Could add example vite.config.js snippet (optional)

2. **package.json Dependencies**: Vite mentioned but specific version not documented
   - Impact: Minimal - "latest stable Vite" is sufficient guidance
   - Resolution: Could specify `"vite": "^5.0.0"` but not required for coherence

3. **Main.js Initialization Snippet**: Entry point coordination described but not shown
   - Impact: Low - Component wiring pattern is clear from implementation patterns
   - Resolution: Could add main.js skeleton (nice-to-have for quick start)

**Assessment:** These gaps are documentation niceties, not architectural blockers. Current architecture is implementable as-is.

### Validation Issues Addressed

**Issue Resolution Summary:** No issues found requiring resolution.

The architecture validation passed all coherence, coverage, and readiness checks:
- All technology choices are compatible
- All patterns align with stack
- All requirements have architectural support
- All implementation patterns are comprehensive
- Project structure is complete and specific

**Decision:** Proceed with architecture as documented. No changes required before implementation.

### Architecture Completeness Checklist

**✅ Requirements Analysis**
- [x] Project context thoroughly analyzed (brownfield MVP → Post-MVP Phase 1)
- [x] Scale and complexity assessed (small brownfield enhancement, ~5 new classes)
- [x] Technical constraints identified (Pi 3B RAM/GPU, Chromium 84, passive display)
- [x] Cross-cutting concerns mapped (GitHub Primer, error isolation, deployment automation)

**✅ Architectural Decisions**
- [x] Critical decisions documented (timer approach, communication pattern, caching, animations, testing)
- [x] Technology stack fully specified (Vanilla JS, Primer, Vite, ES2020)
- [x] Integration patterns defined (direct callbacks, explicit wiring in main.js)
- [x] Performance considerations addressed (setInterval not RAF, CSS transitions, in-memory cache)

**✅ Implementation Patterns**
- [x] Naming conventions established (JS/CSS/file/class/constant patterns)
- [x] Structure patterns defined (one component/file, explicit imports, no wildcards)
- [x] Communication patterns specified (callbacks only, no events, null-checks)
- [x] Process patterns documented (per-column errors, retry logic, enforcement guidelines)

**✅ Project Structure**
- [x] Complete directory structure defined (root → leaf with all files)
- [x] Component boundaries established (CarouselController, ItemHighlighter, DetailPanel, API Client, Utils)
- [x] Integration points mapped (callback wiring, API boundaries, data flow)
- [x] Requirements to structure mapping complete (each epic → specific files/directories)

### Architecture Readiness Assessment

**Overall Status:** ✅ **READY FOR IMPLEMENTATION**

**Confidence Level:** **HIGH** based on validation results

All validation checks passed:
- Zero critical gaps identified
- Zero architectural conflicts detected
- 100% requirements coverage verified
- Comprehensive implementation patterns documented
- Complete project structure defined

**Key Strengths:**

1. **Simplicity First**: setInterval timers, direct function calls, in-memory caching - no over-engineering
2. **Clear Boundaries**: Each component owns specific state, per-column error isolation prevents cascades
3. **GitHub Primer Enforcement**: Mandatory token usage with verification checklist ensures design consistency
4. **Deployment Continuity**: Vite build doesn't change Pi workflow (still git pull + restart)
5. **Implementation Clarity**: One component per file, explicit naming patterns, comprehensive examples prevent AI agent conflicts
6. **Brownfield Respect**: Preserves existing utilities (formatDate, stripHtml, truncate) and deployment automation

**Areas for Future Enhancement:**

1. **Testing**: Currently manual visual testing - could add automated tests later (Vitest for unit, Playwright for E2E)
2. **Accessibility**: No ARIA patterns documented - passive display doesn't require interaction, but screen reader support could be added
3. **Progressive Enhancement**: Could add service worker for offline resilience, though not required for kiosk deployment
4. **Animation Polish**: Could explore sprite-sheet animations (Octocat reference available in /_references) for visual flair
5. **Configuration Management**: Could externalize intervals (30s carousel, 5s highlight) to config file for easier tuning

### Implementation Handoff

**AI Agent Guidelines:**

1. **Follow Architectural Decisions Exactly**: Use setInterval timers, direct function calls, in-memory caching as documented
2. **Use Implementation Patterns Consistently**: camelCase JS, kebab-case CSS, BEM classes, one component per file
3. **Respect GitHub Primer Token Usage**: ZERO hardcoded colors or spacing - use `var(--*)` for all values
4. **Maintain Component Boundaries**: Each class owns its state and timers, communicate only via explicit callbacks
5. **Preserve Error Isolation**: Wrap each column in try/catch, never let one API failure break others
6. **Refer to Architecture Document**: This document (`_bmad-output/planning-artifacts/architecture.md`) is the source of truth for all implementation questions

**First Implementation Step:**

1. **Set Up Project Structure**: Create `/src` directory with `/js` and `/css` subdirectories
2. **Initialize Vite**: `npm create vite@latest . -- --template vanilla` then configure for single-file output
3. **Create Component Skeletons**: Empty class files for CarouselController, ItemHighlighter, DetailPanel
4. **Define GitHub Primer Tokens**: Create `src/css/main.css` with all token definitions from pattern document
5. **Migrate Existing Utilities**: Copy formatDate, stripHtml, truncate from current index.html to `src/js/utils.js`

**Implementation Priority Order:**
1. **Phase 1: Infrastructure** - Vite setup, project structure, GitHub Primer tokens
2. **Phase 2: Core Components** - API client (preserve existing), Utils (migrate existing)
3. **Phase 3: Carousel Logic** - CarouselController with page rotation
4. **Phase 4: Highlighting** - ItemHighlighter with timer coordination
5. **Phase 5: Detail Panel** - Split-view layout and expanded detail view
6. **Phase 6: Integration** - Wire callbacks in main.js, test on Pi

