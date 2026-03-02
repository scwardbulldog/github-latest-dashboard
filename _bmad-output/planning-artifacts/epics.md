---
stepsCompleted: ['step-01-validate-prerequisites', 'step-02-design-epics', 'step-03-create-stories', 'step-04-final-validation']
inputDocuments:
  - '_bmad-output/planning-artifacts/prd.md'
  - '_bmad-output/planning-artifacts/architecture.md'
  - '_bmad-output/planning-artifacts/ux-design-specification.md'
project_name: 'github-latest-dashboard'
user_name: 'Shane'
date: '2026-03-02'
workflowType: 'epics-and-stories'
workflowStatus: 'complete'
requirementsExtracted: true
functionalRequirements: 7
nonFunctionalRequirements: 8
epicsApproved: true
totalEpics: 4
storiesCompleted: true
totalStories: 20
storyCounts:
  epic1: 5
  epic2: 4
  epic3: 5
  epic4: 6
validationStatus: 'passed'
completedAt: '2026-03-02'
---

# github-latest-dashboard - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for github-latest-dashboard, decomposing the requirements from the PRD, Architecture, and UX Design documents into implementable stories.

**Project Context:** Brownfield enhancement of deployed MVP. This epic breakdown focuses on Post-MVP Phase 1: Carousel Evolution (F4-F7).

## Requirements Inventory

### Functional Requirements

#### MVP Features (Already Deployed - F1-F3)

**F1: Dashboard UI - Basic GitHub Styling**
Apply basic GitHub-inspired color scheme and typography to existing dashboard for MVP deployment.

Requirements:
- Apply GitHub-inspired dark theme colors (dark backgrounds, appropriate accent colors)
- Use GitHub-compatible typography and font stack
- Ensure readable layout optimized for TV viewing from walking distance
- Maintain current three-column layout (Blog, Changelog, Status)

**F2: Data Sources - Existing Feeds**
Maintain existing GitHub data source integrations (no changes for MVP).

Current Implementation:
- GitHub Blog - RSS feed via rss2json.com API
- GitHub Changelog - RSS feed via rss2json.com API  
- GitHub Status - REST API from githubstatus.com
- Auto-refresh every 5 minutes
- Display 10 items per section

**F3: Raspberry Pi Kiosk Deployment**
Configure Raspberry Pi to run Chromium in kiosk mode, auto-starting the dashboard on boot.

Requirements:
- Raspberry Pi OS Lite installation
- Chromium browser in kiosk mode (fullscreen, no UI elements)
- Auto-start on boot directly to dashboard
- Hide mouse cursor (unclutter utility)
- Disable screensaver and screen sleep
- Local HTTP server serving the dashboard HTML file
- Connected to guest WiFi network

#### Post-MVP Phase 1 Features (Carousel Evolution - F4-F7)

**F4: Carousel Page Architecture**
Transform single-page layout into multi-page carousel where each page represents a data source (Blog, Changelog, Status).

Requirements:
- Each page displays one data source (replaces simultaneous three-column layout)
- Pages rotate automatically on configurable timer (default: 30 seconds per page)
- Progress bar tracks page-level transitions only
- Progress bar resets when moving to next page
- Page transitions complete within 500ms with fade animation, no visible flicker or content jump
- Page rotation continues indefinitely in cycle

**F5: Split-View Layout**
Each page displays split-view with item list on left and detail view on right.

Requirements:
- Left side: List of items (styled similar to original column layout)
- Right side: Expanded detail view of currently highlighted item
- Left side maintains vertical list format with minimum 16px spacing between items
- Right side provides expanded content area for detailed information
- Layout responsive to maintain readability at TV resolution (1920x1080)
- Split-view proportions: left side 35% width, right side 65% width (configurable via CSS variables)

**F6: Dual Rotation System**
Independent rotation timers for page transitions and item highlighting within pages.

Requirements:
- Page-level timer controls page transitions (independent)
- Item-level timer controls highlighted item within current page (independent)
- Item rotation timer configurable (default: 8 seconds per item)
- Visual indicator shows which item is currently highlighted
- Item rotation cycles through all items on current page
- Item rotation resets when page changes
- Both timers operate independently without interference

**F7: Detail View Rendering System**
Right-side panel dynamically renders detail content for currently highlighted item.

Requirements:
- Detail view updates when highlighted item changes
- Content transitions complete within 200ms using fade effect (opacity 0 to 1)
- Detail view renders full item information: full title, complete timestamp with relative time, full description or summary, direct link URL
- Content formatted for readability: minimum 20px line-height, 16px minimum font size, WCAG AA contrast ratio (4.5:1 for body text)
- Handle missing content gracefully (placeholder message, not broken layout)
- HTML content from RSS feeds properly sanitized and rendered

### Non-Functional Requirements

**TR1: Browser Compatibility**
- Primary target: Chromium on Raspberry Pi OS
- Fallback compatibility: Chrome, Firefox, Edge (for development/testing)

**TR2: Performance Requirements**
- Dashboard page load time: < 2 seconds on Raspberry Pi
- Auto-refresh execution: < 1 second to update content
- No memory leaks over extended runtime (tested for 7+ days continuous operation)

**TR3: Network Requirements**
- Guest WiFi connectivity: minimum 5 Mbps download, 1 Mbps upload (no corporate network access required)
- Network interruption handling: 3 retry attempts with exponential backoff (1s, 2s, 4s), display cached content during outages
- API rate limits: rss2json.com 10,000 requests/day max, GitHub Status API 60 requests/hour max, implement request caching to stay within limits

**TR4: Display Requirements**
- Display resolution: 1920x1080 minimum, scales to 4K (3840x2160)
- Content readable from 10+ feet away: minimum 16px font size for body text, 24px for headings
- High contrast: WCAG AA compliance (4.5:1 ratio for normal text, 3:1 for large text) for visibility in office lighting conditions

**TR5: Reliability Requirements**
- Uptime target: 99.5% (approximately 3.6 hours downtime per month) with auto-recovery from failures
- Automatic restart of browser if it crashes (watchdog checks every 60 seconds)
- Automatic reboot recovery after power outages (auto-relaunch within 2 minutes of power restoration)
- Manual intervention required: no more than once per month for routine maintenance

**TR6: Carousel State Management (Post-MVP)**
- Dual timer architecture: page timer and item timer operate independently
- Timer state persists across auto-refresh cycles (5 minute intervals)
- No timer drift over extended runtime (tested for 24+ hours)
- State resets properly: item timer resets on page change, page timer cycles continuously
- Memory footprint remains stable during continuous rotation (no leaks)

**TR7: Carousel Rendering Performance (Post-MVP)**
- Page transitions complete within 500ms
- Item highlight changes render within 200ms
- Detail view updates without blocking UI thread
- Smooth animations maintain 30+ FPS on Raspberry Pi 3B
- No visual flicker or content jump during transitions

**TR8: Carousel Configuration (Post-MVP)**
- Page rotation timer: configurable 10-120 seconds (default: 30 seconds)
- Item rotation timer: configurable 3-30 seconds (default: 8 seconds)
- Split-view layout proportions: configurable via CSS variables
- Configuration persists across browser refreshes

### Additional Requirements

#### From Architecture Document

**Build Tooling & Project Structure:**
- Multi-file source structure with Vite bundler (build on dev machine, not Pi)
- Source organized in `/src` with `/js` and `/css` subdirectories
- Build output is single `index.html` file (committed to repo for Pi deployment)
- Preserve existing utility functions: `formatDate()`, `stripHtml()`, `truncate()`
- ES6+ JavaScript with ES modules (import/export)
- No TypeScript - vanilla JS simplicity maintained

**Component Architecture:**
- `CarouselController` class: Owns page rotation state and timer (30s default)
- `ItemHighlighter` class: Owns item highlighting state and timer (8s default)
- `DetailPanel` class: Renders expanded detail view on right side
- API Client module: Handles RSS2JSON and GitHub Status API calls with caching
- Utils module: Pure functions for date formatting, HTML stripping, text truncation

**State Management & Communication:**
- Simple setInterval with manual state tracking (no state management library)
- Direct function calls for component communication (no event system)
- Explicit callbacks: `onPageChange`, `onItemHighlight` set in main.js
- In-memory cache with timestamp validation (5-minute TTL per feed)

**Styling System Requirements:**
- GitHub Primer design tokens (CSS custom properties) - MANDATORY
- All colors/spacing MUST use `var(--*)` tokens, zero hardcoded values
- Token definitions in `main.css`, layout/carousel/components in separate files
- CSS transitions for animations (300ms pages, 200ms highlights, 150ms hovers)
- Favor GPU-accelerated properties (opacity, background-color) over expensive ones (transform, box-shadow, filter)

**Error Handling Patterns:**
- Per-column error isolation (one API failure doesn't break others)
- Retry logic: 3 attempts with exponential backoff (1s, 2s, 4s delays)
- Fallback to cached content during network outages
- Visual feedback for network status (offline indicator)
- User-visible error states with GitHub Primer alert/notice styling

**Testing & Validation Strategy:**
- Manual visual testing on dev machine (Vite dev server with hot reload)
- Manual visual testing on Pi (actual TV display from 10-15 foot distance)
- Build validation before deployment (prevents syntax errors)
- 24+ hour burn-in testing for memory stability and timer drift detection
- GitHub Primer validation: side-by-side screenshot comparison with GitHub.com

**Implementation Patterns (Mandatory for Consistency):**
- Naming: camelCase JS, kebab-case CSS, PascalCase classes, UPPER_SNAKE_CASE constants
- Structure: One component per file, explicit imports/exports, no default exports
- Communication: Direct callbacks only, no custom events, null-checks before calling
- CSS: BEM-inspired class names (`.carousel-page`, `.item--highlighted`)

#### From UX Design Document

**Critical User Experience Needs:**
- Instant context recognition within 1-2 seconds of glancing at TV
- Effortless feature spotting (highlighted item obvious without visual search)
- Critical outage visibility regardless of page rotation timing
- Detail panel sufficiency for investigation decision-making
- Comfortable rotation rhythm (never rushed, never stale)

**Visual Design Requirements:**
- GitHub Primer strict adherence (no custom colors or spacing allowed)
- Distance-optimized typography: 16px minimum body text, 20px list titles, 24px detail titles, 32px section headers
- High contrast for 10-15 foot viewing distance (WCAG AA minimum, AAA preferred)
- Smooth transitions (no flashing, no jarring movements, photosensitivity safe)
- Clear page indicators (uppercase section headers with color-coding: BLOG | CHANGELOG | STATUS)

**Emotional Design Goals:**
- Peaceful passive awareness (calm, effortless information consumption without anxiety)
- Calm confidence (trust in system reliability and information freshness)
- Optional engagement (freedom to look or not look without guilt either way)
- Satisfied investigation decisions (sufficient context for relevance assessment)

**Cross-Page Persistent Outage Visibility (Critical UX Challenge):**
- Persistent outage indicator must be visible across all pages (not just Status page)
- Uses GitHub Status page colors and iconography exactly
- Positioned unobtrusively but persistently visible (likely top-right corner)
- Critical service disruptions never hidden by rotation timing
- Indicator appears/disappears dynamically based on actual incident status

### FR Coverage Map

**Foundation (Architecture/Build):**
- Epic 1: Development Infrastructure Setup (enables F4-F7 implementation)

**Carousel Core Features:**
- F4 (Carousel Page Architecture): Epic 2 - Page Rotation System
- F5 (Split-View Layout): Epic 3 - Featured Items with Detail View
- F6 (Dual Rotation System): Epic 3 - Featured Items with Detail View
- F7 (Detail View Rendering System): Epic 3 - Featured Items with Detail View

**Non-Functional Requirements:**
- TR1 (Browser Compatibility): Epic 4 - Production Reliability & Polish
- TR2 (Performance Requirements): Epic 4 - Production Reliability & Polish
- TR3 (Network Requirements): Epic 4 - Production Reliability & Polish
- TR4 (Display Requirements): Epic 4 - Production Reliability & Polish
- TR5 (Reliability Requirements): Epic 4 - Production Reliability & Polish
- TR6 (Carousel State Management): Epic 4 - Production Reliability & Polish
- TR7 (Carousel Rendering Performance): Epic 4 - Production Reliability & Polish
- TR8 (Carousel Configuration): Epic 4 - Production Reliability & Polish

**MVP Features (Already Deployed):**
- F1 (Dashboard UI): Deployed MVP baseline
- F2 (Data Sources): Deployed MVP baseline (preserved in all epics)
- F3 (Raspberry Pi Kiosk): Deployed MVP baseline (deployment unchanged)

## Epic List

### Epic 1: Development Infrastructure Setup

**User Outcome:** Development team has a maintainable, production-ready build system that preserves the reliability and simplicity of the current MVP while enabling carousel evolution.

**FRs covered:** Foundation for F4-F7 (no direct FR, but required by Architecture)

**What Team Members Can Do:**
- Develop carousel features in organized, maintainable multi-file structure
- Test changes locally with hot reload (instant feedback)
- Deploy confidently knowing build validation prevents broken code
- Maintain existing Pi deployment workflow (no changes to git pull automation)

**Implementation Foundation:**
- Vite multi-file source structure with single-file build output
- Component skeleton structure: CarouselController, ItemHighlighter, DetailPanel, API Client, Utils
- GitHub Primer token definitions in CSS (strict adherence enforcement)
- Preserve existing utility functions: formatDate(), stripHtml(), truncate()
- Build validation prevents syntax errors before deployment
- Pi deployment workflow unchanged (git pull + restart still works)

**Success Criteria:**
- npm run dev starts local dev server with hot reload
- npm run build produces working index.html identical to current MVP
- Built artifact runs on Pi without issues
- Source organized in /src/js and /src/css directories
- All GitHub Primer tokens defined in main.css

---

### Epic 2: Page Rotation System

**User Outcome:** Team members see one full-screen page at a time (Blog, Changelog, or Status) that automatically rotates every 30 seconds, with clear visual indication of which page they're viewing and where they are in the rotation cycle.

**FRs covered:** F4 (Carousel Page Architecture)

**What Team Members Can Do:**
- Walk by and instantly know which GitHub data source they're viewing (Blog, Changelog, or Status)
- Trust the rotation cycle is working (progress bar shows position)
- See dedicated full-screen content for each data source (no more three-column cramming)
- Understand rotation timing (30-second cycle is comfortable, not rushed)

**Implementation Components:**
- CarouselController class with 30-second setInterval timer
- Three distinct page views (Blog page, Changelog page, Status page)
- Smooth 500ms CSS fade transitions between pages (no flicker)
- Progress bar showing rotation state (animates page-level transitions)
- Page header with clear identity: BLOG | CHANGELOG | STATUS (uppercase, color-coded)
- Maintains existing data feeds and 5-minute refresh (no API changes)

**Success Criteria:**
- Pages rotate every 30 seconds in cycle: Blog → Changelog → Status → Blog
- Page transitions complete within 500ms with smooth fade
- Current page identity obvious within 1 second of glancing
- Progress bar accurately tracks page position
- No timer drift over 1+ hour observation
- Page rotation continues during 5-minute API refresh

---

### Epic 3: Featured Items with Detail View

**User Outcome:** Team members see one item highlighted at a time within each page, with expanded details displayed in a dedicated panel, allowing them to absorb more context during coffee break pauses without overwhelming quick passers.

**FRs covered:** F5 (Split-View Layout), F6 (Dual Rotation System), F7 (Detail View Rendering System)

**What Team Members Can Do:**
- Quickly scan item list on left side for headlines (quick passers)
- Read expanded detail content on right side for featured item (coffee break lingerers)
- Understand which item is currently featured (clear highlight indicator)
- Absorb sufficient context to decide "investigate at desk" vs "not relevant"
- Trust item rotation timing (8 seconds per item is comfortable reading pace)

**Implementation Components:**
- Split-view layout: 35% list view (left) + 65% detail panel (right)
- ItemHighlighter class with 8-second setInterval timer (independent of page timer)
- Highlighted item visual treatment: brighter background, bold weight, optional border accent
- Detail panel rendering: full title, complete timestamp, full description, link URL
- 200ms smooth transitions for highlight changes (opacity fade)
- Item rotation resets when page changes (coordinated via onPageChange callback)
- Dual timer coordination: page timer and item timer operate independently

**Success Criteria:**
- Split-view layout maintains 35/65 proportions at 1920x1080
- Highlighted item obvious without visual search (brightest element on page)
- Item highlighting cycles through all items on current page
- Detail panel updates within 200ms when highlight changes
- Item timer resets to 0 when page transition occurs
- Content readable from 10-15 feet (16px minimum font size, WCAG AA contrast)
- HTML content from RSS feeds properly sanitized and rendered
- Missing content shows graceful placeholder (not broken layout)

---

### Epic 4: Production Reliability & Polish

**User Outcome:** Team members trust the dashboard to run 24/7 without intervention, with graceful handling of network issues, clear error feedback, and performance optimized for comfortable viewing from 10-15 feet away.

**FRs covered:** All NFRs (TR1-TR8)

**What Team Members Can Do:**
- Trust dashboard runs reliably overnight and weekends (no manual restarts)
- See critical GitHub outages immediately regardless of page rotation timing
- Trust information is current (clear "last updated" indicators)
- Read content comfortably from 10-15 feet (optimized typography and contrast)
- Understand network status during WiFi interruptions (graceful degradation)
- Rely on cached content when network temporarily unavailable

**Implementation Components:**
- Per-column error isolation with retry logic (3 attempts, 1s/2s/4s exponential backoff)
- In-memory caching with 5-minute TTL and graceful fallback to stale data
- Network status indicators during WiFi interruptions (non-alarming visual feedback)
- Cross-page persistent outage indicator (critical GitHub incidents visible on all pages)
- Performance optimization for Pi 3B: 30+ FPS animations, no memory leaks
- Distance-optimized typography: 16px body, 20px list titles, 24px detail titles, 32px headers
- High contrast: WCAG AA minimum (4.5:1), AAA preferred for distance viewing
- Timer state persistence across 5-minute API refresh cycles
- 24+ hour burn-in testing for memory stability and timer drift
- GitHub Primer strict validation (side-by-side comparison with GitHub.com)

**Success Criteria:**
- Dashboard runs 24+ hours without memory leaks or performance degradation
- API failures in one column don't break other columns
- Network interruptions display cached content with clear status indicator
- Active GitHub outages visible across all pages (not just Status page)
- Page/item timers maintain accuracy over 24+ hours (no drift)
- Typography readable from 10-15 feet actual distance test
- Smooth 30+ FPS animations on Pi 3B hardware
- Build succeeds with zero hardcoded colors/spacing (all use Primer tokens)
- Pi auto-recovery after power outage (restarts within 2 minutes)
- Manual intervention required < once per month

---

## Epic 1: Development Infrastructure Setup

**Epic Goal:** Development team has a maintainable, production-ready build system that preserves the reliability and simplicity of the current MVP while enabling carousel evolution.

### Story 1.1: Initialize Vite Build System

As a developer,
I want a Vite build system configured to bundle multi-file source into a single deployable HTML file,
So that I can develop carousel features in organized modules while maintaining the simple deployment model.

**Acceptance Criteria:**

**Given** I have Node.js and npm installed on my development machine
**When** I run `npm install`
**Then** Vite and required dependencies are installed successfully
**And** package.json includes vite dependency and build scripts (dev, build, preview)

**Given** I have a configured vite.config.js file
**When** I run `npm run build`
**Then** a single index.html file is produced in the project root
**And** the index.html contains inlined CSS and JavaScript (no external files)
**And** the file size is reasonable (< 500KB for initial build)

**Given** the Vite dev server is running
**When** I run `npm run dev`
**Then** the dev server starts on localhost:5173
**And** hot module replacement works for CSS and JS changes
**And** the browser automatically refreshes when files are modified

**Given** I want to test the production build locally
**When** I run `npm run build && npm run preview`
**Then** the built index.html is served on a local preview server
**And** the built artifact behaves identically to the dev server

**Given** the build process completes
**When** I inspect the output index.html
**Then** it contains no references to external CSS or JS files
**And** all assets are inlined in the single HTML file
**And** the file is ready to commit to git for Pi deployment

---

### Story 1.2: Migrate Current MVP to Source Structure

As a developer,
I want the existing MVP dashboard migrated to the new /src structure without changing functionality,
So that I have a working baseline in the new architecture before adding carousel features.

**Acceptance Criteria:**

**Given** the current MVP index.html exists with inline CSS and JavaScript
**When** I extract the CSS to src/css/main.css
**Then** all existing styles are preserved exactly
**And** no visual differences appear in the rendered dashboard
**And** the main.css file is referenced in src/index.html

**Given** the current MVP has inline JavaScript
**When** I extract the JavaScript to src/js/main.js
**Then** all existing functionality works identically (data fetching, display, auto-refresh)
**And** the three-column layout renders correctly
**And** no console errors appear

**Given** I have existing utility functions (formatDate, stripHtml, truncate)
**When** I move them to src/js/utils.js as ES6 module exports
**Then** they are exported correctly: `export function formatDate(...)`, etc.
**And** they are imported in main.js: `import { formatDate, stripHtml, truncate } from './utils.js'`
**And** all existing calls to these functions continue to work

**Given** the source is migrated to /src structure
**When** I run `npm run build`
**Then** the output index.html is functionally identical to the original MVP
**And** all three columns display correctly (Blog, Changelog, Status)
**And** data fetches successfully from all APIs
**And** auto-refresh works every 5 minutes

**Given** I deploy the built index.html to the Pi
**When** I access the dashboard in Chromium kiosk mode
**Then** the dashboard displays and functions exactly as the original MVP
**And** no visual or functional regressions occur
**And** the Pi deployment workflow (git pull + restart) remains unchanged

---

### Story 1.3: Create Component Skeleton Files

As a developer,
I want skeleton files for all carousel components created with proper structure and exports,
So that I have a clear architecture foundation for implementing carousel features.

**Acceptance Criteria:**

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

---

### Story 1.4: Define GitHub Primer Design Tokens

As a developer,
I want all GitHub Primer design tokens defined as CSS custom properties,
So that I can enforce strict token usage throughout carousel implementation and maintain GitHub authenticity.

**Acceptance Criteria:**

**Given** I need GitHub Primer color tokens
**When** I define them in src/css/main.css under :root
**Then** all foundation colors are defined:
- `--color-canvas-default: #0d1117` (background)
- `--color-canvas-subtle: #161b22` (elevated surfaces)
- `--color-fg-default: #c9d1d9` (primary text)
- `--color-fg-muted: #7d8590` (secondary text)
- `--color-border-default: #21262d` (subtle borders)
**And** all semantic colors are defined:
- `--color-accent-fg: #58a6ff` (links)
- `--color-success-fg: #2da44e` (operational)
- `--color-attention-fg: #bf8700` (degraded)
- `--color-danger-fg: #cf222e` (critical)
- `--color-sponsor-fg: #8250df` (special emphasis)

**Given** I need spacing tokens
**When** I define them in src/css/main.css
**Then** the 8px base spacing scale is defined:
- `--space-1: 4px`
- `--space-2: 8px`
- `--space-3: 16px`
- `--space-4: 24px`
- `--space-5: 32px`
- `--space-6: 40px`
- `--space-8: 64px`

**Given** I need typography tokens
**When** I define them in src/css/main.css
**Then** font size tokens are defined:
- `--fontsize-h1: 32px` (section headers)
- `--fontsize-h2: 24px` (detail titles)
- `--fontsize-h3: 20px` (list titles)
- `--fontsize-base: 16px` (body text)
- `--fontsize-small: 14px` (metadata)
**And** font weight tokens are defined:
- `--fontweight-normal: 400`
- `--fontweight-semibold: 600`
**And** line height tokens are defined:
- `--lineheight-condensed: 1.25`
- `--lineheight-default: 1.5`

**Given** I need GitHub's font stack
**When** I define it in src/css/main.css
**Then** the exact GitHub Primer font-family is applied to body:
```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", 
             Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji";
```

**Given** all tokens are defined
**When** I verify the existing MVP styles
**Then** no hardcoded color hex values exist outside token definitions
**And** no hardcoded pixel spacing values exist for padding/margin
**And** all styles reference tokens via `var(--token-name)`
**And** the build process includes these tokens in the final HTML

**Given** I want to validate GitHub Primer fidelity
**When** I compare token values to primer.style/design/color
**Then** all color values match GitHub Primer dark theme exactly
**And** spacing values follow the 8px base unit system
**And** typography scale aligns with GitHub standards

---

### Story 1.5: Validate Build Pipeline & Deployment

As a developer,
I want comprehensive validation that the build pipeline works correctly and deploys safely to the Pi,
So that I have confidence in the infrastructure before implementing carousel features.

**Acceptance Criteria:**

**Given** the migrated source code exists in /src
**When** I run `npm run dev`
**Then** the dev server starts without errors
**And** the dashboard displays in the browser at localhost:5173
**And** all three columns render correctly (Blog, Changelog, Status)
**And** hot reload works when I modify CSS or JS files
**And** no console errors appear

**Given** I make a CSS change in src/css/main.css
**When** I save the file
**Then** the browser updates automatically within 1 second
**And** the CSS change is visible without manual refresh
**And** no page reload occurs (HMR works correctly)

**Given** I want to create a production build
**When** I run `npm run build`
**Then** the build completes successfully in < 10 seconds
**And** index.html is created in the project root
**And** the file size is reasonable (< 500KB)
**And** no build errors or warnings appear

**Given** the built index.html exists
**When** I open it directly in a browser (file:// protocol)
**Then** the dashboard loads and displays correctly
**And** API calls work (no CORS issues)
**And** data fetches from all three sources
**And** auto-refresh continues to work every 5 minutes

**Given** I want to test on the Raspberry Pi
**When** I commit index.html to git and push to main
**Then** the commit succeeds without conflicts
**And** the file is pushed to GitHub successfully

**Given** the Pi pulls the latest code
**When** the Pi runs `git pull origin main`
**Then** the new index.html is downloaded
**And** Python http.server serves it at localhost:8000
**And** Chromium loads it in kiosk mode
**And** the dashboard displays identically to the dev environment
**And** all functionality works (data fetching, auto-refresh)

**Given** I want to ensure no regressions
**When** I compare the new build to the original MVP
**Then** all visual elements match exactly (colors, spacing, typography)
**And** all three columns display the same content
**And** timestamps format identically
**And** links are styled the same way
**And** no functional differences exist

**Given** the infrastructure is validated
**When** I review the .gitignore file
**Then** node_modules/ is ignored
**And** index.html is NOT ignored (committed for Pi deployment)
**And** package-lock.json is committed for reproducible builds

**Given** I want to document the setup
**When** I check the README.md
**Then** development workflow is documented (npm install, npm run dev, npm run build)
**And** deployment workflow is explained (build → commit → push → Pi pulls)
**And** prerequisites are listed (Node.js version requirements)

---

## Epic 2: Page Rotation System

**Epic Goal:** Team members see one full-screen page at a time (Blog, Changelog, or Status) that automatically rotates every 30 seconds, with clear visual indication of which page they're viewing and where they are in the rotation cycle.

### Story 2.1: Implement Page Layout Structure

As a team member,
I want to see three distinct full-screen pages (Blog, Changelog, Status) instead of three columns,
So that I can focus on one data source at a time with better readability.

**Acceptance Criteria:**

**Given** the dashboard HTML structure is being refactored
**When** I create three separate page containers in src/index.html
**Then** each page has a unique ID: `id="page-blog"`, `id="page-changelog"`, `id="page-status"`
**And** each page has class `.carousel-page`
**And** only one page is visible at a time (others have `display: none`)
**And** the active page has class `.carousel-page.active`

**Given** I need page headers for context
**When** I create header elements for each page
**Then** Blog page header displays "BLOG" in uppercase with letter-spacing
**And** Changelog page header displays "CHANGELOG" in uppercase
**And** Status page header displays "STATUS" in uppercase
**And** each header uses GitHub Primer color tokens for section identity
**And** headers use --fontsize-h1 (32px) and --fontweight-semibold (600)

**Given** I need to structure content within each page
**When** I create content containers for each page
**Then** Blog page contains a container for blog items: `class="page-content"`
**And** Changelog page contains a container for changelog items
**And** Status page contains a container for status items
**And** each container uses GitHub Primer spacing tokens (--space-4 padding)

**Given** page layout CSS is needed
**When** I create src/css/layout.css
**Then** `.carousel-page` has `display: none` by default
**And** `.carousel-page.active` has `display: block`
**And** pages take full viewport height minus header
**And** layout uses CSS Grid or Flexbox for structure
**And** all spacing uses GitHub Primer tokens (no hardcoded pixels)

**Given** the page structure is complete
**When** I load the dashboard in the browser
**Then** only the Blog page is visible initially (has `.active` class)
**And** Changelog and Status pages are hidden
**And** the Blog page header displays prominently
**And** the layout is readable from 10+ feet away

---

### Story 2.2: Implement CarouselController with Timer

As a developer,
I want a working CarouselController that automatically rotates through pages every 30 seconds,
So that team members see all three data sources in a continuous cycle.

**Acceptance Criteria:**

**Given** I need the CarouselController to manage rotation
**When** I implement the start() method
**Then** it initializes setInterval with 30000ms (30 seconds)
**And** the interval ID is stored in this.timer
**And** the interval calls this.rotatePage() on each tick
**And** the timer starts immediately when start() is called

**Given** I need the page rotation logic
**When** I implement the rotatePage() method
**Then** it increments this.currentPage: `(currentPage + 1) % 3`
**And** it removes `.active` class from the current page element
**And** it adds `.active` class to the next page element
**And** it updates the page visibility correctly
**And** it triggers the onPageChange callback if defined: `if (this.onPageChange) this.onPageChange(pageName)`

**Given** I need to stop the rotation
**When** I implement the stop() method
**Then** it clears the interval: `clearInterval(this.timer)`
**And** it sets this.timer to null
**And** rotation stops immediately

**Given** I need to initialize the carousel
**When** I instantiate CarouselController in main.js
**Then** it accepts interval parameter: `new CarouselController(30000)`
**And** the pages array is set: `['blog', 'changelog', 'status']`
**And** currentPage is initialized to 0 (Blog page)
**And** start() is called to begin rotation

**Given** the carousel is running
**When** 30 seconds elapse
**Then** the page transitions from Blog to Changelog
**And** after another 30 seconds it transitions to Status
**And** after another 30 seconds it returns to Blog (cycles continuously)
**And** the rotation continues indefinitely without stopping

**Given** I want to verify timer accuracy
**When** I observe the dashboard for 5 minutes
**Then** pages rotate exactly every 30 seconds (use stopwatch to verify)
**And** no timer drift occurs
**And** rotation timing is consistent across cycles

---

### Story 2.3: Implement Page Transitions

As a team member,
I want smooth fade transitions between pages,
So that the rotation feels natural and comfortable rather than jarring.

**Acceptance Criteria:**

**Given** I need CSS transitions for pages
**When** I create src/css/carousel.css
**Then** `.carousel-page` has `opacity: 0` and `transition: opacity 300ms ease`
**And** `.carousel-page.active` has `opacity: 1`
**And** the transition duration is exactly 300ms (matches GitHub timing)
**And** the easing function is `ease` (standard CSS easing)

**Given** I need to coordinate JS with CSS transitions
**When** I update rotatePage() method
**Then** it first removes `.active` from current page (fade out starts)
**And** it uses setTimeout(300ms) to wait for fade out completion
**And** after timeout, it sets `display: none` on previous page
**And** it sets `display: block` on next page
**And** it uses requestAnimationFrame to add `.active` to next page (fade in starts)

**Given** transitions complete
**When** a page transition occurs
**Then** the fade out completes within 300ms
**And** the fade in completes within 300ms
**And** total transition time is ~300ms (overlapping fades)
**And** no flicker or visual artifacts appear
**And** no content jump occurs during transition

**Given** I want smooth visual experience
**When** I observe multiple page transitions
**Then** each transition feels smooth and natural
**And** the timing feels comfortable (not too fast, not too slow)
**And** transitions never feel jarring or disruptive
**And** the animation maintains 30+ FPS on Raspberry Pi

**Given** transitions work during data refresh
**When** the 5-minute API refresh occurs during a page
**Then** page rotation continues uninterrupted
**And** the currently visible page updates with new content
**And** transitions remain smooth during data fetch
**And** no visual glitches occur

---

### Story 2.4: Implement Rotation Progress Indicator

As a team member,
I want a visual progress bar showing where I am in the rotation cycle,
So that I understand the rotation state and timing at a glance.

**Acceptance Criteria:**

**Given** I need a progress bar element
**When** I add it to src/index.html
**Then** it appears in the header area of each page
**And** it has structure: `<div class="progress-container"><div class="progress-bar"></div></div>`
**And** the progress-container has fixed height (4px) and full width
**And** the progress-bar fills from 0% to 100% width over 30 seconds

**Given** I need progress bar styling
**When** I create styles in src/css/components.css
**Then** `.progress-container` uses `background: var(--color-border-default)` (subtle background)
**And** `.progress-bar` uses `background: var(--color-accent-fg)` (GitHub blue)
**And** progress-bar has `transition: width 100ms linear` for smooth animation
**And** progress-bar height matches container (4px)

**Given** I need to animate the progress
**When** I implement updateProgress() method in CarouselController
**Then** it calculates progress percentage: `(elapsedTime / interval) * 100`
**And** it updates progress-bar width: `progressBar.style.width = '${progress}%'`
**And** it calls requestAnimationFrame for smooth updates
**And** progress updates approximately every 100ms (10fps is sufficient)

**Given** the carousel rotates
**When** a new page becomes active
**Then** progress resets to 0%
**And** progress animates from 0% to 100% over 30 seconds
**And** progress bar fills smoothly without stuttering
**And** progress bar reaches 100% exactly when page transition occurs

**Given** I want accurate progress indication
**When** I observe the progress bar
**Then** it moves at constant speed (linear progression)
**And** it accurately represents time remaining in current page
**And** it resets cleanly when page changes (no visual jump)
**And** it continues accurately across multiple rotation cycles

**Given** progress indication works during refresh
**When** the 5-minute API refresh occurs
**Then** progress bar continues moving without interruption
**And** timer state persists across refresh
**And** progress accuracy is maintained

---

## Epic 3: Featured Items with Detail View

**Epic Goal:** Team members see one item highlighted at a time within each page, with expanded details displayed in a dedicated panel, allowing them to absorb more context during coffee break pauses without overwhelming quick passers.

### Story 3.1: Implement Split-View Layout

As a team member,
I want each page divided into a list view (left) and detail panel (right),
So that I can scan headlines quickly or read detailed content during pauses.

**Acceptance Criteria:**

**Given** I need split-view layout structure
**When** I update each page container in src/index.html
**Then** each page has two sections: `<div class="list-view">` and `<div class="detail-panel">`
**And** list-view contains the item list (Blog items, Changelog items, or Status items)
**And** detail-panel contains placeholder for featured content
**And** both sections are wrapped in a parent `<div class="split-view-container">`

**Given** I need split-view CSS layout
**When** I update src/css/layout.css
**Then** `.split-view-container` uses CSS Grid: `display: grid; grid-template-columns: 35% 65%;`
**And** list-view has width 35% (720px at 1920x1080)
**And** detail-panel has width 65% (1120px at 1920x1080)
**And** a vertical divider separates them: `border-right: 1px solid var(--color-border-default)` on list-view
**And** both sections have appropriate padding using GitHub Primer spacing tokens

**Given** I need list view item structure
**When** I create item elements in list-view
**Then** each item has class `.list-item`
**And** items display in vertical stack with `gap: var(--space-2)` (8px)
**And** each item shows: title, timestamp, truncated description (optional)
**And** items use GitHub Primer typography tokens (--fontsize-h3 for titles)

**Given** I need detail panel structure
**When** I create the detail-panel container
**Then** it has class `.detail-panel`
**And** it includes sections for: title, timestamp, full description, link
**And** it uses --color-canvas-subtle as background (elevated surface)
**And** it has generous padding: `var(--space-5)` (32px)

**Given** the split-view is rendered
**When** I load a page in the browser
**Then** the 35/65 proportions are correct at 1920x1080 resolution
**And** list-view items are readable from 10+ feet
**And** detail-panel content has appropriate spacing for TV viewing
**And** the vertical divider is subtle but visible
**And** the layout feels balanced and comfortable

---

### Story 3.2: Implement ItemHighlighter with Timer

As a developer,
I want an ItemHighlighter that cycles through items every 8 seconds with clear visual indication,
So that team members know which item is currently featured in the detail panel.

**Acceptance Criteria:**

**Given** I need ItemHighlighter to manage highlighting
**When** I implement the start() method
**Then** it accepts itemCount parameter
**And** it initializes setInterval with 8000ms (8 seconds)
**And** the interval ID is stored in this.timer
**And** currentItem is initialized to 0

**Given** I need item highlighting logic
**When** I implement the highlightNext() method
**Then** it increments currentItem: `(currentItem + 1) % itemCount`
**And** it removes `.item--highlighted` class from previous item
**And** it adds `.item--highlighted` class to current item
**And** it triggers onItemHighlight callback with item data: `if (this.onItemHighlight) this.onItemHighlight(item)`

**Given** I need to reset highlighting when page changes
**When** I implement the reset() method
**Then** it calls stop() to clear the interval
**And** it resets currentItem to 0
**And** it removes `.item--highlighted` from all items
**And** highlighting state is completely cleared

**Given** I need highlighting styles
**When** I create styles in src/css/components.css
**Then** `.list-item` has `background: var(--color-canvas-default)` by default
**And** `.list-item` has `transition: background 200ms ease, font-weight 200ms ease`
**And** `.list-item--highlighted` has `background: var(--color-canvas-subtle)` (brighter)
**And** `.list-item--highlighted` has `font-weight: var(--fontweight-semibold)` (bold)
**And** optionally `.list-item--highlighted` has `border-left: 3px solid var(--color-accent-fg)`

**Given** I need to coordinate with CarouselController
**When** page rotation occurs in CarouselController
**Then** carousel calls `itemHighlighter.reset()`
**And** item highlighting stops for the previous page
**And** highlighting starts fresh on the new page at item 0

**Given** I initialize ItemHighlighter in main.js
**When** a page becomes active
**Then** ItemHighlighter.start() is called with the item count for that page
**And** first item (index 0) is highlighted immediately
**And** highlighting begins cycling every 8 seconds

**Given** highlighting is active
**When** 8 seconds elapse
**Then** the highlight moves to the next item in the list
**And** the transition is smooth (200ms)
**And** only one item is highlighted at a time
**And** highlighting cycles through all items then returns to first

---

### Story 3.3: Implement Detail Panel Rendering

As a team member,
I want the detail panel to show expanded content for the currently highlighted item,
So that I can read full details during coffee break pauses.

**Acceptance Criteria:**

**Given** I need DetailPanel class implementation
**When** I implement the render() method
**Then** it accepts an item object parameter
**And** it extracts: title, timestamp, description, link from the item
**And** it updates the detail panel DOM with this content
**And** it applies proper HTML sanitization to description content

**Given** I need detail panel content structure
**When** render() populates the detail panel
**Then** title is displayed with class `.detail-panel__title` using --fontsize-h2 (24px)
**And** timestamp is displayed with class `.detail-panel__timestamp` using --fontsize-small (14px) and --color-fg-muted
**And** full description is displayed with class `.detail-panel__content` using --fontsize-base (16px)
**And** link is displayed with class `.detail-panel__link` using --color-accent-fg

**Given** I need content transitions
**When** the highlighted item changes
**Then** detail panel content fades out (opacity 0) in 100ms
**And** content is replaced with new item data
**And** detail panel content fades in (opacity 1) in 100ms
**And** total transition time is ~200ms

**Given** I need to handle missing content
**When** an item has no description
**Then** detail panel shows placeholder: "No description available"
**And** the layout doesn't break or show raw HTML
**And** other fields (title, timestamp, link) still display correctly

**Given** I need to sanitize HTML content
**When** RSS feed description contains HTML tags
**Then** HTML is properly sanitized (no script tags, safe HTML only)
**And** basic formatting is preserved (paragraphs, line breaks)
**And** links in content are clickable (though passive display context)
**And** no XSS vulnerabilities exist

**Given** I wire up ItemHighlighter and DetailPanel
**When** ItemHighlighter highlights a new item
**Then** it calls `detailPanel.render(item)` via onItemHighlight callback
**And** detail panel updates within 200ms
**And** the transition is smooth and doesn't block the UI thread

**Given** detail panel rendering is complete
**When** I observe the dashboard
**Then** featured item in list is visually distinct (highlighted)
**And** detail panel shows corresponding content
**And** content is readable from 10+ feet (16px minimum font)
**And** typography follows GitHub Primer hierarchy

---

### Story 3.4: Implement Dual Timer Coordination

As a developer,
I want page timer and item timer to operate independently without interference,
So that rotation and highlighting work smoothly together.

**Acceptance Criteria:**

**Given** I need independent timers
**When** both CarouselController and ItemHighlighter are running
**Then** CarouselController.timer operates on 30-second interval
**And** ItemHighlighter.timer operates on 8-second interval
**And** neither timer interferes with the other
**And** both timers maintain accurate timing

**Given** I need timer coordination on page change
**When** CarouselController rotates to next page
**Then** it calls `itemHighlighter.reset()` via onPageChange callback
**And** item timer is cleared and reset to 0
**And** page timer continues running (not affected by item reset)
**And** itemHighlighter.start() is called with new page's item count

**Given** I need to wire callbacks in main.js
**When** I set up component coordination
**Then** `carousel.onPageChange` is set to a function that calls `highlighter.reset()` and `highlighter.start(itemCount)`
**And** `highlighter.onItemHighlight` is set to a function that calls `detailPanel.render(item)`
**And** all callbacks are wired before calling start() methods

**Given** timers are coordinated
**When** a page transition occurs mid-item-cycle
**Then** page transition completes normally (30s timer)
**And** item highlighting resets immediately
**And** new page's first item is highlighted instantly
**And** item timer starts fresh (begins 8s countdown from 0)

**Given** I need timing verification
**When** I observe the dashboard for 5+ minutes
**Then** page rotations occur exactly every 30 seconds
**And** item highlights occur exactly every 8 seconds on each page
**And** no timer drift accumulates over time
**And** timers remain independent (item timer doesn't affect page timer)

**Given** timers work during API refresh
**When** the 5-minute data refresh occurs
**Then** both timers continue running without interruption
**And** content updates don't reset or interfere with timer state
**And** page and item positions are preserved across refreshes

---

### Story 3.5: Integrate Data Flow from API

As a team member,
I want list items and detail panel content populated from actual API data,
So that I see real GitHub updates in the carousel.

**Acceptance Criteria:**

**Given** I need to fetch data for all pages
**When** the dashboard initializes in main.js
**Then** it calls `fetchBlog()`, `fetchChangelog()`, `fetchStatus()` in parallel
**And** it uses Promise.all to wait for all fetches
**And** data is cached in api-client.js (5-minute TTL)
**And** API errors are handled per-column (one failure doesn't break others)

**Given** I need to populate Blog page
**When** blog data is fetched successfully
**Then** each blog item is rendered in list-view with title and timestamp
**And** items use formatDate() to display "5 hours ago" format
**And** items are truncated if needed using truncate() function
**And** Blog page has at least 10 items visible

**Given** I need to populate Changelog page
**When** changelog data is fetched successfully
**Then** each changelog item is rendered with title and timestamp
**And** HTML content is stripped using stripHtml() for list view
**And** full HTML content is available for detail panel rendering
**And** Changelog page has at least 10 items visible

**Given** I need to populate Status page
**When** status data is fetched successfully
**Then** each status component is rendered with name and status indicator
**And** operational status shows green indicator: `background: var(--color-success-fg)`
**And** degraded status shows yellow indicator: `background: var(--color-attention-fg)`
**And** major outage shows red indicator: `background: var(--color-danger-fg)`
**And** incident details are available in detail panel

**Given** I need auto-refresh to continue working
**When** 5 minutes elapse
**Then** API fetches are triggered again
**And** new data updates the currently visible page
**And** page rotation continues without interruption
**And** item highlighting continues without interruption
**And** timer states are preserved

**Given** data fetching fails for one source
**When** the Blog API returns an error
**Then** Blog page shows error message: "Unable to load blog posts"
**And** Changelog and Status pages continue working normally
**And** Page rotation includes Blog page but shows error state
**And** error message uses GitHub Primer alert styling

**Given** all data is loaded
**When** I navigate through all three pages
**Then** each page displays real GitHub data
**And** list items show actual headlines
**And** detail panel shows actual content
**And** timestamps are current and accurate
**And** all content is readable from 10+ feet

---

## Epic 4: Production Reliability & Polish

**Epic Goal:** Team members trust the dashboard to run 24/7 without intervention, with graceful handling of network issues, clear error feedback, and performance optimized for comfortable viewing from 10-15 feet away.

### Story 4.1: Implement Error Handling & Retry Logic

As a team member,
I want the dashboard to gracefully handle network failures with clear feedback,
So that I understand the system status even during WiFi interruptions.

**Acceptance Criteria:**

**Given** I need retry logic in api-client.js
**When** an API fetch fails
**Then** it retries up to 3 times
**And** delays between retries are: 1s, 2s, 4s (exponential backoff)
**And** each retry uses await setTimeout() pattern
**And** after 3 failures, it throws the error to the caller

**Given** I need fallback to cached data
**When** all retries fail for an API call
**Then** it checks if cached data exists: `if (cache[source].data)`
**And** it returns cached data even if stale
**And** it logs a warning: "Using stale cached data"
**And** displayed content shows "Last updated X minutes ago"

**Given** I need per-column error isolation
**When** the Blog API fails completely
**Then** Blog page shows error: "Unable to load blog posts. Showing cached content."
**And** error uses GitHub Primer danger color: `--color-danger-fg`
**And** error includes last successful fetch timestamp
**And** Changelog and Status pages continue working normally

**Given** I need network status indicator
**When** a fetch fails and cached data is used
**Then** a status indicator appears in the header
**And** indicator shows: "⚠️ Network issues - showing cached content"
**And** indicator uses `--color-attention-fg` (yellow, not alarming)
**And** indicator disappears when connectivity is restored

**Given** network recovers
**When** the next fetch succeeds after failures
**Then** fresh data replaces cached content
**And** network status indicator disappears
**And** "Last updated" timestamp shows current time
**And** error messages are cleared

**Given** I test network interruption
**When** I disconnect WiFi while dashboard is running
**Then** current page continues displaying with cached content
**And** network indicator appears within 10 seconds
**And** page rotation continues normally
**And** item highlighting continues normally
**And** no JavaScript errors appear in console

---

### Story 4.2: Implement Performance Optimization

As a team member,
I want the dashboard to run smoothly on Raspberry Pi hardware,
So that animations are fluid and the system is responsive.

**Acceptance Criteria:**

**Given** I need smooth page transitions
**When** page rotation occurs
**Then** the fade animation maintains 30+ FPS on Pi 3B
**And** transition completes within 500ms
**And** no visual stuttering or frame drops occur
**And** CPU usage remains reasonable (< 50% spike)

**Given** I need smooth item highlighting
**When** item highlight changes
**Then** the transition maintains 30+ FPS
**And** transition completes within 200ms
**And** no lag or delay is perceptible
**And** highlighting doesn't block other UI updates

**Given** I need memory stability
**When** the dashboard runs for 24+ hours
**Then** memory usage remains stable (no continuous growth)
**And** no event listener leaks exist
**And** timers are properly cleaned up if components are destroyed
**And** DOM references don't accumulate

**Given** I need to avoid expensive CSS
**When** I review all CSS styles
**Then** no box-shadow properties are used (expensive on Pi)
**And** no complex filter effects are used
**And** no complex transform animations are used
**And** only opacity and background-color transitions exist (GPU accelerated)

**Given** I need efficient DOM updates
**When** content updates during refresh
**Then** only changed elements are re-rendered (no full page rebuild)
**And** innerHTML updates are batched where possible
**And** no layout thrashing occurs (read/write DOM in batches)

**Given** I test performance on Pi
**When** I run the dashboard on actual Pi 3B hardware
**Then** initial page load completes in < 2 seconds
**And** API refresh completes in < 1 second
**And** animations feel smooth (no perceived lag)
**And** the system remains responsive after 24+ hours

---

### Story 4.3: Implement Cross-Page Persistent Outage Indicator

As a team member,
I want to see critical GitHub outages immediately regardless of which page I'm viewing,
So that I never miss urgent service disruptions due to rotation timing.

**Acceptance Criteria:**

**Given** I need a persistent outage indicator element
**When** I add it to src/index.html
**Then** it's positioned at top-right corner of viewport
**And** it has class `.persistent-alert`
**And** it's visible across all three pages (not inside page containers)
**And** it uses position: fixed or absolute positioning

**Given** I need to detect active outages
**When** status data is fetched
**Then** I check each component for `status !== "operational"`
**And** I identify major outages: `status === "major_outage"`
**And** I identify degraded performance: `status === "degraded_performance"`
**And** I store active incidents in a variable

**Given** an active outage exists
**When** the outage indicator should appear
**Then** it displays: "⚠️ GitHub [Service Name]: [Status]"
**And** major outages use `background: var(--color-danger-fg)` (red)
**And** degraded status uses `background: var(--color-attention-fg)` (yellow)
**And** text is white for contrast: `color: #ffffff`
**And** indicator is prominent but not alarming

**Given** multiple outages exist
**When** more than one service is affected
**Then** indicator shows count: "⚠️ 3 GitHub Services Affected"
**And** clicking opens detail (optional for passive display)
**And** most severe status determines color (major > degraded > operational)

**Given** the indicator is visible
**When** page rotation occurs
**Then** indicator remains visible across all pages
**And** indicator position is fixed (doesn't move during transitions)
**And** indicator doesn't interfere with page content readability

**Given** outages are resolved
**When** status data updates and no incidents remain
**Then** indicator fades out and disappears
**And** removal uses smooth transition: `opacity 300ms ease`
**And** no indicator is shown when all services are operational

**Given** I test with mock outage data
**When** I simulate a major outage in GitHub Status API response
**Then** indicator appears within 10 seconds (next refresh cycle)
**And** indicator is visible on Blog, Changelog, and Status pages
**And** indicator stays visible until outage is resolved in API data

---

### Story 4.4: Implement Distance-Optimized Typography & Contrast

As a team member,
I want all text to be readable from 10-15 feet away,
So that I can comfortably view the dashboard during walk-bys.

**Acceptance Criteria:**

**Given** I need minimum font sizes
**When** I review all typography
**Then** body text is minimum 16px (--fontsize-base)
**And** list item titles are minimum 20px (--fontsize-h3)
**And** detail panel titles are minimum 24px (--fontsize-h2)
**And** section headers are minimum 32px (--fontsize-h1)
**And** metadata text is minimum 14px (--fontsize-small)

**Given** I need high contrast ratios
**When** I test color combinations
**Then** primary text (#c9d1d9) on background (#0d1117) has ratio 15.8:1 (exceeds WCAG AAA)
**And** muted text (#7d8590) on background has ratio 4.6:1 (meets WCAG AA)
**And** links (#58a6ff) on background have ratio 8.6:1 (exceeds WCAG AAA)
**And** all text meets minimum WCAG AA requirement (4.5:1)

**Given** I need comfortable line heights
**When** I review typography spacing
**Then** body text uses `line-height: var(--lineheight-default)` (1.5)
**And** headers use `line-height: var(--lineheight-condensed)` (1.25)
**And** detail panel has minimum 20px line-height for readability
**And** line spacing prevents visual crowding

**Given** I need appropriate font weights
**When** I review text emphasis
**Then** normal body text uses 400 weight
**And** emphasized text (headers, highlighted items) uses 600 weight
**And** no text uses weights below 400 (too thin for distance)
**And** font weights provide clear hierarchy without straining readability

**Given** I test actual distance readability
**When** I view the dashboard from 10 feet away
**Then** all headlines are readable without squinting
**And** body text in detail panel is comfortably readable
**And** timestamps and metadata are discernible
**And** visual hierarchy is obvious at distance

**Given** I test actual distance readability from 15 feet
**When** I view the dashboard from maximum distance
**Then** section headers (BLOG, CHANGELOG, STATUS) are clearly readable
**And** list item titles are readable
**And** highlighted item is obviously distinct
**And** I can determine which page I'm viewing instantly

---

### Story 4.5: Implement Burn-In Testing & Validation

As a developer,
I want comprehensive testing to validate 24/7 reliability,
So that I have confidence deploying to production.

**Acceptance Criteria:**

**Given** I need 24-hour burn-in test
**When** I run the dashboard continuously for 24+ hours
**Then** no memory leaks occur (memory usage stays stable)
**And** no timer drift occurs (rotations remain accurate)
**And** no JavaScript errors appear in console
**And** performance remains consistent (no degradation)
**And** the dashboard continues functioning normally

**Given** I need timer accuracy validation
**When** I measure rotation timing over 24 hours
**Then** page rotations occur within ±1 second of 30-second target
**And** item highlighting occurs within ±0.5 seconds of 8-second target
**And** no cumulative drift exceeds 5 seconds over 24 hours
**And** timers maintain accuracy across API refreshes

**Given** I need API refresh validation
**When** I observe 5-minute refresh cycles
**Then** data updates successfully every 5 minutes
**And** timers continue running during refresh (no interruption)
**And** timer state persists correctly across refresh
**And** page/item positions are maintained

**Given** I need power recovery testing
**When** I simulate power outage by rebooting the Pi
**Then** systemd services restart automatically within 2 minutes
**And** dashboard loads in Chromium kiosk mode
**And** all functionality works after restart
**And** no manual intervention is required

**Given** I need network resilience testing
**When** I disconnect WiFi for 10 minutes then reconnect
**Then** dashboard shows cached content during disconnect
**And** network status indicator appears appropriately
**And** dashboard recovers automatically when WiFi returns
**And** fresh data fetches successfully after recovery

**Given** I need GitHub Primer validation
**When** I compare screenshots to GitHub.com
**Then** all colors match Primer palette exactly
**And** spacing follows 8px base unit system
**And** typography hierarchy matches GitHub standards
**And** no custom colors or spacing exist outside tokens

**Given** I need cross-browser validation
**When** I test on Chrome, Firefox, and Edge
**Then** dashboard displays identically across browsers
**And** all functionality works (timers, transitions, data fetching)
**And** no browser-specific bugs exist
**And** Chromium 84 on Pi remains primary target

**Given** burn-in testing is complete
**When** I evaluate production readiness
**Then** all acceptance criteria are met
**And** no critical bugs remain
**And** performance is acceptable on Pi hardware
**And** the dashboard is ready for 24/7 deployment

---

### Story 4.6: Implement Documentation & Deployment Guide

As a developer or future maintainer,
I want comprehensive documentation for development, deployment, and troubleshooting,
So that I can work effectively with the dashboard.

**Acceptance Criteria:**

**Given** I need development setup documentation
**When** I read README.md
**Then** prerequisites are listed: Node.js version (18+), npm, git
**And** installation steps are documented: `git clone`, `npm install`
**And** development workflow is explained: `npm run dev` for local development
**And** build process is documented: `npm run build` creates index.html
**And** all npm scripts are explained with their purpose

**Given** I need architecture documentation
**When** I read the Architecture section in README
**Then** component responsibilities are explained (CarouselController, ItemHighlighter, DetailPanel)
**And** file structure is documented (/src/js, /src/css organization)
**And** state management approach is explained (setInterval timers, direct callbacks)
**And** GitHub Primer token usage is emphasized (mandatory, no hardcoded values)

**Given** I need deployment documentation
**When** I read the Deployment section
**Then** build → commit → push workflow is documented
**And** Pi auto-pull mechanism is explained (git pull on boot)
**And** systemd service setup is referenced (see deploy/ folder)
**And** rollback procedure is documented (revert git commit)

**Given** I need Pi setup documentation
**When** I read docs/raspberry-pi-setup.md
**Then** OS installation is documented (Raspberry Pi OS Lite)
**And** Chromium kiosk configuration is detailed
**And** systemd services are explained (dashboard-server.service, kiosk.service)
**And** network configuration is covered (guest WiFi setup)
**And** troubleshooting steps are provided

**Given** I need troubleshooting guide
**When** I encounter common issues
**Then** README includes troubleshooting section with:
- "Dashboard not rotating" → Check browser console for timer errors
- "API data not loading" → Verify network connectivity, check CORS
- "Build fails" → Check Node.js version, run `npm install` again
- "Pi not auto-starting" → Check systemd service status
- "Performance issues" → Verify Pi hardware, check memory usage

**Given** I need pattern compliance guide
**When** I want to add new features
**Then** Implementation Patterns section documents:
- Naming conventions (camelCase JS, kebab-case CSS, PascalCase classes)
- GitHub Primer token requirement (MANDATORY)
- Component communication (direct callbacks, no events)
- Error handling (per-column isolation, retry logic)
- Testing approach (manual visual testing)

**Given** documentation is complete
**When** a new developer joins the project
**Then** they can set up the dev environment in < 15 minutes
**And** they understand the architecture without diving into code
**And** they can deploy changes to the Pi confidently
**And** they know where to look when issues occur

