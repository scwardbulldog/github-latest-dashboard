# Burn-In Test Procedure

## Overview

The 24-hour burn-in test is a comprehensive validation protocol designed to verify the GitHub Latest Dashboard can operate continuously in a production kiosk environment without memory leaks, timer drift, or functional degradation.

## Prerequisites

### Development Machine
- Node.js 18+ installed
- npm packages installed (`npm install`)
- Dashboard built (`npm run build`)
- Port 5173 available for Vite dev server

### Test Dependencies
- Puppeteer (automated browser control)
- Chrome/Chromium for headless testing
- Sufficient disk space for 24hrs of logs (~50-100MB)

## Test Components

### 1. Memory Monitoring (memory-monitor.js)
- **Purpose:** Detect memory leaks over 24 hours
- **Method:** Chrome DevTools Protocol via Puppeteer
- **Sample Interval:** 5 minutes
- **Metrics:** Heap size, event listeners, document count, DOM nodes

### 2. Timer Accuracy Logging (instrumented in source)
- **Purpose:** Measure timer drift for page rotation and item highlighting
- **Method:** Instrumented logging in carousel-controller.js and item-highlighter.js
- **Enabled by:** `window.enableTimerLogging = true` before dashboard loads
- **Metrics:** Expected vs actual timing, cumulative drift

### 3. Health Checks (health-check.js)
- **Purpose:** Periodic validation dashboard is functioning
- **Interval:** Every hour (checkpoints: 0hr, 1hr, 2hr, ... 24hr)
- **Checks:** Page structure, data loaded, timers active, network status, console errors

### 4. Master Orchestration (burn-in-test.sh)
- **Purpose:** Coordinate all tests, collect logs, analyze results
- **Duration:** Configurable (default 24 hours, can test 2hrs for quick validation)
- **Output:** Consolidated log file, CSV data, pass/fail report

## Success Criteria

### Memory
- ✅ Initial heap: 15-30 MB (desktop) or 20-30 MB (Pi)
- ✅ Final heap growth: <10 MB after 24 hours
- ✅ Growth trend: <0.5 MB/hour (linear regression)
- ✅ Event listeners: Constant (variance <10%)
- ✅ Documents: Exactly 1 (never exceed)

### Timer Accuracy
- ✅ Page rotation: Within ±1 second tolerance (29-31s acceptable)
- ✅ Item highlighting: Within ±0.5 second tolerance (7.5-8.5s acceptable)
- ✅ Cumulative drift: <5 seconds over 24 hours
- ✅ Violation rate: <10% of measurements exceed tolerance

### Functional
- ✅ No JavaScript console errors during test
- ✅ All health checks pass at each checkpoint
- ✅ Timers remain active throughout test
- ✅ Data continues to refresh (5-minute API cycles)

## Test Execution Steps

### Step 1: Prepare Environment

```bash
# Clone and install
cd ~/Documents/Repos/github-latest-dashboard
npm install

# Build dashboard
npm run build

# Verify dependencies installed
npm list puppeteer chai mocha
```

### Step 2: Start Development Server

```bash
# Terminal 1: Start dev server
npm run dev

# Verify accessible
curl http://localhost:5173
```

**Note:** Dev server must remain running for entire 24-hour test. Consider using `tmux` or `screen` to prevent accidental termination.

### Step 3: Enable Timer Logging (Manual)

**Option A: Browser Console (for local testing)**

1. Open http://localhost:5173 in Chrome
2. Open DevTools Console (Cmd+Option+J / Ctrl+Shift+J)
3. Run: `window.enableTimerLogging = true`
4. Reload page
5. Verify logs appear: `⏱️ Carousel Rotation #1: drift=...`

**Option B: Modify Source (for automated testing)**

Add to [src/index.html](../../src/index.html) before closing `</body>`:

```html
<script>
  // Enable timer accuracy logging for burn-in testing
  window.enableTimerLogging = true;
</script>
```

Then rebuild: `npm run build`

### Step 4: Run Burn-In Test

```bash
# Terminal 2: Run full 24-hour test
bash test/burn-in-test.sh 24

# OR quick 2-hour validation
bash test/burn-in-test.sh 2
```

**What Happens:**
1. Script checks dashboard accessible
2. Starts memory monitoring (Puppeteer headless browser)
3. Runs health checks every hour (0hr, 1hr, 2hr, ... 24hr)
4. Logs all output to `_bmad-output/test-results/burn-in-24hr-YYYY-MM-DD.log`
5. At completion, analyzes memory and timer data
6. Generates pass/fail report

### Step 5: Monitor Progress

**During Test:**

```bash
# Terminal 3: Watch log file in real-time
tail -f _bmad-output/test-results/burn-in-24hr-*.log

# Check memory data
cat _bmad-output/test-results/memory-profile-*.csv | tail -20

# Run manual health check
node test/health-check.js http://localhost:5173
```

**Checkpoints:**

- **0hr (Baseline):** Initial measurements, verify everything starts correctly
- **6hr:** First major checkpoint, memory should be stable
- **12hr:** Midpoint, check for any emerging trends
- **18hr:** Late-stage check, cumulative drift should be < 3s
- **24hr:** Final validation, all criteria must pass

### Step 6: Review Results

After test completes, review generated reports:

**Memory Analysis:**
```bash
node test/analyze-memory-results.js _bmad-output/test-results/memory-profile-*.csv
```

Expected output:
- Baseline heap size
- Final heap growth (should be <10MB)
- Memory growth trend (slope should be <0.5 MB/hour)
- Event listener stability (variance <10%)
- Document count (must be 1)
- Pass/Fail verdict

**Timer Accuracy Analysis:**
```bash
node test/analyze-timer-drift.js _bmad-output/test-results/burn-in-24hr-*.log
```

Expected output:
- Carousel rotation statistics (avg drift, max drift, violations)
- Item highlighting statistics (avg drift, max drift, violations)
- Cumulative drift (should be <5s)
- Distribution analysis (% within tolerance bands)
- Pass/Fail verdict

**Consolidated Report:**

Review `_bmad-output/test-results/burn-in-24hr-YYYY-MM-DD.log` for:
- All health check results
- Console errors (if any)
- Timeline of test execution
- Final pass/fail summary

## Validation Checkpoints

### Checkpoint 0hr - Baseline
- [ ] Dashboard loads successfully
- [ ] All three pages exist (Blog, Changelog, Status)
- [ ] Data loaded from API (or cached if offline)
- [ ] Carousel timer starts (progress bar animating)
- [ ] Item highlighter starts (first item highlighted)
- [ ] Network indicator shows correct status
- [ ] Initial heap size: 15-30 MB (acceptable range)
- [ ] No console errors

### Checkpoint 6hr
- [ ] Dashboard still running (not crashed or stalled)
- [ ] Carousel timer still active (page rotations continue)
- [ ] Item highlighter still active (highlights cycling)
- [ ] Memory growth: <3 MB from baseline (healthy)
- [ ] Event listener count: Stable (no accumulation)
- [ ] Timer drift: <1s average for carousel, <0.5s for items
- [ ] No console errors

### Checkpoint 12hr
- [ ] All functionality continues working normally
- [ ] Memory growth: <5 MB from baseline (healthy)
- [ ] Timer drift: <2s cumulative (healthy)
- [ ] API refreshes successful (data updating every 5 min)
- [ ] No console errors

### Checkpoint 18hr
- [ ] Dashboard remains stable
- [ ] Memory growth: <8 MB from baseline (approaching limit)
- [ ] Timer drift: <3s cumulative (approaching limit)
- [ ] Performance remains consistent (animations smooth)
- [ ] No console errors

### Checkpoint 24hr - Final
- [ ] Dashboard completed full 24-hour run without crashes
- [ ] Memory growth: <10 MB (CRITICAL - must pass)
- [ ] Timer accuracy: ±1s page, ±0.5s item (CRITICAL - must pass)
- [ ] Cumulative drift: <5s (CRITICAL - must pass)
- [ ] Event listeners: Stable (CRITICAL - must pass)
- [ ] Document count: 1 (CRITICAL - must pass)
- [ ] No critical console errors
- [ ] All health checks passed

## Troubleshooting

### Issue: Memory Monitor Crashes

**Symptoms:** Puppeteer exits with error before 24 hours

**Causes:**
- Out of memory on test machine
- Browser crash due to memory leak
- Network connectivity issue

**Actions:**
1. Check test machine has sufficient RAM (8GB+ recommended)
2. Review memory logs before crash to identify leak pattern
3. If browser crashes, indicates critical memory leak - FIX REQUIRED
4. Re-run test after fixes

### Issue: No Timer Accuracy Data

**Symptoms:** Timer analysis reports "NO DATA FOUND"

**Causes:**
- `window.enableTimerLogging` not set before dashboard loaded
- Console logs not captured in log file

**Actions:**
1. Verify timer logging enabled (see Step 3)
2. Check log file contains timer entries: `grep "⏱️" _bmad-output/test-results/burn-in-*.log`
3. Re-run test with logging properly enabled

### Issue: Health Checks Fail

**Symptoms:** Health check reports "CRITICAL ISSUES DETECTED"

**Causes:**
- Dashboard crashed or stalled
- Timers stopped (possible timer cleanup issue)
- Page elements missing (DOM manipulation error)

**Actions:**
1. Review health check output to identify specific failure
2. Manually inspect dashboard in browser at failure time
3. Check for JavaScript errors in console
4. If timers stopped, review timer cleanup logic
5. Fix issues and re-run test

### Issue: High Memory Growth

**Symptoms:** Heap growth >10 MB over 24 hours

**Causes:**
- Event listeners not removed (accumulation)
- DOM references retained (closure issue)
- Cache unbounded growth
- Timer not cleared properly

**Actions:**
1. Take heap snapshot at start and end of test (Chrome DevTools)
2. Compare snapshots to identify retained objects
3. Review common leak patterns (see MEMORY-BASELINE.md)
4. Add proper cleanup in `stop()` methods
5. Re-run test to validate fix

### Issue: Timer Drift Excessive

**Symptoms:** Cumulative drift >5 seconds or individual rotations >2 seconds off

**Causes:**
- `setInterval` without drift correction
- Heavy computation during timer execution
- Browser throttling (unlikely in kiosk mode)

**Actions:**
1. Review timer implementation for drift correction
2. Profile code to identify expensive operations during rotation
3. Consider using Date.now() to calculate expected time vs actual
4. Re-run test after optimization

## Raspberry Pi Testing

### Remote Testing (Pi as Target)

1. **On Dev Machine:** Build and deploy
   ```bash
   npm run build
   git commit -am "Build for Pi testing"
   git push
   ```

2. **On Pi:** Pull and start
   ```bash
   cd ~/dashboard
   git pull
   python3 -m http.server 8000 &
   ```

3. **On Dev Machine:** Run test against Pi
   ```bash
   TEST_URL=http://192.168.1.100:8000 bash test/burn-in-test.sh 24
   ```

**Note:** Replace `192.168.1.100` with your Pi's IP address.

### Local Testing (On Pi)

**Not recommended** - Pi 3B lacks resources to run Puppeteer alongside dashboard. Use remote testing approach above.

## Production Approval Checklist

Before deploying to production, all of the following MUST be true:

- [ ] ✅ 24-hour burn-in test completed successfully
- [ ] ✅ Memory analysis passed (growth <10MB, trend <0.5 MB/hr)
- [ ] ✅ Timer analysis passed (±1s page, ±0.5s item, cumulative <5s)
- [ ] ✅ All health checks passed at all checkpoints
- [ ] ✅ No critical console errors during test
- [ ] ✅ API refresh continues working (5-minute cycles successful)
- [ ] ✅ Dashboard remains functional after 24+ hours
- [ ] ✅ Test results documented in production readiness report
- [ ] ✅ Product Owner (Shane) approval obtained

**Sign-Off:** Developer \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ Date: \_\_\_\_\_\_\_\_\_\_

**Sign-Off:** Product Owner \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ Date: \_\_\_\_\_\_\_\_\_\_

## References

- Memory Baseline Expectations: [MEMORY-BASELINE.md](MEMORY-BASELINE.md)
- Memory Monitor Script: [memory-monitor.js](memory-monitor.js)
- Timer Analysis Script: [analyze-timer-drift.js](analyze-timer-drift.js)
- Health Check Script: [health-check.js](health-check.js)
- Burn-In Master Script: [burn-in-test.sh](burn-in-test.sh)
