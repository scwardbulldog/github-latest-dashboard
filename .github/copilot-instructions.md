<!-- BMAD:START -->
# BMAD Method — Project Instructions

## Project Configuration

- **Project**: github-latest-dashboard
- **User**: Shane
- **Communication Language**: English
- **Document Output Language**: English
- **User Skill Level**: intermediate
- **Output Folder**: {project-root}/_bmad-output
- **Planning Artifacts**: {project-root}/_bmad-output/planning-artifacts
- **Implementation Artifacts**: {project-root}/_bmad-output/implementation-artifacts
- **Project Knowledge**: {project-root}/docs

## BMAD Runtime Structure

- **Agent definitions**: `_bmad/bmm/agents/` (BMM module) and `_bmad/core/agents/` (core)
- **Workflow definitions**: `_bmad/bmm/workflows/` (organized by phase)
- **Core tasks**: `_bmad/core/tasks/` (help, editorial review, indexing, sharding, adversarial review)
- **Core workflows**: `_bmad/core/workflows/` (brainstorming, party-mode, advanced-elicitation)
- **Workflow engine**: `_bmad/core/tasks/workflow.xml` (executes YAML-based workflows)
- **Module configuration**: `_bmad/bmm/config.yaml`
- **Core configuration**: `_bmad/core/config.yaml`
- **Agent manifest**: `_bmad/_config/agent-manifest.csv`
- **Workflow manifest**: `_bmad/_config/workflow-manifest.csv`
- **Help manifest**: `_bmad/_config/bmad-help.csv`
- **Agent memory**: `_bmad/_memory/`

## Key Conventions

- Always load `_bmad/bmm/config.yaml` before any agent activation or workflow execution
- Store all config fields as session variables: `{user_name}`, `{communication_language}`, `{output_folder}`, `{planning_artifacts}`, `{implementation_artifacts}`, `{project_knowledge}`
- MD-based workflows execute directly — load and follow the `.md` file
- YAML-based workflows require the workflow engine — load `workflow.xml` first, then pass the `.yaml` config
- Follow step-based workflow execution: load steps JIT, never multiple at once
- Save outputs after EACH step when using the workflow engine
- The `{project-root}` variable resolves to the workspace root at runtime

## Available Agents

| Agent | Persona | Title | Capabilities |
|---|---|---|---|
| bmad-master | BMad Master | BMad Master Executor, Knowledge Custodian, and Workflow Orchestrator | runtime resource management, workflow orchestration, task execution, knowledge custodian |
| analyst | Mary | Business Analyst | market research, competitive analysis, requirements elicitation, domain expertise |
| architect | Winston | Architect | distributed systems, cloud infrastructure, API design, scalable patterns |
| dev | Amelia | Developer Agent | story execution, test-driven development, code implementation |
| pm | John | Product Manager | PRD creation, requirements discovery, stakeholder alignment, user interviews |
| qa | Quinn | QA Engineer | test automation, API testing, E2E testing, coverage analysis |
| quick-flow-solo-dev | Barry | Quick Flow Solo Dev | rapid spec creation, lean implementation, minimum ceremony |
| sm | Bob | Scrum Master | sprint planning, story preparation, agile ceremonies, backlog management |
| tech-writer | Paige | Technical Writer | documentation, Mermaid diagrams, standards compliance, concept explanation |
| ux-designer | Sally | UX Designer | user research, interaction design, UI patterns, experience strategy |

## Slash Commands

Type `/bmad-` in Copilot Chat to see all available BMAD workflows and agent activators. Agents are also available in the agents dropdown.
<!-- BMAD:END -->

---

# GitHub Copilot Coding Agent Instructions

## Project Overview

This is the **GitHub Latest Dashboard** — a single-page web dashboard designed to run full-screen 24/7 on a large office TV. It displays the latest updates from GitHub across three sources: Status, Blogs, and Changelog. It is a "fun lazy project" built with BMAD V6, emphasizing simplicity and maintainability over complexity.

---

## 1. Code Style & Standards

### JavaScript / ES6+

- **Always use ES modules** (`import`/`export`) — no CommonJS, no `require()`
- **Prefer `const` over `let`**, never use `var`
- **Always use named exports** for classes and functions; avoid default exports
- **Include `.js` extension** in all import paths (required for ES modules)
- **Use `async`/`await`** with `try/catch` for all asynchronous code
- **Template literals** for HTML generation via `innerHTML` (not `createElement` loops)
- **No external runtime libraries** — use native browser APIs only (no lodash, moment.js, etc.)
- **ES2020 target** — optional chaining (`?.`) and nullish coalescing (`??`) are allowed; avoid anything newer

```javascript
// ✅ Correct patterns
export class CarouselController { }
export function fetchBlogData() { }
export const RSS2JSON_API = 'https://api.rss2json.com/v1/api.json';

import { CarouselController } from './carousel-controller.js';
import { formatDate, stripHtml, truncate } from './utils.js';
```

### HTML Structure

- **Edit `src/index.html`** — the project root `index.html` is a build artifact; never edit it directly
- Use semantic HTML5 elements
- Keep the single-page structure — one HTML file, multiple logical sections visible/hidden via CSS

### CSS

- **Always add `-webkit` prefixes** for CSS features targeting Chromium 84 (Pi 3B):
  - `-webkit-line-clamp` for text truncation
  - `-webkit-box-orient` with `display: -webkit-box`
- Use **CSS custom properties** (design tokens) defined in `src/css/main.css`
- **Avoid complex box-shadows** and heavy animations — Pi 3B performance constraints
- **Prefer opacity-based transitions** over transform-based ones

### Naming Conventions

| Thing | Convention | Example |
|---|---|---|
| JS files | `kebab-case.js` | `carousel-controller.js` |
| CSS files | `kebab-case.css` | `layout.css` |
| JS classes | `PascalCase` | `CarouselController` |
| Functions/variables | `camelCase` | `fetchBlogData`, `currentPage` |
| CSS classes | `kebab-case` | `.item--highlighted` |
| CSS modifiers | BEM `--modifier` | `.blog-item`, `.item--highlighted` |

---

## 2. Architecture Guidelines

### Source File Locations (CRITICAL)

```
src/index.html          ← Edit HTML structure here
src/js/main.js          ← Application entry point, component wiring
src/js/carousel-controller.js  ← Page rotation logic (30s timer)
src/js/item-highlighter.js     ← Item-level highlighting (8s timer)
src/js/detail-panel.js         ← Detail view rendering (reactive, no timer)
src/js/api-client.js           ← Data fetching with 5-min in-memory cache
src/js/persistent-alert.js     ← Cross-page outage indicator
src/js/utils.js                ← Shared utilities (formatDate, stripHtml, truncate)
src/css/main.css        ← GitHub Primer tokens, CSS custom properties
src/css/layout.css      ← Grid, flexbox, split-view layouts
src/css/carousel.css    ← Page transition styles, fade effects
src/css/components.css  ← Item cards, detail panel, progress bar
```

> ⚠️ **NEVER edit `/index.html` at the project root** — it is a generated build artifact. Always edit source files under `/src/` and run `npm run build` to regenerate it.

### Component Architecture

- **One class per file** — separate concerns, easier testing
- **Direct callback communication** — no event bus, no pub/sub system
- **Independent timers with explicit coordination** via callbacks
- **Clear lifecycle**: `constructor()` → `start()` → `stop()` → `reset()`
- Constructors accept a configuration object with defaults: `constructor({ interval = 30000 } = {})`

```javascript
export class ComponentExample {
  constructor({ interval = 30000 } = {}) {
    this.interval = interval;
    this.timer = null;
    this.currentIndex = 0;
    this.onStateChange = null; // Callback property
  }

  start() {
    this.timer = setInterval(() => this.tick(), this.interval);
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  reset() {
    this.stop();
    this.currentIndex = 0;
  }
}
```

### State Management

- **Manual state tracking** with `setInterval()` timers — no external state libraries
- Component coordination via **direct function callbacks** (no event bus)
- **Timer cleanup is mandatory** in `stop()` methods: always `clearInterval()` and null the reference
- State persists across 5-minute API refresh cycles — timers are independent of data fetches
- Page change **must** trigger item timer reset to prevent state desync

### API Integration

- **RSS2JSON API** for GitHub Blog & Changelog: `https://api.rss2json.com/v1/api.json?rss_url=...`
- **GitHub Status API**: `https://www.githubstatus.com/api/v2/incidents.json`
- Always use `encodeURIComponent()` for URL parameters
- Validate `data.status === 'ok'` before processing RSS items
- Use `Promise.all()` for parallel fetching across all three data sources
- **In-memory cache with 5-minute expiration** — check cache before making API requests
- **3-retry exponential backoff** (1s, 2s, 4s delays) for network failures
- Return stale cache during network errors (graceful degradation — never break the UI)

```javascript
const cache = {
  blog: { data: null, timestamp: 0 },
  changelog: { data: null, timestamp: 0 },
  status: { data: null, timestamp: 0 }
};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
```

---

## 3. Testing Requirements

All test scripts live in the `test/` directory and use **Puppeteer** for automated browser testing.

### When to Add Tests

- Add **memory monitoring** tests (`test/memory-monitor.js`) when implementing features with timers, intervals, or DOM mutations
- Add **health checks** (`test/health-check.js`) for new API endpoints or data sources
- Add **Primer color validation** (`test/validate-primer-colors.js`) when adding or changing CSS color values
- Add **burn-in test** coverage (`test/burn-in-test.sh`) for any feature that creates persistent DOM changes

### Test Script Conventions

- Use Puppeteer with `headless: true` for CI, `headless: false` for manual debugging
- Structure test files as standalone Node.js scripts (not a test framework like Jest)
- Return non-zero exit codes on failure for CI integration
- Log results clearly with `console.log` and `console.error`

### Available Test Commands

```bash
npm run test:memory    # Memory leak monitoring (Puppeteer)
npm run test:burn-in   # Long-duration burn-in test (bash + Puppeteer)
npm run test:validate  # Primer color token validation
npm run test:health    # API and DOM health checks
```

### Health Check Structure

Each health check should verify:
1. API endpoint reachability
2. Expected DOM elements are present
3. No JavaScript console errors
4. Memory within expected bounds

---

## 4. Build & Deployment

### Build System

- **Vite 7.x** with `vite-plugin-singlefile` — produces a single self-contained `index.html`
- Source root is `src/` — the Vite dev server and build both use this as the entry point
- Build outputs to `/dist/` (gitignored), then post-build script copies to project root
- **Minification:** Terser for JavaScript
- **Target:** `es2020` for Chromium 84 (Raspberry Pi 3B) compatibility

### Build Commands

```bash
npm run dev      # Start Vite dev server at localhost:5173 (with hot reload)
npm run build    # Build to dist/, copy index.html to project root
npm run preview  # Preview the production build locally
```

### Single-File Output Requirement

The `vite-plugin-singlefile` plugin inlines all CSS and JavaScript into a single `index.html`. This is critical because the Raspberry Pi serves this file via Python's `http.server` with no Node.js runtime.

- **Do not add external CDN dependencies** — everything must be bundled inline
- **Do not split chunks** — `inlineDynamicImports: true` in Vite config ensures single output
- Minimize bundle size: avoid large libraries, tree-shake everything

### Deployment Flow

1. Develop on dev machine with `npm run dev`
2. Run `npm run build` to generate `/index.html` (build artifact)
3. Commit both source (`/src/`) and built artifact (`/index.html`) to git
4. Raspberry Pi auto-pulls on restart and serves the pre-built `index.html`
5. **No build tools run on the Pi** — it receives a ready-to-serve HTML file

---

## 5. Special Considerations

### Performance for 24/7 Operation

- **Limit displayed items to 7–8 per page** — prevents overflow and excessive DOM size
- **Batch DOM updates** with `innerHTML` rather than individual `appendChild` calls
- **CSS transitions only** for animations — `opacity` and `background-color` changes, not `transform`
- **Avoid requestAnimationFrame** for non-animation work — use `setInterval` for timed updates
- Timer precision with `setInterval` is sufficient — minor drift over 24 hours is acceptable

### Memory Leak Prevention (Critical for 24/7 Kiosk)

- **Always clear intervals** in `stop()` methods — do not leave orphaned timers
- **Set timer references to `null`** after clearing: `this.timer = null`
- **Remove event listeners** when components are torn down
- **Avoid closures that retain large objects** — keep callback references minimal
- DOM nodes replaced via `innerHTML` are automatically garbage collected — preferred over manual node removal
- Validate memory stability with `npm run test:memory` after changes to timers or DOM mutation logic

### TV Display Optimization

- **High contrast colors** from GitHub Primer design tokens — readable at 10+ feet
- **Large font sizes** — minimum 16px body text, headings 24px+
- **No hover states as primary interactions** — this is not a mouse-driven UI
- **Full-screen layout** — design for 1920×1080, no scrollbars
- **Split-view layout**: item list on the left (~35%), detail panel on the right (~65%)

### GitHub API Rate Limiting

- The RSS2JSON API and GitHub Status API are **public endpoints with no authentication required**
- **5-minute cache** prevents excessive API calls (12 requests/hour max per feed)
- On rate limit or network failure, **display stale cache data** rather than an error state
- Log rate limit errors to console but maintain graceful UI degradation

### GitHub Primer Design System

- Use **GitHub Primer color tokens** defined in `src/css/main.css` as CSS custom properties
- Do not hardcode hex colors — always reference `var(--color-*)` tokens
- Validate color usage with `npm run test:validate` after CSS changes
- Reference: [Primer Design System](https://primer.style/design/foundations/color)

---

## 6. Documentation

### When to Update README.md

- When adding a new data source or API integration
- When changing the build process or deployment steps
- When adding new npm scripts or test commands
- When changing the required Node.js or npm version

### Feature Documentation

- Document new components in `docs/architecture.md`
- Document new test procedures in `docs/testing-guide.md`
- Document deployment changes in `docs/deployment.md`
- Keep `docs/troubleshooting.md` updated with known issues and fixes

### Code Documentation

- Add JSDoc comments only for public class methods and exported functions
- Inline comments for non-obvious logic (especially timer coordination and cache behavior)
- Keep comments concise — prefer clear code over verbose comments

---

## 7. Project-Specific Context

### Philosophy

- This is a **"fun lazy project"** — keep it simple and maintainable
- **No frameworks, no complexity** — vanilla HTML, CSS, and JavaScript only
- **BMAD V6 was used for full codebase generation** — the architecture documents in `_bmad-output/` are the canonical design reference
- Favor **readability and maintainability** over clever optimizations

### What to Avoid

- ❌ Adding npm runtime dependencies (only devDependencies for build tools)
- ❌ Introducing a frontend framework (React, Vue, Angular, etc.)
- ❌ TypeScript — this is intentionally plain JavaScript
- ❌ CSS preprocessors (Sass, Less) — use CSS custom properties instead
- ❌ Complex build pipelines — the current Vite setup is intentionally minimal
- ❌ Server-side rendering or backend services
- ❌ Authentication or private API access — public GitHub APIs only

### Key Design Decisions

| Decision | Rationale |
|---|---|
| Single built `index.html` | Pi has no Node.js — file must be self-contained |
| Vanilla JS, no framework | Simplicity, maintainability, no upgrade treadmill |
| Direct callbacks, no event bus | Explicit data flow, easier debugging on kiosk |
| In-memory cache | Prevents rate limiting, survives brief network blips |
| Chromium 84 target | Locked browser version on Raspberry Pi 3B |
| CSS opacity transitions | GPU-friendly on Pi 3B's limited hardware |

### Raspberry Pi Deployment Constraints

- **Chromium 84** on Raspberry Pi 3B — this is the fixed browser version
- **1GB RAM** — keep memory footprint minimal; no memory leaks
- **Quad-core ARM** — avoid CPU-intensive operations
- **No Node.js on Pi** — build artifacts must be pre-compiled before deployment
- **Python 3 `http.server`** on port 8000 for serving the static file
