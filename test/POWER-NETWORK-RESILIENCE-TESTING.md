# Power Recovery & Network Resilience Testing Protocol

## Overview

This document describes manual testing procedures to validate the dashboard's resilience to power outages and network failures in a production Raspberry Pi kiosk environment.

## Test Objectives

1. **Power Recovery:** Verify dashboard auto-restarts after power outage (<2 minutes)
2. **Network Resilience:** Verify dashboard operates gracefully during network outage (cached content, indicator, auto-recovery)
3. **Auto-Start Validation:** Verify systemd services restart automatically without manual intervention
4. **Recovery Time:** Measure time from power-on to dashboard fully functional

## Acceptance Criteria Mapping

From Story 4.5 Acceptance Criteria:

**AC: Power Recovery Testing**
- ✅ systemd services restart automatically within 2 minutes
- ✅ Dashboard loads in Chromium kiosk mode
- ✅ All functionality works after restart
- ✅ No manual intervention is required

**AC: Network Resilience Testing**
- ✅ Dashboard shows cached content during disconnect
- ✅ Network status indicator appears appropriately
- ✅ Dashboard recovers automatically when WiFi returns
- ✅ Fresh data fetches successfully after recovery

## Prerequisites

### Hardware
- Raspberry Pi 3B (or compatible) with dashboard deployed
- TV or monitor connected via HDMI
- Power supply (5V 2.5A minimum)
- Network: WiFi or Ethernet configured

### Software
- Dashboard deployed and running (see [deploy/README.md](../deploy/README.md))
- systemd services installed and enabled:
  - `dashboard-server.service` (Python http.server)
  - `kiosk.service` (Chromium in kiosk mode)
- Dashboard code at: `~/dashboard/`

### Access
- Physical access to Pi (to pull power cable)
- SSH access for verification (optional)
- Router/WiFi access point control (for network disconnect test)

## Test 1: Power Recovery (Reboot Test)

### Objective
Verify dashboard restarts automatically after power outage and becomes fully functional within 2 minutes.

### Test Procedure

**Step 1: Baseline State**
1. Verify dashboard running normally on TV
2. Note current page displayed (e.g., Blog, Changelog, Status)
3. Note current IP address (for SSH verification)
4. Note current time: ________________

**Step 2: Simulate Power Outage**
1. **Pull power cable** from Raspberry Pi (or power outlet)
2. Wait 30 seconds (ensure full shutdown)
3. Start stopwatch or note time: ________________

**Step 3: Restore Power**
1. Reconnect power cable to Raspberry Pi
2. Observe boot sequence:
   - [ ] Red power LED illuminates immediately
   - [ ] Green activity LED starts blinking (SD card access)
   - [ ] HDMI output appears (rainbow square, then boot text)
3. Continue timing until dashboard visible on TV

**Step 4: Observe Auto-Start Sequence**

**Phase 1: OS Boot (30-60 seconds)**
- [ ] Raspberry Pi OS boots
- [ ] Boot messages scroll on TV (if splash screen disabled)
- [ ] Login prompt appears briefly (auto-login configured)

**Phase 2: Services Start (20-40 seconds)**
- [ ] `dashboard-server.service` starts (Python http.server on port 8000)
- [ ] Wait for service startup delay (if configured)

**Phase 3: Chromium Launches (30-60 seconds)**
- [ ] `kiosk.service` starts
- [ ] Chromium window opens (kiosk mode, fullscreen)
- [ ] Dashboard URL loads: http://localhost:8000
- [ ] Dashboard renders on TV

**Step 5: Verify Full Functionality**

After dashboard visible, verify functionality:
- [ ] Dashboard loaded completely (not blank page)
- [ ] Data displayed (blog items, changelog items, or cached content)
- [ ] Carousel timer started (progress bar animating at bottom)
- [ ] Item highlighting active (first item highlighted)
- [ ] Page rotation works (wait 30 seconds, verify page changes)
- [ ] Item highlighting works (wait 8 seconds, verify highlight changes)
- [ ] No visible errors on screen

**Step 6: Record Recovery Time**
- **Time to Dashboard Visible:** __________ seconds (from power on to dashboard on screen)
- **Time to Fully Functional:** __________ seconds (from power on to timers active)

**Step 7: SSH Verification (Optional)**

If SSH access available, verify services:
```bash
# SSH to Pi
ssh pi@<pi-ip-address>

# Check service status
systemctl status dashboard-server.service
systemctl status kiosk.service

# Check process uptime
ps aux | grep python  # Should show http.server running
ps aux | grep chromium  # Should show chromium process

# Check service start times
journalctl -u dashboard-server.service -b | grep "Started"
journalctl -u kiosk.service -b | grep "Started"
```

Expected: Both services show "active (running)" and started times recent.

### Success Criteria

**PASS: All of the following true**
- ✅ Dashboard visible on TV within 2 minutes of power restoration
- ✅ All functionality works (timers, rotation, highlighting, data)
- ✅ No manual intervention required (no SSH, no keyboard/mouse)
- ✅ systemd services started automatically
- ✅ Chromium launched in kiosk mode (fullscreen, no browser UI)

**FAIL: Any of the following true**
- ❌ Dashboard not visible after 2 minutes
- ❌ Blank screen or error message on TV
- ❌ Manual SSH intervention required to start services
- ❌ Timers not working after recovery
- ❌ Chromium not in kiosk mode (browser UI visible)

### Common Issues and Troubleshooting

**Issue: Dashboard not appearing (blank screen)**

**Cause:** Services not starting automatically

**Debug:**
```bash
# SSH to Pi
ssh pi@<pi-ip-address>

# Check service status
sudo systemctl status dashboard-server.service
sudo systemctl status kiosk.service

# Check service enabled for auto-start
sudo systemctl is-enabled dashboard-server.service  # Should show "enabled"
sudo systemctl is-enabled kiosk.service             # Should show "enabled"

# Manually start services
sudo systemctl start dashboard-server.service
sudo systemctl start kiosk.service
```

**Fix:** Enable services if not enabled:
```bash
sudo systemctl enable dashboard-server.service
sudo systemctl enable kiosk.service
```

**Issue: Dashboard shows errors or "Cannot connect"**

**Cause:** Dashboard server not running or port conflict

**Debug:**
```bash
# Check if port 8000 listening
sudo netstat -tulnp | grep 8000

# Check server logs
journalctl -u dashboard-server.service -n 50
```

**Fix:** Ensure server starts and port 8000 available.

**Issue: Chromium shows normal UI (not kiosk mode)**

**Cause:** Kiosk service not configured correctly

**Debug:**
```bash
# Check kiosk service configuration
cat /etc/systemd/system/kiosk.service

# Verify --kiosk flag present in ExecStart
```

**Fix:** Ensure `--kiosk` flag in service file (see [deploy/systemd/kiosk.service](../deploy/systemd/kiosk.service)).

## Test 2: Network Resilience (WiFi Disconnect/Reconnect)

### Objective
Verify dashboard continues functioning with cached content during network outage and recovers automatically when network returns.

### Test Procedure

**Step 1: Baseline State**
1. Verify dashboard running normally with network connected
2. Verify data loaded (check timestamps/content is fresh)
3. Note current page and highlighted item
4. Note network indicator status (green dot = online)
5. Note current time: ________________

**Step 2: Disconnect Network**

**Method A: Router/Access Point Control (Preferred)**
1. Access router admin interface
2. Disable WiFi network (or block Pi MAC address)
3. **Do NOT physically disconnect Pi power** (testing network only)
4. Start timer: ________________

**Method B: SSH to Pi (Alternative)**
```bash
# SSH to Pi
ssh pi@<pi-ip-address>

# Bring down WiFi interface
sudo ifconfig wlan0 down

# OR disconnect from network
sudo nmcli device disconnect wlan0
```

**Step 3: Observe Behavior During Outage (10 Minutes)**

**Immediately After Disconnect:**
- [ ] Dashboard continues displaying (no crash or freeze)
- [ ] Cached content remains visible (blog items, changelog items)
- [ ] Carousel timer continues rotating pages (30s interval)
- [ ] Item highlighter continues cycling (8s interval)
- [ ] Network status indicator changes to **offline** (yellow dot)
- [ ] No error popups or modal dialogs on screen

**At 5-Minute Mark (First API Refresh Attempt During Outage):**
- [ ] Dashboard still functioning normally
- [ ] Timers still active (no pause or stutter)
- [ ] Cached content still displayed (no blank screen)
- [ ] Network indicator still shows offline
- [ ] No visible errors on TV

**At 10-Minute Mark (Second API Refresh Attempt):**
- [ ] Dashboard still functioning normally
- [ ] Cached content still displayed (unchanged/stale is expected)
- [ ] Timers remain accurate (no cumulative drift)
- [ ] Network indicator still shows offline

**Step 4: Reconnect Network**

**Method A: Router/Access Point**
1. Re-enable WiFi network (or unblock Pi MAC address)
2. Wait for Pi to reconnect automatically (30-60 seconds)

**Method B: SSH to Pi**
```bash
# SSH to Pi (if still accessible via Ethernet)
ssh pi@<pi-ip-address>

# Bring up WiFi interface
sudo ifconfig wlan0 up

# OR reconnect to network
sudo nmcli device connect wlan0
```

Note time of reconnection: ________________

**Step 5: Observe Recovery (After Reconnect)**

**Immediately After Reconnect:**
- [ ] Dashboard continues functioning (no restart required)
- [ ] Network indicator changes back to **online** (green dot)

**At Next 5-Minute API Refresh (Within 5 Minutes):**
- [ ] Fresh data fetched from APIs
- [ ] New content rendered in UI
- [ ] Timestamps/content updated (verify data is fresh, not cached)
- [ ] Dashboard fully recovered automatically
- [ ] No manual intervention required

**Step 6: Verify Continued Operation (10 More Minutes)**
- [ ] Dashboard continues functioning normally
- [ ] Timers remain accurate
- [ ] API refreshes continue every 5 minutes
- [ ] Data stays fresh (not reverting to cached)

### Success Criteria

**PASS: All of the following true**
- ✅ Dashboard continues functioning during 10-minute network outage
- ✅ Cached content displayed throughout outage (no blank screen)
- ✅ Network indicator appears and shows offline status (yellow)
- ✅ Timers continue running accurately (no pause, no reset)
- ✅ Dashboard recovers automatically when network returns (no manual action)
- ✅ Network indicator clears when online (green)
- ✅ Fresh data fetched within 5 minutes of reconnect
- ✅ No errors or crashes during entire test

**FAIL: Any of the following true**
- ❌ Dashboard crashes or freezes during outage
- ❌ Blank screen during outage (cached content not shown)
- ❌ Network indicator does not appear or incorrect status
- ❌ Timers stop or reset during outage
- ❌ Dashboard does not recover automatically (manual restart required)
- ❌ Fresh data not fetched after reconnect
- ❌ Errors or popups visible on TV

### Common Issues and Troubleshooting

**Issue: Dashboard shows blank screen during outage**

**Cause:** No cached content or cache not being used

**Debug:**
- Verify API calls succeeded before disconnect (check Network tab in DevTools)
- Check if localStorage has cached data (see `apiClient.js`)

**Fix:**
- Ensure cache populated during normal operation
- Verify cache fallback logic in API client

**Issue: Network indicator does not appear**

**Cause:** Indicator component not rendering or not detecting network status

**Debug:**
- SSH to Pi (via Ethernet if WiFi down)
- Check dashboard source for `persistent-alert.js`
- Verify indicator logic detects fetch failures

**Fix:**
- Ensure persistent alert component initialized
- Verify network detection logic in API client

**Issue: Dashboard does not recover after reconnect**

**Cause:** Network reconnect not triggering API refresh

**Debug:**
- Check if WiFi actually reconnected (ping external IP)
- Verify API refresh timer still running
- Check for JavaScript errors in console (if accessible)

**Fix:**
- Ensure API refresh interval not cleared during outage
- Verify retry logic attempts fresh fetch after reconnect

**Issue: Timers reset during network outage**

**Cause:** Timer state lost during error handling

**Debug:**
- Review timer implementation for any stops/resets during API failures
- Check if error handling inadvertently re-initializes components

**Fix:**
- Ensure API errors do not affect timer state
- Isolate timer logic from network/data logic

## Test 3: Extended Network Outage (Optional)

### Objective
Verify dashboard remains stable during extended network outage (30+ minutes).

### Test Procedure
Same as Test 2, but extend outage duration to 30 minutes or longer.

### Additional Observations
- [ ] Dashboard remains stable throughout extended outage
- [ ] Memory usage does not grow excessively (use SSH to check if needed)
- [ ] Timers remain accurate after 30+ minutes
- [ ] User experience acceptable with stale cached content

## Documentation Requirements

After completing tests, document the following in Story 4.5 Dev Agent Record:

### Power Recovery Test Results
- **Recovery Time (to visible):** __________ seconds
- **Recovery Time (to functional):** __________ seconds
- **Services Auto-Started:** Yes / No
- **Manual Intervention Required:** Yes / No
- **Issues Found:** (list or "None")
- **Pass/Fail:** PASS / FAIL

### Network Resilience Test Results
- **Outage Duration Tested:** __________ minutes
- **Cached Content Displayed:** Yes / No
- **Network Indicator Appeared:** Yes / No
- **Timers Continued Running:** Yes / No
- **Auto-Recovery Successful:** Yes / No
- **Fresh Data After Recovery:** Yes / No
- **Manual Intervention Required:** Yes / No
- **Issues Found:** (list or "None")
- **Pass/Fail:** PASS / FAIL

### Overall Resilience Assessment
- **Production Ready:** Yes / No
- **Confidence Level:** High / Medium / Low
- **Recommendations:** (any suggestions or concerns)

## References

- Raspberry Pi Setup Guide: [docs/raspberry-pi-setup.md](../docs/raspberry-pi-setup.md)
- Deployment Scripts: [deploy/](../deploy/)
- systemd Service Files: [deploy/systemd/](../deploy/systemd/)
- API Client Implementation: [src/js/api-client.js](../src/js/api-client.js)
- Persistent Alert Component: [src/js/persistent-alert.js](../src/js/persistent-alert.js)
- Story 4.1 (Error Handling): Retry logic and cached fallback
- Story 4.3 (Outage Indicator): Network status indicator
