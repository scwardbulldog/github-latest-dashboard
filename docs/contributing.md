# Contributing Guide

This guide covers development patterns, coding standards, and best practices for contributing to the GitHub Updates Dashboard.

**We welcome contributions from both human developers and AI agents!** Whether you're a developer using your favorite IDE or an AI coding assistant, this guide will help you contribute effectively to this project.

## Table of Contents

- [AI Agent Contributors](#ai-agent-contributors)

- [Naming Conventions](#naming-conventions)
- [Component Communication Pattern](#component-communication-pattern)
- [Error Handling Pattern](#error-handling-pattern)
- [Testing Approach](#testing-approach)
- [Critical Development Rules](#critical-development-rules)

## AI Agent Contributors

AI coding agents (GitHub Copilot, Claude, Cursor, Aider, etc.) are first-class contributors to this project. This section provides essential context and guidance for effective AI-assisted development.

### Quick Start for AI Agents

1. **Read the project context first:** [`_bmad-output/project-context.md`](../_bmad-output/project-context.md) contains all critical rules, patterns, and constraints optimized for LLM consumption
2. **Understand the architecture:** [`docs/architecture.md`](architecture.md) explains component relationships and data flow
3. **Check implementation status:** [`IMPLEMENTATION_TRACKER.md`](../IMPLEMENTATION_TRACKER.md) shows current progress and completed stories

### Critical Rules for AI Agents

:warning: **These rules prevent common AI mistakes:**

| Rule | Why It Matters |
|------|----------------|
| **Edit `/src/` files only** | `/index.html` at root is a build artifact - your changes will be overwritten |
| **Run `npm run build`** | Changes in `/src/` must be built to produce deployable `/index.html` |
| **Use Primer design tokens** | Never hardcode colors, spacing, or fonts - use `var(--token-name)` |
| **Include `.js` in imports** | ES modules require explicit file extensions for browser compatibility |
| **Target Chromium 84** | Pi 3B runs an older browser - use `-webkit-` prefixes, avoid bleeding-edge features |
| **Implement `stop()` methods** | All timers need cleanup to prevent memory leaks over 24+ hour runtime |

### Project Context Files

| File | Purpose |
|------|----------|
| [`_bmad-output/project-context.md`](../_bmad-output/project-context.md) | **Primary AI context** - rules, patterns, constraints (read this first) |
| [`docs/architecture.md`](architecture.md) | Component design, data flow, timing specifications |
| [`docs/troubleshooting.md`](troubleshooting.md) | Common issues and solutions |
| [`IMPLEMENTATION_TRACKER.md`](../IMPLEMENTATION_TRACKER.md) | Story status and implementation progress |

### Best Practices for AI Contributions

- **Validate your changes:** Run `npm run test:validate` to check design token compliance
- **Build before committing:** Always run `npm run build` after editing source files
- **Test locally:** Use `npm run dev` to preview changes with hot reload
- **Follow existing patterns:** The codebase uses direct callbacks (not events) for component communication
- **Respect Pi constraints:** This runs on Raspberry Pi 3B with 1GB RAM - keep it lightweight
- **Check the story file:** Implementation artifacts in `_bmad-output/implementation-artifacts/` contain detailed requirements

### What AI Agents Do Well Here

- Implementing component logic following established patterns
- Applying consistent coding style across the codebase
- Generating boilerplate with proper design tokens
- Refactoring while maintaining code conventions
- Creating documentation and inline comments

## Naming Conventions

### JavaScript

**Variables and Functions:** `camelCase`
```javascript
const fetchBlogData = () => {};
let currentPage = 0;
function rotatePage() {}
```

**Classes:** `PascalCase`
```javascript
class CarouselController {}
class ItemHighlighter {}
class DetailPanel {}
```

### CSS

**Classes:** `kebab-case`
```css
.carousel-page {}
.list-item {}
.list-item--highlighted {}
```

**Custom Properties:** `kebab-case` with prefix
```css
--color-fg-default
--space-4
--fontsize-large
```

### Files

**All Files:** `kebab-case` with extension
```
carousel-controller.js
main.css
raspberry-pi-setup.md
```

## Component Communication Pattern

Use **direct callbacks** instead of events or pub/sub:

### Producer Pattern

```javascript
// Producer (CarouselController)
class CarouselController {
  constructor() {
    this.onPageChange = null; // Callback property
  }
  
  rotatePage() {
    // ... rotation logic
    if (this.onPageChange) {
      this.onPageChange(this.pages[this.currentPage]);
    }
  }
}
```

### Consumer Pattern

```javascript
// Consumer (Main.js)
const carousel = new CarouselController();
carousel.onPageChange = (page) => {
  itemHighlighter.reset(); // Reset child component
  console.log(`Page changed to: ${page}`);
};
```

### Why This Pattern?

- **Simplicity:** No event system overhead
- **Explicit:** Clear producer-consumer relationships
- **Type-safe:** Direct function references
- **Debuggable:** Easy to trace callback chains
- **No Memory Leaks:** No event listener cleanup needed

## Error Handling Pattern

Use **per-column isolation** with **retry logic** and **cached fallback**:

### Retry with Exponential Backoff

```javascript
async function fetchWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      return await response.json();
    } catch (error) {
      if (i < retries - 1) {
        // Exponential backoff: 1s, 2s, 4s
        await new Promise(resolve => 
          setTimeout(resolve, Math.pow(2, i) * 1000)
        );
      }
    }
  }
  throw new Error('All retries failed');
}
```

### Cached Fallback

```javascript
try {
  data = await fetchWithRetry(blogUrl);
  // Update cache on success
  cache.blog = { data, timestamp: Date.now() };
} catch (error) {
  // Use cached data if available
  if (cache.blog.data) {
    console.warn('Using stale cached data');
    data = cache.blog.data;
  } else {
    // Show error in UI (per-column isolation)
    displayError('blog', 'Unable to load blog posts');
  }
}
```

### Why This Pattern?

- **Resilience:** One API failure doesn't break entire dashboard
- **Retry Logic:** Handles transient network issues
- **Graceful Degradation:** Shows stale data better than nothing
- **User Feedback:** Clear error messages per section

## Testing Approach

### Primary Testing Method

**Manual visual testing** is the primary QA method:
- Single-purpose kiosk display prioritizes visual correctness
- Real Pi hardware required for performance validation
- Rapid development not hindered by test maintenance

### Automated Validation Scripts

Located in `/test/` folder:

```bash
# Design token compliance (~5 seconds)
npm run test:validate
# Scans CSS for hardcoded colors and non-base-8 spacing
# When to use: Before committing CSS changes

# Dashboard health check (~30 seconds)
npm run test:health
# Uses Puppeteer to verify dashboard loads and APIs respond
# When to use: After build, before deployment

# Memory leak detection (24+ hours)
npm run test:memory
# Monitors memory usage over extended period
# When to use: Before production deployment, after timer changes

# Complete burn-in test suite (24+ hours)
npm run test:burn-in
# Orchestrates all long-running tests
# When to use: Final validation before deploying to Pi
```

See [Testing Guide](testing-guide.md) for detailed procedures.

### Why Manual Testing?

- **Visual correctness matters most** - Font size, colors, layout from 10-15 feet
- **Single-purpose application** - No complex user interactions to test
- **Pi hardware specific** - Performance characteristics differ from dev machine
- **Rapid development** - No test maintenance overhead

## Critical Development Rules

### 1. Never Edit Build Artifacts

❌ **DO NOT EDIT** `/index.html` at project root

✅ **ALWAYS EDIT** `/src/index.html`, `/src/js/*.js`, `/src/css/*.css`

This is a build artifact from Vite. Changes will be overwritten on next build.

### 2. Always Build After Source Changes

🔨 **After editing source files, run:**
```bash
npm run build
```

This regenerates `/index.html` at project root for Pi deployment.

### 3. Always Use GitHub Primer Tokens

❌ **DO NOT** use hardcoded colors, spacing, or fonts:
```css
color: #c9d1d9;        /* Wrong */
margin: 16px;          /* Wrong */
font-size: 20px;       /* Wrong */
```

✅ **ALWAYS** use Primer design tokens:
```css
color: var(--color-fg-default);    /* Correct */
margin: var(--space-4);             /* Correct */
font-size: var(--fontsize-large);  /* Correct */
```

**Validation:**
```bash
npm run test:validate
```

### 4. Follow ES Module Syntax

✅ **ALWAYS** include `.js` extensions in imports:
```javascript
import { CarouselController } from './carousel-controller.js';
import { formatDate } from './utils.js';
```

❌ **DO NOT** omit extensions:
```javascript
import { CarouselController } from './carousel-controller';  // Wrong
```

**Why?** ES modules in browsers require explicit file extensions.

### 5. Clean Up Timers

✅ **ALWAYS** implement `stop()` methods to prevent memory leaks:
```javascript
class CarouselController {
  start() {
    this.intervalId = setInterval(() => this.rotatePage(), 30000);
  }
  
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}
```

### 6. Test on Pi Hardware

⚠️ **Dev machine performance doesn't reflect Pi 3B reality**

Before considering a feature complete:
- Test on actual Pi 3B hardware
- Verify animations smooth at 30+ FPS
- Check memory usage over 24+ hours
- Verify from 10-15 feet viewing distance

## Development Workflow

### Daily Development

```bash
# 1. Start dev server (hot reload enabled)
npm run dev

# 2. Make changes in /src/ directory
# Changes appear instantly in browser

# 3. Validate design tokens (if editing CSS)
npm run test:validate

# 4. Build for deployment
npm run build

# 5. Test built artifact locally
python3 -m http.server 8000
# Visit http://localhost:8000

# 6. Commit source changes only
git add src/
git commit -m "feat: your changes here"

# 7. Push to GitHub
git push origin <your-branch>

# 8. Open PR and merge to main
# Rebuild workflow auto-commits index.html + img/ on main

# 9. Deploy to Pi (restart kiosk)
ssh pi@github-dashboard.local "sudo systemctl restart kiosk.service"
```

### Before Committing

**Checklist:**
- [ ] Code follows naming conventions
- [ ] No hardcoded values (colors, spacing, fonts)
- [ ] ES module imports include `.js` extensions
- [ ] Timers have cleanup methods
- [ ] Design token validation passes (`npm run test:validate`)
- [ ] Built artifact regenerated (`npm run build`)
- [ ] PR includes source/docs changes only (`/src/**`, `/docs/**`, etc.)
- [ ] PR does NOT include generated `/index.html` or `/img/**`

### Before Deploying to Pi

**Checklist:**
- [ ] Tested on actual Pi 3B hardware
- [ ] Health check passes (`npm run test:health`)
- [ ] Memory leak test passes (if timer changes)
- [ ] Viewing distance test (10-15 feet)
- [ ] Full page rotation cycle verified (90 seconds)
- [ ] All 3 data sources loading

## Common Mistakes to Avoid

### 1. Editing Root index.html

**Problem:** Editing `/index.html` at project root  
**Why It's Wrong:** This file is regenerated by `npm run build`  
**Solution:** Edit `/src/index.html` instead

### 2. Forgetting to Build

**Problem:** Committing source changes without building  
**Why It's Wrong:** Pi serves `/index.html`, not source files  
**Solution:** Always run `npm run build` before committing

### 3. Hardcoded Values

**Problem:** Using `color: #c9d1d9` instead of tokens  
**Why It's Wrong:** Breaks design system consistency  
**Solution:** Use `color: var(--color-fg-default)`

### 4. Omitting .js Extensions

**Problem:** `import { utils } from './utils'`  
**Why It's Wrong:** ES modules require explicit extensions  
**Solution:** `import { utils } from './utils.js'`

### 5. Memory Leaks from Timers

**Problem:** Starting `setInterval` without cleanup  
**Why It's Wrong:** Causes memory leaks over 24+ hour runtime  
**Solution:** Implement `stop()` method that calls `clearInterval()`

### 6. Assuming Dev Machine Performance

**Problem:** "Works fast on my MacBook Pro"  
**Why It's Wrong:** Pi 3B has 1GB RAM and modest CPU  
**Solution:** Test on actual Pi hardware before considering complete

## Code Review Guidelines

When reviewing pull requests (from humans or AI agents), check for:

1. **File Editing Rules:** Changes in `/src/`, not root `/index.html`
2. **Build Artifact:** Both source and built file committed
3. **Naming Conventions:** Consistent camelCase, PascalCase, kebab-case
4. **Design Tokens:** No hardcoded colors, spacing, fonts
5. **ES Module Syntax:** `.js` extensions in imports
6. **Timer Cleanup:** `stop()` methods for all `setInterval`
7. **Error Handling:** Retry logic and cached fallback
8. **Component Communication:** Direct callbacks, not events
9. **Testing Evidence:** Manual testing on Pi mentioned in PR description
10. **Documentation:** README or docs updated if behavior changes

### Additional Checks for AI-Generated Code

- **Pattern consistency:** Verify AI followed existing project patterns, not generic best practices
- **Chromium 84 compatibility:** Check for modern JS/CSS features that may not work
- **No over-engineering:** AI sometimes adds unnecessary abstractions - keep it simple
- **Correct file paths:** Ensure AI edited `/src/` files, not build artifacts

## Getting Help

- **AI Agent Context:** See [`_bmad-output/project-context.md`](../_bmad-output/project-context.md) (optimized for LLMs)
- **Architecture Questions:** See [Architecture Guide](architecture.md)
- **Deployment Issues:** See [Deployment Guide](deployment.md)
- **Common Problems:** See [Troubleshooting Guide](troubleshooting.md)
- **Testing Procedures:** See [Testing Guide](testing-guide.md)
- **Pi Setup:** See [Raspberry Pi Setup Guide](raspberry-pi-setup.md)

## Questions?

Open an issue or start a discussion in the repository.

---

*This guide is designed to be useful for both human developers and AI coding assistants. If you're an AI agent reading this, please also consume the project context file for comprehensive rules and patterns.*
