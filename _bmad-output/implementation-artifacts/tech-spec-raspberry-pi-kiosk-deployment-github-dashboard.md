---
title: 'Raspberry Pi Kiosk Deployment for GitHub Dashboard'
slug: 'raspberry-pi-kiosk-deployment-github-dashboard'
created: '2026-02-17'
status: 'implementation-complete'
stepsCompleted: [1, 2, 3, 4, 5]
tech_stack: ['Raspberry Pi OS Lite', 'Chromium', 'Python 3 http.server', 'systemd', 'unclutter', 'xset']
files_to_modify: ['docs/raspberry-pi-setup.md', 'README.md']
code_patterns: []
test_patterns: []
---

# Tech-Spec: Raspberry Pi Kiosk Deployment for GitHub Dashboard

**Created:** 2026-02-17
**Updated:** 2026-02-17

## Overview

### Problem Statement

The GitHub dashboard UI is complete and TV-optimized, but needs reliable 24/7 kiosk mode deployment on Raspberry Pi 3. The Pi must auto-boot directly to the dashboard in fullscreen, hide the cursor, prevent screen sleep, survive power outages, and require minimal manual intervention.

### Solution

Configure Raspberry Pi 3B with Raspberry Pi OS Lite, Chromium in kiosk mode, systemd auto-start services, screen power management settings, unclutter for cursor hiding, local HTTP server for dashboard hosting, and WiFi configuration for password-protected network access.

### Scope

**In Scope:**
- Pi 3B OS installation & configuration (Raspberry Pi OS Lite)
- Chromium browser kiosk mode setup (fullscreen, no UI)
- Auto-start on boot (systemd services)
- Screen sleep & screensaver disable (xset, DPMS settings)
- Mouse cursor hiding (unclutter utility)
- Local HTTP server setup (Python http.server or nginx)
- WiFi configuration (password-protected WPA2 network)
- Auto-recovery from power outages (systemd auto-restart)
- Complete setup documentation (step-by-step guide for replication)

**Out of Scope:**
- UI/UX modifications (already complete)
- Remote management (VNC/SSH/monitoring)
- Pi Zero 2 W deployment (Pi 3B is primary target)
- Multiple dashboard views/rotations
- Advanced monitoring/alerting
- Hardware watchdog timer (nice-to-have, not MVP)

## Context for Development

### Codebase Patterns

**Current Project Structure:**
- Single-file dashboard: `index.html` (UI complete, no modifications needed)
- Empty `docs/` directory (ready for deployment guide)
- Basic README with local development instructions only
- No existing automation, service files, or deployment scripts (clean slate)

**Dashboard Architecture:**
- Static HTML with embedded CSS/JS (vanilla JavaScript, no build process)
- GitHub Primer design system colors and minimal flat aesthetic
- Client-side API calls: RSS2JSON (blog/changelog), GitHub Status API
- Auto-refresh: 5-minute interval via JavaScript setInterval
- Optimized for TV viewing from 10+ feet (tested and validated)

### Files to Reference

| File | Purpose |
| ---- | ------- |
| index.html | Complete dashboard (no changes needed) |
| README.md | Will add Pi deployment section |
| docs/ | Will create raspberry-pi-setup.md guide |

### Technical Decisions

**Hardware:**
- **Target**: Raspberry Pi 3B (1GB RAM, quad-core 1.2GHz ARM)
- **Confirmed**: Pi Zero 2 W not suitable (insufficient RAM/performance headroom)

**Operating System:**
- **Raspberry Pi OS Lite** (headless, no desktop environment by default)
- Minimal X11 components installed only for Chromium
- Reduces attack surface and improves reliability

**HTTP Server:**
- **Python 3 http.server** for MVP (simplest, zero config)
- Serves single static HTML to localhost only
- Future upgrade path to nginx if needed

**Browser & Display:**
- **Chromium** in kiosk mode (fullscreen, no chrome/UI)
- Launch flags: `--kiosk --no-first-run --disable-infobars --disable-session-crashed-bubble`
- Hardware acceleration enabled for smooth rendering

**Service Management:**
- **systemd** for all services (HTTP server + Chromium launcher)
- Auto-restart on failure with exponential backoff
- Dependencies configured (network-online before services start)

**Screen & Cursor:**
- **xset** disables DPMS, screen blanking, screensaver
- **unclutter** hides mouse cursor after 1 second idle
- Applied via autostart script on X11 session init

**Network:**
- Password-protected WiFi via WPA2 (wpa_supplicant config)
- No captive portal complexity
- No ethernet fallback (WiFi confirmed reliable per testing)

## Implementation Plan

### Tasks

**Phase 1: Documentation Creation**

- [x] Task 1: Create comprehensive Pi deployment guide
  - File: `docs/raspberry-pi-setup.md`
  - Action: Write complete step-by-step setup guide covering OS installation through validation
  - Sections: Prerequisites, OS Installation, System Configuration, Dashboard Setup, Service Creation, Screen Management, Testing, Troubleshooting
  - Include: Every command with expected output, configuration file contents, validation steps

- [x] Task 2: Update main README with deployment section
  - File: `README.md`
  - Action: Add "Raspberry Pi Kiosk Deployment" section linking to docs/raspberry-pi-setup.md
  - Include: Brief overview of hardware requirements and link to detailed guide

**Phase 2: Pi Hardware Setup** (Manual execution following guide)

- [ ] Task 3: Install Raspberry Pi OS Lite on SD card
  - Tool: Raspberry Pi Imager
  - Action: Flash Pi OS Lite (64-bit) to SD card, configure WiFi and enable SSH via imager settings
  - Validation: Pi boots and connects to WiFi

- [ ] Task 4: Initial system configuration
  - Action: SSH into Pi, update system, set timezone, configure hostname
  - Commands: `sudo apt update && sudo apt upgrade -y`, `sudo raspi-config`
  - Validation: System fully updated

- [ ] Task 5: Install required packages
  - Packages: `chromium-browser`, `unclutter`, `x11-xserver-utils`, `xinit`, `openbox` (lightweight window manager)
  - Command: `sudo apt install -y chromium-browser unclutter x11-xserver-utils xinit openbox`
  - Validation: All packages installed successfully

**Phase 3: Dashboard Deployment**

- [ ] Task 6: Copy dashboard to Pi
  - Action: SCP `index.html` from Mac to Pi at `/home/pi/dashboard/index.html`
  - Command: `scp index.html pi@<PI_IP>:/home/pi/dashboard/`
  - Validation: File exists on Pi and displays correctly in browser

- [ ] Task 7: Create HTTP server systemd service
  - File: `/etc/systemd/system/dashboard-server.service`
  - Action: Create service file that runs `python3 -m http.server 8000` in dashboard directory
  - Service config: Start on boot, restart on failure, run as pi user
  - Validation: Service starts, dashboard accessible at http://localhost:8000

**Phase 4: Kiosk Mode Configuration**

- [ ] Task 8: Create Chromium kiosk launcher script
  - File: `/home/pi/start-kiosk.sh`
  - Action: Shell script that configures screen settings and launches Chromium in kiosk mode
  - Script contents: xset commands to disable screen blanking, unclutter launch, chromium launch with kiosk flags
  - Validation: Script runs and launches fullscreen dashboard

- [ ] Task 9: Create X11 autostart configuration
  - File: `/home/pi/.config/openbox/autostart`
  - Action: Configure openbox to auto-run kiosk launcher script on X11 start
  - Validation: Openbox runs kiosk script automatically

- [ ] Task 10: Create kiosk auto-start systemd service
  - File: `/etc/systemd/system/kiosk.service`
  - Action: Service that starts X11 session with openbox on boot
  - Dependencies: After network-online.target and dashboard-server.service
  - Validation: Pi boots directly to fullscreen dashboard

**Phase 5: Testing & Validation**

- [ ] Task 11: Perform power cycle tests
  - Action: Power cycle Pi 3 times, verify auto-boot to dashboard each time
  - Validation: Dashboard loads within 60 seconds of power on

- [ ] Task 12: Perform 24-hour burn-in test
  - Action: Let Pi run continuously for 24 hours, monitor for crashes or memory leaks
  - Validation: Dashboard still running after 24 hours, no visual issues

- [ ] Task 13: Document TV-specific settings
  - File: `docs/raspberry-pi-setup.md` (TV Configuration section)
  - Action: Document TV model, HDMI settings, input configuration
  - Validation: TV settings documented for future reference

### Acceptance Criteria

**AC1: Documentation Completeness**
- [ ] Given the setup guide exists, when a user follows it step-by-step, then they can replicate the entire Pi deployment without prior knowledge

**AC2: Auto-Boot Functionality**
- [ ] Given the Pi is powered off, when power is applied, then the dashboard loads fullscreen within 60 seconds without any user interaction

**AC3: Screen Management**
- [ ] Given the dashboard is running, when the Pi is idle for 10+ minutes, then the screen remains on and does not blank or show a screensaver

**AC4: Cursor Hidden**
- [ ] Given the dashboard is displayed, when viewing from any distance, then the mouse cursor is not visible

**AC5: Dashboard Auto-Refresh**
- [ ] Given the dashboard is running, when 5 minutes elapse, then the content auto-refreshes and displays updated data from APIs

**AC6: Power Outage Recovery**
- [ ] Given the Pi loses power unexpectedly, when power is restored, then the system automatically boots back to the fullscreen dashboard without intervention

**AC7: Service Reliability**
- [ ] Given the Chromium process crashes, when the crash occurs, then systemd automatically restarts the kiosk session within 10 seconds

**AC8: Network Resilience**
- [ ] Given WiFi connection drops temporarily, when connection is restored, then the dashboard continues functioning and auto-refresh resumes

**AC9: HTTP Server Availability**
- [ ] Given the Pi is running, when accessing http://localhost:8000 from the Pi, then index.html loads successfully

**AC10: TV Readability**
- [ ] Given the dashboard is displayed on the office TV, when standing 10-12 feet away, then item titles and section headers are clearly readable

## Additional Context

### Dependencies

**Hardware:**
- Raspberry Pi 3B (1GB RAM, quad-core ARM)
- MicroSD card (16GB minimum, 32GB recommended for longevity)
- USB power supply (5V, 2.5A minimum for Pi 3B)
- HDMI cable
- Office TV with HDMI input
- Keyboard (for initial setup only)
- Network: Password-protected WiFi (WPA2)

**Software:**
- Raspberry Pi OS Lite (64-bit, latest stable)
- Raspberry Pi Imager (for Mac - available at raspberrypi.com/software)
- Python 3 (pre-installed on Pi OS)
- Chromium browser
- systemd (pre-installed on Pi OS)
- X11 server components (xinit, openbox)
- unclutter utility
- x11-xserver-utils (includes xset)

**Network Services:**
- Guest WiFi network with password
- Internet access for API calls (rss2json.com, githubstatus.com)

**External Dependencies:**
- RSS2JSON API (free tier, no auth required)
- GitHub Status API (public, no auth required)
- GitHub blog/changelog RSS feeds (public)

### Testing Strategy

**Unit-Level Testing:**
- Verify each systemd service individually before enabling auto-start
- Test HTTP server serves index.html correctly
- Test Chromium kiosk script launches fullscreen
- Test xset commands disable screen blanking
- Test unclutter hides cursor

**Integration Testing:**
- Test service dependencies (HTTP server must start before kiosk)
- Test boot sequence from power-on to dashboard display
- Test API calls work from Pi browser
- Test auto-refresh mechanism functions

**System Testing:**
- Power cycle test (3x minimum) - verify auto-boot every time
- Burn-in test (24+ hours) - verify stability and no memory leaks
- Network interruption test - disconnect/reconnect WiFi, verify recovery
- Crash recovery test - kill Chromium process, verify systemd restart

**Acceptance Testing:**
- Physical test: Stand 10-12 feet from TV, verify readability
- Walk-by test: Simulate developer walking past, verify information is glanceable
- Week-long operational test: Run for 7 days, monitor for issues

**Manual Testing Checklist:**
1. [ ] Dashboard loads on boot without interaction
2. [ ] Screen never blanks or shows screensaver
3. [ ] Cursor is hidden
4. [ ] Content auto-refreshes every 5 minutes
5. [ ] All three sections display data (Blog, Changelog, Status)
6. [ ] Item hover states work (background changes)
7. [ ] Links are clickable if accidentally interacted with
8. [ ] TV remains on correct HDMI input
9. [ ] System recovers from power loss
10. [ ] System recovers from network loss

### Notes

**High-Risk Items:**
- **SD card corruption** - Most common failure mode for Pi kiosk deployments. Mitigation: Use quality SD card, create backup image after successful setup
- **WiFi password change** - If network credentials change, Pi requires physical access to reconfigure. Document this in troubleshooting section
- **TV auto-input switching** - Some TVs switch inputs automatically. Document TV-specific settings to prevent this
- **Chromium memory leaks** - Extended operation may cause memory issues. Systemd restart policy mitigates, but document as potential issue

**Known Limitations:**
- No remote management - all changes require physical access to Pi
- No health monitoring or alerting - failures only noticed when someone looks at TV
- Single point of failure - if Pi fails, dashboard is down until replaced
- API rate limits - rss2json free tier has limits, but unlikely to hit with 5-min refresh

**Future Considerations (Out of Scope):**
- Hardware watchdog timer for auto-recovery from kernel hangs
- VNC or SSH tunnel for emergency remote access
- Log aggregation for troubleshooting past issues
- Multiple dashboard views with rotation
- Integration with team's Slack for status notifications
- Prometheus metrics for uptime monitoring
- Backup Pi with automatic failover

**Maintenance Plan:**
- Monthly: Check Pi is still running, visually inspect dashboard content
- Quarterly: SSH in, run `sudo apt update && sudo apt upgrade`
- Yearly: Backup SD card image, consider SD card replacement (preventative)
- When adding team members: No action needed (passive display)

---

## Review Notes

- Adversarial review completed: 15 findings identified
- **Findings addressed**: All 15 (1 Critical, 3 High, 9 Medium, 2 Low)
- **Resolution approach**: Auto-fix all valid findings

### Critical fixes applied:
- F1: Added SSH security hardening section with firewall configuration and disable instructions
- F2: Documented rss2json.com API rate limits and mitigation strategies  
- F8: Added journald log rotation configuration to prevent SD card filling
- F12: Added NTP time synchronization configuration

### Additional improvements:
- F3: Fixed dd backup command syntax for both Mac (bs=4m) and Linux (bs=4M)
- F4: Added actual command output examples throughout guide
- F5: Updated power supply specification from 2.5A to 3A minimum
- F6: Added thermal management section with heatsink recommendations and temperature monitoring
- F7: Fixed success checklist to use unchecked boxes [ ] for user completion
- F9: Added monitoring/alerting strategy in advanced configuration
- F10: Documented wired ethernet as more reliable alternative to WiFi
- F11: Changed systemd kiosk service dependency from Requires= to Wants= for looser coupling
- F13: Added browser cache invalidation instructions for dashboard updates
- F14: Added comprehensive HDMI/overscan/resolution configuration section
- F15: Enhanced revision history with author, hardware tested, and detailed tracking
