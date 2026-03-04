# Story 4.5: Implement Burn-In Testing & Validation

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

---

## Story

As a developer,
I want comprehensive testing to validate 24/7 reliability,
So that I have confidence deploying to production.

---

## Acceptance Criteria

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

## Epic Context

### Epic 4: Production Reliability & Polish

**Epic Goal:** Team members trust the dashboard to run 24/7 without intervention, with graceful handling of network issues, clear error feedback, and performance optimized for comfortable viewing from 10-15 feet away.

**What This Story Delivers:**
- Comprehensive 24-hour burn-in test protocol validating memory stability
- Timer accuracy measurement tools and validation criteria (±1s page, ±0.5s item)
- API refresh validation ensuring data updates without timer disruption
- Power recovery testing confirming auto-restart capabilities
- Network resilience testing validating graceful degradation and recovery
- GitHub Primer design validation against official standards
- Cross-browser compatibility verification
- Production readiness checklist and sign-off criteria

**What This Story Does NOT Include:**
- Feature development (all features complete in Stories 4.1-4.4)
- Documentation (Story 4.6)
- User acceptance testing (internal validation only)

**Story Position:** Fifth story in Epic 4 (4.5 of 4.6)

**Dependencies:**
- ✅ Epic 1 completed: Vite build system, component structure
- ✅ Epic 2 completed: Carousel page rotation (30s timer)
- ✅ Epic 3 completed: Split-view layout, item highlighting (8s timer), dual timer coordination
- ✅ Story 4.1 completed: Error handling, retry logic, cached fallback
- ✅ Story 4.2 completed: Performance optimization, GPU-accelerated animations
- ✅ Story 4.3 in review: Persistent outage indicator
- ✅ Story 4.4 in review: Distance-optimized typography

**Critical Success Factors:**
- 24-hour burn-in test MUST complete without memory leaks or crashes
- Timer accuracy MUST stay within specified tolerances (±1s page, ±0.5s item)
- All automated validation scripts MUST pass
- Manual testing checklists MUST be completed with sign-off
- Production deployment CANNOT proceed until all ACs met

---

## Tasks / Subtasks

- [ ] **Task 1: Create Memory Leak Detection Tools** (AC: Memory usage stays stable over 24+ hours)
  - [ ] Subtask 1.1: Create browser memory monitoring script using Chrome DevTools Protocol
  - [ ] Subtask 1.2: Add memory usage logging to console every 5 minutes (timestamp + heap size)
  - [ ] Subtask 1.3: Create automated memory analysis script (baseline vs 24hr comparison)
  - [ ] Subtask 1.4: Document memory baseline expectations (acceptable growth: <10MB over 24hrs)

- [ ] **Task 2: Implement Timer Accuracy Measurement** (AC: ±1s page rotation, ±0.5s item highlighting)
  - [ ] Subtask 2.1: Add timer accuracy logging in carousel-controller.js (log actual vs expected)
  - [ ] Subtask 2.2: Add timer accuracy logging in item-highlighter.js (log actual vs expected)
  - [ ] Subtask 2.3: Create timer drift analysis script (cumulative drift over 24 hours)
  - [ ] Subtask 2.4: Set up automated alerts if drift exceeds tolerance (±1s page, ±0.5s item)

- [ ] **Task 3: Create Burn-In Test Protocol** (AC: Dashboard runs 24+ hours without issues)
  - [ ] Subtask 3.1: Create burn-in test startup script (launch dashboard with monitoring)
  - [ ] Subtask 3.2: Define validation checkpoints (0hr, 6hr, 12hr, 18hr, 24hr)
  - [ ] Subtask 3.3: Create automated health check script (timers running, no console errors, API fetching)
  - [ ] Subtask 3.4: Document burn-in test procedure and success criteria

- [ ] **Task 4: API Refresh Validation** (AC: 5-minute refresh maintains timer state)
  - [ ] Subtask 4.1: Add API refresh event logging (timestamp, endpoint, success/failure)
  - [ ] Subtask 4.2: Validate timer continuity across refresh (timers don't reset or pause)
  - [ ] Subtask 4.3: Validate page/item position persistence (carousel/highlighter state preserved)
  - [ ] Subtask 4.4: Test API failure scenarios (all retries fail, verify cached content display)

- [ ] **Task 5: Power Recovery & Network Resilience Testing** (AC: Auto-recovery without intervention)
  - [ ] Subtask 5.1: Test Pi reboot recovery (systemd auto-start, dashboard loads in kiosk mode)
  - [ ] Subtask 5.2: Measure recovery time from power on to dashboard functional (<2 minutes)
  - [ ] Subtask 5.3: Test network disconnect/reconnect (WiFi off 10 min, verify cache → recovery)
  - [ ] Subtask 5.4: Validate network status indicator behavior (appears/disappears correctly)

- [ ] **Task 6: GitHub Primer Design Validation** (AC: Exact color/spacing/typography match)
  - [ ] Subtask 6.1: Create automated color validation script (extract CSS colors, compare to Primer palette)
  - [ ] Subtask 6.2: Validate spacing using 8px base unit (all margins/paddings use --space-* tokens)
  - [ ] Subtask 6.3: Validate typography hierarchy (font sizes match --fontsize-* tokens)
  - [ ] Subtask 6.4: Visual comparison against GitHub.com screenshots (manual review)

- [ ] **Task 7: Cross-Browser Compatibility Testing** (AC: Works on Chrome, Firefox, Edge)
  - [ ] Subtask 7.1: Test on Chrome (latest) - visual, functional, console errors
  - [ ] Subtask 7.2: Test on Firefox (latest) - visual, functional, console errors
  - [ ] Subtask 7.3: Test on Edge (latest) - visual, functional, console errors
  - [ ] Subtask 7.4: Test on Chromium 84 (Pi target) - validate -webkit prefixes, performance

- [ ] **Task 8: Production Readiness Validation** (AC: All criteria met, deployment approved)
  - [ ] Subtask 8.1: Execute full burn-in test (24+ hours) - document results
  - [ ] Subtask 8.2: Complete all automated validation scripts - all passing
  - [ ] Subtask 8.3: Complete manual testing checklists - all signed off
  - [ ] Subtask 8.4: Create production readiness report - approval for deployment

---

## Dev Notes

### Critical Context: This Is Quality Assurance, Not Feature Development

**IMPORTANT:** This story is about comprehensive validation and testing of existing functionality. No new features should be added. Focus is on:
1. Automated testing scripts and tools
2. Manual testing protocols and checklists
3. Production readiness validation
4. Documentation of test results

### Current Component Architecture (To Be Tested)

**Existing Components (from /src/js/):**
- `carousel-controller.js` (5.2KB) - Page rotation with 30s timer
- `item-highlighter.js` (3.4KB) - Item highlighting with 8s timer
- `detail-panel.js` (4.7KB) - Detail view rendering (reactive)
- `api-client.js` (8.5KB) - Data fetching with 5-minute refresh, retry logic, caching
- `persistent-alert.js` (4.3KB) - Cross-page outage indicator
- `main.js` (34.3KB) - Application entry point, component wiring
- `utils.js` (1.7KB) - Shared utilities (formatDate, stripHtml, truncate)

**Key Testing Targets:**
- **Memory Leaks:** Timer cleanup in carousel/highlighter, DOM reference cleanup
- **Timer Accuracy:** setInterval drift over 24 hours, synchronization across refreshes
- **API Resilience:** Retry logic (3x with backoff), cached fallback, per-column isolation
- **Network Recovery:** Live dot indicator, cached content during outage, auto-recovery
- **State Persistence:** Carousel/highlighter position maintained across API refresh

### Memory Leak Detection Strategy

**Chrome DevTools Protocol Approach:**

Create a Node.js script using Puppeteer to monitor memory:

```javascript
// test/memory-monitor.js
const puppeteer = require('puppeteer');

async function monitorMemory() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto('http://localhost:5173');
  
  const interval = 5 * 60 * 1000; // 5 minutes
  const duration = 24 * 60 * 60 * 1000; // 24 hours
  let startTime = Date.now();
  
  while (Date.now() - startTime < duration) {
    const metrics = await page.metrics();
    const memory = await page.evaluate(() => performance.memory);
    
    console.log({
      timestamp: new Date().toISOString(),
      heapUsed: Math.round(memory.usedJSHeapSize / 1024 / 1024) + 'MB',
      heapLimit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024) + 'MB',
      documents: metrics.Documents,
      jsEventListeners: metrics.JSEventListeners
    });
    
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  
  await browser.close();
}

monitorMemory();
```

**Expected Baseline:**
- Initial heap: ~15-25MB (including Chromium overhead)
- Acceptable growth: <10MB over 24 hours
- Event listeners: Should remain constant (no accumulation)
- Documents: Should remain at 1 (no orphaned DOMs)

**Warning Signs:**
- Continuous upward trend in heap usage (linear or exponential)
- Growing event listener count (indicates cleanup failure)
- Multiple document count (indicates DOM leak)

### Timer Accuracy Measurement Strategy

**Instrumentation Approach:**

Add logging to carousel-controller.js and item-highlighter.js:

```javascript
// Add to carousel-controller.js rotatePage() method
rotatePage() {
  const actualTime = Date.now();
  const expectedTime = this.lastRotation + this.interval;
  const drift = actualTime - expectedTime;
  
  if (Math.abs(drift) > 1000) { // >1 second drift
    console.warn(`⚠️ Carousel drift: ${drift}ms`);
  }
  
  this.lastRotation = actualTime;
  // ...rest of rotation logic
}
```

**Drift Analysis Script:**

Create a log parser that analyzes 24 hours of timer logs:

```javascript
// test/analyze-timer-drift.js
// Parse console logs, extract drift measurements
// Calculate cumulative drift over 24 hours
// Report: average drift, max drift, cumulative drift
// PASS if: avg <500ms page, <250ms item; cumulative <5s
```

**Expected Results:**
- Page rotation: 30s ± 1s (29-31s acceptable)
- Item highlighting: 8s ± 0.5s (7.5-8.5s acceptable)
- Cumulative drift: <5s over 24 hours total
- No timer resets during API refresh

### API Refresh Validation Strategy

**Test Protocol:**

1. **Normal Operation:** Monitor 5-minute refresh cycles for 2 hours (24 refreshes)
2. **Network Failure:** Disconnect WiFi, verify retry logic (3x with backoff 1s, 2s, 4s)
3. **Cached Fallback:** Confirm dashboard displays cached content when all retries fail
4. **Recovery:** Reconnect WiFi, verify next refresh succeeds and fresh data loads
5. **Timer Continuity:** Confirm carousel/highlighter timers never pause during refresh

**Validation Checklist:**
- [ ] API calls occur every 5 minutes (±5 seconds)
- [ ] Retry logic executes on failure (3 attempts with backoff)
- [ ] Cached content displayed when all retries fail
- [ ] Network indicator (`live-dot.offline`) appears during outage
- [ ] Dashboard recovers automatically when network returns
- [ ] Timers continue running during entire refresh cycle

### Power Recovery Testing Protocol

**Test Procedure:**

1. **Baseline:** Confirm dashboard running normally on Pi
2. **Power Off:** Pull power plug (simulate outage)
3. **Wait:** 30 seconds (ensure full shutdown)
4. **Power On:** Restore power to Pi
5. **Monitor:** Use stopwatch to measure time to dashboard loaded
6. **Validate:** All functionality works (timers, API fetching, transitions)

**systemd Auto-Start Validation:**
```bash
# On Pi, verify services are enabled
systemctl status dashboard-server.service
systemctl status kiosk.service

# Check service startup time
journalctl -u dashboard-server.service -b | grep "Started"
journalctl -u kiosk.service -b | grep "Started"
```

**Success Criteria:**
- Dashboard visible in Chromium kiosk mode <2 minutes after power on
- All timers functioning (page rotation, item highlighting)
- API data loads successfully (or cached content if network slow)
- No manual SSH or intervention required

### Network Resilience Testing Protocol

**Test Procedure:**

1. **Disconnect WiFi:** Turn off guest network or disconnect Pi WiFi
2. **Wait 30 seconds:** Verify dashboard shows cached content
3. **Observe Indicator:** Confirm live dot changes to `offline` (yellow)
4. **Wait 10 minutes:** Dashboard continues functioning with cached content
5. **Reconnect WiFi:** Restore network connectivity
6. **Observe Recovery:** Live dot returns to green, data refreshes within 5 minutes

**Validation Checklist:**
- [ ] Cached content displayed immediately when network drops
- [ ] Network status indicator (`live-dot.offline`) appears
- [ ] Page rotation continues normally (timers not affected)
- [ ] Item highlighting continues normally (timers not affected)
- [ ] No JavaScript errors in console during outage
- [ ] Dashboard recovers automatically when network returns
- [ ] Fresh data loads within 5 minutes of reconnection

### GitHub Primer Design Validation

**Automated Color Validation Script:**

```javascript
// test/validate-primer-colors.js
const primerColors = {
  '--color-canvas-default': '#0d1117',
  '--color-fg-default': '#c9d1d9',
  '--color-accent-fg': '#58a6ff',
  // ...all Primer tokens
};

// Extract CSS custom properties from built index.html
// Compare against official Primer palette
// Report any mismatches or custom colors outside tokens
```

**Manual Visual Comparison:**
1. Open GitHub.com in one browser tab
2. Open dashboard in adjacent tab
3. Compare side-by-side:
   - Header style and spacing
   - Card/item styling and borders
   - Typography hierarchy and weights
   - Color usage and semantic meaning
   - Button/link styling
4. Take screenshots for documentation

**Success Criteria:**
- All colors use GitHub Primer tokens (no hardcoded hex values outside `:root`)
- All spacing uses 8px base unit system (`var(--space-*)`)
- Typography matches GitHub hierarchy (`var(--fontsize-*)`)
- Visual comparison shows consistent GitHub design language

### Cross-Browser Testing Protocol

**Test Matrix:**

| Browser | Version | Platform | Tests |
|---------|---------|----------|-------|
| Chrome | Latest (2026) | macOS/Windows | Visual, Functional, Performance |
| Firefox | Latest (2026) | macOS/Windows | Visual, Functional, Console |
| Edge | Latest (2026) | macOS/Windows | Visual, Functional, Console |
| Chromium | 84 (Pi 3B) | Raspberry Pi OS | Primary Target - Full Suite |

**Test Checklist (Per Browser):**
- [ ] **Visual:** Layout correct, no broken styles, proper spacing
- [ ] **Page Rotation:** 30s timer works, smooth fade transitions
- [ ] **Item Highlighting:** 8s timer works, correct styling applied
- [ ] **Detail Panel:** Content renders correctly, links work
- [ ] **API Fetching:** Data loads, no CORS errors, retry logic works
- [ ] **Persistent Alert:** Outage indicator appears/disappears correctly
- [ ] **Console:** No JavaScript errors or warnings
- [ ] **Performance:** Animations smooth (30+ FPS), no lag

**Expected Results:**
- ✅ Chrome/Firefox/Edge: May have minor CSS differences but fully functional
- ✅ Chromium 84 (Pi): Perfect match, optimized for this target

**Known Acceptable Differences:**
- Font rendering may vary slightly between browsers
- Subtle animation timing differences are acceptable
- Pi 3B will have lower framerate than desktop (30 FPS target vs 60 FPS)

### Production Readiness Checklist

**Pre-Deployment Validation:**

- [ ] **24-Hour Burn-In Test Complete**
  - [ ] Memory usage stable (<10MB growth)
  - [ ] No JavaScript errors in console
  - [ ] Timer drift within tolerance (±1s page, ±0.5s item)
  - [ ] All functionality working normally

- [ ] **Automated Tests Passing**
  - [ ] Memory monitoring script executed (no leaks detected)
  - [ ] Timer accuracy analysis passed (drift within limits)
  - [ ] API refresh validation passed (all checkpoints met)
  - [ ] GitHub Primer validation passed (no token violations)

- [ ] **Manual Tests Complete**
  - [ ] Power recovery tested (auto-restart <2 min)
  - [ ] Network resilience tested (cache → recovery flow)
  - [ ] Cross-browser tested (Chrome, Firefox, Edge, Chromium 84)
  - [ ] Distance readability tested (10-15 feet on actual TV)

- [ ] **Documentation Complete**
  - [ ] Burn-in test results documented
  - [ ] Timer accuracy measurements recorded
  - [ ] Known issues logged (if any)
  - [ ] Deployment approval obtained

**Deployment Approval Criteria:**

All of the following MUST be true:
1. ✅ 24-hour burn-in test completed successfully
2. ✅ No memory leaks detected (growth <10MB)
3. ✅ Timer accuracy within tolerance (±1s page, ±0.5s item)
4. ✅ All automated validation scripts pass
5. ✅ All manual testing checklists complete
6. ✅ No critical bugs remaining (P0/P1)
7. ✅ Performance acceptable on Pi 3B hardware (30+ FPS)
8. ✅ Production readiness report approved

**Sign-Off Required:** Developer + Product Owner (Shane)

### Project Structure Notes

**Test Scripts Location:**

Create new folder for test utilities:
```
/test/
  memory-monitor.js           # 24hr memory leak detection
  analyze-timer-drift.js      # Timer accuracy analysis
  validate-primer-colors.js   # GitHub Primer token validation
  health-check.js             # Automated dashboard health check
  burn-in-test.sh             # Master burn-in test script
```

**Test Results Location:**

Create folder for test output:
```
/_bmad-output/test-results/
  burn-in-24hr-2026-03-03.log         # 24hr burn-in log
  memory-profile-2026-03-03.csv       # Memory measurements
  timer-accuracy-2026-03-03.csv       # Timer drift measurements
  production-readiness-report.md      # Final approval document
```

**Test Dependencies:**

Add to package.json (dev dependencies):
```json
{
  "devDependencies": {
    "puppeteer": "^21.0.0",
    "chai": "^4.3.10",
    "mocha": "^10.2.0"
  },
  "scripts": {
    "test:memory": "node test/memory-monitor.js",
    "test:burn-in": "bash test/burn-in-test.sh",
    "test:validate": "node test/validate-primer-colors.js"
  }
}
```

### Architecture Patterns

**Testing Philosophy:**

This project uses **manual visual testing** as primary approach:
- Automated tests for memory/timer/design validation
- Manual testing for visual QA, UX, and real-world scenarios
- No unit tests for UI components (complexity vs value tradeoff)
- Focus on integration/system-level validation

**Rationale for Manual Testing:**
- Single-purpose kiosk (not customer-facing product)
- Visual correctness more important than logic coverage
- Rapid development cycle (test automation overhead not justified)
- Real-world Pi testing required (can't simulate hardware)

**Automated Testing Scope:**
- ✅ Memory leak detection (puppeteer)
- ✅ Timer accuracy measurement (instrumentation)
- ✅ Design token validation (CSS parsing)
- ✅ Health checks (endpoint testing)
- ❌ Unit tests (not implemented)
- ❌ E2E UI tests (not implemented)

### Testing Standards Summary

**Memory Leak Detection:**
- Tool: Puppeteer + Chrome DevTools Protocol
- Duration: 24+ hours continuous
- Metrics: Heap size, event listeners, document count
- Success: <10MB heap growth, constant listener count

**Timer Accuracy Validation:**
- Method: Instrumented logging + analysis script
- Duration: 24+ hours continuous
- Tolerance: ±1s page rotation, ±0.5s item highlighting
- Success: Cumulative drift <5s over 24 hours

**API Refresh Validation:**
- Method: Manual observation + log analysis
- Duration: 2+ hours (24 refresh cycles)
- Checks: Timer continuity, state persistence, retry logic
- Success: No timer interruption, cached fallback works

**Power Recovery Testing:**
- Method: Manual Pi reboot test
- Metric: Time from power-on to dashboard functional
- Success: <2 minutes, auto-start, no intervention

**Network Resilience Testing:**
- Method: Manual WiFi disconnect/reconnect
- Duration: 10 minutes offline
- Checks: Cached content, indicator, auto-recovery
- Success: Graceful degradation, automatic recovery

**GitHub Primer Validation:**
- Method: Automated script + visual comparison
- Checks: Colors, spacing, typography tokens
- Success: 100% token compliance, visual match to GitHub.com

**Cross-Browser Testing:**
- Browsers: Chrome, Firefox, Edge, Chromium 84
- Checks: Visual, functional, console errors
- Success: All browsers functional, Chromium 84 perfect

### Previous Story Intelligence

**Learnings from Story 4.4 (Typography):**

1. **Validation > Implementation:** Story 4.4 was primarily validation and fine-tuning. Story 4.5 follows similar pattern - validate existing implementation rather than build new features.

2. **Systematic Audit Approach:** Story 4.4 audited typography systematically (design tokens → usage → compliance). Apply same methodology here: define criteria → measure → validate.

3. **Documentation Critical:** Story 4.4created detailed tables and standards documentation. Story 4.5 should similarly document test results, measurements, and validation outcomes.

4. **Physical Testing Required:** Story 4.4 required physical distance testing on TV. Story 4.5 requires physical Pi testing (reboot, network disconnect) that cannot be automated.

**Key Insight:** This story is quality assurance and production validation. Focus on systematic testing, clear criteria, and thorough documentation of results.

### Git Repository Intelligence

**Recent Commit Patterns:**

```
ae2d08f Remove bottom progress bar (while attempting to keep octocat, he's cool)
d10dd73 Dev and Complete story 4.3
35d2b42 Tweak to result of story 4.2 for better ui look
c20ab69 Dev and Complete story 4.2
97e4ccb quality of life tweak for story 4.1
42dac3e Dev and Complete story 4.1
```

**Patterns Observed:**

1. **Iterative Refinement:** Multiple quality-of-life tweaks after story completion. Story 4.5 may reveal issues requiring similar post-story refinements.

2. **UI Focus:** Recent commits prioritize visual polish. Burn-in testing will validate if this polish holds up over 24+ hours.

3. **Epic 4 Momentum:** Stories 4.1-4.4 completed rapidly. Story 4.5 is longer duration (24hr burn-in) but systematic.

**Relevant Testing Insights:**

- No previous burn-in testing performed (this is first comprehensive validation)
- Current implementation stable enough for rapid story completion (good sign)
- Memory/timer concerns not evident in commit history (no leak fixes)

### Latest Technical Information

**Memory Leak Detection Tools (2026):**

**Chrome DevTools Protocol:**
- Node.js library: `puppeteer` (v21+)
- Memory metrics: `page.metrics()` and `page.evaluate(() => performance.memory)`
- Heap snapshots: `page._client.send('HeapProfiler.takeHeapSnapshot')`

**Browser Memory APIs:**
```javascript
// Available in console for manual inspection
performance.memory.usedJSHeapSize  // Current heap usage
performance.memory.jsHeapSizeLimit // Maximum heap size
performance.memory.totalJSHeapSize // Total allocated heap
```

**Timer Accuracy Best Practices:**

**setInterval Drift:**
- setInterval is not perfectly accurate (browser throttling, event loop delays)
- Expected drift: 0-100ms per interval is normal
- Cumulative drift: Can accumulate over 24 hours if not corrected
- Mitigation: Use Date.now() to calculate expected time vs actual time

**Correction Strategy:**
```javascript
// Instead of relying solely on setInterval
setInterval(() => {
  const now = Date.now();
  const elapsed = now - this.startTime;
  const expectedCycles = Math.floor(elapsed / this.interval);
  const actualCycles = this.cycleCount;
  
  if (expectedCycles > actualCycles) {
    // Fast-forward to catch up
    while (this.cycleCount < expectedCycles) {
      this.tick();
    }
  }
}, this.interval);
```

**Raspberry Pi 3B Performance Benchmarks (2026):**

**Typical Dashboard Performance:**
- Initial heap size: ~20-30MB (Chromium + dashboard)
- Steady-state heap: ~25-35MB after 1 hour
- Memory leak threshold: >10MB growth over 24 hours considered leak
- Acceptable heap at 24hr: <45MB total

**Timer Accuracy on Pi:**
- setInterval accuracy: ±50-200ms typical on Pi 3B (browser throttling)
- Background tab throttling: Not applicable (kiosk mode fullscreen)
- Power management: May affect timer accuracy during high CPU loads

**Network Recovery Time:**
- systemd restart time: 30-90 seconds typical
- Chromium launch time: 20-40 seconds typical
- Dashboard load time: 2-5 seconds typical
- Total recovery: <2 minutes target achievable

### References

**Source Documentation:**

- **Puppeteer Documentation:** [pptr.dev](https://pptr.dev/) - Memory monitoring and automation
- **Chrome DevTools Protocol:** [chromedevtools.github.io/devtools-protocol](https://chromedevtools.github.io/devtools-protocol/) - Memory profiling APIs
- **GitHub Primer Design System:** [primer.style](https://primer.style/design) - Design token validation
- **systemd Documentation:** [systemd.io](https://systemd.io/) - Auto-start service configuration

**Project Artifacts:**

- **Architecture:** [_bmad-output/planning-artifacts/architecture.md](_bmad-output/planning-artifacts/architecture.md) - Component architecture and patterns
- **Epic 4 Requirements:** [_bmad-output/planning-artifacts/epics.md](_bmad-output/planning-artifacts/epics.md) - Story 4.5 acceptance criteria
- **Project Context:** [_bmad-output/project-context.md](_bmad-output/project-context.md) - Component architecture, memory management patterns
- **Previous Story (4.4):** [_bmad-output/implementation-artifacts/4-4-implement-distance-optimized-typography-contrast.md](_bmad-output/implementation-artifacts/4-4-implement-distance-optimized-typography-contrast.md)

**Deployment Reference:**

- **Pi Setup Guide:** [docs/raspberry-pi-setup.md](../../docs/raspberry-pi-setup.md) - systemd services, Chromium configuration
- **Deployment Scripts:** [deploy/](../../deploy/) - update-dashboard.sh, start-kiosk.sh, systemd service files

**Source Code (Current Implementation to Test):**

- **Component Files:** [src/js/](../../src/js/) - All 7 JavaScript modules
- **Styles:** [src/css/](../../src/css/) - All 4 CSS files
- **Built Artifact:** [index.html](../../index.html) - Production dashboard

---

## Dev Agent Record

### Agent Model Used

_To be filled by dev agent executing this story_

### Debug Log References

_To be added if debugging is required during testing_

### Completion Notes List

_To be added as story progresses:_
- Memory monitoring tool created and tested
- Timer accuracy measurement results (24hr burn-in)
- API refresh validation outcomes
- Power recovery test results
- Network resilience test results
- GitHub Primer validation status
- Cross-browser testing summary
- Production readiness sign-off

### File List

_Expected files to be created (to be confirmed by dev agent):_
- `/test/memory-monitor.js` - Puppeteer-based memory leak detection
- `/test/analyze-timer-drift.js` - Timer accuracy analysis script
- `/test/validate-primer-colors.js` - GitHub Primer token validation
- `/test/health-check.js` - Automated dashboard health check
- `/test/burn-in-test.sh` - Master burn-in test orchestration script
- `/_bmad-output/test-results/` - Test results and logs
- `/_bmad-output/test-results/production-readiness-report.md` - Final approval document
- `/package.json` - Updated with test dependencies (puppeteer, chai, mocha)

_Expected files to be modified (instrumentation):_
- `/src/js/carousel-controller.js` - Add timer accuracy logging
- `/src/js/item-highlighter.js` - Add timer accuracy logging
- `/src/js/api-client.js` - Add refresh event logging (if needed)

_All instrumentation changes should be minimal and non-invasive to production code._
