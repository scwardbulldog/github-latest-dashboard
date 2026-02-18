# Raspberry Pi Kiosk Deployment Guide

Complete step-by-step guide to deploying the GitHub Dashboard as a 24/7 kiosk on Raspberry Pi 3B.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Phase 1: OS Installation](#phase-1-os-installation)
- [Phase 2: System Configuration](#phase-2-system-configuration)
- [Phase 3: Dashboard Setup](#phase-3-dashboard-setup)
- [Phase 4: Kiosk Mode Configuration](#phase-4-kiosk-mode-configuration)
- [Phase 5: Testing & Validation](#phase-5-testing--validation)
- [Troubleshooting](#troubleshooting)
- [Maintenance](#maintenance)

---

## Prerequisites

### Hardware Requirements

- **Raspberry Pi 3B** (1GB RAM, quad-core ARM)
- **MicroSD card** - 16GB minimum (32GB recommended for longevity)
- **USB power supply** - 5V, 3A (official Raspberry Pi power supply recommended for reliability with WiFi/HDMI)
- **HDMI cable**
- **Office TV** with HDMI input
- **Keyboard** (for initial setup only)
- **Computer** (Mac/Windows/Linux) for SD card preparation
- **Heatsink kit** (recommended for 24/7 operation to prevent thermal throttling)

### Network Requirements

- Password-protected WiFi network (WPA2)
- Internet access for API calls
- WiFi credentials (SSID and password)

### Software Requirements

- **Raspberry Pi Imager** - Download from https://www.raspberrypi.com/software/
- **Terminal/SSH client** - Terminal (Mac/Linux) or PuTTY (Windows)

---

## Phase 1: OS Installation

### Step 1: Flash Raspberry Pi OS to SD Card

1. **Insert SD card** into your computer
2. **Launch Raspberry Pi Imager**
3. **Choose OS**: 
   - Click "Choose OS"
   - Select "Raspberry Pi OS (other)"
   - Select "Raspberry Pi OS Lite (64-bit)"
4. **Choose Storage**: Select your SD card
5. **Configure Settings** (click gear icon or press Cmd+Shift+X):
   - **Set hostname**: `github-dashboard` (or your preference)
   - **Enable SSH**: Check "Enable SSH" and use password authentication
   - **Set username**: `pi` (or your preference)
   - **Set password**: Choose a secure password
   - **Configure WiFi**: 
     - SSID: Your network name
     - Password: Your network password
     - WiFi country: Your country code (e.g., US)
   - **Set locale settings**: 
     - Time zone: Your timezone
     - Keyboard layout: Your layout
6. **Write**: Click "Write" and confirm
7. **Wait**: The process takes 5-10 minutes
8. **Eject**: Safely eject the SD card when complete

### Step 2: First Boot

1. **Insert SD card** into Raspberry Pi
2. **Connect HDMI cable** to TV (optional - can be done later)
3. **Power on** the Pi - Wait 30-60 seconds for first boot
4. **Find Pi IP address**: Check your router's connected devices or use:
   ```bash
   # From your computer
   ping github-dashboard.local
   ```

### Step 3: SSH Connection

```bash
# From your computer
ssh pi@github-dashboard.local
# Or use IP address if .local doesn't work
ssh pi@192.168.x.x

# Enter password when prompted
```

**Expected output**: You should see the Raspberry Pi OS welcome message and command prompt:
```
Linux github-dashboard 6.1.0-rpi4-rpi-v8 #1 SMP PREEMPT Debian 1:6.1.54-1+rpt2 (2023-10-05) aarch64
...
pi@github-dashboard:~ $
```

---

## Phase 2: System Configuration

### Step 4: Update System

```bash
# Update package lists and upgrade all packages
sudo apt update && sudo apt upgrade -y

# This may take 5-15 minutes
```

**Expected output**: 
```
Get:1 http://deb.debian.org/debian bookworm InRelease [151 kB]
...
Reading package lists... Done
Building dependency tree... Done
...
The following packages will be upgraded:
...
Done.
```

### Step 5: Install Required Packages

```bash
sudo apt install -y chromium unclutter x11-xserver-utils xinit openbox
```

**Packages installed**:
- `chromium` - Web browser for dashboard display
- `unclutter` - Hides mouse cursor
- `x11-xserver-utils` - Includes xset for screen management
- `xinit` - X11 session starter
- `openbox` - Lightweight window manager

**Expected output**: 
```
Reading package lists... Done
Building dependency tree... Done
...
The following NEW packages will be installed:
  chromium chromium-common ... openbox unclutter x11-xserver-utils xinit
...
Processing triggers for man-db ...
```
(Installation may take 3-5 minutes)

### Step 6: Configure System Settings

```bash
sudo raspi-config
```

**Required settings**:
- **System Options** → **Boot / Auto Login** → Leave as "Console" (we'll use systemd)
- **Localisation Options** → Verify timezone is correct
- **Advanced Options** → **Memory Split** → Set to 256MB (for better graphics performance)

**Exit and save changes**, then continue to additional configuration:

```bash
# Configure time synchronization (NTP)
sudo timedatectl set-ntp true

# Verify NTP is active
timedatectl status
```

**Expected output**: `NTP service: active`

**Configure journald log rotation** to prevent SD card filling:

```bash
sudo nano /etc/systemd/journald.conf
```

Uncomment and set:
```ini
SystemMaxUse=100M
SystemMaxFileSize=10M
MaxRetentionSec=1week
```

Save and restart journald:
```bash
sudo systemctl restart systemd-journald
```

**Configure X11 permissions** to allow systemd services to start X server:

```bash
sudo nano /etc/X11/Xwrapper.config
```

Change the line `allowed_users=console` to:
```
allowed_users=anybody
```

Save and exit. This prevents "Only console users are allowed to run the X server" errors.

---

## Phase 3: Dashboard Setup

### Step 7: Create Dashboard Directory

**Note**: Replace `/home/pi/` with your actual home directory if using a different username.

```bash
# Create directory for dashboard files
mkdir -p /home/pi/dashboard
```

### Step 8: Transfer Dashboard File

**From your computer** (in the github-latest-dashboard project directory):

**Note**: Replace `pi@` and `/home/pi/` with your actual username if different (e.g., `yourusername@` and `/home/yourusername/`).

```bash
# Copy index.html to Pi
scp index.html pi@github-dashboard.local:/home/pi/dashboard/

# Or using IP address
scp index.html pi@192.168.x.x:/home/pi/dashboard/
```

**Expected output**: File transferred successfully.

**Verify on Pi** (adjust path for your username):
```bash
ls -lh /home/pi/dashboard/
```

You should see `index.html`.

### Step 9: Create HTTP Server Service

Create systemd service file:

```bash
sudo nano /etc/systemd/system/dashboard-server.service
```

**⚠️ IMPORTANT**: The service file below uses `User=pi` and `/home/pi/` paths. **If you created a different username during Pi setup**, replace `pi` with your actual username in:
- `User=pi` → `User=yourusername`
- `WorkingDirectory=/home/pi/dashboard` → `WorkingDirectory=/home/yourusername/dashboard`

**Paste this content** (customize username if needed):

```ini
[Unit]
Description=GitHub Dashboard HTTP Server
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/dashboard
ExecStart=/usr/bin/python3 -m http.server 8000
Restart=on-failure
RestartSec=5s

[Install]
WantedBy=multi-user.target
```

**Save and exit**: Press `Ctrl+X`, then `Y`, then `Enter`.

**Enable and start the service**:

```bash
# Reload systemd to recognize new service
sudo systemctl daemon-reload

# Enable service to start on boot
sudo systemctl enable dashboard-server.service

# Start service now
sudo systemctl start dashboard-server.service

# Check status
sudo systemctl status dashboard-server.service
```

**Expected output**: Service should show "active (running)" in green.

**Test HTTP server**:

```bash
curl -I http://localhost:8000
```

**Expected output**: `HTTP/1.0 200 OK`

---

## Phase 4: Kiosk Mode Configuration

### Step 10: Create Kiosk Launcher Script

**Note**: Replace `/home/pi/` with your actual home directory if using a different username (e.g., `/home/yourusername/`).

```bash
nano /home/pi/start-kiosk.sh
```

**Paste this content**:

```bash
#!/bin/bash

# Disable screen blanking and power management
xset s off
xset -dpms
xset s noblank

# Hide mouse cursor after 1 second of inactivity
unclutter -idle 1 -root &

# Wait for HTTP server to be ready
sleep 5

# Launch Chromium in kiosk mode
chromium \
  --kiosk \
  --noerrdialogs \
  --disable-infobars \
  --no-first-run \
  --disable-session-crashed-bubble \
  --disable-features=TranslateUI \
  --check-for-update-interval=31536000 \
  http://localhost:8000
```

**Save and exit**: Press `Ctrl+X`, then `Y`, then `Enter`.

**Make script executable**:

```bash
chmod +x /home/pi/start-kiosk.sh
```

### Step 11: Configure Openbox Autostart

**Note**: Replace `/home/pi/` with your actual home directory if using a different username.

Create openbox config directory:

```bash
mkdir -p /home/pi/.config/openbox
```

Create autostart file:

```bash
nano /home/pi/.config/openbox/autostart
```

**Paste this content**:

```bash
# Start kiosk launcher script
/home/pi/start-kiosk.sh &
```

**Save and exit**: Press `Ctrl+X`, then `Y`, then `Enter`.

### Step 12: Create Kiosk Systemd Service

```bash
sudo nano /etc/systemd/system/kiosk.service
```

**⚠️ IMPORTANT**: The service file below uses `User=pi` and `/home/pi/` paths. **If you created a different username during Pi setup**, replace `pi` with your actual username in:
- `User=pi` → `User=yourusername`
- `XAUTHORITY=/home/pi/.Xauthority` → `XAUTHORITY=/home/yourusername/.Xauthority`

**Paste this content** (customize username if needed):

```ini
[Unit]
Description=Chromium Kiosk
After=network-online.target dashboard-server.service
Wants=network-online.target dashboard-server.service

[Service]
Type=simple
User=pi
TTYPath=/dev/tty7
StandardInput=tty
StandardOutput=journal
StandardError=journal
Environment=DISPLAY=:0
Environment=XAUTHORITY=/home/pi/.Xauthority
ExecStart=/usr/bin/startx /usr/bin/openbox-session -- vt7 -nocursor
Restart=on-failure
RestartSec=10s

[Install]
WantedBy=multi-user.target
```

**Save and exit**: Press `Ctrl+X`, then `Y`, then `Enter`.

**Enable the kiosk service**:

```bash
# Reload systemd
sudo systemctl daemon-reload

# Enable service to start on boot
sudo systemctl enable kiosk.service

# DO NOT start it yet - we'll reboot for initial test
```

---

## Phase 5: Testing & Validation

### Step 13: Initial Reboot Test

```bash
sudo reboot
```

**What should happen**:
1. Pi reboots (~30 seconds)
2. X11 server starts automatically
3. Chromium launches in fullscreen kiosk mode
4. Dashboard loads from localhost:8000
5. Mouse cursor disappears after 1 second
6. Screen remains on (no blanking)

**If the Pi doesn't boot to kiosk mode**, SSH back in and check service status:

```bash
ssh pi@github-dashboard.local

# Check HTTP server
sudo systemctl status dashboard-server.service

# Check kiosk service
sudo systemctl status kiosk.service

# View kiosk service logs
journalctl -u kiosk.service -n 50
```

### Step 14: Power Cycle Tests

**Perform 3 power cycles**:

1. Unplug Pi power
2. Wait 10 seconds
3. Plug power back in
4. Verify dashboard loads within 60 seconds

**Repeat 3 times** to ensure consistent auto-boot.

### Step 15: Screen Management Validation

**SSH into Pi** (or use Ctrl+Alt+F1 to switch to terminal):

```bash
ssh pi@github-dashboard.local

# Check xset settings (run from Pi terminal, not SSH)
# You'll need to switch to a terminal on the Pi (Ctrl+Alt+F1)
# Then log in and run:
DISPLAY=:0 xset q | grep -A 5 "Screen Saver"
```

**Expected output**: 
- Screen Saver: timeout = 0 (disabled)
- DPMS: Disabled

### Step 16: 24-Hour Burn-In Test

Let the Pi run continuously for 24 hours:

**Check after 24 hours**:
- [ ] Dashboard still running
- [ ] No visual artifacts or UI issues
- [ ] Content still auto-refreshing
- [ ] Screen still on (no blanking)

**Monitor memory usage** (SSH in):
```bash
free -h
```

**Expected**: Memory usage should be stable (~300-500MB used).

### Step 17: Network Resilience Test

**Disconnect WiFi** from your router (or disable SSID temporarily):
- Dashboard should show connection errors for API calls

**Reconnect WiFi**:
- Dashboard should recover and resume auto-refresh within 1-2 cycles

### Step 18: Crash Recovery Test

**Force-kill Chromium** (SSH into Pi):

```bash
# Find Chromium process
pgrep chromium

# Kill it
sudo killall chromium
```

**Expected**: Systemd should automatically restart kiosk service within 10 seconds.

**Verify**:
```bash
sudo systemctl status kiosk.service
```

You should see restart logs.

---

## Troubleshooting

### Dashboard Doesn't Load on Boot

**Check service status**:
```bash
sudo systemctl status dashboard-server.service
sudo systemctl status kiosk.service
```

**View logs**:
```bash
journalctl -u dashboard-server.service -n 50
journalctl -u kiosk.service -n 50
```

**Common issues**:
- HTTP server not starting: Check `/home/pi/dashboard/index.html` exists
- Kiosk service failed: Check X11 permissions, try running `startx` manually
- Black screen: Check HDMI connection, verify TV input

### Screen Blanks After Inactivity

**Verify xset settings**:
```bash
# From Pi terminal (Ctrl+Alt+F1)
DISPLAY=:0 xset q
```

**Re-apply settings manually**:
```bash
DISPLAY=:0 xset s off
DISPLAY=:0 xset -dpms
DISPLAY=:0 xset s noblank
```

If this fixes it, check `/home/pi/start-kiosk.sh` has correct xset commands.

### Mouse Cursor Visible

**Check unclutter is running**:
```bash
ps aux | grep unclutter
```

**If not running**, check `/home/pi/start-kiosk.sh` includes unclutter command.

**Restart kiosk**:
```bash
sudo systemctl restart kiosk.service
```

### WiFi Not Connecting

**Check WiFi configuration**:
```bash
sudo cat /etc/wpa_supplicant/wpa_supplicant.conf
```

**Reconfigure WiFi**:
```bash
sudo raspi-config
# System Options → Wireless LAN
```

**Or edit manually**:
```bash
sudo nano /etc/wpa_supplicant/wpa_supplicant.conf
```

Add:
```
network={
    ssid="YourNetworkName"
    psk="YourPassword"
}
```

**Restart networking**:
```bash
sudo systemctl restart networking
```

### Dashboard Shows API Errors

**Check internet connectivity**:
```bash
ping -c 3 google.com
```

**Test API endpoints directly**:
```bash
curl -I https://api.github.com/status
curl -I https://api.rss2json.com/v1/api.json
```

**Common issues**:
- No internet: Check WiFi connection
- API rate limiting: rss2json free tier limits (unlikely with 5-min refresh)
- API service down: Check https://www.githubstatus.com/

### TV Shows "No Signal"

**Check HDMI connection**:
- Ensure HDMI cable is securely connected
- Verify TV is on correct HDMI input

**Force HDMI output**:
```bash
sudo nano /boot/config.txt
```

Add/uncomment:
```
hdmi_force_hotplug=1
hdmi_drive=2
```

**Reboot**:
```bash
sudo reboot
```

### Kiosk Service Won't Start - "Only console users allowed"

**Error in logs**: `/usr/lib/xorg/Xorg.wrap: Only console users are allowed to run the X server`

**Fix**: Allow systemd services to start X server

```bash
# Edit X11 wrapper config
sudo nano /etc/X11/Xwrapper.config

# Change this line:
# allowed_users=console
# To:
allowed_users=anybody

# Save and exit, then restart
sudo systemctl restart kiosk.service
```

### Kiosk Service Won't Start - User Error (status=217/USER)

**Error in logs**: `Failed to determine user credentials: No such process` or `status=217/USER`

**Cause**: The service file specifies `User=pi` but your username is different.

**Fix**: Update service files with your actual username

```bash
# Find your username
whoami

# Edit kiosk service
sudo nano /etc/systemd/system/kiosk.service

# Change User=pi to User=yourusername
# Also update XAUTHORITY path from /home/pi to /home/yourusername

# Edit dashboard server service  
sudo nano /etc/systemd/system/dashboard-server.service

# Change User=pi to User=yourusername
# Change WorkingDirectory=/home/pi/dashboard to /home/yourusername/dashboard

# Reload and restart
sudo systemctl daemon-reload
sudo systemctl restart dashboard-server.service
sudo systemctl restart kiosk.service
```

### Kiosk Service Won't Start - TTY/Console Errors

**Error in logs**: `Cannot open /dev/tty0 (Permission denied)` or `Couldn't get a file descriptor referring to the console`

**Fix**: Add TTY configuration to kiosk service

```bash
# Edit kiosk service
sudo nano /etc/systemd/system/kiosk.service

# Add these lines in the [Service] section:
TTYPath=/dev/tty7
StandardInput=tty
StandardOutput=journal
StandardError=journal

# Change ExecStart line to:
ExecStart=/usr/bin/startx /usr/bin/openbox-session -- vt7 -nocursor

# Also add user to tty group
sudo usermod -a -G tty yourusername

# Reload and restart
sudo systemctl daemon-reload
sudo systemctl restart kiosk.service
```

### Cannot Save Files with nano

**Symptom**: When using `sudo nano /etc/systemd/system/somefile.service`, you can't save the file even with sudo.

**Workaround**: Create empty file first, then edit

```bash
# Create empty file first
sudo touch /etc/systemd/system/somefile.service

# Then edit it
sudo nano /etc/systemd/system/somefile.service

# Now saving should work
```

**Alternative**: Use `tee` to write files directly:

```bash
sudo tee /etc/systemd/system/somefile.service > /dev/null << 'EOF'
[Unit]
Description=My Service
...
EOF
```

### SD Card Corruption

**Symptoms**: Pi won't boot, random crashes, filesystem errors

**Prevention**:
- Use quality SD card (SanDisk, Samsung recommended)
- Don't unplug power during writes
- Enable read-only filesystem (advanced - see Raspberry Pi docs)

**Recovery**:
- Reflash SD card with Pi OS
- Restore from backup image (if you created one)

### Creating Backup Image

**After successful setup**, create backup:

**On Mac**:
```bash
# Insert SD card into computer
# Find disk with: diskutil list
sudo dd if=/dev/diskX of=~/github-dashboard-backup.img bs=4m

# Replace /dev/diskX with your SD card device (e.g., /dev/disk4)
```

**On Linux**:
```bash
# Insert SD card into computer
# Find disk with: lsblk
sudo dd if=/dev/sdX of=~/github-dashboard-backup.img bs=4M status=progress

# Replace /dev/sdX with your SD card device (e.g., /dev/sdb)
# Note: Linux uses uppercase M in bs=4M
```

**On Windows**: Use Win32 Disk Imager or Raspberry Pi Imager to create backup image.

---

## Maintenance

### Monthly Checks

```bash
# SSH into Pi
ssh pi@github-dashboard.local

# Check services are running
sudo systemctl status dashboard-server.service
sudo systemctl status kiosk.service

# Check disk space
df -h

# Check memory usage
free -h
```

### Quarterly Updates

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Reboot to apply updates
sudo reboot
```

### Yearly Maintenance

1. **Backup SD card** (see Creating Backup Image above)
2. **Consider SD card replacement** (preventative - SD cards degrade over time)
3. **Clean Pi case** and verify ventilation is clear

### Changing WiFi Password

If your network password changes:

```bash
# SSH into Pi (using ethernet if possible)
sudo raspi-config
# System Options → Wireless LAN → Enter new credentials

# Or edit manually
sudo nano /etc/wpa_supplicant/wpa_supplicant.conf
# Update psk="NewPassword"

# Restart networking
sudo systemctl restart networking
```

### Updating Dashboard File

```bash
# From your computer
scp index.html pi@github-dashboard.local:/home/pi/dashboard/
```

**Clear browser cache** to see changes immediately:
```bash
# SSH into Pi and restart kiosk to force cache clear
ssh pi@github-dashboard.local
sudo systemctl restart kiosk.service
```

Alternatively, wait for next auto-refresh cycle (5 minutes).

### Viewing Logs

**HTTP server logs**:
```bash
journalctl -u dashboard-server.service -f
```

**Kiosk service logs**:
```bash
journalctl -u kiosk.service -f
```

**System logs**:
```bash
sudo journalctl -f
```

---

## Display Configuration

### HDMI and Overscan Settings

If you experience black borders or cropped edges on your TV:

```bash
sudo nano /boot/config.txt
```

**Add or uncomment these lines**:
```ini
# Force HDMI output (prevent "no signal")
hdmi_force_hotplug=1
hdmi_drive=2

# Disable overscan (remove black borders)
disable_overscan=1

# If you still have borders, adjust these values:
# overscan_left=16
# overscan_right=16
# overscan_top=16
# overscan_bottom=16

# Force specific HDMI mode if auto-detection fails
# hdmi_group=1  # CEA (HDTV)
# hdmi_mode=16  # 1080p 60Hz
```

Reboot after changes:
```bash
sudo reboot
```

### TV-Specific Configuration

Document your TV settings here for future reference:

**TV Model**: _____________________

**HDMI Input**: HDMI ____ (1/2/3/4)

**TV Settings**:
- Picture Mode: ____________________
- Sleep Timer: **Disabled**
- Auto Power Off: **Disabled**
- HDMI-CEC: **Disabled** (prevents input switching)
- Screen Saver: **Disabled**
- Overscan: **Off** (or "Just Scan" / "Screen Fit")

**TV Remote Quick Access**:
- Input Select Button: _______________
- Settings Button: _______________

---

## Advanced Configuration

### Security Hardening

**After initial setup is complete**, secure SSH access:

**Option 1: Disable SSH entirely** (recommended for kiosk-only use):
```bash
sudo systemctl disable ssh
sudo systemctl stop ssh
```

**Option 2: Harden SSH** (if you need remote access):
```bash
# Change default password
passwd
# Enter new strong password

# Configure firewall (UFW)
sudo apt install -y ufw
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow from 192.168.1.0/24 to any port 22  # Adjust to your network
sudo ufw enable

# Disable password authentication (use SSH keys only)
sudo nano /etc/ssh/sshd_config
# Set: PasswordAuthentication no
# Set: PubkeyAuthentication yes
sudo systemctl restart ssh
```

### Network Configuration

**Using Wired Ethernet** (more reliable for stationary kiosk):

If your Pi location has ethernet access, use wired connection instead of WiFi:

1. Connect ethernet cable before first boot
2. Skip WiFi configuration in Raspberry Pi Imager
3. Pi will auto-configure via DHCP

**Benefits**: More reliable, lower latency, no WiFi interference issues

### API Rate Limiting

The dashboard uses rss2json.com free tier which has rate limits:

**Free tier**: 10,000 requests/day (with 5-min refresh = 288 requests/day, well within limits)

**If you exceed limits** or need higher reliability:
1. Create account at https://rss2json.com/ for higher limits
2. Add API key to dashboard URL queries
3. Monitor usage in rss2json.com dashboard

**Alternative**: For GitHub Status API, consider using GitHub Personal Access Token for higher rate limits if needed.

### Monitoring and Alerting

For production deployments, consider:

**Simple uptime monitoring**:
- Use services like UptimeRobot (free tier) to ping Pi's IP address
- Configure email/Slack alerts on downtime

**Advanced monitoring**:
- Install Prometheus node exporter
- Set up Grafana dashboards
- Configure alerting rules for CPU temp, memory usage, disk space

**Health check endpoint**:
Add a simple health check HTML file that monitoring can ping:
```bash
echo "OK" > /home/pi/dashboard/health.html
```

### Thermal Management

For 24/7 operation, install heatsinks on:
- CPU (BCM2837 chip - large heatsink)
- RAM chip (small heatsink)
- USB/Ethernet chip (small heatsink)

**Check temperature**:
```bash
vcgencmd measure_temp
```

**Throttling check**:
```bash
vcgencmd get_throttled
```

Output `throttled=0x0` means no throttling. Any other value indicates thermal or voltage issues.

**Consider case with fan** if temperature exceeds 70°C under normal operation.

### Enable Auto-Login to Desktop (Alternative Method)

If you prefer auto-login instead of systemd service:

```bash
sudo raspi-config
# System Options → Boot / Auto Login → Desktop Autologin
```

Then add kiosk script to `/etc/xdg/lxsession/LXDE-pi/autostart`.

### Hardware Watchdog Timer

For automatic recovery from kernel hangs:

```bash
# Load watchdog module
echo "bcm2835_wdt" | sudo tee -a /etc/modules

# Install watchdog daemon
sudo apt install -y watchdog

# Configure
sudo nano /etc/watchdog.conf
# Uncomment: watchdog-device = /dev/watchdog

# Enable and start
sudo systemctl enable watchdog
sudo systemctl start watchdog
```

### Read-Only Filesystem

For maximum SD card longevity (advanced):

See official Raspberry Pi documentation for read-only root filesystem configuration.

---

## Success Checklist

After completing this guide, verify:

- [ ] Pi boots to fullscreen dashboard within 60 seconds
- [ ] Screen never blanks or shows screensaver
- [ ] Mouse cursor is hidden
- [ ] Dashboard auto-refreshes every 5 minutes
- [ ] All three sections display data (Blog, Changelog, Status)
- [ ] System recovers from power loss automatically
- [ ] Services auto-restart on failure
- [ ] Passes 3x power cycle test
- [ ] Passes 24-hour burn-in test
- [ ] TV settings documented
- [ ] Backup image created
- [ ] SSH secured or disabled
- [ ] NTP synchronized

---

## Support Resources

- **Raspberry Pi Documentation**: https://www.raspberrypi.com/documentation/
- **Raspberry Pi Forums**: https://forums.raspberrypi.com/
- **systemd Documentation**: https://www.freedesktop.org/software/systemd/man/
- **Chromium Kiosk Mode**: https://die-antwort.eu/techblog/2017-12-setup-raspberry-pi-for-kiosk-mode/

---

## Revision History

| Date | Version | Author | Changes | Tested On |
|------|---------|--------|---------|----------|
| 2026-02-17 | 1.0 | Shane | Initial deployment guide created | Raspberry Pi 3B, Pi OS Lite 64-bit |
