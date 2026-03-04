# Testing Guide

Comprehensive testing procedures and validation for the GitHub Updates Dashboard.

## Table of Contents

- [Testing Philosophy](#testing-philosophy)
- [Quick Validation](#quick-validation)
- [Test Scripts](#test-scripts)
- [Burn-In Testing](#burn-in-testing)
- [Manual Testing Procedures](#manual-testing-procedures)

## Testing Philosophy

The dashboard uses **manual visual testing** as the primary QA method:

- **Visual correctness** matters most (font sizes, colors, layout readable from 10-15 feet)
- **Single-purpose application** with no complex user interactions to test
- **Pi hardware specific** - performance characteristics differ from dev machine
- **Rapid development** - no test maintenance overhead

Automated validation scripts complement manual testing for specific concerns:
- Design token compliance
- Memory leak detection
- Health check automation
- Long-duration stability

## Quick Validation

Before deploying any changes, run:

```bash
# 1. Design token compliance (~5 seconds)
npm run test:validate

# 2. Build successfully
npm run build

# 3. Health check (~30 seconds)
npm run test:health
```

All three should pass before pushing to production.

## Test Scripts

### Design Token Compliance

**Command:** `npm run test:validate`

**Purpose:** Scans CSS for hardcoded colors and non-base-8 spacing values

**Duration:** ~5 seconds

**When to Use:** Before committing any CSS changes

**What It Checks:**
- Hardcoded color values (hex, rgb, hsl)
- Non-base-8 spacing values (must be multiples of 8px)
- Ensures all values use GitHub Primer design tokens

**Success Output:**
```bash
✓ No hardcoded colors found
✓ All spacing uses base-8 or Primer tokens
```

**Failure Output:**
```bash
✗ Found 11 hardcoded colors in src/css/main.css
  Line 42: color: #c9d1d9; (use var(--color-fg-default))
  Line 78: background: #0d1117; (use var(--color-canvas-default))
  ...

✗ Found 24 non-base-8 spacing values
  Line 15: margin: 6px; (use 8px or var(--space-2))
  Line 91: padding: 14px; (use 16px or var(--space-4))
  ...
```

**Fix:**
1. Replace hardcoded values with Primer tokens
2. Use base-8 multiples for spacing (8px, 16px, 24px, etc.)
3. Re-run validation

---

### Dashboard Health Check

**Command:** `npm run test:health`

**Purpose:** Uses Puppeteer to verify dashboard loads and all APIs respond

**Duration:** ~30 seconds

**When to Use:**
- After building for deployment
- Before deploying to Pi
- After major changes

**What It Checks:**
- Dashboard HTML loads without errors
- All 3 data sources return data (Blog, Changelog, Status)
- No console errors
- Page renders within timeout
- JavaScript executes correctly

**Success Output:**
```bash
✓ Dashboard loaded successfully
✓ Blog API returned 10 items
✓ Changelog API returned 10 items
✓ Status API returned incidents
✓ No console errors
```

**Failure Output:**
```bash
✗ Blog API failed: Network error
✗ Console error: TypeError: Cannot read property 'map' of undefined
```

**Fix:**
1. Check network connectivity
2. Verify API endpoints accessible
3. Check console for JavaScript errors
4. Review error details in test output

---

### Memory Leak Detection

**Command:** `npm run test:memory`

**Purpose:** Monitors memory usage over extended period to detect leaks

**Duration:** 24+ hours (configurable)

**When to Use:**
- Before production deployment
- After timer/interval changes
- After major refactoring
- Before long-term Pi deployment

**What It Checks:**
- Memory usage over time
- Heap size growth
- Timer leak detection
- DOM node accumulation

**Configuration:**
```javascript
// test/memory-monitor.js
const DURATION_HOURS = 24;
const SAMPLE_INTERVAL_MINUTES = 5;
```

**Success Criteria:**
- Memory growth < 5% over 24 hours
- No sustained upward trend
- Heap size remains stable
- No timer accumulation

**Failure Indicators:**
- Memory grows continuously
- Heap increases linearly over time
- Memory usage doubles or more
- Process eventually crashes (OOM)

**Output:**
```bash
Memory Monitoring Results (24 hours)
=====================================
Initial Memory: 45.2 MB
Final Memory:   47.1 MB
Growth:         1.9 MB (4.2%)
Status:         ✓ PASS

Generated report: test/results/memory-leak-report.json
```

**Fix:**
1. Review timer cleanup (`clearInterval` calls)
2. Check for event listener leaks
3. Verify canvas contexts released
4. Review DOM reference accumulation

---

### Complete Burn-In Test

**Command:** `npm run test:burn-in`

**Purpose:** Orchestrates all long-running tests for production readiness

**Duration:** 24+ hours

**When to Use:**
- Final validation before initial Pi deployment
- Before major version releases
- After significant architecture changes

**What It Runs:**
1. Design token validation
2. Health check
3. Memory leak detection (24+ hours)
4. Timer drift analysis
5. API refresh validation

**Output:**
```bash
Burn-In Test Suite
==================

[✓] Design token compliance       (5s)
[✓] Health check                  (30s)
[⧗] Memory leak detection        (24h in progress...)
[⧗] Timer drift analysis         (24h in progress...)
[⧗] API refresh validation       (24h in progress...)

Test will complete at: 2026-03-04 15:30:00
```

**Final Report:**
```
Production Readiness Report
Generated: 2026-03-04 15:30:00

✓ All tests passed
✓ Memory stable over 24 hours
✓ Timer drift < 100ms
✓ API refresh working correctly
✓ No console errors

Status: READY FOR PRODUCTION
```

**Report Location:** `test/results/production-readiness-report.md`

---

## Burn-In Testing

### Prerequisites

- **Time:** 24+ hours for complete test
- **Hardware:** Can run on dev machine or actual Pi
- **Network:** Stable internet connection
- **Power:** Uninterrupted power supply

### Running Burn-In Test

```bash
# Start burn-in test
npm run test:burn-in

# Test runs in background
# Check status anytime:
cat test/results/burn-in-status.txt

# View live memory usage:
tail -f test/results/memory-log.txt

# Stop test early (if needed):
pkill -f "test/burn-in"
```

### Burn-In Test Checklist

☐ **Initial Setup**
- [ ] Dashboard builds successfully
- [ ] Health check passes
- [ ] Design tokens valid

☐ **24-Hour Monitoring**
- [ ] Memory remains stable
- [ ] No console errors
- [ ] Page rotation continues
- [ ] API refresh working
- [ ] Timers not drifting

☐ **Pi Hardware Testing** (if available)
- [ ] Test on actual Pi 3B
- [ ] Verify from 10-15 feet distance
- [ ] Check performance under load
- [ ] Verify thermal management

☐ **Network Resilience**
- [ ] Test with WiFi drop simulation
- [ ] Verify cached fallback works
- [ ] Check retry logic effective
- [ ] Outage indicator appears/disappears

☐ **Power Resilience** (Pi only)
- [ ] Test power cycle recovery
- [ ] Auto-start on boot verified
- [ ] Git pull on restart working

☐ **Final Validation**
- [ ] All test scripts pass
- [ ] Production readiness report generated
- [ ] No blocking issues found
- [ ] Approval for deployment

### Burn-In Test Documentation

Detailed procedures available in:
- `test/BURN-IN-TEST-PROCEDURE.md` - Step-by-step guide
- `test/MEMORY-BASELINE.md` - Memory benchmarks
- `test/PRODUCTION-READINESS-REPORT-TEMPLATE.md` - Report format

---

## Manual Testing Procedures

### Visual Testing Checklist

☐ **Layout and Spacing**
- [ ] All sections visible on screen
- [ ] No content cut off
- [ ] Spacing consistent
- [ ] Alignment correct

☐ **Typography**
- [ ] Font sizes readable from 10-15 feet
- [ ] Text contrast sufficient (WCAG AA)
- [ ] Line height comfortable
- [ ] No text overflow

☐ **Colors**
- [ ] GitHub brand colors accurate
- [ ] Contrast ratios compliant
- [ ] No color accessibility issues
- [ ] Dark theme consistent

☐ **Animations**
- [ ] Page transitions smooth (30+ FPS)
- [ ] Fade effects clean
- [ ] No stuttering or lag
- [ ] Timing feels natural (30s rotation, 8s highlight)

☐ **Data Display**
- [ ] All 3 sources loading (Blog, Changelog, Status)
- [ ] Item highlighting visible
- [ ] Detail panel updates correctly
- [ ] Dates formatted correctly ("2 hours ago")

☐ **Error Handling**
- [ ] Network errors shown gracefully
- [ ] Cached fallback works
- [ ] Outage indicator appears when offline
- [ ] Recovery automatic when online

### Viewing Distance Test

**Location:** 10-15 feet from display

☐ **Readability**
- [ ] Titles clearly readable
- [ ] Body text legible
- [ ] Dates/metadata readable
- [ ] No squinting required

☐ **Visual Hierarchy**
- [ ] Highlights noticeable
- [ ] Current page obvious
- [ ] Detail panel prominent
- [ ] Progress indicator visible

### Pi Hardware Testing

**Required:** Actual Raspberry Pi 3B

☐ **Performance**
- [ ] Page rotation smooth
- [ ] No lag or stuttering
- [ ] Animations maintain 30+ FPS
- [ ] CPU usage reasonable (< 80%)
- [ ] Memory usage stable (< 800MB)

☐ **Thermal Management**
- [ ] Temperature < 70°C under load
- [ ] No thermal throttling
- [ ] Heatsinks installed
- [ ] Ventilation adequate

☐ **Long-Term Stability**
- [ ] Runs 24+ hours without restart
- [ ] No memory leaks detected
- [ ] Timers don't drift
- [ ] No accumulated errors

### Cross-Browser Testing

**Target Environment:** Chromium 84 on Pi 3B

**Additional Testing:**

☐ **Chrome/Edge** (dev machine)
- [ ] Layout correct
- [ ] Animations smooth
- [ ] APIs working
- [ ] No console errors

☐ **Firefox** (dev machine)
- [ ] Layout correct
- [ ] Animations working
- [ ] APIs working

☐ **Safari** (if available)
- [ ] Layout correct
- [ ] Animations working
- [ ] APIs working

**Note:** Chromium 84 (Pi target) is primary concern. Modern browsers should work but Pi is what matters.

### Checklist Documentation

Additional testing checklists available in:
- `test/CROSS-BROWSER-TESTING-CHECKLIST.md` - Browser compatibility
- `test/POWER-NETWORK-RESILIENCE-TESTING.md` - Resilience testing

---

## Before Production Deployment

Complete this checklist before deploying to Pi:

☐ **Code Quality**
- [ ] Design token validation passes
- [ ] Build completes without errors
- [ ] Health check passes
- [ ] No console errors in production build

☐ **Testing**
- [ ] 24-hour burn-in test completed
- [ ] Memory leak test passed
- [ ] Manual visual testing done
- [ ] Pi hardware testing completed

☐ **Documentation**
- [ ] Production readiness report generated
- [ ] Test results documented
- [ ] Known issues documented
- [ ] Deployment plan confirmed

☐ **Deployment Validation**
- [ ] Build artifact committed to git
- [ ] Source and artifact versions match
- [ ] Git push successful
- [ ] Pi accessible via SSH

☐ **Post-Deployment**
- [ ] Dashboard loads on Pi
- [ ] All 3 sections visible
- [ ] Page rotation working
- [ ] Monitor for 30+ minutes
- [ ] Verify from viewing distance

---

## Related Documentation

- [Architecture Guide](architecture.md) - System design
- [Contributing Guide](contributing.md) - Development patterns
- [Deployment Guide](deployment.md) - Deployment procedures
- [Troubleshooting Guide](troubleshooting.md) - Common issues
- [Raspberry Pi Setup](raspberry-pi-setup.md) - Pi configuration
