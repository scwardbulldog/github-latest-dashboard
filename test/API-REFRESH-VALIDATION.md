# API Refresh Validation Protocol

## Overview

This document describes the validation protocol for ensuring the 5-minute API refresh cycle maintains timer state, data consistency, and graceful error handling in the GitHub Latest Dashboard.

## Test Objectives

1. **Timer Continuity:** Verify carousel and item highlighter timers continue running during API refresh (no pause, no reset)
2. **State Persistence:** Verify page and item positions maintained across refresh
3. **Data Updates:** Verify new data fetched successfully every 5 minutes
4. **Error Handling:** Verify retry logic (3x with backoff) and cached fallback on failure
5. **Network Recovery:** Verify automatic recovery after network outage

## Acceptance Criteria Mapping

From Story 4.5 Acceptance Criteria:

**AC: API Refresh Validation**
- ✅ Data updates successfully every 5 minutes
- ✅ Timers continue running during refresh (no interruption)
- ✅ Timer state persists correctly across refresh
- ✅ Page/item positions are maintained

## Test Components

### Automated Logging (Optional Enhancement)
Timer accuracy logging already captures timing across API refreshes. Additional API-specific logging can be added if needed.

### Manual Observation
Primary validation method - observe dashboard behavior during 2+ hours (24 refresh cycles).

### Browser DevTools Network Tab
Monitor actual API requests, timing, and responses.

## Validation Checkpoints

### Checkpoint 1: Normal Operation (0-30 minutes)

**Setup:**
1. Start dashboard: `npm run dev`
2. Open in Chrome with DevTools (Cmd+Option+I)
3. Go to Network tab, filter by "Fetch/XHR"
4. Note initial page displayed (Blog)
5. Note first highlighted item
6. Clear console and watch for API calls

**Observations (Every 5 Minutes):**

**Minute 0 (Initial Load):**
- [ ] Dashboard loads
- [ ] Initial API calls to RSS2JSON for blog/changelog
- [ ] Initial API call to GitHub Status
- [ ] Data renders in UI
- [ ] First page (Blog) displayed
- [ ] First item highlighted
- [ ] Carousel timer starts (progress bar animating)

**Minute 5 (First Refresh):**
- [ ] API calls trigger in Network tab (RSS2JSON + GitHub Status)
- [ ] Carousel continues rotating (does NOT pause or reset)
- [ ] Item highlighter continues cycling (does NOT pause or reset)
- [ ] Current page remains displayed during refresh
- [ ] Current highlighted item maintained
- [ ] New data renders after fetch complete
- [ ] No console errors
- [ ] Progress bar continues animating smoothly

**Minute 10 (Second Refresh):**
- [ ] Repeat observations from Minute 5
- [ ] Timers still accurate (no cumulative drift)

**Minute 15, 20, 25, 30 (Additional Refreshes):**
- [ ] Repeat observations
- [ ] Verify consistent behavior across multiple cycles

**Expected Behavior:**
- API refresh is **completely transparent** to user
- Timers **never pause, never reset, never stutter**
- Page/item positions **never jump or reset**
- Data updates **seamlessly** in background

**Red Flags:**
- ❌ Timer resets to 0% during refresh
- ❌ Highlighting jumps back to first item during refresh
- ❌ Page switches unexpectedly during refresh
- ❌ Progress bar pauses or stutters during refresh
- ❌ Console errors related to API fetch

### Checkpoint 2: Network Failure Simulation (30-60 minutes)

**Setup:**
1. Continue from Checkpoint 1
2. Prepare to disconnect WiFi/network

**Test Procedure:**

**Minute 30 (Before Disconnect):**
- [ ] Dashboard functioning normally
- [ ] Note current page and highlighted item
- [ ] Note current cached data (timestamp or content)

**Minute 32 (Disconnect Network):**
- Disconnect WiFi or disable network interface
- Wait for next refresh cycle (5-minute mark)

**Minute 35 (First Refresh After Disconnect):**
- [ ] API calls fail (network errors in Network tab)
- [ ] Retry logic executes (3 attempts visible in console or Network tab)
- [ ] Retry delays: 1s, 2s, 4s (total ~7s retry period)
- [ ] After retries fail, cached content continues displaying
- [ ] Timers continue running (no pause, no reset)
- [ ] No JavaScript errors (graceful error handling)
- [ ] Network status indicator (`live-dot`) changes to `offline` (yellow)

**Minute 40 (Second Refresh During Disconnect):**
- [ ] Repeat observations from Minute 35
- [ ] Dashboard continues functioning with cached data
- [ ] User experience remains smooth (no degradation)

**Minute 45 (Reconnect Network):**
- Reconnect WiFi or enable network interface
- Wait for next refresh cycle

**Minute 50 (First Refresh After Reconnect):**
- [ ] API calls succeed (200 OK in Network tab)
- [ ] Fresh data fetched
- [ ] New data renders in UI
- [ ] Network status indicator returns to `online` (green)
- [ ] Timers continue running (no interruption)
- [ ] Dashboard fully recovered automatically
- [ ] No manual intervention required

**Expected Behavior:**
- Network failure is **gracefully handled**
- Dashboard **continues functioning** with cached data
- Retry logic **attempts 3x** before giving up
- Network indicator **reflects correct status**
- Automatic recovery when network returns

**Red Flags:**
- ❌ Dashboard crashes or stalls on network failure
- ❌ JavaScript errors thrown (unhandled promise rejection)
- ❌ Timers stop when network unavailable
- ❌ Dashboard does not recover automatically after reconnect
- ❌ Network indicator does not update correctly

### Checkpoint 3: Extended Observation (60-120 minutes)

**Test Procedure:**
1. Let dashboard run for additional hour
2. Observe 12 more refresh cycles (5-minute intervals)
3. Monitor for any degradation or anomalies

**Observations:**

**Every 5 Minutes:**
- [ ] API refresh continues successfully
- [ ] Timers remain accurate (no cumulative drift)
- [ ] No memory growth visible (check Task Manager/Activity Monitor)
- [ ] No console errors accumulating

**At 120 Minutes (12 total refresh cycles):**
- [ ] Dashboard still functioning normally
- [ ] Consistent behavior across all 24 refresh cycles
- [ ] Memory usage stable (use Chrome Task Manager: Shift+Esc)
- [ ] Timer accuracy maintained (within ±1s page, ±0.5s item)

**Expected Behavior:**
- Consistent performance over extended period
- No degradation or accumulation of issues
- Memory remains stable
- Timers remain accurate

## Validation Checklist

### Timer Continuity During Refresh
- [ ] Carousel timer never pauses during API fetch
- [ ] Carousel timer never resets during API fetch
- [ ] Item highlighter never pauses during API fetch
- [ ] Item highlighter never resets during API fetch
- [ ] Progress bar animation smooth (no stuttering)

### State Persistence Across Refresh
- [ ] Current page remains displayed during refresh
- [ ] Page index maintained (does not reset to Blog)
- [ ] Current highlighted item maintained
- [ ] Item index maintained (does not reset to first item)

### Data Update Success
- [ ] API calls trigger every 5 minutes (±5 seconds)
- [ ] RSS2JSON API fetched for blog and changelog
- [ ] GitHub Status API fetched for incidents
- [ ] New data renders in UI after successful fetch
- [ ] Timestamps/content update (verify data is fresh)

### Retry Logic on Failure
- [ ] 3 retry attempts executed when network fails
- [ ] Retry delays: 1s, 2s, 4s (exponential backoff)
- [ ] Cached content displayed when all retries fail
- [ ] No JavaScript errors thrown (graceful error handling)

### Network Recovery
- [ ] Network status indicator appears during outage
- [ ] Indicator shows `offline` state (yellow dot)
- [ ] Dashboard functions normally with cached data
- [ ] Fresh data fetches automatically after network returns
- [ ] Network status indicator clears when online
- [ ] No manual intervention required for recovery

## Testing Tools

### Chrome DevTools - Network Tab
**Purpose:** Monitor API requests, timing, and responses

**Usage:**
1. Open DevTools (Cmd+Option+I / Ctrl+Shift+I)
2. Go to Network tab
3. Filter by "Fetch/XHR"
4. Observe requests every 5 minutes

**What to Look For:**
- Request URL (RSS2JSON endpoints, GitHub Status API)
- Status codes (200 OK for success, network errors for failure)
- Timing (verify 5-minute intervals)
- Response data (verify fresh content)

### Chrome DevTools - Console
**Purpose:** Monitor for errors and warnings

**Usage:**
1. Open DevTools Console tab
2. Clear console at start of test
3. Watch for errors during refresh cycles

**What to Look For:**
- ❌ Any JavaScript errors (red text)
- ⚠️ Warnings about failed fetches (expected during network disconnect)
- ℹ️ Retry attempt logs (if instrumented)

### Chrome DevTools - Performance Monitor
**Purpose:** Monitor memory and CPU during refresh

**Usage:**
1. Open Command Palette (Cmd+Shift+P / Ctrl+Shift+P)
2. Type "Show Performance Monitor"
3. Monitor during test

**What to Look For:**
- CPU usage (should be low, spikes during API fetch acceptable)
- JS heap size (should remain stable, minor fluctuations acceptable)
- Nodes (should remain stable, growth indicates DOM leak)

### Manual Timer Verification
**Purpose:** Verify timers continue accurately during refresh

**Method:**
1. Use stopwatch or timer app
2. Start when page rotation occurs
3. Time next rotation (should be 30s ±1s)
4. Repeat during API refresh to verify no interruption

### Visual Observation
**Purpose:** Catch visual glitches during refresh

**Method:**
1. Watch dashboard closely during 5-minute mark
2. Look for any flicker, jump, or reset of UI
3. Verify smooth continuous operation

## Common Issues and Debugging

### Issue: Timers Reset During Refresh

**Symptoms:**
- Progress bar jumps back to 0% during API fetch
- Highlighting resets to first item during API fetch

**Likely Causes:**
- Timer state (startTime, lastRotation, currentItem) inadvertently reset
- Component re-initialized during data update

**Debugging Steps:**
1. Add console.log to timer `start()` methods
2. Check if called during API refresh (should NOT be)
3. Review data update logic - ensure does not re-mount components

**Fix:**
- Ensure data updates use **in-place DOM updates**, not re-rendering
- Timer instances should be created once at load, not on every data update

### Issue: Page/Item Position Resets During Refresh

**Symptoms:**
- Dashboard always shows Blog page after refresh
- Highlighting always resets to first item after refresh

**Likely Causes:**
- State lost during data update
- Components re-initialized with default state

**Debugging Steps:**
1. Add state logging before and after refresh
2. Check if `currentPage` or `currentItem` reset
3. Review data update - ensure state preserved

**Fix:**
- Store state externally (not just in component)
- Ensure re-render preserves state
- Test state persistence with console logging

### Issue: API Refresh Not Triggering

**Symptoms:**
- No network requests in DevTools Network tab after 5 minutes
- Data never updates (stale timestamps)

**Likely Causes:**
- Refresh interval timer not started
- Timer cleared accidentally
- Refresh logic has conditional that blocks execution

**Debugging Steps:**
1. Check `apiClient.js` for refresh interval setup
2. Verify `setInterval` called and handle stored
3. Add console.log at start of refresh function

**Fix:**
- Ensure refresh timer started at initialization
- Verify timer handle not cleared inadvertently
- Test refresh trigger with console logging

### Issue: Retry Logic Not Working

**Symptoms:**
- Dashboard crashes immediately on network failure
- Only 1 retry attempt instead of 3
- No cached content displayed after retries fail

**Likely Causes:**
- Retry logic not implemented or broken
- Promise rejection not caught
- Cache not populated or not used as fallback

**Debugging Steps:**
1. Review `apiClient.js` retry implementation
2. Check for unhandled promise rejections in console
3. Verify cache populated before network failure test

**Fix:**
- Implement retry with exponential backoff (1s, 2s, 4s)
- Catch promise rejections gracefully
- Ensure cached data used as fallback

## Pass/Fail Criteria

### PASS: All of the following true
- ✅ API refreshes every 5 minutes for 2+ hours (24+ cycles)
- ✅ Timers never pause, reset, or stutter during refresh
- ✅ Page and item positions maintained across refresh
- ✅ New data fetched and rendered successfully
- ✅ Retry logic executes 3x on network failure
- ✅ Cached content displayed when retries fail
- ✅ Network indicator reflects correct status
- ✅ Automatic recovery when network returns
- ✅ No JavaScript errors during any refresh cycle
- ✅ No manual intervention required at any point

### FAIL: Any of the following true
- ❌ Timers pause, reset, or stutter during refresh
- ❌ Page or item position resets during refresh
- ❌ API refresh does not trigger every 5 minutes
- ❌ JavaScript errors during refresh
- ❌ Dashboard crashes on network failure
- ❌ No retry attempts or <3 retry attempts
- ❌ Cached content not displayed after retries fail
- ❌ Dashboard does not recover automatically after network returns
- ❌ Manual intervention required for recovery

## Documentation Requirements

After completing validation, document the following in Story 4.5 Dev Agent Record:

- **Test Duration:** Total time observed (e.g., 2 hours)
- **Refresh Cycles Observed:** Number of 5-minute cycles (e.g., 24)
- **Network Failure Tests:** Number of disconnect/reconnect tests (e.g., 1)
- **Issues Found:** Any deviations from expected behavior (or "None")
- **Pass/Fail Status:** Overall validation result
- **Evidence:** Screenshots or logs demonstrating success

## References

- API Client Implementation: [src/js/api-client.js](../src/js/api-client.js)
- Timer Implementations: [src/js/carousel-controller.js](../src/js/carousel-controller.js), [src/js/item-highlighter.js](../src/js/item-highlighter.js)
- Story 4.1 (Error Handling): Retry logic and cached fallback implementation
- Story 4.3 (Outage Indicator): Network status indicator implementation
