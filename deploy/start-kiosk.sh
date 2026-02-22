#!/bin/bash

# Pull latest changes from GitHub
/home/sward/update-dashboard.sh

# Disable screen blanking and power management
xset s off
xset -dpms
xset s noblank

# Hide mouse cursor after 1 second of inactivity
unclutter -idle 1 -root &

# Wait for HTTP server to be ready
sleep 5

# Launch Chromium in kiosk mode with cache disabled
chromium \
  --kiosk \
  --noerrdialogs \
  --disable-infobars \
  --no-first-run \
  --disable-session-crashed-bubble \
  --disable-features=TranslateUI \
  --check-for-update-interval=31536000 \
  --disk-cache-size=1 \
  --disable-application-cache \
  http://localhost:8000
