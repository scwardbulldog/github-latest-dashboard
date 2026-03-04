# Story 4.6: Implement Documentation & Deployment Guide

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

**Completion Note:** Ultimate context engine analysis completed - comprehensive developer guide created with architecture patterns, implementation standards, troubleshooting scenarios, and testing references from Story 4.5.

---

## Story

As a developer or future maintainer,
I want comprehensive documentation for development, deployment, and troubleshooting,
So that I can work effectively with the dashboard.

---

## Acceptance Criteria

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

---

## Epic Context

### Epic 4: Production Reliability & Polish

**Epic Goal:** Team members trust the dashboard to run 24/7 without intervention, with graceful handling of network issues, clear error feedback, and performance optimized for comfortable viewing from 10-15 feet away.

**What This Story Delivers:**
- Enhanced README.md with architecture, implementation patterns, and troubleshooting
- Review and polish of existing docs/raspberry-pi-setup.md for completeness
- Clear development → deployment workflow documentation
- Troubleshooting guide for common issues
- Pattern compliance guide for future development
- New developer onboarding materials

**What This Story Does NOT Include:**
- Code implementation (all features complete)
- Testing (Story 4.5)
- User-facing help documentation (this is technical/developer docs)

**Story Position:** Final story in Epic 4 (4.6 of 4.6) - Completes Epic 4

**Dependencies:**
- ✅ Epic 1-3 completed: All core features implemented
- ✅ Story 4.1 completed: Error handling patterns to document
- ✅ Story 4.2 completed: Performance patterns to document
- ✅ Story 4.3 completed: Persistent alert pattern to document
- ✅ Story 4.4 completed: Typography patterns to document
- ✅ Story 4.5 completed: Testing infrastructure to reference

**Critical Success Factors:**
- Documentation must be accurate and reflect current implementation
- New developers can onboard without asking questions
- Deployment instructions are foolproof (no SSH file copying confusion)
- Troubleshooting covers real issues encountered during development

---

## Tasks / Subtasks

- [ ] **Task 1: Enhance README.md with Architecture Section** (AC: Component responsibilities explained)
  - [ ] Subtask 1.1: Add Architecture Overview section after Features
  - [ ] Subtask 1.2: Document component responsibilities (CarouselController, ItemHighlighter, DetailPanel, APIClient, Utils)
  - [ ] Subtask 1.3: Document file structure (/src/js, /src/css, /src/index.html → build artifacts)
  - [ ] Subtask 1.4: Document state management (setInterval timers, direct callbacks, component coordination)
  - [ ] Subtask 1.5: Document GitHub Primer token usage (mandatory, no hardcoded values)
  - [ ] Subtask 1.6: Document ES module pattern (import/export, .js extensions)

- [ ] **Task 2: Add Implementation Patterns Section** (AC: Pattern compliance guide documented)
  - [ ] Subtask 2.1: Document naming conventions (camelCase JS, kebab-case CSS, PascalCase classes)
  - [ ] Subtask 2.2: Document GitHub Primer tokens (--color-*, --space-*, --fontsize-* mandatory)
  - [ ] Subtask 2.3: Document component communication (direct callbacks, no events, no publish/subscribe)
  - [ ] Subtask 2.4: Document error handling (per-column isolation, retry logic with exponential backoff, cached fallback)
  - [ ] Subtask 2.5: Document testing approach (manual visual testing, no unit tests, validation scripts in /test)
  - [ ] Subtask 2.6: Document critical rules (never edit /index.html root, always edit /src/)

- [ ] **Task 3: Add Troubleshooting Section** (AC: Common issues documented with solutions)
  - [ ] Subtask 3.1: Document "Dashboard not rotating" (check console for timer errors, verify setInterval)
  - [ ] Subtask 3.2: Document "API data not loading" (network connectivity, CORS, API endpoints, check cache)
  - [ ] Subtask 3.3: Document "Build fails" (Node.js version 18+, npm install, check Vite config)
  - [ ] Subtask 3.4: Document "Pi not auto-starting" (systemd service status, journalctl logs)
  - [ ] Subtask 3.5: Document "Performance issues" (Pi hardware limitations, check memory, CPU usage)
  - [ ] Subtask 3.6: Document "Git pull fails on Pi" (SSH keys, repository access, network)

- [ ] **Task 4: Review and Polish Pi Setup Documentation** (AC: Pi setup complete and accurate)
  - [ ] Subtask 4.1: Review docs/raspberry-pi-setup.md for accuracy (verify OS version, commands)
  - [ ] Subtask 4.2: Verify systemd configuration is documented correctly
  - [ ] Subtask 4.3: Verify Chromium kiosk configuration is complete
  - [ ] Subtask 4.4: Add troubleshooting section to Pi docs if missing

- [ ] **Task 5: Document Deployment Rollback Procedure** (AC: Rollback procedure documented)
  - [ ] Subtask 5.1: Document git revert command for rollback
  - [ ] Subtask 5.2: Document how to restart kiosk after rollback
  - [ ] Subtask 5.3: Document emergency Pi access (keyboard/mouse, stop kiosk mode)

- [ ] **Task 6: Validate Documentation Completeness** (AC: New developer can onboard < 15 min)
  - [ ] Subtask 6.1: Verify all npm scripts are documented (dev, build, preview, test:*)
  - [ ] Subtask 6.2: Verify all prerequisite versions are documented (Node 18+, npm, git)
  - [ ] Subtask 6.3: Verify deployment workflow is clear (no file copying, git-based only)
  - [ ] Subtask 6.4: Verify test scripts are referenced (/test folder, npm run test:*)

---

## Dev Notes

### Critical Context: Documentation Story - Accuracy Is Paramount

**IMPORTANT:** This is a documentation story. The goal is to accurately document the existing implementation, not to change code. Focus is on:
1. Ensuring documentation reflects current code structure
2. Making documentation clear for new developers
3. Providing troubleshooting guidance based on real issues
4. Documenting implementation patterns to maintain consistency

### Current Documentation State (Baseline Analysis)

**Existing Documentation:**

**README.md (Current State - 219 lines):**
- ✅ Features section exists (brief)
- ✅ Data sources documented
- ✅ Prerequisites documented (Node.js, npm, git)
- ✅ Development workflow documented (npm install, npm run dev, npm run build)
- ✅ Deployment workflow documented (git-based, no file copying)
- ✅ Raspberry Pi kiosk deployment overview exists
- ✅ Browser compatibility documented
- ❌ Architecture section MISSING (component structure, state management)
- ❌ Implementation patterns section MISSING (naming, Primer tokens, error handling)
- ❌ Troubleshooting section MISSING (common issues and solutions)

**docs/raspberry-pi-setup.md (Comprehensive - 1309 lines):**
- ✅ Complete OS installation guide
- ✅ System configuration steps
- ✅ Dashboard setup (git clone, Python server)
- ✅ Kiosk mode configuration (Chromium, systemd services)
- ✅ Troubleshooting section
- ✅ Maintenance procedures
- **Status:** Comprehensive and complete, requires review for accuracy only

**deploy/ folder:**
- ✅ systemd service files exist (dashboard-server.service, kiosk.service)
- ✅ start-kiosk.sh script exists
- ✅ update-dashboard.sh script exists
- ✅ openbox configuration exists
- ✅ deploy/README.md exists with deployment instructions

**project-context.md (_bmad-output/):**
- ✅ Comprehensive development rules for AI agents
- ✅ Technology stack documented
- ✅ File editing rules (never edit root index.html)
- ✅ ES module patterns documented
- **Note:** This is internal documentation for AI agents, not end-user docs

### Architecture to Document (For README Addition)

**Component Structure:**

```
/src/js/
  ├── main.js (34.3KB) - Application entry point
  │   ├── Initializes all components
  │   ├── Sets up API refresh interval (5 minutes)
  │   └── Coordinates component interactions
  ├── carousel-controller.js (5.2KB) - Page rotation
  │   ├── Rotates between Blog/Changelog/Status every 30s
  │   ├── Manages smooth fade transitions (300ms)
  │   └── Exposes onPageChange callback for coordination
  ├── item-highlighter.js (3.4KB) - Item highlighting
  │   ├── Highlights items within current page every 8s
  │   ├── Resets when page changes (listens to carousel)
  │   └── Exposes onItemHighlight callback for detail panel
  ├── detail-panel.js (4.7KB) - Detail view
  │   ├── Displays full content of highlighted item
  │   ├── Renders title, author, date, description
  │   └── Listens to item-highlighter for updates
  ├── api-client.js (8.5KB) - Data fetching
  │   ├── Fetches from 3 APIs (Blog, Changelog, Status)
  │   ├── Implements retry logic (3x with exponential backoff: 1s, 2s, 4s)
  │   ├── In-memory caching (5-minute duration)
  │   ├── Per-column error isolation (Blog fails → Changelog/Status OK)
  │   └── Cached fallback when offline
  ├── persistent-alert.js (4.3KB) - Network status indicator
  │   ├── Cross-page outage indicator (survives page rotation)
  │   ├── Shows when using cached data during network issues
  │   └── Auto-hides when connectivity restored
  └── utils.js (1.7KB) - Shared utilities
      ├── formatDate() - ISO to relative time ("2 hours ago")
      ├── stripHtml() - Safe HTML tag removal
      └── truncate() - Character truncation with ellipsis
```

**State Management Pattern:**
- **No framework** - Pure vanilla JavaScript
- **setInterval timers** - CarouselController (30s), ItemHighlighter (8s), API refresh (5min)
- **Direct callbacks** - Components communicate via function callbacks (no events, no pub/sub)
- **Timer cleanup** - All timers cleaned up in stop() methods to prevent memory leaks
- **State independence** - Timers run independently of API refresh (no interruption)
- **Component coordination** - CarouselController.onPageChange → ItemHighlighter.reset()

**Data Flow:**
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

### Implementation Patterns to Document

**Naming Conventions:**
- **JavaScript variables/functions:** camelCase (`fetchBlogData`, `currentPage`, `rotatePage`)
- **JavaScript classes:** PascalCase (`CarouselController`, `ItemHighlighter`, `DetailPanel`)
- **CSS classes:** kebab-case (`carousel-page`, `list-item`, `list-item--highlighted`)
- **CSS custom properties:** kebab-case with prefix (`--color-fg-default`, --space-4`)
- **File names:** kebab-case with .js/.css (`carousel-controller.js`, `main.css`)

**GitHub Primer Token Usage (MANDATORY):**
- **Colors:** ALWAYS use `var(--color-*)` tokens, NEVER hardcoded hex/rgb
  - Example: `color: var(--color-fg-default)` NOT `color: #c9d1d9`
  - Available tokens: --color-canvas-*, --color-fg-*, --color-border-*, --color-accent-*, --color-danger-*, etc.
- **Spacing:** ALWAYS use `var(--space-*)` tokens or 8px multiples
  - Example: `margin: var(--space-4)` NOT `margin: 16px`
  - Available: --space-1 (4px), --space-2 (8px), --space-3 (12px), --space-4 (16px), etc.
- **Typography:** ALWAYS use `var(--fontsize-*)` tokens
  - Example: `font-size: var(--fontsize-large)` NOT `font-size: 20px`
  - Available: --fontsize-small, --fontsize-default, --fontsize-medium, --fontsize-large, etc.
- **Why mandatory:** Ensures visual consistency with GitHub's design system, easier theme changes, accessibility

**Component Communication Pattern:**
```javascript
// Direct callback pattern (NO events, NO pub/sub)

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

// Consumer (Main.js)
const carousel = new CarouselController();
carousel.onPageChange = (page) => {
  itemHighlighter.reset(); // Reset child component
  console.log(`Page changed to: ${page}`);
};
```

**Error Handling Pattern:**
```javascript
// Per-column isolation with retry + cached fallback

async function fetchWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      return await response.json();
    } catch (error) {
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
      }
    }
  }
  throw new Error('All retries failed');
}

// Use cached fallback
try {
  data = await fetchWithRetry(blogUrl);
  cache.blog = { data, timestamp: Date.now() };
} catch (error) {
  if (cache.blog.data) {
    console.warn('Using stale cached data');
    data = cache.blog.data;
  } else {
    // Show error message in UI (per-column isolation)
    displayError('blog', 'Unable to load blog posts');
  }
}
```

**Testing Approach:**
- **Manual visual testing** - Primary QA method (no automated UI tests)
- **Validation scripts** - Located in /test/ folder
  - `npm run test:validate` - GitHub Primer token compliance (checks for hardcoded colors/spacing)
  - `npm run test:health` - Dashboard health check (puppeteer-based)
  - `npm run test:memory` - Memory leak detection (24hr burn-in test)
- **Why manual testing:** Single-purpose kiosk display, visual correctness > logic coverage, rapid development
- **Real-world testing:** Actual Pi hardware required for performance validation

### Troubleshooting Scenarios (From Development Experience)

**Common Issues Encountered:**

1. **"Dashboard not rotating pages"**
   - **Symptoms:** Dashboard loads but stays on first page
   - **Cause:** Timer not starting, JavaScript error preventing rotation
   - **Solution:** Check browser console (F12) for JavaScript errors, verify `carousel.start()` called in main.js

2. **"API data not loading"**
   - **Symptoms:** Dashboard shows "Loading..." or empty sections
   - **Cause:** Network connectivity, CORS issues, API endpoint down, cache issue
   - **Solution:** 
     - Check browser Network tab (F12) for failed requests
     - Verify CORS allows requests from localhost
     - Test API endpoints directly: https://api.rss2json.com/v1/api.json?rss_url=...
     - Check if using cached data (look for console warning)

3. **"Build fails with Vite error"**
   - **Symptoms:** `npm run build` fails with module resolution errors
   - **Cause:** Wrong Node.js version, missing dependencies, Vite configuration issue
   - **Solution:**
     - Verify Node.js version: `node --version` (must be 18+)
     - Reinstall dependencies: `rm -rf node_modules package-lock.json && npm install`
     - Check vite.config.js for syntax errors

4. **"Pi not auto-starting dashboard"**
   - **Symptoms:** Pi boots but doesn't launch dashboard in kiosk mode
   - **Cause:** systemd services not enabled, dashboard-server.service failed, kiosk.service failed
   - **Solution:**
     - SSH to Pi: `ssh pi@github-dashboard.local`
     - Check service status: `systemctl status dashboard-server.service kiosk.service`
     - View logs: `journalctl -u dashboard-server.service -u kiosk.service -b`
     - Verify Python server running: `curl http://localhost:8000`

5. **"Performance issues / laggy animations"**
   - **Symptoms:** Fade transitions stutter, page rotation slow, high CPU usage
   - **Cause:** Pi hardware limitations, heavy CSS (box-shadows), memory leak, too many DOM nodes
   - **Solution:**
     - Verify Pi 3B hardware (not Pi Zero or Pi 2)
     - Check CPU usage: `top` on Pi
     - Check memory usage: `free -h` on Pi
     - Review CSS for expensive properties (box-shadow, filter, complex transforms)
     - Run memory leak test: `npm run test:memory`

6. **"Git pull fails on Pi"**
   - **Symptoms:** `git pull` fails with authentication error or permission denied
   - **Cause:** SSH keys not configured, repository access denied, network issue
   - **Solution:**
     - Verify Pi can reach GitHub: `ping github.com`
     - Check repository access: `git remote -v`
     - For HTTPS: ensure credentials cached or stored
     - For SSH: verify SSH key added to GitHub account

7. **"Wrong file edited (changes don't appear after build)"**
   - **Symptoms:** Made changes but they don't show up in built index.html
   - **Cause:** Edited root `/index.html` instead of `/src/index.html`
   - **Solution:**
     - **NEVER edit** `/index.html` at project root (build artifact)
     - **ALWAYS edit** `/src/index.html`, `/src/js/*.js`, `/src/css/*.css`
     - After editing source, run: `npm run build`
     - Verify changes in `/src/` directory, not root

### Previous Story Intelligence (Story 4.5 Learnings)

**Story 4.5: Burn-In Testing & Validation (Status: done)**

**Key Learnings:**
1. **Testing infrastructure complete but execution deferred** - Test scripts created and functional, but 24-hour burn-in test and Pi hardware testing deferred to deployment phase
2. **Test scripts location** - All test utilities in `/test/` folder, documentation in same location
3. **Documentation pattern established** - Comprehensive markdown guides created (BURN-IN-TEST-PROCEDURE.md, MEMORY-BASELINE.md, etc.)
4. **Manual testing crucial** - Physical Pi hardware required for reboot/network testing, cannot be automated
5. **Design token violations found** - `npm run test:validate` found 11 hardcoded colors, 24 non-base-8 spacing values - **Story 4.6 should reference these findings and emphasize Primer tokens in Implementation Patterns**

**Files Created in Story 4.5 (Reference for Documentation):**
- `/test/memory-monitor.js` - Memory leak detection (puppeteer)
- `/test/health-check.js` - Dashboard health validation
- `/test/validate-primer-colors.js` - Design token compliance checker
- `/test/burn-in-test.sh` - Master burn-in orchestration script
- `/test/BURN-IN-TEST-PROCEDURE.md` - Testing procedure documentation
- `/test/PRODUCTION-READINESS-REPORT-TEMPLATE.md` - Deployment approval template

**Testing Documentation Approach to Carry Forward:**
- Comprehensive markdown guides with step-by-step procedures
- Clear success criteria and validation checklists
- Examples of commands to run
- Troubleshooting sections within each guide
- **Apply same documentation quality to README enhancements**

**Deferred Testing Activities (Should Be Mentioned in README):**
- 24-hour burn-in test (run before deployment)
- Physical Pi hardware testing (reboot recovery, network resilience)
- Cross-browser testing (Chrome, Firefox, Edge, Chromium 84)
- Production readiness report generation

### Architecture Patterns (From project-context.md)

**File Editing Rules (CRITICAL - Must Document):**
- ❌ **NEVER edit** `/index.html` at project root (build artifact from Vite)
- ✅ **ALWAYS edit** `/src/index.html` for HTML structure
- ✅ **ALWAYS edit** `/src/js/*.js` for JavaScript
- ✅ **ALWAYS edit** `/src/css/*.css` for CSS
- 🔨 **After editing source, run** `npm run build` to regenerate root index.html

**ES Module Pattern (Document in README):**
```javascript
// Named exports (ALWAYS use for classes/functions)
export class CarouselController { }
export function fetchBlogData() { }

// Import with .js extension (REQUIRED for ES modules)
import { CarouselController } from './carousel-controller.js';
import { formatDate } from './utils.js';
```

**Build Architecture (Already Documented - Verify Accuracy):**
- **Source:** `/src/` directory (where developers edit)
- **Build temp:** `/dist/` folder (gitignored, temporary build output)
- **Deployment:** `/index.html` at root (committed, what Pi serves)
- **Workflow:** Edit src/ → `npm run build` → commit src/ + index.html → git push

**Deployment Model (Already Documented - Verify Clarity):**
- **Git-based** - No file copying, no SCP, no manual deployment
- **Pi auto-pull** - Systemd service pulls from GitHub on restart
- **Zero Node.js on Pi** - Serves pre-built index.html via Python http.server
- **Rollback** - Git revert commit, restart kiosk service

### Latest Technical Information

**Current Technology Versions (Verified from package.json and project state):**
- **Node.js:** 18+ required (ES2020 features, async/await, optional chaining)
- **npm:** 7+ (comes with Node.js 18+)
- **Vite:** 7.3.1 (current, build tool)
- **Puppeteer:** 24.37.5 (for test scripts, current supported version)
- **Target:** Chromium 84 on Raspberry Pi 3B (requires -webkit prefixes)

**GitHub Primer Design System (Current as of 2026):**
- **Reference:** https://primer.style/design
- **Color tokens:** Updated to GitHub's v2 color system (dark theme optimized)
- **Spacing tokens:** 8px base unit system (--space-1 through --space-16)
- **Typography tokens:** GitHub's type scale (--fontsize-small through --fontsize-xxlarge)
- **Accessibility:** WCAG 2.1 AAA compliant color contrasts

**API Endpoints (Current and Stable):**
- **RSS2JSON API:** https://api.rss2json.com/v1/api.json (free tier, no auth required)
- **GitHub Status API:** https://www.githubstatus.com/api/v2/incidents.json (public, no auth)
- **Rate Limits:** RSS2JSON allows reasonable usage, GitHub Status has no documented limit
- **CORS:** Both APIs allow cross-origin requests from browser

**Raspberry Pi OS (Current as of 2026):**
- **Latest stable:** Raspberry Pi OS Lite 64-bit (Debian 12 Bookworm-based)
- **Chromium version:** 84.x (stable for Pi 3B, legacy but sufficient)
- **Python version:** 3.11.x (pre-installed, used for http.server)
- **NetworkManager:** Default WiFi management tool (replaces wpa_supplicant in newer versions)

### Project Structure Notes

**Current File Structure (Verified from workspace):**
```
github-latest-dashboard/
├── src/                          # Source files (EDIT THESE)
│   ├── index.html               # HTML structure (source)
│   ├── js/                      # JavaScript modules
│   │   ├── main.js
│   │   ├── carousel-controller.js
│   │   ├── item-highlighter.js
│   │   ├── detail-panel.js
│   │   ├── api-client.js
│   │   ├── persistent-alert.js
│   │   └── utils.js
│   └── css/                     # CSS stylesheets
│       ├── main.css
│       ├── layout.css
│       ├── components.css
│       └── reset.css
├── index.html                    # Built artifact (DO NOT EDIT)
├── package.json                  # Dependencies and scripts
├── vite.config.js               # Vite build configuration
├── README.md                     # Main documentation (TO UPDATE)
├── docs/                         # Additional documentation
│   ├── raspberry-pi-setup.md    # Pi deployment guide (REVIEW)
│   └── sprite-sheet-animation-guide.md
├── deploy/                       # Pi deployment files
│   ├── README.md
│   ├── start-kiosk.sh
│   ├── update-dashboard.sh
│   ├── systemd/                 # systemd service files
│   └── openbox/                 # Openbox kiosk config
├── test/                         # Testing utilities (Story 4.5)
│   ├── memory-monitor.js
│   ├── health-check.js
│   ├── validate-primer-colors.js
│   ├── burn-in-test.sh
│   └── *.md                     # Test documentation
└── _bmad-output/                 # BMAD artifacts (internal)
    └── project-context.md       # AI agent rules (internal)
```

**Documentation Files to Update:**
1. **README.md** - Add Architecture, Implementation Patterns, Troubleshooting
2. **docs/raspberry-pi-setup.md** - Review for accuracy, add missing troubleshooting if needed

**Documentation Files Already Complete:**
- ✅ deploy/README.md - Deployment scripts documentation
- ✅ test/*.md files - Testing documentation (Story 4.5)
- ✅ _bmad-output/project-context.md - Internal AI agent rules

**No Conflicts Detected:**
- All documentation updates are additive (not replacing existing content)
- Existing README structure is good foundation to build upon
- Pi setup guide is comprehensive, needs review only

### References

**Source Artifacts:**
- [Epic 4 Context: _bmad-output/planning-artifacts/epics.md, lines 1159-1506]
- [Story 4.6 Requirements: _bmad-output/planning-artifacts/epics.md, lines 1443-1506]
- [Current README: README.md, 219 lines]
- [Pi Setup Guide: docs/raspberry-pi-setup.md, 1309 lines]
- [Project Context: _bmad-output/project-context.md, 957 lines]
- [Previous Story (4.5): _bmad-output/implementation-artifacts/4-5-implement-burn-in-testing-validation.md]

**Technical References:**
- [Vite Documentation: vitejs.dev/guide]
- [GitHub Primer Design System: primer.style/design]
- [Raspberry Pi OS Documentation: raspberrypi.com/documentation]
- [ES Modules Guide: developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules]

**Component Source Files (For Architecture Documentation):**
- [CarouselController: src/js/carousel-controller.js]
- [ItemHighlighter: src/js/item-highlighter.js]
- [DetailPanel: src/js/detail-panel.js]
- [APIClient: src/js/api-client.js]
- [PersistentAlert: src/js/persistent-alert.js]
- [Utils: src/js/utils.js]
- [Main: src/js/main.js]

---

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.5 (GitHub Copilot)

### Debug Log References

_Will be populated during implementation._

### Completion Notes List

_Will be populated after story completion._

### File List

**Expected File Modifications:**
- README.md (add Architecture, Implementation Patterns, Troubleshooting sections)
- docs/raspberry-pi-setup.md (review and polish, minimal changes expected)

**No New Files Expected:**
- This is a documentation story - updates existing files only
- All code artifacts already exist from previous stories

