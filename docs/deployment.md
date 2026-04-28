# Deployment Guide

This guide covers building and deploying the GitHub Updates Dashboard.

## Table of Contents

- [Overview](#overview)
- [Development Workflow](#development-workflow)
- [Production Build](#production-build)
- [Deployment Workflow](#deployment-workflow)
- [Rollback Procedures](#rollback-procedures)
- [Advanced Topics](#advanced-topics)

## Overview

The dashboard uses a **Git-based deployment model**:
- ✅ Build on development machine
- ✅ Commit source + built artifact to git
- ✅ Push to GitHub
- ✅ Pi automatically pulls and serves

**No manual file copying. No build step on Pi.**

## Development Workflow

### Quick Start

```bash
# Start dev server with hot reload
npm run dev

# Dashboard available at http://localhost:5173
# Changes to /src/ appear instantly
```

The dev server provides:
- **Hot Module Replacement (HMR)** - CSS and JS changes without page reload
- **Fast refresh** - Immediate feedback during development
- **Error overlay** - Build errors displayed in browser

### Making Changes

1. **Edit source files** in `/src/` directory:
   - `/src/index.html` - HTML structure
   - `/src/css/*.css` - Styles
   - `/src/js/*.js` - JavaScript modules

2. **Changes appear automatically** in dev server

3. **Never edit** `/index.html` at project root (build artifact)

## Production Build

### Build Command

```bash
npm run build
```

### What Happens During Build

1. **Vite builds to `/dist/`**:
   - Bundles all JavaScript modules
   - Inlines all CSS
   - Minifies code
   - Tree-shakes unused code
   - Copies public assets (img folder) to dist

2. **Copies `/dist/index.html` to project root**:
   - Single-file artifact
   - All CSS/JS inlined
   - Typically ~165KB with all features (size increased due to additional animation features)

3. **Copies `/dist/img/` to project root**:
   - Animation images (jetpacktocat.png, ghskatecat frames)
   - Required for Easter egg animations

4. **Build completes in < 1 second**

### Build Output

- **Created:** `/dist/` folder (temporary, gitignored)
- **Copied:** `/index.html` to project root (committed to git)
- **Copied:** `/img/` folder to project root (committed to git) - includes animation images (jetpacktocat.png, ghskatecat frames)
- **Result:** HTML file + images ready for Pi deployment

### Build Architecture

- **Source files:** `/src/` (where you edit)
- **Static assets:** `/public/img/` (source images, copied during build)
- **Build artifacts:** `/dist/` (temporary, gitignored)
- **Deployment files:** `/index.html` and `/img/` folder (committed to root for Pi)

**Why commit build artifacts?** Pi deployment requires zero build tools. The Pi serves pre-built HTML directly using Python's http.server.

## Deployment Workflow

### Complete Deployment Process

```bash
# 1. Make changes in /src/ directory
# Edit src/index.html, src/js/*.js, src/css/*.css

# 2. Build the production artifact
npm run build
# This builds to /dist/ and copies index.html and img/ to root

# 3. Commit source changes only
git add src/
git commit -m "feat: your changes here"

# 4. Push branch and open PR
git push origin <your-branch>

# 5. Merge PR to main
# Build-artifact workflow auto-commits root index.html + img/ on main

# 6. Deploy to Pi (restart kiosk to pull latest)
ssh pi@github-dashboard.local "cd ~/dashboard && git pull origin main && sudo systemctl restart kiosk.service"
```

### Deployment Architecture

**On Development Machine:**
- Node.js + npm + Vite installed
- Build happens here (`npm run build`)
- Source changes committed in PRs

**On GitHub main branch:**
- `Rebuild generated artifacts` workflow runs on source/config changes
- Workflow commits root `index.html` and `img/` automatically

**On Raspberry Pi:**
- **No Node.js or build tools** required
- Python http.server serves index.html
- Git pull fetches latest code
- systemd automatically restarts on boot

### Why This Architecture?

1. **Pi stays lean** - No Node.js dependencies
2. **Reliable deployment** - Serve pre-built static file
3. **Fast updates** - No build step on Pi
4. **Git-based** - Automatic pull on restart
5. **Simple rollback** - Git revert and restart

### Testing Built Artifact Locally

Before deploying to Pi, test the built file locally:

```bash
# Option 1: Python http.server
npm run build
python3 -m http.server 8000
# Visit http://localhost:8000

# Option 2: Vite preview
npm run preview
# Visit http://localhost:4173

# Option 3: Open directly in browser
open index.html
```

### Manual Pi Deployment

If automatic deployment isn't configured:

```bash
# SSH to Pi
ssh pi@github-dashboard.local

# Navigate to dashboard directory
cd ~/dashboard

# Pull latest code
git pull origin main

# Restart kiosk service
sudo systemctl restart kiosk.service

# Or restart just the server
sudo systemctl restart dashboard-server.service
```

## Rollback Procedures

If a deployment introduces issues, roll back to the previous version.

### Rollback Checklist

☐ **Step 1: Identify the bad commit**
```bash
git log --oneline -5
# Note the hash of the last known good commit
```

☐ **Step 2: Revert on development machine**

**Option A: Revert (preserves history)**
```bash
git revert <bad-commit-hash>
git push origin main
```

**Option B: Reset (rewrites history - use with caution)**
```bash
git reset --hard <good-commit-hash>
git push origin main --force
```

☐ **Step 3: Pull rollback on Pi**
```bash
ssh pi@github-dashboard.local "cd ~/dashboard && git pull origin main && sudo systemctl restart kiosk.service"
```

☐ **Step 4: Verify dashboard displays correctly**
- Check TV shows dashboard (no blank screen)
- Watch for at least one full page rotation (90 seconds)
- Verify all 3 sections load (Blog, Changelog, Status)

☐ **Step 5: Check for console errors** (if accessible)
- Connect keyboard to Pi or view via SSH
- Open kiosk Chromium and press F12
- Verify no red errors in console

☐ **Step 6: Monitor stability**
- Observe for 10+ minutes
- Verify page rotation continues
- Verify API refresh cycle works (5 minutes)

### Emergency Pi Access

If kiosk is completely broken and you can't access it:

```bash
# SSH to Pi
ssh pi@github-dashboard.local

# Stop kiosk service
sudo systemctl stop kiosk.service

# You now have keyboard/mouse access on Pi
# Connect keyboard/mouse/monitor to Pi

# Fix issues or manually revert
cd ~/dashboard
git reset --hard <good-commit-hash>

# Restart when ready
sudo systemctl start kiosk.service
```

### Rollback Without SSH

If you can't SSH to the Pi:

1. **Physical access:** Connect keyboard/mouse to Pi
2. **Press Ctrl+Alt+F2** to switch to virtual terminal
3. **Log in** as pi user
4. **Stop kiosk:** `sudo systemctl stop kiosk.service`
5. **Revert code:** `cd ~/dashboard && git reset --hard <commit-hash>`
6. **Restart:** `sudo systemctl start kiosk.service`

## Advanced Topics

### Custom Deployment Scripts

You can create custom deployment scripts in `/deploy/` folder:

```bash
#!/bin/bash
# deploy/deploy.sh

# Build on dev machine
npm run build

# Commit source changes only
git add src/
git commit -m "deploy: $(date +%Y-%m-%d-%H%M)"

# Push branch / open PR
git push origin <your-branch>

# Merge PR to main
# Build-artifact workflow auto-commits root index.html + img/

# Deploy to Pi
ssh pi@github-dashboard.local "cd ~/dashboard && git pull && sudo systemctl restart kiosk.service"

echo "Deployment complete!"
```

### Multiple Pi Deployments

If deploying to multiple Pis:

```bash
# List of Pi hostnames
HOSTS="pi-office1.local pi-office2.local pi-office3.local"

# Deploy to all
for host in $HOSTS; do
  echo "Deploying to $host..."
  ssh pi@$host "cd ~/dashboard && git pull origin main && sudo systemctl restart kiosk.service"
done
```

### Deployment Validation

Before considering deployment complete:

```bash
# 1. Health check
npm run test:health

# 2. Design token compliance
npm run test:validate

# 3. Manual verification on Pi
ssh pi@github-dashboard.local "curl -s http://localhost:8000 | grep -q 'GitHub Updates' && echo 'OK' || echo 'FAIL'"
```

### Zero-Downtime Deployment

For critical environments requiring zero downtime:

1. **Run two Pis** with load balancer
2. **Deploy to Pi 1** (Pi 2 still serving)
3. **Verify Pi 1** working correctly
4. **Deploy to Pi 2** (Pi 1 now serving both)
5. **Verify Pi 2** working correctly

This requires load balancer configuration not covered in this guide.

### Monitoring Deployment Status

Check systemd service status:

```bash
# Check services running
ssh pi@github-dashboard.local "systemctl is-active dashboard-server.service kiosk.service"

# View recent logs
ssh pi@github-dashboard.local "journalctl -u kiosk.service -b --no-pager | tail -20"
```

### Automated Deployment (CI/CD)

For automated deployment using GitHub Actions:

```yaml
# .github/workflows/deploy.yml
name: Deploy to Pi

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - run: |
          git config user.name "GitHub Actions"
          git config user.email "actions@github.com"
          git add index.html img/
          git commit -m "build: automated build [skip ci]" || exit 0
          git push
      # Add SSH deployment step if desired
```

## Related Documentation

- [Architecture Guide](architecture.md) - System architecture overview
- [Contributing Guide](contributing.md) - Development patterns and standards
- [Troubleshooting Guide](troubleshooting.md) - Common deployment issues
- [Testing Guide](testing-guide.md) - Testing before deployment
- [Raspberry Pi Setup](raspberry-pi-setup.md) - Initial Pi configuration
