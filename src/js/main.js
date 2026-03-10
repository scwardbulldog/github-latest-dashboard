// Import utility functions
import { formatDate, stripHtml, truncate } from './utils.js';

// Component skeletons imported for Epic 2+ implementation
// Current MVP functionality remains using existing code below
import { CarouselController } from './carousel-controller.js';
import { ItemHighlighter } from './item-highlighter.js';
import { DetailPanel } from './detail-panel.js';

// Import persistent alert component (Story 4.3)
import { PersistentAlert } from './persistent-alert.js';

// Import API client for data fetching (Story 3.5)
import {
    fetchBlog as fetchBlogFromApiClient,
    fetchChangelog as fetchChangelogFromApiClient,
    fetchStatus as fetchStatusFromApiClient,
    fetchVSCode as fetchVSCodeFromApiClient,
    getCacheEntry,
    detectActiveOutages,
    fetchArticleContent
} from './api-client.js';

// Configuration
const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

// Network status state (Story 4.1)
let isOffline = false;

/**
 * Get last update time for a source
 * @param {string} containerId - Container ID (e.g., 'blog-list')
 * @returns {string} Formatted timestamp
 */
function getLastUpdateTime(containerId) {
    // Extract source name from container ID (blog-list → blog)
    const sourceName = containerId.replace('-list', '');
    const cacheEntry = getCacheEntry(sourceName);
    
    if (!cacheEntry || !cacheEntry.timestamp) {
        return 'Never';
    }
    
    const minutesAgo = Math.floor((Date.now() - cacheEntry.timestamp) / 60000);
    if (minutesAgo < 1) return 'Just now';
    if (minutesAgo === 1) return '1 minute ago';
    if (minutesAgo < 60) return `${minutesAgo} minutes ago`;
    
    const hoursAgo = Math.floor(minutesAgo / 60);
    if (hoursAgo === 1) return '1 hour ago';
    return `${hoursAgo} hours ago`;
}

/**
 * Render error state for a page with last update timestamp
 * @param {string} containerId - Container element ID
 * @param {string} errorMessage - Error message to display
 */
function renderErrorState(containerId, errorMessage) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`renderErrorState: Container ${containerId} not found`);
        return;
    }
    
    const lastUpdate = getLastUpdateTime(containerId);
    
    container.innerHTML = `
        <div class="error-message">
            <div class="error-icon">⚠️</div>
            <div class="error-text">${errorMessage}</div>
            <div class="error-timestamp">Last updated: ${lastUpdate}</div>
        </div>
    `;
}

/**
 * Update live indicator to show network status
 * Story 4.1: Integrate with existing Live indicator for immediate feedback
 */
function updateLiveIndicator() {
    const liveText = document.getElementById('liveText');
    const liveDot = document.getElementById('liveDot');
    
    if (!liveText || !liveDot) return;
    
    if (isPaused) {
        // Paused state takes precedence
        liveText.textContent = 'Paused';
        liveDot.classList.remove('offline');
        liveDot.classList.add('paused');
    } else if (isOffline) {
        // Offline state
        liveText.textContent = 'Offline';
        liveDot.classList.remove('paused');
        liveDot.classList.add('offline');
    } else {
        // Live state
        liveText.textContent = 'Live';
        liveDot.classList.remove('paused', 'offline');
    }
}

/**
 * Render Blog page data
 * @param {Object} blogData - Blog RSS data from API
 * @returns {number} Number of items rendered
 */
function renderBlogList(blogData) {
    const blogListEl = document.getElementById('blog-list');
    if (!blogListEl) {
        console.error('renderBlogList: blog-list element not found');
        return 0;
    }
    
    // Clear placeholder content
    blogListEl.innerHTML = '';
    
    // Render at least 10 items (AC requirement)
    const items = blogData.items.slice(0, 10);
    
    // Performance optimization: Use DocumentFragment for batched DOM insertion
    // This eliminates layout thrashing (only one reflow instead of N reflows)
    const fragment = document.createDocumentFragment();
    
    items.forEach((item, index) => {
        const itemEl = document.createElement('div');
        itemEl.className = 'list-item';
        itemEl.dataset.index = index;
        itemEl.dataset.link = item.link || '';
        
        // Store full content HTML for detail panel rendering (use 'content' field, fallback to 'description')
        itemEl.dataset.fullDescription = item.content || item.description || '';
        
        const title = item.title || 'Untitled';
        const timestamp = formatDate(item.pubDate);
        const description = truncate(stripHtml(item.description || ''), 120);
        
        itemEl.innerHTML = `
            <div class="list-item-title">${title}</div>
            <div class="list-item-timestamp">${timestamp}</div>
            <div class="list-item-description">${description}</div>
        `;
        
        // Append to fragment (no DOM reflow)
        fragment.appendChild(itemEl);
    });
    
    // Single DOM write (one reflow)
    blogListEl.appendChild(fragment);
    
    console.log(`renderBlogList: Rendered ${items.length} blog items`);
    return items.length;
}

/**
 * Render Changelog page data
 * @param {Object} changelogData - Changelog RSS data from API
 * @returns {number} Number of items rendered
 */
function renderChangelogList(changelogData) {
    const changelogListEl = document.getElementById('changelog-list');
    if (!changelogListEl) {
        console.error('renderChangelogList: changelog-list element not found');
        return 0;
    }
    
    // Clear placeholder content
    changelogListEl.innerHTML = '';
    
    // Render at least 10 items (AC requirement)
    const items = changelogData.items.slice(0, 10);
    
    // Performance optimization: Use DocumentFragment for batched DOM insertion
    const fragment = document.createDocumentFragment();
    
    items.forEach((item, index) => {
        const itemEl = document.createElement('div');
        itemEl.className = 'list-item';
        itemEl.dataset.index = index;
        itemEl.dataset.link = item.link || '';
        
        // Store full content HTML for detail panel rendering (use 'content' field, fallback to 'description')
        itemEl.dataset.fullDescription = item.content || item.description || '';
        
        const title = item.title || 'Untitled';
        const timestamp = formatDate(item.pubDate);
        // Strip HTML for list view, preserve for detail panel
        const description = truncate(stripHtml(item.description || ''), 120);
        
        itemEl.innerHTML = `
            <div class="list-item-title">${title}</div>
            <div class="list-item-timestamp">${timestamp}</div>
            <div class="list-item-description">${description}</div>
        `;
        
        // Append to fragment (no DOM reflow)
        fragment.appendChild(itemEl);
    });
    
    // Single DOM write (one reflow)
    changelogListEl.appendChild(fragment);
    
    console.log(`renderChangelogList: Rendered ${items.length} changelog items`);
    return items.length;
}

/**
 * Render VS Code Updates page data
 * @param {Object} vscodeData - VS Code Updates RSS data from API
 * @returns {number} Number of items rendered
 */
function renderVSCodeList(vscodeData) {
    const vscodeListEl = document.getElementById('vscode-list');
    if (!vscodeListEl) {
        console.error('renderVSCodeList: vscode-list element not found');
        return 0;
    }

    // Clear placeholder content
    vscodeListEl.innerHTML = '';

    const items = vscodeData.items.slice(0, 10);

    // Performance optimization: Use DocumentFragment for batched DOM insertion
    const fragment = document.createDocumentFragment();

    items.forEach((item, index) => {
        const itemEl = document.createElement('div');
        itemEl.className = 'list-item';
        itemEl.dataset.index = index;
        itemEl.dataset.link = item.link || '';

        // Store full content HTML for detail panel rendering
        itemEl.dataset.fullDescription = item.content || item.description || '';

        const title = item.title || 'Untitled';
        const timestamp = formatDate(item.pubDate);
        const description = truncate(stripHtml(item.description || ''), 120);

        itemEl.innerHTML = `
            <div class="list-item-title">${title}</div>
            <div class="list-item-timestamp">${timestamp}</div>
            <div class="list-item-description">${description}</div>
        `;

        fragment.appendChild(itemEl);
    });

    // Single DOM write (one reflow)
    vscodeListEl.appendChild(fragment);

    console.log(`renderVSCodeList: Rendered ${items.length} VS Code update items`);
    return items.length;
}

/**
 * Render Status page data (split-view with active incidents + resolved grid)
 * @param {Object} statusData - GitHub Status API incidents data
 * @returns {number} Number of items rendered
 */
function renderStatusList(statusData) {
    const statusListEl = document.getElementById('status-list');
    const resolvedGridEl = document.getElementById('status-resolved-grid');
    
    if (!statusListEl || !resolvedGridEl) {
        console.error('renderStatusList: Required elements not found');
        return 0;
    }
    
    // Clear existing content
    statusListEl.innerHTML = '';
    resolvedGridEl.innerHTML = '';
    
    const incidents = statusData.incidents || [];
    
    // Separate active and resolved incidents
    const activeIncidents = incidents.filter(inc => inc.status !== 'resolved');
    const resolvedIncidents = incidents.filter(inc => inc.status === 'resolved');
    
    // If no active incidents, show all systems operational
    if (activeIncidents.length === 0) {
        const allGoodEl = document.createElement('div');
        allGoodEl.className = 'list-item';
        allGoodEl.dataset.index = 'operational';
        allGoodEl.dataset.fullDescription = 'All GitHub services are operating normally. No active incidents or service disruptions reported.';
        
        allGoodEl.innerHTML = `
            <div class="list-item-title">
                <span class="status-indicator status-operational"></span>
                All Systems Operational
            </div>
            <div class="list-item-timestamp">${formatDate(new Date().toISOString())}</div>
            <div class="list-item-description">No active incidents reported</div>
        `;
        statusListEl.appendChild(allGoodEl);
    } else {
        // Performance optimization: Use DocumentFragment for batched DOM insertion
        const fragment = document.createDocumentFragment();
        
        // Render active incidents as list items
        activeIncidents.forEach((incident, index) => {
            const impact = incident.impact || 'none';
            
            // Map impact to status class
            const statusClass = {
                'none': 'status-operational',
                'minor': 'status-degraded',
                'major': 'status-outage',
                'critical': 'status-outage'
            }[impact] || 'status-degraded';
            
            const itemEl = document.createElement('div');
            itemEl.className = 'list-item';
            itemEl.dataset.index = `incident-${index}`;
            itemEl.dataset.link = incident.shortlink || '';
            
            // Build full description for detail panel
            let detailText = `Impact: ${impact}\n\nStatus: ${incident.status || 'Unknown'}\n\n`;
            if (incident.incident_updates && incident.incident_updates.length > 0) {
                detailText += 'Latest Update:\n' + stripHtml(incident.incident_updates[0].body);
            } else {
                detailText += 'No updates available.';
            }
            itemEl.dataset.fullDescription = detailText;
            
            const timestamp = formatDate(incident.created_at || incident.updated_at);
            const statusText = (incident.status || 'unknown').replace(/_/g, ' ');
            
            itemEl.innerHTML = `
                <div class="list-item-title">
                    <span class="status-indicator ${statusClass}"></span>
                    ${incident.name || 'Incident'}
                </div>
                <div class="list-item-timestamp">${timestamp}</div>
                <div class="list-item-description">${truncate(statusText, 100)}</div>
            `;
            
            // Append to fragment (no DOM reflow)
            fragment.appendChild(itemEl);
        });
        
        // Single DOM write (one reflow)
        statusListEl.appendChild(fragment);
    }
    
    // Render resolved incidents in multi-column grid (show more history, up to 12)
    if (resolvedIncidents.length > 0) {
        // Performance optimization: Build resolved grid using DocumentFragment
        const fragment = document.createDocumentFragment();
        
        // Add header
        const headerEl = document.createElement('div');
        headerEl.className = 'status-resolved-grid-header';
        headerEl.textContent = 'Recently Resolved Incidents';
        fragment.appendChild(headerEl);
        
        // Create grid container
        const gridContainer = document.createElement('div');
        gridContainer.className = 'status-resolved-items';
        
        // Render up to 6 resolved incidents in grid (3 cols x 2 rows)
        resolvedIncidents.slice(0, 6).forEach(incident => {
            const impact = incident.impact || 'none';
            
            const symbol = (impact === 'critical' || impact === 'major')
                ? '■' 
                : impact === 'minor' 
                    ? '▲' 
                    : '●';
            
            const symbolClass = (impact === 'critical' || impact === 'major')
                ? 'status-symbol-major'
                : impact === 'minor'
                    ? 'status-symbol-minor'
                    : 'status-symbol-operational';
            
            const cardEl = document.createElement('div');
            cardEl.className = 'status-resolved-card';
            
            cardEl.innerHTML = `
                <div class="status-resolved-title">
                    <span class="status-symbol ${symbolClass}">${symbol}</span>
                    ${truncate(incident.name || 'Incident', 60)}
                </div>
                <div class="status-resolved-meta">
                    <span class="status-resolved-status">Resolved</span>
                    <span>${formatDate(incident.resolved_at || incident.updated_at)}</span>
                </div>
            `;
            
            gridContainer.appendChild(cardEl);
        });
        
        fragment.appendChild(gridContainer);
        
        // Single DOM write for entire resolved section
        resolvedGridEl.appendChild(fragment);
    }
    
    const totalItems = Math.max(activeIncidents.length, 1); // Count active incidents for highlighting
    console.log(`renderStatusList: Rendered ${activeIncidents.length} active incidents and ${Math.min(resolvedIncidents.length, 6)} resolved in grid`);
    return totalItems;
}

// Remove old placeholder functions - replaced by API integration above
// (Removed: fetchBlog, fetchChangelog, fetchStatus stubs)

// ============================================================================
// SpriteAnimator Class - Production Version
// ============================================================================

class SpriteAnimator {
    constructor(config) {
        this.canvas = config.canvas;
        this.ctx = this.canvas.getContext('2d');
        this.spriteSheetPath = config.spriteSheetPath;
        
        this.gridColumns = config.gridColumns || 5;
        this.gridRows = config.gridRows || 3;
        this.paletteRows = config.paletteRows || 1;
        this.framePadding = config.framePadding || 0;
        this.verticalOffsets = config.verticalOffsets || [44, 90];
        this.verticalOffset = config.verticalOffset || 0;
        
        this.fps = config.fps || 6;
        this.scale = config.scale || 1;
        
        this.chromaKeyEnabled = config.chromaKey !== false;
        this.chromaKeyColor = config.chromaKeyColor || '#161B22';
        this.chromaKeyTolerance = config.chromaKeyTolerance || 10;
        this.backgroundColor = config.backgroundColor || 'transparent';
        
        this.spriteSheet = null;
        this.frameWidth = 0;
        this.frameHeight = 0;
        this.totalFrames = this.gridColumns * (this.gridRows - this.paletteRows);
        this.currentFrame = 0;
        this.isPlaying = false;
        this.lastFrameTime = 0;
        this.animationId = null;
        
        this.onLoad = config.onLoad || null;
        
        this.loadSpriteSheet();
    }
    
    loadSpriteSheet() {
        this.spriteSheet = new Image();
        this.spriteSheet.onload = () => {
            this.calculateFrameDimensions();
            this.resizeCanvas();
            this.draw();
            if (this.onLoad) this.onLoad(this);
        };
        this.spriteSheet.src = this.spriteSheetPath;
    }
    
    calculateFrameDimensions() {
        this.frameWidth = Math.floor(this.spriteSheet.width / this.gridColumns);
        this.frameHeight = Math.floor(this.spriteSheet.height / this.gridRows);
    }
    
    resizeCanvas() {
        const displayWidth = (this.frameWidth - (this.framePadding * 2));
        const displayHeight = (this.frameHeight - (this.framePadding * 2));
        this.canvas.width = displayWidth * this.scale;
        this.canvas.height = displayHeight * this.scale;
        this.ctx.imageSmoothingEnabled = false;
    }
    
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (this.backgroundColor !== 'transparent') {
            this.ctx.fillStyle = this.backgroundColor;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
        
        if (!this.spriteSheet) return;
        
        const frameRow = Math.floor(this.currentFrame / this.gridColumns);
        const frameCol = this.currentFrame % this.gridColumns;
        const rowOffset = this.verticalOffsets[frameRow] || this.verticalOffset;
        
        const sourceX = (frameCol * this.frameWidth) + this.framePadding;
        const sourceY = (frameRow * this.frameHeight) + this.framePadding + rowOffset;
        const sourceWidth = this.frameWidth - (this.framePadding * 2);
        const sourceHeight = this.frameHeight - (this.framePadding * 2);
        
        this.ctx.drawImage(
            this.spriteSheet,
            sourceX, sourceY, sourceWidth, sourceHeight,
            0, 0, this.canvas.width, this.canvas.height
        );
        
        if (this.chromaKeyEnabled) this.applyChromaKey();
    }
    
    applyChromaKey() {
        try {
            const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
            const data = imageData.data;
            const chromaRGB = this.hexToRgb(this.chromaKeyColor);
            const tolerance = this.chromaKeyTolerance;
            
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                const distance = Math.sqrt(
                    Math.pow(r - chromaRGB.r, 2) +
                    Math.pow(g - chromaRGB.g, 2) +
                    Math.pow(b - chromaRGB.b, 2)
                );
                if (distance < tolerance) data[i + 3] = 0;
            }
            
            this.ctx.putImageData(imageData, 0, 0);
        } catch (error) {
            console.error('Chroma key error:', error);
        }
    }
    
    hexToRgb(hex) {
        hex = hex.replace('#', '');
        return {
            r: parseInt(hex.substring(0, 2), 16),
            g: parseInt(hex.substring(2, 4), 16),
            b: parseInt(hex.substring(4, 6), 16)
        };
    }
    
    animate(timestamp) {
        if (!this.isPlaying) return;
        
        const frameInterval = 1000 / this.fps;
        const elapsed = timestamp - this.lastFrameTime;
        
        if (elapsed >= frameInterval) {
            this.currentFrame = (this.currentFrame + 1) % this.totalFrames;
            this.draw();
            this.lastFrameTime = timestamp - (elapsed % frameInterval);
        }
        
        this.animationId = requestAnimationFrame((ts) => this.animate(ts));
    }
    
    play() {
        if (this.isPlaying) return;
        this.isPlaying = true;
        this.lastFrameTime = performance.now();
        this.animationId = requestAnimationFrame((ts) => this.animate(ts));
    }
    
    pause() {
        this.isPlaying = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
}

// ============================================================================
// Dashboard State
// ============================================================================

let isPaused = false;
let refreshIntervalId = null;
let skaterAnimator = null;

// Update timestamp
function updateTimestamp() {
    const now = new Date();
    document.getElementById('timestamp').textContent = 
        now.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit'
        });
}

// Toggle pause/resume
function togglePause() {
    isPaused = !isPaused;
    const pauseButton = document.getElementById('pauseButton');
    const pauseIcon = document.getElementById('pauseIcon');
    const pauseText = document.getElementById('pauseText');
    
    if (isPaused) {
        // Pause mode
        pauseIcon.textContent = '▶';
        pauseText.textContent = 'Resume';
        updateLiveIndicator();
        
        // Clear refresh interval
        if (refreshIntervalId) {
            clearInterval(refreshIntervalId);
        }
        if (progressInterval) {
            clearInterval(progressInterval);
        }
        document.getElementById('refreshProgress').style.width = '0%';
    } else {
        // Resume mode
        pauseIcon.textContent = '⏸';
        pauseText.textContent = 'Pause';
        
        // Preserve network state across pause/resume - don't change isOffline
        // Show current state immediately (Offline if it was offline, Live if it was online)
        updateLiveIndicator();
        
        // Restart refresh interval and fetch immediately
        // fetchAllData() will update isOffline state based on actual network status
        fetchAllData();
        refreshIntervalId = setInterval(fetchAllData, REFRESH_INTERVAL);
    }
}

// Refresh Progress Bar Animation
let progressInterval;
let progressStartTime;

function startProgressBar() {
    const progressBar = document.getElementById('refreshProgress');
    progressStartTime = Date.now();
    
    progressBar.style.width = '0%';
    progressBar.classList.remove('refreshing');
    
    if (progressInterval) clearInterval(progressInterval);
    
    progressInterval = setInterval(() => {
        const elapsed = Date.now() - progressStartTime;
        const progress = Math.min((elapsed / REFRESH_INTERVAL) * 100, 100);
        
        progressBar.style.width = progress + '%';
        
        // Update octocat sprite position
        const octocat = document.getElementById('octocatTraveler');
        octocat.style.left = progress + '%';
        
        // Add glow effect in last 10 seconds
        if (progress > 96.67) {
            progressBar.classList.add('refreshing');
        }
        
        // Reset when complete
        if (progress >= 100) {
            setTimeout(() => {
                progressBar.style.width = '0%';
                progressBar.classList.remove('refreshing');
                octocat.style.left = '0%';
            }, 500);
        }
    }, 1000);
}

// Fetch all data
async function fetchAllData() {
    if (isPaused) return;
    updateTimestamp();
    startProgressBar();
    
    console.log('fetchAllData: Starting parallel API fetches...');
    
    try {
        // Track fetch failures for network status indicator
        let anyFetchFailed = false;
        
        // Parallel fetch with Promise.all (AC requirement)
        // Per-column error isolation: each fetch has its own catch block
        const [blogData, changelogData, statusData, vscodeData] = await Promise.all([
            fetchBlogFromApiClient().catch(err => {
                console.error('fetchAllData: Blog fetch failed:', err);
                anyFetchFailed = true;
                return null; // Per-column isolation
            }),
            fetchChangelogFromApiClient().catch(err => {
                console.error('fetchAllData: Changelog fetch failed:', err);
                anyFetchFailed = true;
                return null;
            }),
            fetchStatusFromApiClient().catch(err => {
                console.error('fetchAllData: Status fetch failed:', err);
                anyFetchFailed = true;
                return null;
            }),
            fetchVSCodeFromApiClient().catch(err => {
                console.error('fetchAllData: VS Code updates fetch failed:', err);
                anyFetchFailed = true;
                return null;
            })
        ]);
        
        // Update offline state based on fetch results
        const wasOffline = isOffline;
        isOffline = anyFetchFailed;
        
        // Update live indicator if offline state changed
        if (wasOffline !== isOffline) {
            updateLiveIndicator();
            if (isOffline) {
                console.log('Network issues detected - showing cached content');
            } else {
                console.log('Network recovered - fetching fresh data');
            }
        }
        
        // Store item counts for highlighter restart
        let blogItemCount = 0;
        let changelogItemCount = 0;
        let statusItemCount = 0;
        let vscodeItemCount = 0;
        
        // Render each page (with error handling for null data)
        if (blogData) {
            blogItemCount = renderBlogList(blogData);
        } else {
            renderErrorState('blog-list', 'Unable to load blog posts');
        }
        
        if (changelogData) {
            changelogItemCount = renderChangelogList(changelogData);
        } else {
            renderErrorState('changelog-list', 'Unable to load changelog');
        }
        
        if (statusData) {
            statusItemCount = renderStatusList(statusData);
            
            // Story 4.3: Check for active outages and update persistent indicator
            try {
                const outageData = detectActiveOutages(statusData);
                if (outageData && window.persistentAlertInstance) {
                    window.persistentAlertInstance.show(outageData);
                } else if (window.persistentAlertInstance) {
                    window.persistentAlertInstance.hide();
                }
            } catch (error) {
                console.error('fetchAllData: Error detecting outages:', error);
                // Don't show indicator on detection error - only show for actual outages
                if (window.persistentAlertInstance) {
                    window.persistentAlertInstance.hide();
                }
            }
        } else {
            renderErrorState('status-list', 'Unable to load status');
            // Hide indicator if status fetch failed (no outage data available)
            if (window.persistentAlertInstance) {
                window.persistentAlertInstance.hide();
            }
        }

        if (vscodeData) {
            vscodeItemCount = renderVSCodeList(vscodeData);
        } else {
            renderErrorState('vscode-list', 'Unable to load VS Code updates');
        }
        
        // CRITICAL: Restart highlighter on current page with updated item count
        // Timer states must be preserved (do NOT call reset() - that would break timer)
        // Only update if we're on the first load or need to update counts
        if (!window.dataInitialized) {
            // First load - start highlighting AFTER data is rendered
            window.dataInitialized = true;
            console.log('fetchAllData: First data load complete');
            
            // Hide loading overlay and remove loading class
            const loadingOverlay = document.getElementById('loadingOverlay');
            const dashboardContainer = document.querySelector('.dashboard-container');
            if (loadingOverlay) {
                loadingOverlay.classList.add('hidden');
                // Remove overlay from DOM after transition completes
                setTimeout(() => loadingOverlay.remove(), 300);
            }
            if (dashboardContainer) {
                dashboardContainer.classList.remove('loading');
            }
            
            // Initialize ItemHighlighter with real data
            const initialPage = window.carouselInstance.pages[window.carouselInstance.currentPage];
            const initialItemCount = getItemCountForPage(initialPage);
            if (initialItemCount > 0) {
                applyItemIntervalForPage(initialPage);
                window.itemHighlighterInstance.start(initialItemCount);
                console.log(`ItemHighlighter initialized with ${initialItemCount} items on ${initialPage} page`);
            }
        } else {
            // Subsequent refresh - DO NOT reset timers, just update data
            // The existing ItemHighlighter continues highlighting the updated DOM
            console.log('fetchAllData: Data refresh complete (timers preserved)');
        }
        
    } catch (error) {
        console.error('fetchAllData: Critical error during data initialization:', error);
        
        // Hide loading overlay even on error
        const loadingOverlay = document.getElementById('loadingOverlay');
        const dashboardContainer = document.querySelector('.dashboard-container');
        if (loadingOverlay) {
            loadingOverlay.classList.add('hidden');
            setTimeout(() => loadingOverlay.remove(), 300);
        }
        if (dashboardContainer) {
            dashboardContainer.classList.remove('loading');
        }
        
        // Fallback: show error state for all pages
        isOffline = true;
        updateLiveIndicator();
        renderErrorState('blog-list', 'Dashboard initialization failed');
        renderErrorState('changelog-list', 'Dashboard initialization failed');
        renderErrorState('status-list', 'Dashboard initialization failed');
        renderErrorState('vscode-list', 'Dashboard initialization failed');
    }
}

// Initialize sprite animator
const canvas = document.getElementById('spriteCanvas');
skaterAnimator = new SpriteAnimator({
    canvas: canvas,
    spriteSheetPath: 'octocat-skater-v2.png',
    gridColumns: 5,
    gridRows: 3,
    paletteRows: 1,
    framePadding: 0,
    verticalOffsets: [44, 90],
    fps: 6,
    scale: 0.15,
    chromaKey: true,
    chromaKeyColor: '#161B22',
    chromaKeyTolerance: 10,
    onLoad: (animator) => {
        animator.play();
    }
});

/**
 * Helper function to get item count for a specific page
 * @param {string} pageName - Page identifier ('blog', 'changelog', 'status')
 * @returns {number} Number of list items on the page
 */
function getItemCountForPage(pageName) {
    const pageElement = document.getElementById(`page-${pageName}`);
    if (!pageElement) {
        console.warn(`ItemHighlighter: Page ${pageName} not found`);
        return 0;
    }
    
    const listItems = pageElement.querySelectorAll('.list-item');
    return listItems.length;
}

// Initialize dashboard
updateTimestamp();
fetchAllData();

// Initialize and start carousel rotation
// Store globally to prevent memory leaks during hot reload
if (window.carouselInstance) {
  window.carouselInstance.stop();
}

const DEFAULT_PAGE_INTERVAL = 30000; // 30 seconds per page
const PAGE_INTERVAL_OVERRIDES = {
  blog: 90000,
  changelog: 90000,
  vscode: 90000
};

window.carouselInstance = new CarouselController({ interval: DEFAULT_PAGE_INTERVAL, pages: ['vscode', 'blog', 'changelog', 'status'], pageIntervals: PAGE_INTERVAL_OVERRIDES }); // 30 seconds per page default, overridden per page

// Initialize item highlighter
if (window.itemHighlighterInstance) {
  window.itemHighlighterInstance.stop();
}

const DEFAULT_ITEM_INTERVAL = 8000; // 8 seconds per item
const ITEM_INTERVAL_OVERRIDES = {
  blog: 24000,
  changelog: 24000,
  vscode: 24000
};

function applyItemIntervalForPage(pageName) {
    const pageSpecificInterval = ITEM_INTERVAL_OVERRIDES[pageName];
    const nextInterval = pageSpecificInterval || DEFAULT_ITEM_INTERVAL;
    window.itemHighlighterInstance.setInterval(nextInterval);
}

window.itemHighlighterInstance = new ItemHighlighter({ interval: DEFAULT_ITEM_INTERVAL }); // 8 seconds per item default, overridden per page

// Initialize detail panel (Story 3.3)
if (window.detailPanelInstance) {
  // Clean up if exists (hot reload support)
  window.detailPanelInstance = null;
}

window.detailPanelInstance = new DetailPanel();

// Initialize persistent alert (Story 4.3)
if (window.persistentAlertInstance) {
  // Clean up if exists (hot reload support)
  window.persistentAlertInstance = null;
}

window.persistentAlertInstance = new PersistentAlert();

/**
 * Extract item data from a list item DOM element
 * @param {HTMLElement} itemElement - The list item element
 * @returns {Object} Item data object
 */
function extractItemData(itemElement) {
  if (!itemElement) {
    return {
      title: 'Untitled',
      timestamp: 'Unknown date',
      description: 'No content available',
      link: ''
    };
  }
  
  // Extract from dataset if available (set by rendering functions)
  const fullDescription = itemElement.dataset?.fullDescription || 
                          itemElement.querySelector('.list-item-description')?.textContent?.trim() || 
                          'No description available';
  
  return {
    title: itemElement.querySelector('.list-item-title')?.textContent?.trim() || 'Untitled',
    timestamp: itemElement.querySelector('.list-item-timestamp')?.textContent?.trim() || 'Unknown date',
    description: fullDescription,
    link: itemElement.dataset?.link || '' // Populated with real API data
  };
}

// Set item highlighter callback to render detail panel (Story 3.3)
// This callback is triggered every 8 seconds when the highlighted item changes
// ItemHighlighter passes (itemElement, itemIndex) - both parameters available
window.itemHighlighterInstance.onItemHighlight = (itemElement, itemIndex) => {
  // Get active page for validation
  const activePage = document.querySelector('.carousel-page.active');
  if (!activePage) {
    console.warn('DetailPanel callback: No active page found');
    return;
  }
  
  // Validate itemElement was provided
  if (!itemElement) {
    console.warn(`DetailPanel callback: No item element provided for index ${itemIndex}`);
    return;
  }
  
  // Extract data from DOM element
  const itemData = extractItemData(itemElement);
  
  // Check if we're on the VS Code page - use async content fetching
  const isVSCodePage = activePage.id === 'page-vscode';
  
  if (isVSCodePage && itemData.link) {
    // Use async content fetching for VS Code items
    // Hide the header (title + timestamp) since the fetched article content already includes them
    // Skip initial RSS content - only show loading state then full article
    window.detailPanelInstance.renderWithAsyncContent(itemData, fetchArticleContent, { hideHeader: true, skipInitialContent: true });
    console.log(`DetailPanel rendering VS Code item ${itemIndex} with async content:`, itemData.title);
  } else {
    // Regular rendering for other pages
    window.detailPanelInstance.render(itemData);
    console.log(`DetailPanel rendering item ${itemIndex}:`, itemData.title);
  }
};

// ============================================================================
// DUAL TIMER COORDINATION (Story 3.4)
// ============================================================================
// Two independent timers work together:
// 1. Page Timer (30s default, 90s on Blog/Changelog) - Managed by CarouselController
// 2. Item Timer (8s default, 24s on Blog/Changelog) - Managed by ItemHighlighter
//
// Coordination Pattern:
// - Page changes trigger onPageChange → resets item timer
// - Item changes trigger onItemHighlight → updates detail panel
// - Timers run independently without blocking each other
//
// Timer Lifecycle:
// 1. Callbacks wired BEFORE start() calls (prevents missed events)
// 2. Both timers started (carousel.start(), highlighter.start())
// 3. Page timer runs continuously every 30 seconds
// 4. Item timer runs every 8 seconds, resets when page changes
// 5. Both timers persist through 5-minute API refresh cycles
// ============================================================================

// Set carousel callback BEFORE starting (Story 3.2/3.4)
// This callback is triggered when the page changes (default 30s, extended on Blog/Changelog)
window.carouselInstance.onPageChange = (pageName) => {
    console.log(`Page changed to: ${pageName}`);
    
    // CRITICAL: Reset item highlighting when page changes
    // This clears the 8-second timer and removes all highlights
    window.itemHighlighterInstance.reset();
    
    // Apply page-specific item timing (triple on blog/changelog)
    applyItemIntervalForPage(pageName);
    
    // Get item count for new page
    const itemCount = getItemCountForPage(pageName);
    
    // Start highlighting on new page if items exist
    // Item timer begins fresh countdown using page-specific interval
    if (itemCount > 0) {
        window.itemHighlighterInstance.start(itemCount);
        console.log(`ItemHighlighter started with ${itemCount} items on ${pageName}`);
    }
};

// Start carousel
window.carouselInstance.start();

// ItemHighlighter will be initialized in fetchAllData() after data is loaded
// This ensures the first item is highlighted immediately when data is ready

// Auto-refresh every 5 minutes
refreshIntervalId = setInterval(fetchAllData, REFRESH_INTERVAL);

// Pause button handler
document.getElementById('pauseButton').addEventListener('click', togglePause);

// Update timestamp every second
setInterval(updateTimestamp, 1000);

// Browser online/offline event listeners for immediate network detection
// Story 4.1: Detect network changes instantly without waiting for API fetch
window.addEventListener('online', () => {
    console.log('Browser detected: Network connection restored');
    // Immediately fetch to verify connectivity and update data
    // This provides fast recovery (within ~7 seconds including retries)
    if (isOffline && !isPaused) {
        console.log('Attempting immediate data refresh to verify connection');
        fetchAllData();
    }
});

window.addEventListener('offline', () => {
    console.log('Browser detected: Network connection lost');
    isOffline = true;
    updateLiveIndicator();
});
