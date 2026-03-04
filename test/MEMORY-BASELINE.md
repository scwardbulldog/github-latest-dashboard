# Memory Baseline Expectations & Leak Detection Guide

## Overview

This document defines acceptable memory usage patterns and leak detection criteria for the GitHub Latest Dashboard running in 24/7 kiosk mode.

## Baseline Memory Expectations

### Initial Heap Size (Time 0)
- **Chrome/Chromium (Desktop):** 15-25 MB
- **Chromium 84 (Raspberry Pi 3B):** 20-30 MB
- **Components:** Includes browser overhead + dashboard JavaScript + initial data

### Steady-State Memory (After 1 Hour)
- **Chrome/Chromium (Desktop):** 20-30 MB
- **Chromium 84 (Raspberry Pi 3B):** 25-35 MB
- **Reason:** Dashboard has loaded data, timers running, some GC cycles complete

### Acceptable Growth Over 24 Hours
- **Maximum Total Growth:** <10 MB from baseline
- **Maximum Steady-State:** <45 MB on Pi (including all overhead)
- **Growth Pattern:** Slight upward trend acceptable, but must plateau

### Event Listeners
- **Baseline Count:** ~10-20 (carousel timer, highlighter timer, API client, DOM events)
- **Expected Behavior:** Should remain **constant** over 24 hours
- **Acceptable Variance:** <10% (1-2 listeners)
- **Warning Sign:** Continuous increase indicates cleanup failure

### Document Count
- **Expected:** 1 (single page application)
- **Critical:** Must **never exceed 1**
- **Warning Sign:** Multiple documents indicate DOM leak or navigation error

### DOM Nodes
- **Baseline:** ~200-400 nodes (depending on data loaded)
- **Expected Behavior:** Minor fluctuations (±50 nodes) acceptable
- **Acceptable Growth:** <100 nodes over 24 hours
- **Warning Sign:** Continuous growth >200 nodes indicates DOM leak

## Memory Leak Detection Criteria

### Critical Failures (Must Fix Before Production)

1. **Heap Growth >10 MB over 24 hours**
   - Indicates substantial memory leak
   - Likely causes: Event listener accumulation, cached data not cleared, closure references

2. **Continuous Upward Trend (Slope >0.5 MB/hour)**
   - Linear regression analysis shows continuous growth
   - Even if under 10MB total, trend indicates eventual failure
   - Likely causes: setInterval not cleared, DOM references retained

3. **Document Count >1**
   - Multiple documents indicate navigation error or iframe leak
   - Critical issue - must be resolved immediately

4. **Event Listener Growth >20%**
   - Event listeners continuously accumulate
   - Likely causes: addEventListener called repeatedly without removeEventListener
   - Common culprits: Timer setup in loops, dynamic DOM event binding

### Warnings (Should Investigate)

1. **Heap Growth 5-10 MB**
   - Not critical but warrants investigation
   - May indicate inefficient garbage collection patterns

2. **Event Listener Variance 10-20%**
   - Minor fluctuations acceptable
   - Monitor to ensure not continuous growth

3. **DOM Node Growth 50-100**
   - Minor growth acceptable
   - Ensure not continuous accumulation

## Common Memory Leak Patterns in Dashboard

### Timer Cleanup
```javascript
// ❌ BAD: Timer not cleared
setInterval(() => this.tick(), 1000);

// ✅ GOOD: Timer stored and cleared
this.timerId = setInterval(() => this.tick(), 1000);

stop() {
  if (this.timerId) {
    clearInterval(this.timerId);
    this.timerId = null;
  }
}
```

### Event Listener Cleanup
```javascript
// ❌ BAD: Listener not removed
element.addEventListener('click', this.handleClick);

// ✅ GOOD: Listener removed
this.boundHandleClick = this.handleClick.bind(this);
element.addEventListener('click', this.boundHandleClick);

destroy() {
  element.removeEventListener('click', this.boundHandleClick);
}
```

### DOM Reference Cleanup
```javascript
// ❌ BAD: DOM references retained
this.items = Array.from(document.querySelectorAll('.item'));

// ✅ GOOD: Query fresh each time
getItems() {
  return Array.from(document.querySelectorAll('.item'));
}
```

### Cache Management
```javascript
// ❌ BAD: Unbounded cache growth
this.cache[key] = data; // No limit

// ✅ GOOD: Cache with size limit
if (Object.keys(this.cache).length > MAX_CACHE_SIZE) {
  const oldestKey = Object.keys(this.cache)[0];
  delete this.cache[oldestKey];
}
this.cache[key] = data;
```

## Dashboard-Specific Considerations

### 5-Minute API Refresh
- **Expected:** Minor heap spike during data fetch and DOM update
- **Acceptable:** 1-2 MB temporary increase, should GC back to baseline
- **Warning:** If heap doesn't return to baseline after refresh, indicates leak

### 30-Second Page Rotation
- **Expected:** Minor heap fluctuation during fade transition
- **Acceptable:** <0.5 MB temporary increase
- **Warning:** Continuous growth indicates DOM not cleaned up after rotation

### 8-Second Item Highlighting
- **Expected:** Minimal memory impact (CSS class changes)
- **Acceptable:** <0.1 MB impact
- **Warning:** If measurable growth, indicates CSS or class accumulation

## Measurement Methodology

### Automated Monitoring (memory-monitor.js)
1. Launch dashboard in headless Chromium via Puppeteer
2. Sample memory every 5 minutes for 24 hours
3. Record: heap size, event listeners, documents, DOM nodes
4. Log to CSV for analysis

### Analysis (analyze-memory-results.js)
1. Parse CSV data
2. Calculate linear regression (growth trend)
3. Identify anomalies (spikes, continuous growth)
4. Generate pass/fail report

### Manual Inspection (Chrome DevTools)
1. Open dashboard in Chrome
2. Run for 1-2 hours minimum
3. Take heap snapshots every 30 minutes
4. Compare snapshots to identify retained objects

## Testing Protocol

### Development Machine (Quick Test - 2 Hours)
```bash
npm run dev                    # Start dev server
npm run test:memory           # Run 2-hour test (modify CONFIG.duration)
node test/analyze-memory-results.js _bmad-output/test-results/memory-profile-*.csv
```

### Raspberry Pi (Full Burn-In - 24 Hours)
```bash
# On dev machine: Install dependencies and build
npm install
npm run build
git commit && git push

# On Pi: Pull and start
cd ~/dashboard
git pull
python3 -m http.server 8000 &

# On dev machine: Run memory monitoring against Pi
TEST_URL=http://pi-ip-address:8000 npm run test:memory
```

### Success Criteria Checklist
- [ ] Baseline heap: 15-30 MB (desktop) or 20-30 MB (Pi)
- [ ] Final heap growth: <10 MB after 24 hours
- [ ] Growth trend: <0.5 MB/hour (linear regression slope)
- [ ] Event listeners: Constant (variance <10%)
- [ ] Documents: Exactly 1 (never exceed)
- [ ] No console errors logged during test
- [ ] All API refreshes successful (or graceful fallback)
- [ ] Timers remain accurate (measured separately)

## Known Acceptable Behaviors

### Garbage Collection Spikes
- **Pattern:** Periodic heap drops (sawtooth pattern)
- **Cause:** Browser garbage collection
- **Status:** ✅ Normal, expected behavior

### Initial Warm-Up Growth
- **Pattern:** 2-5 MB growth in first 30 minutes
- **Cause:** Browser caches, JIT compilation, data loading
- **Status:** ✅ Normal, focus on growth after 1 hour

### Heap Fluctuations
- **Pattern:** ±2 MB fluctuations around baseline
- **Cause:** GC cycles, API refresh, page rotation
- **Status:** ✅ Normal, ensure returns to baseline

## Troubleshooting Common Issues

### Issue: Continuous Upward Trend
**Likely Cause:** Timer or event listener not cleared
**Fix:** Audit `setInterval`, `setTimeout`, `addEventListener` for cleanup
**Test:** Add cleanup methods and re-run 24hr test

### Issue: Event Listener Growth
**Likely Cause:** addEventListener in loop or repeated calls
**Fix:** Store bound functions, call removeEventListener in destroy
**Test:** Monitor listener count, should stabilize

### Issue: Document Count >1
**Likely Cause:** Iframe created or navigation error
**Fix:** Audit for hidden iframes or window.open calls
**Test:** Should see document count = 1 immediately

### Issue: Heap Growth During API Refresh
**Likely Cause:** Old data not released before new data loaded
**Fix:** Clear previous data references before assigning new data
**Test:** Monitor heap after refresh, should return to baseline

## References

- **Chrome DevTools Memory Profiling:** https://developer.chrome.com/docs/devtools/memory-problems/
- **Puppeteer Memory Metrics:** https://pptr.dev/api/puppeteer.page.metrics
- **Performance Memory API:** https://developer.mozilla.org/en-US/docs/Web/API/Performance/memory
- **JavaScript Garbage Collection:** https://developer.mozilla.org/en-US/docs/Web/JavaScript/Memory_management

## Document History

- **2026-03-03:** Initial baseline expectations documented
- **Baseline Data:** No empirical data yet, expectations based on similar dashboards
- **To Update:** After first 24hr burn-in test, update with actual measurements
