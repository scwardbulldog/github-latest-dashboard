---
project_name: 'github-latest-dashboard'
user_name: 'Shane'
date: '2026-02-17'
sections_completed: ['technology_stack', 'language_rules', 'code_quality', 'deployment_workflow', 'critical_rules']
status: 'complete'
rule_count: 87
optimized_for_llm: true
existing_patterns_found: 15
---

# Project Context for AI Agents

_This file contains critical rules and patterns that AI agents must follow when implementing code in this project. Focus on unobvious details that agents might otherwise miss._

---

## Technology Stack & Versions

**Core Technologies:**
- **HTML5, CSS3, Vanilla JavaScript (ES6+)** - Single index.html file (743 lines)
- **No frameworks, no bundlers, no transpilers** - Pure static web page
- **External APIs:**
  - RSS2JSON API (rss2json.com/v1/api.json) - GitHub Blog & Changelog feeds
  - GitHub Status API (githubstatus.com/api/v2/incidents.json)

**Deployment Environment:**
- **Hardware:** Raspberry Pi 3B (1GB RAM, quad-core ARM)
- **OS:** Raspberry Pi OS Lite (64-bit)
- **Browser:** Chromium 84 (kiosk mode, fullscreen)
- **Web Server:** Python 3 http.server (port 8000)
- **File Transfer:** Manual SCP of index.html to Pi

**Build & Deployment:**
- **Current:** Zero build process, manual deployment
- **Preference:** Automated build tooling and automated deployment desired
- **Constraint:** Must work elegantly without significant overhead

**CSS & JavaScript Compatibility:**
- **CSS:** Modern features supported (Grid, Flexbox, Custom Properties), -webkit prefixes for Chromium 84
- **JavaScript:** ES6+ supported (async/await, template literals, Promises, arrow functions)
- **Performance:** Pi 3B limitations - avoid heavy animations, complex box-shadows, large libraries

**Important Constraints:**
- **Not constrained to single-file** - Can evolve to multi-file architecture if beneficial
- **External dependencies acceptable** - IF they deploy elegantly without significant overhead
- **Zero external files currently** - All CSS and JavaScript inline in index.html

## Critical Implementation Rules

### Language-Specific Rules (JavaScript/HTML/CSS)

**Current Architecture (Single-File):**
- **index.html (743 lines):** HTML structure + CSS (lines 7-212) + JavaScript (lines 244-444)
- **Future flexibility:** Can evolve to separate CSS/JS files if beneficial
- **Migration path:** When splitting files, preserve the patterns below

**JavaScript Code Patterns (maintain regardless of file structure):**

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

**Async/Await Conventions:**
- **Parallel fetching required:** Use `Promise.all()` for simultaneous API calls
- **Error handling pattern:** Every async function must have try/catch with fallback UI
```javascript
async function fetchData() {
    try {
        // API call logic
    } catch (error) {
        console.error('Error:', error);
        container.innerHTML = `<div class="error">Error message</div>`;
    }
}
```

**Utility Functions - MUST REUSE (don't recreate):**
- `formatDate(dateString)` - Converts ISO dates to relative time ("2 hours ago")
- `stripHtml(html)` - Removes HTML tags using DOM parsing (safe for RSS content)
- `truncate(text, maxLength)` - Hard character truncation with ellipsis
- **Note:** If splitting to external files, keep these in a shared utilities module

**CSS Patterns (maintain regardless of file structure):**

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
- **ALWAYS use -webkit prefixes** for modern CSS features:
  - `-webkit-line-clamp` for text truncation
  - `-webkit-box-orient` with display: -webkit-box
- **Avoid:** Complex box-shadows (Pi 3B performance)
- **Prefer:** Simple borders, background colors, opacity-based effects

**API Integration Pattern:**
- **RSS2JSON API:** `${RSS2JSON_API}?rss_url=${encodeURIComponent(RSS_URL)}`
- **Always encode:** Use `encodeURIComponent()` for URL parameters
- **Response structure:** Check `data.status === 'ok'` before processing items

**Performance Rules for Pi 3B (hardware constraint):**
- **Item limits:** Slice to 7-8 items max per column (fits screen without scroll)
- **Animations:** Keep simple (fadeIn, hover transitions), avoid complex transforms
- **DOM updates:** Batch with innerHTML rather than createElement loops
- **External libraries:** Evaluate bundle size impact - Pi 3B has limited resources

**File Organization Options (when/if splitting from single-file):**
- **Option 1:** Keep single index.html for simplicity
- **Option 2:** Separate to index.html + styles.css + app.js (requires build step for deployment)
- **Option 3:** Component-based structure (requires bundler)
- **Decision criteria:** Only split if it improves maintainability without adding deployment complexity

### Code Quality & Style Rules

**Core Design Principle:**
- **ALWAYS match GitHub UI/UX vibes** - This dashboard represents GitHub, so it must feel like GitHub
- **GitHub Primer Design System** - The authoritative source for colors, typography, spacing, and patterns
- **Authenticity over creativity** - When in doubt, copy GitHub's actual UI patterns

**Color Palette (GitHub Primer - NON-NEGOTIABLE):**
```css
/* ALWAYS use these exact GitHub Primer colors */
Background: #0d1117        /* GitHub dark theme background */
Text Primary: #c9d1d9     /* GitHub primary text */
Text Secondary: #7d8590   /* GitHub muted text */
Border/Divider: #21262d   /* GitHub subtle borders */
Link Blue: #58a6ff        /* GitHub link color */
Hover Blue: #79c0ff       /* GitHub link hover */
Status Green: #2da44e     /* GitHub success/operational */
Status Yellow: #bf8700    /* GitHub warning/minor */
Status Red: #cf222e       /* GitHub danger/major */
Purple (features): #8250df /* GitHub new feature accent */
```

**Design Reference Sources:**
- **GitHub.com UI** - Inspect actual GitHub pages for spacing, borders, hover states
- **GitHub Primer** (primer.style) - Official design system documentation
- **UX Spec** (`_bmad-output/planning-artifacts/dashboard-redesign-specs.md`) - Project-specific design decisions

**Typography (GitHub Style):**
- **Font Stack:** `-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif` (GitHub's exact stack)
- **Font Weights:** 400 (normal), 600 (semibold) - match GitHub's weight choices
- **Letter Spacing:** Uppercase headers use `letter-spacing: 1px` for GitHub feel
- **Line Heights:** 1.3-1.5 for readability at TV viewing distance

**Code Organization (Current Single-File Structure):**
- **HTML Structure:** Lines 1-243 (head, body, dashboard grid)
- **CSS Styles:** Lines 7-212 within `<style>` block in `<head>`
- **JavaScript Logic:** Lines 244-444 within `<script>` block before `</body>`
- **Strict separation:** Keep these sections clearly delineated

**CSS Organization Pattern:**
```css
/* Section 1: Global/Reset styles (*, body) */
/* Section 2: Layout components (header, dashboard-container, section) */
/* Section 3: Base item styles (.item, .item-title, etc.) */
/* Section 4: Column-specific styles (.blog-item, .changelog-item, .status-card) */
/* Section 5: Utility classes (.loading, .error) */
/* Section 6: Media queries and animations */
```

**JavaScript Function Organization Pattern:**
```javascript
// 1. Configuration constants (RSS2JSON_API, GITHUB_BLOG_RSS, etc.)
// 2. Utility functions (formatDate, stripHtml, truncate)
// 3. Data fetching functions (fetchBlog, fetchChangelog, fetchStatus)
// 4. UI update functions (updateTimestamp, startProgressBar)
// 5. Orchestration (fetchAllData)
// 6. Initialization and intervals
```

**Naming Conventions:**
- **CSS Classes:** kebab-case (`.changelog-badge`, `.status-card-operational`)
- **JavaScript Variables:** camelCase (`lastUpdated`, `progressInterval`)
- **Constants:** UPPER_SNAKE_CASE (`RSS2JSON_API`, `REFRESH_INTERVAL`)
- **Functions:** camelCase descriptive verbs (`fetchBlog`, `formatDate`, `startProgressBar`)
- **DOM IDs:** kebab-case matching semantic purpose (`blog-content`, `refresh-progress`)

**Comment Patterns:**
- **Section headers:** `/* Modern Dashboard: Feature Name */` for major UI sections
- **Inline comments:** Brief explanations for non-obvious logic
- **No JSDoc currently:** Simple function names are self-documenting
- **TV Display notes:** Comments like `// TV Display: Limit to 8 items` explain Pi-specific constraints

**HTML Structure Conventions:**
- **Semantic sections:** Each column has `.section` wrapper with `.section-header` and `.section-content`
- **Data attributes:** Not used currently - rely on IDs for DOM selection
- **Accessibility:** Basic HTML semantics (h1, h2), no ARIA currently (kiosk display)

**Spacing/Layout Constants (GitHub-inspired):**
- **Grid gap:** 24px (desktop), 32px (between columns)
- **Padding:** 20px (body), 24px (sections)
- **Font sizes:** 1.5em (h1), 1em (h2), 1.0625em (item-title), 0.75em (dates)
- **Border radius:** 4px or 6px (match GitHub's subtle rounded corners)

**Visual Effects (Keep it GitHub-minimal):**
- **Transitions:** 0.2s ease for hover states (GitHub standard)
- **Hover states:** Subtle background changes with `rgba(255, 255, 255, 0.03)`
- **No shadows:** Avoid box-shadows (Pi performance + GitHub uses minimal shadows)
- **Borders over shadows:** Use colored borders for emphasis (GitHub pattern)

**Anti-Patterns to Avoid:**
- ❌ Don't add external CSS frameworks (Bootstrap, Tailwind) - conflicts with Pi performance
- ❌ Don't use jQuery or heavy DOM libraries - vanilla JS is sufficient
- ❌ Don't create separate CSS files without build automation - manual deployment is error-prone
- ❌ Don't use `var` - always use `const` or `let`
- ❌ Don't use `.innerHTML` without sanitization for user input (OK for trusted API data)
- ❌ Don't deviate from GitHub Primer colors - maintain visual consistency
- ❌ Don't add flashy animations or effects - GitHub is clean and minimal

**File/Directory Naming (if expanding beyond single file):**
- **CSS files:** `styles.css` or feature-based `dashboard.css`
- **JS files:** `app.js` or feature-based `api-client.js`, `ui-utils.js`
- **Assets:** `/assets/` directory for images, fonts if needed
- **Deployment artifact:** Always generates `index.html` (single entry point for Pi)

### Deployment & Workflow Rules

**Current Deployment Process (Manual):**
1. Developer edits `index.html` locally
2. Manual SCP to Pi: `scp index.html pi@github-dashboard.local:/home/pi/dashboard/`
3. Dashboard auto-refreshes (no restart needed - Python http.server serves updated file)
4. No build step, no bundling, no transpilation

**Deployment Constraints:**
- **Target hardware:** Raspberry Pi 3B running Raspberry Pi OS Lite (64-bit)
- **Web server:** Python 3 http.server on port 8000 (systemd service: `dashboard-server.service`)
- **Browser:** Chromium 84 in kiosk mode (systemd service: `kiosk.service`)
- **Network:** Pi connects via WiFi, serves localhost:8000
- **User account:** Default `pi` user (or custom username set during setup)

**Critical Deployment Rules:**

**File Location on Pi:**
- **Dashboard files:** `/home/pi/dashboard/` (or `/home/{username}/dashboard/`)
- **Entry point:** Must be named `index.html` - Python http.server serves this by default
- **All assets:** Must be in or under `/home/pi/dashboard/` directory
- **No subdirectories currently:** Single file deployment keeps it simple

**Systemd Services (DO NOT MODIFY without testing):**
- **dashboard-server.service:** Python http.server, auto-starts on boot, depends on network
- **kiosk.service:** Chromium kiosk mode, auto-starts after dashboard-server, depends on X11
- **Restart commands:** 
  - Dashboard only: No restart needed (http.server serves updated file)
  - Browser refresh: `sudo systemctl restart kiosk.service`
  - Web server: `sudo systemctl restart dashboard-server.service`

**Kiosk Configuration Files (DO NOT MODIFY unless intentional):**
- `/home/pi/start-kiosk.sh` - Kiosk launcher script (disables screen blanking, launches Chromium)
- `/home/pi/.config/openbox/autostart` - Openbox autostart configuration
- `/etc/systemd/system/kiosk.service` - Kiosk systemd service
- `/etc/systemd/system/dashboard-server.service` - Web server systemd service

**Pi-Specific Constraints:**
- **No npm/Node.js on Pi** - Pi runs the dashboard, not a build process
- **No write access for web server** - Dashboard is read-only (no form submissions, no persistence)
- **Limited CPU/RAM** - Avoid resource-intensive processes on the Pi itself
- **24/7 uptime expected** - Services configured with `Restart=on-failure`

**Future Automation Goals:**
- **Automated build:** Consider build process on dev machine (concatenation, minification)
- **Automated deployment:** Consider CI/CD pipeline or deploy script
- **Must remain elegant:** No complex deployment steps, preserve simplicity

**Development Workflow (Current):**
1. **Local development:** Edit `index.html` in project repo
2. **Local testing:** Open in browser (`file://` or local http server)
3. **Version control:** Commit to git (repo: `scwardbulldog/github-latest-dashboard`, branch: `main`)
4. **Deploy to Pi:** Manual SCP transfer
5. **Verify:** Check dashboard on TV display

**Git Workflow:**
- **Main branch:** `main` (default and current branch)
- **Commit messages:** Descriptive, explain what changed and why
- **No branching strategy currently:** Direct commits to main for small team
- **Remote:** GitHub repository `scwardbulldog/github-latest-dashboard`

**Testing Strategy:**
- **No automated tests currently** - Manual visual testing on TV display
- **Testing locations:**
  - Local browser (desktop) - Quick iteration
  - Pi display (TV) - Final verification at viewing distance
- **Critical test:** View from 10-15 feet away (typical TV viewing distance)

**Deployment Checklist (for AI agents making changes):**
1. ✅ Test locally in browser first
2. ✅ Verify GitHub Primer colors match design spec
3. ✅ Check Chromium 84 compatibility (CSS prefixes)
4. ✅ Ensure file is valid HTML5 (no build errors)
5. ✅ Keep file size reasonable (Pi serves over WiFi)
6. ✅ Test error states (API failures, network issues)
7. ✅ Commit to git with descriptive message
8. ✅ Deploy to Pi via SCP
9. ✅ Verify on actual TV display from distance

**Documentation Requirements:**
- **README.md:** Keep updated with deployment instructions
- **docs/raspberry-pi-setup.md:** Comprehensive Pi setup guide (1110 lines) - DO NOT MODIFY unless deployment process changes
- **Tech specs:** Document in `_bmad-output/implementation-artifacts/` for complex changes
- **PRD:** Reference `_bmad-output/planning-artifacts/prd.md` for feature requirements

### Critical Don't-Miss Rules

**Anti-Patterns to Avoid:**

**❌ NEVER break the GitHub aesthetic:**
- Don't use colors outside GitHub Primer palette
- Don't add custom fonts or font weights GitHub doesn't use
- Don't create UI patterns that don't exist on GitHub.com
- Don't use emojis in production UI (icons/symbols only in comments)

**❌ NEVER ignore Pi 3B performance constraints:**
- Don't add lodash, moment.js, or other heavy libraries (use native JS)
- Don't use complex CSS animations (transforms, 3D effects, particles)
- Don't add box-shadows with blur (use simple borders instead)
- Don't create deep DOM trees (keep structure flat)
- Don't load large images or media files

**❌ NEVER break the kiosk deployment:**
- Don't rename `index.html` (Python http.server expects this name)
- Don't add external file dependencies without updating deployment process
- Don't require npm/Node.js on the Pi itself
- Don't modify systemd services without testing on actual Pi hardware
- Don't add features requiring user input (dashboard is display-only)

**❌ NEVER skip error handling:**
- Don't call APIs without try/catch blocks
- Don't update DOM without checking element exists
- Don't assume API responses have expected structure (always validate)
- Don't let errors break the entire dashboard (isolated error states per column)

**Edge Cases That MUST Be Handled:**

**API Failure Scenarios:**
```javascript
// ALWAYS handle these cases:
// 1. Network timeout/offline
// 2. API returns non-200 status
// 3. API returns malformed JSON
// 4. API returns empty items array
// 5. RSS2JSON service down (data.status !== 'ok')

// Pattern:
try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status !== 'ok' || !data.items || data.items.length === 0) {
        container.innerHTML = '<div class="error">No data available</div>';
        return;
    }
    // Process items...
} catch (error) {
    console.error('Error:', error);
    container.innerHTML = `<div class="error">Error loading content</div>`;
}
```

**Data Quality Issues:**
- **Missing titles:** RSS feeds sometimes have empty title fields
- **Missing dates:** pubDate can be null or malformed
- **HTML in content:** Always use `stripHtml()` before displaying descriptions
- **Very long titles:** GitHub changelog titles can exceed 200 characters
- **Special characters:** Properly escape with template literals (auto-escaped)

**Display/Rendering Edge Cases:**
- **TV viewing distance:** Must be readable from 10-15 feet away (test on actual TV)
- **Screen blanking:** Handled by kiosk.service, but verify `xset s off` is working
- **Refresh during display:** 5-minute auto-refresh should be smooth (no flicker)
- **Resolution mismatches:** Dashboard should work on various TV resolutions (responsive design)

**Pi-Specific Gotchas:**
- **WiFi connection loss:** Dashboard continues serving cached content, but API calls fail gracefully
- **SD card corruption:** Keep writes minimal (logs are rotated, no file writes from dashboard)
- **Thermal throttling:** Pi 3B throttles at 80°C - avoid CPU-intensive operations
- **Power interruptions:** Services auto-restart on boot, but test recovery

**Browser-Specific Issues (Chromium 84):**
- **Modern JS features:** Most ES6+ works, but avoid cutting-edge features (optional chaining, nullish coalescing are OK)
- **CSS Grid:** Fully supported
- **Flexbox:** Fully supported
- **CSS Custom Properties:** Fully supported
- **Fetch API:** Fully supported
- **-webkit prefixes:** Required for `-webkit-line-clamp`, `-webkit-box-orient`

**Security Considerations:**

**✅ SAFE (current implementation):**
- Using `.innerHTML` with trusted API data (GitHub RSS feeds, GitHub Status API)
- No user input fields or form submissions
- No cookies, no localStorage, no sessions
- No sensitive data displayed or stored

**⚠️ IF expanding functionality:**
- Don't add user input without sanitization
- Don't store credentials in code (use environment variables if needed)
- Don't expose internal network information
- Don't add features requiring authentication (dashboard is public display)

**Performance Optimization Rules:**

**✅ DO:**
- Limit items to 7-8 per column (fits screen, reduces DOM size)
- Use `Promise.all()` for parallel API calls
- Batch DOM updates with `.innerHTML` (faster than individual createElement)
- Use CSS transitions instead of JavaScript animations
- Keep refresh interval at 5 minutes (balances freshness vs. API load)

**❌ DON'T:**
- Poll APIs more frequently than 5 minutes (unnecessary API load)
- Render more items than fit on screen (wasted rendering)
- Use `setInterval` for animations (use CSS or requestAnimationFrame)
- Create memory leaks with uncleaned event listeners
- Load external resources on every refresh (use browser caching)

**Critical "Must Remember" Rules:**

1. **Preserve utility functions:** Always reuse `formatDate()`, `stripHtml()`, `truncate()` - don't recreate
2. **Test on actual TV:** Desktop browser testing is insufficient - verify at viewing distance
3. **Match GitHub exactly:** When in doubt, inspect GitHub.com and copy their approach
4. **Keep it simple:** Simplicity is a feature for 24/7 kiosk reliability
5. **Error states per column:** One column failing shouldn't break others
6. **Chromium 84 compatibility:** Always check caniuse.com for Chromium 84 support
7. **No build process currently:** Any change requiring build tools needs deployment strategy update

---

## Usage Guidelines

**For AI Agents:**

- Read this file before implementing any code
- Follow ALL rules exactly as documented
- When in doubt, prefer the more restrictive option
- Always match GitHub Primer design system
- Test on Pi 3B hardware constraints
- Update this file if new patterns emerge

**For Humans:**

- Keep this file lean and focused on agent needs
- Update when technology stack changes
- Review when deployment process evolves
- Remove rules that become obvious over time
- Reference when onboarding new AI agents to the project

**Last Updated:** 2026-02-17
