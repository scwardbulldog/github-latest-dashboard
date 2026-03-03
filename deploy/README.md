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

### Development Machine Workflow

1. **Edit source files** in the `/src/` directory:
   - `/src/index.html` - HTML structure
   - `/src/js/*.js` - JavaScript modules
   - `/src/css/*.css` - Stylesheets

2. **Build for production**:
   ```bash
   npm run build
   ```
   This creates `/dist/` (temporary) and copies final build to `/index.html` at root.

3. **Commit both source and built artifact**:
   ```bash
   git add src/ index.html
   git commit -m "feat: your changes"
   ```

4. **Push to GitHub**:
   ```bash
   git push origin main
   ```

### Raspberry Pi Automatic Update

5. **Restart the kiosk** to trigger update:
   ```bash
   ssh pi@github-dashboard.local
   sudo systemctl restart kiosk.service
   ```

6. The kiosk service automatically:
   - Runs `/home/pi/dashboard/deploy/update-dashboard.sh`
   - Pulls latest code from GitHub: `git pull origin main`
   - Starts Chromium in fullscreen with updated `index.html`

**No manual file transfers or build steps on Pi needed!** 🎉

## Architecture Notes

**Build Process (Development Machine):**
- Vite builds to `/dist/` folder (gitignored, temporary)
- Post-build script copies `dist/index.html` to project root
- Root `/index.html` is committed to repository for Pi deployment

**Pi Deployment (No Build Tools):**
- Pi only needs Git and Python's `http.server`
- Serves pre-built `/index.html` from repository root
- No Node.js, npm, or build dependencies required
- Lean, reliable, minimal attack surface

This "Option B" architecture balances Vite best practices with Pi deployment simplicity.
