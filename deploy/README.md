# Raspberry Pi Deployment Files

This directory contains configuration files and scripts for deploying the GitHub Dashboard to a Raspberry Pi in kiosk mode.

## Files

### Scripts
- **update-dashboard.sh** - Pulls latest code from GitHub (runs on every kiosk start)
- **start-kiosk.sh** - Launches the kiosk browser with proper settings

### Systemd Services
- **systemd/dashboard-server.service** - HTTP server for serving dashboard files
- **systemd/kiosk.service** - Kiosk mode X11 session with Chromium

### Openbox Config
- **openbox/autostart** - Openbox autostart configuration

## Important Notes

⚠️ **Username Configuration**: The files in this directory use `sward` as the username. When deploying to your Pi, replace `sward` with your actual Raspberry Pi username in:
- update-dashboard.sh
- start-kiosk.sh  
- systemd/dashboard-server.service
- systemd/kiosk.service
- openbox/autostart

## Deployment

See [../docs/raspberry-pi-setup.md](../docs/raspberry-pi-setup.md) for complete step-by-step deployment instructions.

## How Updates Work

1. Make changes to the dashboard code on your development machine
2. Commit and push changes to GitHub: `git push origin main`
3. SSH into the Pi and restart the kiosk: `sudo systemctl restart kiosk.service`
4. The kiosk service automatically pulls the latest code and displays it

No manual file transfers needed! 🎉
