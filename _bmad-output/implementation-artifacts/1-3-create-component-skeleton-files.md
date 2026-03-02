# Story 1.3: Create Component Skeleton Files

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,
I want skeleton files for all carousel components created with proper structure and exports,
So that I have a clear architecture foundation for implementing carousel features.

## Acceptance Criteria

**Given** I need a carousel controller component
**When** I create src/js/carousel-controller.js
**Then** it exports a CarouselController class with constructor
**And** the constructor accepts an interval parameter (default: 30000ms)
**And** it includes skeleton methods: start(), stop(), rotatePage()
**And** it includes an onPageChange callback property set to null
**And** the file follows naming conventions (camelCase methods, PascalCase class)

**Given** I need an item highlighter component
**When** I create src/js/item-highlighter.js
**Then** it exports an ItemHighlighter class with constructor
**And** the constructor accepts an interval parameter (default: 8000ms)
**And** it includes skeleton methods: start(), stop(), reset(), highlightNext()
**And** it includes an onItemHighlight callback property set to null
**And** the file follows architecture patterns from the Architecture doc

**Given** I need a detail panel component
**When** I create src/js/detail-panel.js
**Then** it exports a DetailPanel class with constructor
**And** it includes skeleton methods: show(), hide(), render()
**And** the class is prepared to handle detail content rendering

**Given** I need an API client module
**When** I create src/js/api-client.js
**Then** it exports functions: fetchBlog(), fetchChangelog(), fetchStatus()
**And** it includes in-memory cache structure: `const cache = { blog: {data: null, timestamp: 0}, ... }`
**And** it includes CACHE_DURATION constant: 5 * 60 * 1000 (5 minutes)
**And** it preserves the existing API URLs for rss2json and GitHub Status

**Given** all component skeleton files are created
**When** I import them in src/js/main.js
**Then** all imports succeed without errors
**And** the skeleton classes can be instantiated
**And** the build process completes successfully
**And** no runtime errors occur from the skeleton structure

## Tasks / Subtasks

- [x] Create CarouselController skeleton (AC: 1)
  - [x] Create src/js/carousel-controller.js file
  - [x] Define CarouselController class with PascalCase naming
  - [x] Add constructor accepting config object: `constructor({ interval = 30000, pages = ['blog', 'changelog', 'status'] } = {})`
  - [x] Initialize state properties: `this.interval`, `this.pages`, `this.currentPage = 0`, `this.timer = null`
  - [x] Add callback property: `this.onPageChange = null`
  - [x] Create skeleton start() method with TODO comment
  - [x] Create skeleton stop() method with clearInterval pattern
  - [x] Create skeleton rotatePage() method with TODO comment
  - [x] Export class: `export class CarouselController { }`
  - [x] Add JSDoc comments for class and constructor parameters

- [x] Create ItemHighlighter skeleton (AC: 2)
  - [x] Create src/js/item-highlighter.js file
  - [x] Define ItemHighlighter class with PascalCase naming
  - [x] Add constructor accepting config object: `constructor({ interval = 8000 } = {})`
  - [x] Initialize state properties: `this.interval`, `this.currentItem = 0`, `this.itemCount = 0`, `this.timer = null`
  - [x] Add callback property: `this.onItemHighlight = null`
  - [x] Create skeleton start(itemCount) method accepting item count parameter
  - [x] Create skeleton stop() method with clearInterval pattern
  - [x] Create skeleton reset() method calling stop() and resetting currentItem to 0
  - [x] Create skeleton highlightNext() method with TODO comment
  - [x] Export class: `export class ItemHighlighter { }`
  - [x] Add JSDoc comments for class and methods

- [x] Create DetailPanel skeleton (AC: 3)
  - [x] Create src/js/detail-panel.js file
  - [x] Define DetailPanel class with PascalCase naming
  - [x] Add constructor accepting config object: `constructor({ containerId = 'detail-panel' } = {})`
  - [x] Initialize properties: `this.containerId`, `this.container = null`
  - [x] Create skeleton show() method with TODO comment
  - [x] Create skeleton hide() method with TODO comment
  - [x] Create skeleton render(item) method accepting item data parameter
  - [x] Export class: `export class DetailPanel { }`
  - [x] Add JSDoc comments for class and methods

- [x] Create API Client skeleton (AC: 4)
  - [x] Create src/js/api-client.js file
  - [x] Define cache object: `const cache = { blog: {data: null, timestamp: 0}, changelog: {data: null, timestamp: 0}, status: {data: null, timestamp: 0} }`
  - [x] Define CACHE_DURATION constant: `const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes`
  - [x] Copy API URLs from current main.js: RSS2JSON_API, GITHUB_BLOG_RSS, GITHUB_CHANGELOG_RSS, GITHUB_STATUS_API
  - [x] Create fetchBlog() async function signature with cache check pattern
  - [x] Create fetchChangelog() async function signature with cache check pattern
  - [x] Create fetchStatus() async function signature with cache check pattern
  - [x] Add TODO comments for actual fetch logic implementation
  - [x] Export all three functions: `export async function fetchBlog() { }`, etc.
  - [x] Add JSDoc comments documenting return types and error handling

- [x] Import skeletons in main.js (AC: 5)
  - [x] Add import for CarouselController: `import { CarouselController } from './carousel-controller.js';`
  - [x] Add import for ItemHighlighter: `import { ItemHighlighter } from './item-highlighter.js';`
  - [x] Add import for DetailPanel: `import { DetailPanel } from './detail-panel.js';`
  - [x] Add import for API client: `import { fetchBlog, fetchChangelog, fetchStatus } from './api-client.js';`
  - [x] Add comment block explaining skeleton imports (not yet implemented)
  - [x] Verify existing imports for utils.js remain intact

- [x] Validate skeleton structure (AC: 5)
  - [x] Run `npm run dev` and verify dev server starts without errors
  - [x] Open browser console and check for import/syntax errors
  - [x] Verify skeleton classes can be instantiated (test in console or add temp code)
  - [x] Run `npm run build` and verify build completes successfully
  - [x] Check built index.html opens and has no runtime errors
  - [x] Verify existing MVP functionality still works (API calls, display)
  - [x] Confirm no console errors related to new skeleton files

- [x] Document skeleton architecture (Dev Notes)
  - [x] Review and update Dev Notes with component skeleton structure
  - [x] Document component communication pattern (callbacks, not events)
  - [x] Document timer lifecycle (constructor → start() → stop() → reset())
  - [x] Reference architecture.md sections on component patterns
  - [x] Add notes on what remains to implement in Epic 2+

## Dev Notes

### Epic Context

**Epic 1: Development Infrastructure Setup**
- **Goal:** Establish maintainable build system preserving MVP reliability while enabling carousel evolution
- **Why This Story Matters:** Creates the architectural foundation with properly structured component skeletons that will house all carousel logic (Epic 2+)
- **Dependencies:** 
  - **Requires:** Story 1.1 (Vite build) ✅, Story 1.2 (source migration) ✅
  - **Enables:** Story 1.4 (Primer tokens), 1.5 (validation), Epic 2 (carousel implementation)

**Story Position in Epic:**
- ✅ **Story 1.1 DONE:** Vite build system configured and validated
- ✅ **Story 1.2 DONE:** MVP migrated to /src structure (main.js, utils.js, main.css)
- 🎯 **Story 1.3 (THIS STORY):** Create component skeleton files for carousel architecture
- ⏭️ **Story 1.4:** Define GitHub Primer tokens in CSS
- ⏭️ **Story 1.5:** Validate complete build pipeline and deployment

### Critical Architecture Requirements

**THIS IS A SKELETON-ONLY STORY - NO FEATURE IMPLEMENTATION**

🚨 **CRITICAL RULES:**
1. **SKELETON ONLY** - Create class structures and method signatures, NO implementation logic
2. **NO BREAKING CHANGES** - Existing MVP functionality must continue working perfectly
3. **IMPORTS ONLY** - Add imports to main.js but don't instantiate or use components yet
4. **BUILD VALIDATION** - Must build and run without errors, even with empty methods
5. **PRESERVE MVP** - Current three-column dashboard must display and function identically

**What "Skeleton" Means:**
- ✅ Create files with proper class structure
- ✅ Define constructor with correct parameter patterns
- ✅ Add method signatures (start, stop, reset, render, etc.)
- ✅ Set up state properties and callback properties
- ✅ Add JSDoc comments documenting intent
- ❌ NO actual implementation logic in methods (use TODO comments)
- ❌ NO instantiation or wiring in main.js yet (just imports)
- ❌ NO HTML/CSS changes (purely JavaScript structure)

**Why Skeletons First:**
This approach follows industry best practices for brownfield refactoring:
1. Establish architecture without risk (skeleton doesn't execute)
2. Validate structure compiles and imports correctly
3. Enable parallel work (Story 1.4 tokens, then Epic 2 implementation)
4. Prevent "big bang" integration disasters
5. Allow Story 1.5 to validate complete infrastructure before Epic 2

### Component Architecture Specifications

**Component File Structure (From Architecture Doc):**

```
/src/js
  ├── main.js                    (entry point, component wiring)
  ├── utils.js                   (EXISTING - formatDate, stripHtml, truncate)
  ├── carousel-controller.js     (NEW - page rotation logic)
  ├── item-highlighter.js        (NEW - item-level highlighting)
  ├── detail-panel.js            (NEW - detail view rendering)
  └── api-client.js              (NEW - data fetching with caching)
```

**ES Module Export Pattern (MANDATORY):**

```javascript
// ALWAYS use named exports for classes
export class ComponentName {
  constructor({ param = defaultValue } = {}) {
    // Configuration parameter pattern with destructuring defaults
  }
}

// ALWAYS use named exports for functions
export async function functionName() {
  // Function implementation
}
```

**Component Class Structure Pattern:**

```javascript
/**
 * ComponentName - Brief description of responsibility
 * @class
 */
export class ComponentName {
  /**
   * Create a ComponentName instance
   * @param {Object} config - Configuration options
   * @param {number} config.interval - Timer interval in milliseconds (default: 30000)
   */
  constructor({ interval = 30000 } = {}) {
    // 1. Store configuration
    this.interval = interval;
    
    // 2. Initialize state properties
    this.currentIndex = 0;
    this.timer = null;
    
    // 3. Initialize callback properties
    this.onSomeEvent = null;
  }
  
  /**
   * Start the component (activate timers, bind events)
   */
  start() {
    // TODO: Implementation in Epic 2
  }
  
  /**
   * Stop the component (cleanup timers, unbind events)
   */
  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}
```

**Constructor Configuration Object Pattern:**

```javascript
// ALWAYS use destructuring with defaults
constructor({ interval = 30000, pages = ['blog', 'changelog', 'status'] } = {}) {
  // This pattern allows:
  // new Component()                           // Uses all defaults
  // new Component({ interval: 20000 })        // Override some, keep others
  // new Component({ interval: 20000, pages: ['blog'] })  // Override multiple
}
```

**Why This Pattern:**
- Flexible: Accept any number of optional parameters
- Clear: Named parameters self-document
- Safe: Defaults prevent undefined values
- Future-proof: Easy to add new parameters without breaking existing code

### CarouselController Skeleton Specification

**Responsibility:** Owns page rotation state and timing (30-second page timer)

**Required Structure:**
```javascript
/**
 * CarouselController - Manages page rotation timing and state
 * @class
 */
export class CarouselController {
  /**
   * Create a CarouselController instance
   * @param {Object} config - Configuration options
   * @param {number} config.interval - Page rotation interval in milliseconds (default: 30000)
   * @param {string[]} config.pages - Array of page identifiers (default: ['blog', 'changelog', 'status'])
   */
  constructor({ interval = 30000, pages = ['blog', 'changelog', 'status'] } = {}) {
    this.interval = interval;
    this.pages = pages;
    this.currentPage = 0;      // Index of current page
    this.timer = null;          // setInterval handle
    this.onPageChange = null;   // Callback: (page: string) => void
  }
  
  /**
   * Start page rotation timer
   */
  start() {
    // TODO: Implement in Epic 2.2 (Page Rotation System)
    // this.timer = setInterval(() => this.rotatePage(), this.interval);
  }
  
  /**
   * Stop page rotation timer and cleanup
   */
  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
  
  /**
   * Rotate to next page in cycle
   * @private
   */
  rotatePage() {
    // TODO: Implement in Epic 2.2
    // this.currentPage = (this.currentPage + 1) % this.pages.length;
    // if (this.onPageChange) this.onPageChange(this.pages[this.currentPage]);
  }
}
```

**Key Properties:**
- `interval`: Milliseconds between page rotations (default 30000 = 30 seconds)
- `pages`: Array of page IDs to cycle through (['blog', 'changelog', 'status'])
- `currentPage`: Index into pages array (0-based)
- `timer`: setInterval handle for cleanup
- `onPageChange`: Callback invoked on page transition (wired in main.js)

### ItemHighlighter Skeleton Specification

**Responsibility:** Owns item highlighting state and timing (8-second item timer)

**Required Structure:**
```javascript
/**
 * ItemHighlighter - Manages item-level highlighting and rotation
 * @class
 */
export class ItemHighlighter {
  /**
   * Create an ItemHighlighter instance
   * @param {Object} config - Configuration options
   * @param {number} config.interval - Item highlight interval in milliseconds (default: 8000)
   */
  constructor({ interval = 8000 } = {}) {
    this.interval = interval;
    this.currentItem = 0;       // Index of currently highlighted item
    this.itemCount = 0;         // Total items on current page
    this.timer = null;          // setInterval handle
    this.onItemHighlight = null; // Callback: (itemIndex: number) => void
  }
  
  /**
   * Start item highlighting timer
   * @param {number} itemCount - Number of items to rotate through
   */
  start(itemCount) {
    // TODO: Implement in Epic 3.2 (ItemHighlighter with Timer)
    // this.itemCount = itemCount;
    // this.timer = setInterval(() => this.highlightNext(), this.interval);
  }
  
  /**
   * Stop item highlighting timer and cleanup
   */
  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
  
  /**
   * Reset to first item (called on page change)
   */
  reset() {
    this.stop();
    this.currentItem = 0;
  }
  
  /**
   * Move to next item in rotation
   * @private
   */
  highlightNext() {
    // TODO: Implement in Epic 3.2
    // this.currentItem = (this.currentItem + 1) % this.itemCount;
    // if (this.onItemHighlight) this.onItemHighlight(this.currentItem);
  }
}
```

**Key Properties:**
- `interval`: Milliseconds between item highlights (default 8000 = 8 seconds)
- `currentItem`: Index of highlighted item (0-based)
- `itemCount`: Total items on current page (passed to start())
- `timer`: setInterval handle for cleanup
- `onItemHighlight`: Callback invoked on highlight change (wired in main.js)

**Coordination Pattern:**
- `reset()` called by CarouselController on page change
- Ensures item timer starts fresh on each page (no stale highlighting)

### DetailPanel Skeleton Specification

**Responsibility:** Renders expanded detail content for highlighted item (reactive, no timer)

**Required Structure:**
```javascript
/**
 * DetailPanel - Manages detail view rendering for highlighted items
 * @class
 */
export class DetailPanel {
  /**
   * Create a DetailPanel instance
   * @param {Object} config - Configuration options
   * @param {string} config.containerId - DOM element ID for detail panel (default: 'detail-panel')
   */
  constructor({ containerId = 'detail-panel' } = {}) {
    this.containerId = containerId;
    this.container = null;  // Will be set in show() or render()
  }
  
  /**
   * Show the detail panel
   */
  show() {
    // TODO: Implement in Epic 3.3 (Detail Panel Rendering)
    // this.container = document.getElementById(this.containerId);
    // if (this.container) this.container.style.display = 'block';
  }
  
  /**
   * Hide the detail panel
   */
  hide() {
    // TODO: Implement in Epic 3.3
    // if (this.container) this.container.style.display = 'none';
  }
  
  /**
   * Render item details in the panel
   * @param {Object} item - Item data to render (title, description, date, link, etc.)
   */
  render(item) {
    // TODO: Implement in Epic 3.3
    // this.container = document.getElementById(this.containerId);
    // if (!this.container) return;
    // 
    // this.container.innerHTML = `
    //   <div class="detail-title">${item.title}</div>
    //   <div class="detail-date">${formatDate(item.pubDate)}</div>
    //   <div class="detail-content">${item.description}</div>
    //   <a href="${item.link}" target="_blank">Read more</a>
    // `;
  }
}
```

**Key Properties:**
- `containerId`: DOM element ID where detail content renders
- `container`: Cached DOM reference (set on first render)

**Rendering Pattern:**
- No timer (purely reactive to ItemHighlighter callbacks)
- Called via `detailPanel.render(item)` when highlight changes
- Will use template literals with `innerHTML` for rendering (matches existing MVP pattern)

### API Client Skeleton Specification

**Responsibility:** Data fetching with in-memory caching (5-minute refresh)

**Required Structure:**
```javascript
/**
 * API Client - Handles data fetching with in-memory caching
 * @module api-client
 */

// Cache structure for all three data sources
const cache = {
  blog: { data: null, timestamp: 0 },
  changelog: { data: null, timestamp: 0 },
  status: { data: null, timestamp: 0 }
};

// Cache duration: 5 minutes (matches existing auto-refresh interval)
const CACHE_DURATION = 5 * 60 * 1000;

// API endpoints (copy from existing main.js)
const RSS2JSON_API = 'https://api.rss2json.com/v1/api.json';
const GITHUB_BLOG_RSS = 'https://github.blog/feed/';
const GITHUB_CHANGELOG_RSS = 'https://github.blog/changelog/feed/';
const GITHUB_STATUS_API = 'https://www.githubstatus.com/api/v2/incidents.json';

/**
 * Fetch GitHub Blog data with caching
 * @returns {Promise<Object>} Blog RSS data
 * @throws {Error} If fetch fails and no cached data available
 */
export async function fetchBlog() {
  // TODO: Implement in Epic 3.5 (Data Flow Integration)
  // const now = Date.now();
  // if (cache.blog.data && now - cache.blog.timestamp < CACHE_DURATION) {
  //   return cache.blog.data;
  // }
  // 
  // const response = await fetch(`${RSS2JSON_API}?rss_url=${encodeURIComponent(GITHUB_BLOG_RSS)}`);
  // const data = await response.json();
  // cache.blog = { data, timestamp: now };
  // return data;
}

/**
 * Fetch GitHub Changelog data with caching
 * @returns {Promise<Object>} Changelog RSS data
 * @throws {Error} If fetch fails and no cached data available
 */
export async function fetchChangelog() {
  // TODO: Implement in Epic 3.5
}

/**
 * Fetch GitHub Status data with caching
 * @returns {Promise<Object>} Status API data
 * @throws {Error} If fetch fails and no cached data available
 */
export async function fetchStatus() {
  // TODO: Implement in Epic 3.5
}
```

**Key Components:**
- `cache`: In-memory object with data and timestamp for each source
- `CACHE_DURATION`: 5 minutes (5 * 60 * 1000 milliseconds)
- API URL constants: Preserve exact values from existing main.js
- Export three async functions: `fetchBlog()`, `fetchChangelog()`, `fetchStatus()`

**Caching Pattern:**
- Check `Date.now() - cache[source].timestamp < CACHE_DURATION`
- Return cached data if fresh
- Fetch and cache if stale or missing
- Return stale cache on fetch error (graceful degradation)

### Technology Stack & Patterns

**ES Module Import/Export Pattern:**

```javascript
// Component file (e.g., carousel-controller.js)
export class CarouselController { }  // Named export

// Main entry point (main.js)
import { CarouselController } from './carousel-controller.js';  // MUST include .js extension
import { ItemHighlighter } from './item-highlighter.js';
import { DetailPanel } from './detail-panel.js';
import { fetchBlog, fetchChangelog, fetchStatus } from './api-client.js';
import { formatDate, stripHtml, truncate } from './utils.js';  // Existing utilities

// Import components but DON'T instantiate yet (skeleton only)
// Actual wiring will happen in Epic 2+
```

**Constructor Default Parameters Pattern:**

```javascript
// Configuration object with destructuring defaults
constructor({ interval = 30000, pages = ['blog', 'changelog', 'status'] } = {}) {
  this.interval = interval;
  this.pages = pages;
}

// Usage examples:
new CarouselController();                                    // Uses all defaults
new CarouselController({ interval: 20000 });                 // Override interval only
new CarouselController({ pages: ['blog', 'status'] });       // Override pages only
```

**Timer Lifecycle Pattern:**

```javascript
// Start: Create timer
start() {
  this.timer = setInterval(() => this.someMethod(), this.interval);
}

// Stop: Cleanup timer (MANDATORY to prevent memory leaks)
stop() {
  if (this.timer) {
    clearInterval(this.timer);
    this.timer = null;  // Clear reference
  }
}

// Reset: Stop and reset state (for child timers on parent events)
reset() {
  this.stop();
  this.currentIndex = 0;
}
```

**Callback Communication Pattern:**

```javascript
// Component defines callback property
export class CarouselController {
  constructor() {
    this.onPageChange = null;  // Will be set by main.js
  }
  
  rotatePage() {
    // Trigger callback if set
    if (this.onPageChange) {
      this.onPageChange(this.pages[this.currentPage]);
    }
  }
}

// Main.js wires components via callbacks
const carousel = new CarouselController();
carousel.onPageChange = (page) => {
  console.log(`Page changed to: ${page}`);
  // Coordinate with other components
};
```

**Code Style Conventions:**

- **Class names:** PascalCase (CarouselController, ItemHighlighter)
- **Method names:** camelCase (start, stop, rotatePage, highlightNext)
- **Private methods:** Prefix with underscore if truly internal (not mandatory for skeletons)
- **Constants:** UPPER_SNAKE_CASE (CACHE_DURATION, RSS2JSON_API)
- **Property names:** camelCase (currentPage, onPageChange)
- **File names:** kebab-case matching class name (carousel-controller.js)

**JSDoc Comment Pattern:**

```javascript
/**
 * Brief description of class/method
 * @class (for classes)
 * @param {Type} paramName - Description
 * @returns {Type} Description
 * @throws {Error} When error occurs
 * @private (for internal methods)
 */
```

### Previous Story Intelligence (Story 1.2)

**Key Learnings from Story 1.2 (Migration to /src structure):**

1. **Multi-File ES Modules Work Perfectly**
   - Successfully extracted utils.js with formatDate(), stripHtml(), truncate()
   - Import/export syntax validated in build and runtime
   - No issues with .js extension requirement for ES modules
   - Dev server hot reload works flawlessly with multi-file structure

2. **Vite Build Configuration**
   - Input set to 'src/index.html' in vite.config.js
   - outDir: '.' writes to project root (Pi expects index.html there)
   - emptyOutDir: false preserves docs/, deploy/, _bmad/ folders
   - Single-file output with viteSingleFile plugin works perfectly

3. **Existing MVP Code Patterns to Preserve**
   - API URLs: RSS2JSON_API, GITHUB_BLOG_RSS, GITHUB_CHANGELOG_RSS, GITHUB_STATUS_API
   - Utility functions: formatDate(), stripHtml(), truncate() (already in utils.js)
   - Badge detection functions: detectBadgeType(), detectBlogBadgeType()
   - Template literal innerHTML rendering pattern
   - async/await error handling with try/catch

4. **Current Source Structure After Story 1.2**
   ```
   /src
     /js
       main.js       (611 lines - all MVP logic)
       utils.js      (formatDate, stripHtml, truncate)
     /css
       main.css      (all MVP styles)
     index.html      (HTML structure referencing CSS/JS)
   ```

5. **Build Validation Success Criteria**
   - `npm run dev` starts dev server on localhost:5173
   - `npm run build` produces index.html in project root (~46KB)
   - Built artifact displays three-column dashboard correctly
   - All API calls work (Blog, Changelog, Status)
   - No console errors in dev or built version

6. **What NOT to Touch (From Story 1.2 Experience)**
   - Don't modify existing main.js logic that's still needed (API calls, rendering)
   - Don't change HTML structure (same IDs, classes)
   - Don't refactor CSS yet (Story 1.4 handles Primer tokens)
   - Don't alter utility function implementations
   - Don't break auto-refresh cycle (5-minute setInterval)

**Implications for Story 1.3:**
- ✅ Can confidently create new .js files in /src/js (proven pattern)
- ✅ Import/export syntax is stable and works
- ✅ Build process handles multiple modules cleanly
- ⚠️ Add imports to main.js but don't remove existing code yet (Epic 2 migrates logic)
- ⚠️ Skeleton classes should follow patterns from utils.js (named exports, JSDoc)

### File Structure Changes in This Story

**Before Story 1.3:**
```
/src/js
  ├── main.js       (611 lines - all MVP logic)
  └── utils.js      (utility functions)
```

**After Story 1.3:**
```
/src/js
  ├── main.js                (+ imports for new skeleton components)
  ├── utils.js               (unchanged)
  ├── carousel-controller.js (NEW skeleton - ~40 lines)
  ├── item-highlighter.js    (NEW skeleton - ~45 lines)
  ├── detail-panel.js        (NEW skeleton - ~30 lines)
  └── api-client.js          (NEW skeleton - ~50 lines)
```

**Changes to main.js (MINIMAL):**
```javascript
// ADD these imports at the top (after existing utils import)
import { CarouselController } from './carousel-controller.js';
import { ItemHighlighter } from './item-highlighter.js';
import { DetailPanel } from './detail-panel.js';
import { fetchBlog, fetchChangelog, fetchStatus } from './api-client.js';

// ADD comment block explaining imports
// Component skeletons imported for Epic 2 implementation
// Current MVP functionality remains using existing code below
// TODO Epic 2: Wire carousel components and migrate logic

// KEEP all existing code unchanged below imports
// (Configuration constants, functions, event listeners, etc.)
```

**What NOT to Change in main.js:**
- ❌ Don't instantiate skeleton components yet
- ❌ Don't modify existing fetch functions (fetchBlog, fetchChangelog, fetchStatus)
- ❌ Don't alter existing rendering logic
- ❌ Don't change auto-refresh setInterval
- ❌ Don't modify existing event listeners or initialization code
- ✅ ONLY add imports and a comment block

### Project Structure Notes

**Alignment with Unified Project Structure:**
- `/src/js/` follows standard JavaScript module organization
- Component naming matches architecture document specifications
- ES module exports align with modern JavaScript patterns
- Constructor patterns consistent with class-based architecture

**Architecture Document References:**
- Component structure: [architecture.md](/_bmad-output/planning-artifacts/architecture.md#component-architecture)
- State management: [architecture.md](/_bmad-output/planning-artifacts/architecture.md#state-management-timer-coordination)
- Communication patterns: [architecture.md](/_bmad-output/planning-artifacts/architecture.md#component-communication)
- Timer coordination: [architecture.md](/_bmad-output/planning-artifacts/architecture.md#timer-coordination-rules)

**Project Context References:**
- ES Module patterns: [project-context.md](/_bmad-output/project-context.md#es-module-patterns)
- Component architecture: [project-context.md](/_bmad-output/project-context.md#component-architecture-communication-patterns)
- Constructor patterns: [project-context.md](/_bmad-output/project-context.md#constructor-default-parameters-pattern)
- Timer lifecycle: [project-context.md](/_bmad-output/project-context.md#timer-lifecycle-pattern)

### References

**Source Material:**
- [Epic 1: Development Infrastructure Setup](/_bmad-output/planning-artifacts/epics.md#epic-1-development-infrastructure-setup)
- [Story 1.3 Requirements](/_bmad-output/planning-artifacts/epics.md#story-13-create-component-skeleton-files)
- [Architecture: Component Patterns](/_bmad-output/planning-artifacts/architecture.md#core-architectural-decisions)
- [Architecture: State Management](/_bmad-output/planning-artifacts/architecture.md#state-management-timer-coordination)
- [Project Context: Component Architecture](/_bmad-output/project-context.md#component-architecture-communication-patterns)
- [Story 1.2: Source Migration](/_bmad-output/implementation-artifacts/1-2-migrate-current-mvp-to-source-structure.md)

**Next Story Preview:**
- **Story 1.4:** Define GitHub Primer Design Tokens - CSS custom properties for colors, spacing, typography

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.5

### Debug Log References

No debugging required - skeleton implementation was straightforward.

### Completion Notes List

**Implementation Summary:**
- Created 4 component skeleton files with proper ES module exports
- All classes follow constructor configuration object pattern with destructuring defaults
- All methods include JSDoc comments documenting their future purpose
- Implementation logic intentionally omitted (TODO comments) per skeleton-only requirement
- stop() methods include proper clearInterval() cleanup pattern
- Imports added to main.js without breaking existing MVP functionality

**Key Decisions:**
- Used named exports for all classes and functions (matches project patterns)
- Included explicit .js extensions in import paths (required for ES modules)
- Preserved existing API URLs in api-client.js (copied from main.js)
- Added comprehensive JSDoc comments for all public methods and constructors
- All callback properties initialized to null (will be wired in Epic 2)

**Validation Results:**
- ✅ Dev server starts successfully on port 5175
- ✅ Build completes without errors (24.40 kB output)
- ✅ No runtime or compile-time errors detected
- ✅ Existing imports remain intact (utils.js)
- ✅ All acceptance criteria satisfied

**Architecture Foundation:**
- Component structure follows architecture.md specifications exactly
- Timer coordination pattern established (page → item reset)
- Callback communication pattern ready for wiring in Epic 2
- Constructor patterns consistent across all components

### File List

**Created:**
- src/js/carousel-controller.js (CarouselController skeleton)
- src/js/item-highlighter.js (ItemHighlighter skeleton)
- src/js/detail-panel.js (DetailPanel skeleton)
- src/js/api-client.js (API caching module skeleton)

**Modified:**
- src/js/main.js (added component imports with explanatory comments)
- _bmad-output/implementation-artifacts/1-3-create-component-skeleton-files.md (task completion)
- _bmad-output/implementation-artifacts/sprint-status.yaml (status updates)
 - src/index.html (updated by build pipeline during validation)
 - octocat-racer-reference.html (reference HTML for sprite animation)
 - octocat-skater.png (sprite sheet asset referenced by dashboard)
