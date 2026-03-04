# Troubleshooting Guide

Common issues and solutions for the GitHub Updates Dashboard.

## Table of Contents

- [Development Issues](#development-issues)
  - [Dashboard not rotating pages](#dashboard-not-rotating-pages)
  - [API data not loading](#api-data-not-loading)
  - [Build fails with Vite error](#build-fails-with-vite-error)
  - [Wrong file edited](#wrong-file-edited)
- [Deployment Issues](#deployment-issues)
  - [Pi not auto-starting dashboard](#pi-not-auto-starting-dashboard)
  - [Dashboard shows stale data](#dashboard-shows-stale-data)
  - [Git pull fails on Pi](#git-pull-fails-on-pi)
- [Performance Issues](#performance-issues)
  - [Performance issues / laggy animations](#performance-issues--laggy-animations)

---

## Development Issues

### Dashboard not rotating pages

**Symptoms:**
- Dashboard loads but stays on first page
- Page rotation never happens
- Stuck on Blog/Changelog/Status page

**Possible Causes:**
- Timer not starting
- JavaScript error preventing rotation
- Browser console shows errors
- Incorrect import statements

**Solutions:**

1. **Check browser console** (F12) for JavaScript errors:
   ```
   Open DevTools → Console tab
   Look for red error messages
   ```

2. **Verify carousel starts** in `main.js`:
   ```javascript
   // Ensure this is called
   carousel.start();
   ```

3. **Check dev server terminal** for build errors if using `npm run dev`:
   ```bash
   Look for compilation errors
   Syntax errors in source files
   ```

4. **Verify imports use `.js` extensions**:
   ```javascript
   // Correct
   import { CarouselController } from './carousel-controller.js';
   
   // Wrong
   import { CarouselController } from './carousel-controller';
   ```

5. **Clear browser cache** and hard reload:
   ```
   Windows/Linux: Ctrl + Shift + R
   Mac: Cmd + Shift + R
   ```

---

### API data not loading

**Symptoms:**
- Dashboard shows "Loading..." indefinitely
- Empty sections (no blog posts, changelog, or status)
- Network errors in console

**Possible Causes:**
- Network connectivity issue
- CORS restrictions
- API endpoint down or rate limited
- Cache corruption
- Firewall blocking requests

**Solutions:**

1. **Check browser Network tab** (F12 → Network):
   ```
   Look for failed requests (red)
   Check status codes (should be 200)
   Verify response contains data
   ```

2. **Test API endpoints directly in browser**:
   
   **Blog API:**
   ```
   https://api.rss2json.com/v1/api.json?rss_url=https://github.blog/feed
   ```
   
   **Changelog API:**
   ```
   https://api.rss2json.com/v1/api.json?rss_url=https://github.com/changelog.atom
   ```
   
   **Status API:**
   ```
   https://www.githubstatus.com/api/v2/incidents.json
   ```
   
   All should return JSON data.

3. **Verify CORS** allows requests from localhost:
   ```
   Check Network tab → Response Headers
   Look for Access-Control-Allow-Origin: *
   ```

4. **Check for cached data warning** in console:
   ```
   "Using stale cached data" - indicates network issues
   ```

5. **Clear browser cache** and try again:
   ```
   Settings → Privacy → Clear browsing data
   Or use Incognito/Private window
   ```

6. **Verify network connectivity**:
   ```bash
   ping api.rss2json.com
   ping www.githubstatus.com
   ```

---

### Build fails with Vite error

**Symptoms:**
- `npm run build` fails with errors
- Module resolution errors
- Syntax errors
- Build never completes

**Possible Causes:**
- Wrong Node.js version (need 18+)
- Missing dependencies
- Vite configuration issue
- Syntax error in source files
- Corrupted `node_modules`

**Solutions:**

1. **Verify Node.js version** (must be 18+):
   ```bash
   node --version
   # Should show v18.x.x or higher
   ```
   
   If wrong version, install Node.js 18+ from [nodejs.org](https://nodejs.org/)

2. **Reinstall dependencies** (fixes most issues):
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Check vite.config.js** for syntax errors:
   ```bash
   cat vite.config.js
   # Verify valid JavaScript syntax
   ```

4. **Review error message** for specific file/line:
   ```
   Error: [file.js:42:10] Unexpected token
   
   Fix the syntax error at that location
   ```

5. **Ensure all imports use `.js` extensions**:
   ```bash
   # Find imports without .js extension
   grep -r "from '\\./" src/js/*.js | grep -v "\\.js'"
   ```

6. **Clear Vite cache** and rebuild:
   ```bash
   rm -rf node_modules/.vite
   npm run build
   ```

---

### Wrong file edited

**Symptoms:**
- Made changes but they don't appear in built `index.html`
- Changes lost after running `npm run build`
- Dashboard shows old version after deployment

**Possible Causes:**
- Edited root `/index.html` instead of `/src/index.html`
- Forgot to run `npm run build` after source changes
- Build process not completing successfully

**Solutions:**

1. **CRITICAL RULE:** Never edit `/index.html` at project root
   ```
   ❌ DO NOT EDIT: /index.html (build artifact)
   ✅ ALWAYS EDIT:  /src/index.html (source file)
   ```

2. **Verify changes are in `/src/` directory**:
   ```bash
   ls -la src/
   # Check timestamps - should be recent
   ```

3. **Build after every source edit**:
   ```bash
   npm run build
   # This regenerates /index.html from /src/
   ```

4. **Verify built file timestamp** is recent:
   ```bash
   ls -la index.html
   # Should match build time
   ```

5. **Check terminal output** for build errors:
   ```
   Build should complete with:
   ✓ built in XXXms
   ```

6. **Compare source vs built file**:
   ```bash
   # Your changes should appear in both
   grep "your-change" src/index.html
   grep "your-change" index.html
   ```

---

## Deployment Issues

### Pi not auto-starting dashboard

**Symptoms:**
- Pi boots but doesn't show dashboard
- Black screen or desktop environment visible
- Dashboard not launching in kiosk mode

**Possible Causes:**
- systemd services not enabled or failed
- Dashboard server not running
- Kiosk service not running
- Git repository not cloned to Pi
- Python not installed

**Solutions:**

1. **SSH to Pi**:
   ```bash
   ssh pi@github-dashboard.local
   ```

2. **Check service status**:
   ```bash
   systemctl status dashboard-server.service
   systemctl status kiosk.service
   ```
   
   Both should show "active (running)" in green.

3. **View service logs** for errors:
   ```bash
   # Dashboard server logs
   journalctl -u dashboard-server.service -b
   
   # Kiosk service logs
   journalctl -u kiosk.service -b
   ```

4. **Verify Python server running**:
   ```bash
   curl http://localhost:8000
   # Should return HTML content
   ```

5. **Check dashboard directory exists**:
   ```bash
   ls -la ~/dashboard
   # Should contain index.html and src/
   ```

6. **Manually test repository**:
   ```bash
   cd ~/dashboard
   git pull origin main
   # Should fetch latest code
   ```

7. **Enable services** if not enabled:
   ```bash
   sudo systemctl enable dashboard-server.service
   sudo systemctl enable kiosk.service
   sudo systemctl start dashboard-server.service
   sudo systemctl start kiosk.service
   ```

8. **Restart services**:
   ```bash
   sudo systemctl restart dashboard-server.service
   sudo systemctl restart kiosk.service
   ```

---

### Dashboard shows stale data

**Symptoms:**
- Dashboard displays old content
- Recent changes don't appear
- Pushing to GitHub doesn't update Pi

**Possible Causes:**
- Pi hasn't pulled latest code from GitHub
- Browser cache serving old version
- Python server still serving old file
- systemd services need restart

**Solutions:**

1. **SSH to Pi and manually pull**:
   ```bash
   ssh pi@github-dashboard.local
   cd ~/dashboard
   git pull origin main
   ```

2. **Check git status**:
   ```bash
   git status
   # Should be clean, no uncommitted changes
   
   git log --oneline -3
   # Should show recent commits
   ```

3. **Verify correct branch**:
   ```bash
   git branch
   # Should show: * main
   ```

4. **Restart kiosk service** (hard refresh):
   ```bash
   sudo systemctl restart kiosk.service
   ```

5. **Restart both services** (harder refresh):
   ```bash
   sudo systemctl restart dashboard-server.service
   sudo systemctl restart kiosk.service
   ```

6. **Verify Python server serving latest file**:
   ```bash
   curl http://localhost:8000 | grep "version\|date"
   # Add version/date marker to index.html for verification
   ```

7. **Check for uncommitted changes**:
   ```bash
   git status
   # If files modified, stash or commit them
   ```

8. **Force hard reset to remote** (use with caution):
   ```bash
   git fetch origin
   git reset --hard origin/main
   sudo systemctl restart kiosk.service
   ```

---

### Git pull fails on Pi

**Symptoms:**
- `git pull` fails with authentication error
- Permission denied
- Connection timeout
- Repository not accessible

**Possible Causes:**
- SSH keys not configured correctly
- Repository access revoked
- Network connectivity issue
- Incorrect remote URL
- Private repository without credentials

**Solutions:**

1. **Verify Pi can reach GitHub**:
   ```bash
   ping github.com
   # Should get responses
   ```

2. **Check repository access**:
   ```bash
   cd ~/dashboard
   git remote -v
   # Should show correct repository URL
   ```

3. **For HTTPS repositories**, ensure credentials cached:
   ```bash
   git config credential.helper store
   git pull  # Enter credentials if prompted
   ```

4. **For SSH repositories**, verify SSH key configured:
   ```bash
   ssh -T git@github.com
   # Should show: "Hi username! You've successfully authenticated"
   ```

5. **Check if repository is private**:
   ```
   Private repos require authentication
   Either use SSH keys or HTTPS with credentials
   ```

6. **Verify correct remote URL**:
   ```bash
   cat ~/dashboard/.git/config
   # Check [remote "origin"] url value
   ```

7. **Test clone from scratch** (if all else fails):
   ```bash
   cd ~
   mv dashboard dashboard.backup
   git clone <repository-url> dashboard
   cd dashboard
   sudo systemctl restart dashboard-server.service
   sudo systemctl restart kiosk.service
   ```

---

## Performance Issues

### Performance issues / laggy animations

**Symptoms:**
- Fade transitions stutter or lag
- Page rotation slow or choppy
- High CPU usage
- Browser feels unresponsive
- Dashboard freezes occasionally

**Possible Causes:**
- Pi hardware insufficient (not Pi 3B, or Pi Zero/2)
- Heavy CSS properties (box-shadows, filters, blur)
- Memory leak over time
- Too many DOM nodes
- Insufficient power supply
- Pi thermally throttling

**Solutions:**

1. **Verify Pi 3B hardware**:
   ```bash
   cat /proc/device-tree/model
   # Should show: Raspberry Pi 3 Model B
   ```
   
   Pi Zero and Pi 2 are too slow for this dashboard.

2. **Check CPU usage**:
   ```bash
   top
   # Look for processes using high CPU
   # Chromium should be manageable < 80%
   ```

3. **Check memory usage**:
   ```bash
   free -h
   # Available memory should be > 200MB
   ```

4. **Review CSS for expensive properties**:
   ```bash
   grep -r "box-shadow\|filter\|blur" src/css/
   # These properties are expensive on Pi GPU
   ```

5. **Run memory leak test** (24+ hours):
   ```bash
   npm run test:memory
   # Memory should be stable over time
   ```

6. **Check power supply**:
   ```
   Official Pi adapter: 5V 3A
   Underpowered supply causes throttling
   ```

7. **Verify heatsinks installed**:
   ```bash
   vcgencmd measure_temp
   # Should be < 70°C under load
   ```

8. **Check for thermal throttling**:
   ```bash
   vcgencmd get_throttled
   # Should return: throttled=0x0 (no throttling)
   ```

9. **Reduce animation complexity** if needed:
   ```css
   /* Simpler transitions for Pi */
   .fade {
     transition: opacity 300ms ease;
     /* Avoid: transform, filter, box-shadow during transition */
   }
   ```

10. **Monitor over time** for memory leaks:
    ```bash
    # Watch memory usage
    watch -n 5 free -h
    ```

---

## Getting More Help

If these solutions don't resolve your issue:

1. **Check related documentation**:
   - [Architecture Guide](architecture.md) - System design
   - [Contributing Guide](contributing.md) - Development patterns
   - [Deployment Guide](deployment.md) - Deployment procedures
   - [Testing Guide](testing-guide.md) - Testing procedures
   - [Raspberry Pi Setup](raspberry-pi-setup.md) - Pi configuration

2. **Enable verbose logging** for debugging:
   ```javascript
   // Add to main.js for debugging
   console.log('Carousel started:', carousel);
   console.log('Data loaded:', data);
   ```

3. **Capture screenshots/logs** when reporting issues

4. **Open an issue** in the GitHub repository with:
   - Detailed symptoms
   - Steps to reproduce
   - Error messages/logs
   - Environment (Node version, Pi model, etc.)

5. **Search existing issues** - your problem may already be solved
