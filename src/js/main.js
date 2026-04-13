// Import utility functions
import { formatDate, stripHtml, truncate, formatDuration } from './utils.js';

// Component skeletons imported for Epic 2+ implementation
// Current MVP functionality remains using existing code below
import { CarouselController } from './carousel-controller.js';
import { ItemHighlighter } from './item-highlighter.js';
import { DetailPanel } from './detail-panel.js';

// Import persistent alert component (Story 4.3)
import { PersistentAlert } from './persistent-alert.js';

// Import status badge component (Enhanced Error UI)
import { StatusBadge } from './status-badge.js';

// Import theme toggle
import { ThemeToggle } from './theme-toggle.js';

// Import time-based messages component (Easter Egg)
import { TimeBasedMessages } from './time-based-messages.js';

// Import Matrix rain easter egg for incident detection
import { checkForNewIncidents } from './matrix-rain.js';

// Import settings manager for localStorage persistence
import { SettingsManager } from './settings-manager.js';

// Import configurable refresh interval controller
import { RefreshIntervalController } from './refresh-interval-controller.js';

// Import multi-source refresh controller for per-source refresh intervals
import { MultiSourceRefreshController } from './multi-source-refresh-controller.js';

// Import GitHub Uptime Streak Counter (Easter Egg)
import { GitHubStreakCounter } from './github-streak-counter.js';

// Import Claude Uptime Streak Counter (Easter Egg)
import { ClaudeStreakCounter } from './claude-streak-counter.js';

// Import Octocat cameo Easter egg
import { OctocatCameo } from './octocat-cameo.js';

// Import API client for data fetching (Story 3.5)
import {
    fetchBlog as fetchBlogFromApiClient,
    fetchChangelog as fetchChangelogFromApiClient,
    fetchStatus as fetchStatusFromApiClient,
    fetchVSCode as fetchVSCodeFromApiClient,
    fetchVisualStudio as fetchVisualStudioFromApiClient,
    fetchAnthropic as fetchAnthropicFromApiClient,
    getCacheEntry,
    detectActiveOutages,
    fetchArticleContent,
    onStatusChange
} from './api-client.js';

// Import config loader for user-configurable settings
import {
    loadConfig,
    getConfig,
    getDefaultConfig,
    getItemsPerFeed,
    getPageInterval,
    getItemInterval,
    getRefreshInterval
} from './config-loader.js';

// Import ExportController for share/export functionality
import { ExportController } from './export-controller.js';

// Configuration - loaded from config.json with fallback defaults
// These will be populated by initializeWithConfig()
let REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes (default, updated from config)

// Network status state (Story 4.1)
let isOffline = false;

// Global ExportController instance
let exportController = null;

// Share modal state
let currentShareItem = null;

// Track if dashboard was paused by share modal (to avoid resume if user had already paused)
let pausedByShareModal = false;

// QR code display timer
let qrDisplayTimer = null;
let qrCountdownInterval = null;

// Track if pause QR widget is dismissed by user
let pauseQrWidgetDismissed = false;

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
 * Create a share button element for an item.
 * No click listener is attached here; event delegation in renderRSSList handles clicks.
 * @returns {HTMLElement} Share button element
 */
function createShareButton() {
    const shareBtn = document.createElement('button');
    shareBtn.className = 'btn-share';
    shareBtn.title = 'Share this item';
    shareBtn.innerHTML = `
        <svg class="icon-share" viewBox="0 0 16 16" fill="currentColor">
            <path d="M13 7.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm-11 6a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm11 0a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"></path>
            <path d="M5.7 11.2L10.3 13.8M10.3 2.2L5.7 4.8" stroke="currentColor" stroke-width="1.5"></path>
        </svg>
    `;
    return shareBtn;
}

/**
 * Delegated click handler for share buttons inside list containers.
 * Reconstructs item data from the DOM so no closures over item objects are held.
 * @param {MouseEvent} event
 */
function handleShareButtonClick(event) {
    const shareBtn = event.target.closest('.btn-share');
    if (!shareBtn) return; // Click was not on a share button

    event.stopPropagation(); // Prevent item selection / document-level listeners

    const itemEl = shareBtn.closest('.list-item');
    if (!itemEl) return;

    const item = {
        title: itemEl.querySelector('.list-item-title')?.textContent || '',
        link: itemEl.dataset.link || '',
        description: itemEl.querySelector('.list-item-description')?.textContent || '',
        content: itemEl.dataset.fullDescription || '',
        pubDate: itemEl.dataset.pubDate || '',
        source: itemEl.dataset.source || ''
    };

    openShareModal(item);
}

/**
 * Shared RSS list renderer - DRY implementation for all RSS-based pages
 * @param {Object} data - RSS data from API with items array
 * @param {string} containerId - DOM element ID for the list container
 * @param {string} sourceName - Human-readable source name for logging/errors
 * @param {string} feedName - Feed name for config lookup (e.g., 'blog', 'changelog'). Required for proper config lookup.
 * @returns {number} Number of items rendered
 */
function renderRSSList(data, containerId, sourceName, feedName) {
    const listEl = document.getElementById(containerId);
    if (!listEl) {
        console.error(`renderRSSList: ${containerId} element not found`);
        return 0;
    }
    
    // Clear placeholder content
    listEl.innerHTML = '';
    
    // Get item count from config (feedName must be a valid config key)
    const itemCount = getItemsPerFeed(feedName);
    const items = data.items.slice(0, itemCount);
    
    // Performance optimization: Use DocumentFragment for batched DOM insertion
    // This eliminates layout thrashing (only one reflow instead of N reflows)
    const fragment = document.createDocumentFragment();
    
    items.forEach((item, index) => {
        const itemEl = document.createElement('div');
        itemEl.className = 'list-item';
        itemEl.dataset.index = index;
        itemEl.dataset.link = item.link || '';
        itemEl.dataset.source = sourceName;
        itemEl.dataset.pubDate = item.pubDate || '';
        
        // Store full content HTML for detail panel rendering (use 'content' field, fallback to 'description')
        itemEl.dataset.fullDescription = item.content || item.description || '';
        
        const title = item.title || 'Untitled';
        const timestamp = formatDate(item.pubDate);
        const description = truncate(stripHtml(item.description || ''), 120);
        
        // Create item header with title and share button
        const headerEl = document.createElement('div');
        headerEl.style.display = 'flex';
        headerEl.style.justifyContent = 'space-between';
        headerEl.style.alignItems = 'flex-start';
        headerEl.style.gap = 'var(--space-2)';
        
        const titleEl = document.createElement('div');
        titleEl.className = 'list-item-title';
        titleEl.textContent = title;
        titleEl.style.flex = '1';
        headerEl.appendChild(titleEl);
        
        // Add share button
        const shareBtn = createShareButton();
        headerEl.appendChild(shareBtn);
        
        itemEl.appendChild(headerEl);
        
        // Add timestamp and description
        const timestampEl = document.createElement('div');
        timestampEl.className = 'list-item-timestamp';
        timestampEl.textContent = timestamp;
        itemEl.appendChild(timestampEl);
        
        const descEl = document.createElement('div');
        descEl.className = 'list-item-description';
        descEl.textContent = description;
        itemEl.appendChild(descEl);
        
        // Append to fragment (no DOM reflow)
        fragment.appendChild(itemEl);
    });
    
    // Single DOM write (one reflow)
    listEl.appendChild(fragment);

    // Attach a single delegated click listener for all share buttons in this list.
    // Remove before re-adding to prevent duplicates on every data refresh.
    listEl.removeEventListener('click', handleShareButtonClick);
    listEl.addEventListener('click', handleShareButtonClick);

    console.log(`renderRSSList: Rendered ${items.length} ${sourceName} items`);
    return items.length;
}

/**
 * Render Blog page data
 * @param {Object} blogData - Blog RSS data from API
 * @returns {number} Number of items rendered
 */
function renderBlogList(blogData) {
    return renderRSSList(blogData, 'blog-list', 'blog', 'blog');
}

/**
 * Render Changelog page data
 * @param {Object} changelogData - Changelog RSS data from API
 * @returns {number} Number of items rendered
 */
function renderChangelogList(changelogData) {
    return renderRSSList(changelogData, 'changelog-list', 'changelog', 'changelog');
}

/**
 * Render VS Code Updates page data
 * @param {Object} vscodeData - VS Code Updates RSS data from API
 * @returns {number} Number of items rendered
 */
function renderVSCodeList(vscodeData) {
    return renderRSSList(vscodeData, 'vscode-list', 'VS Code update', 'vscode');
}

/**
 * Render Visual Studio DevBlog list data
 * @param {Object} visualstudioData - Visual Studio DevBlog RSS data from API
 * @returns {number} Number of items rendered
 */
function renderVisualStudioList(visualstudioData) {
    return renderRSSList(visualstudioData, 'visualstudio-list', 'Visual Studio update', 'visualstudio');
}

/**
 * Render Claude Code Changelog list data with thumbnail support
 * Thumbnails are sourced from item.thumbnail or item.enclosure.link
 * Descriptions are HTML-stripped via stripHtml() to prevent XSS
 * @param {Object} anthropicData - Claude Code Changelog RSS data from API
 * @returns {number} Number of items rendered
 */
function renderAnthropicList(anthropicData) {
    const listEl = document.getElementById('anthropic-list');
    if (!listEl) {
        console.error('renderAnthropicList: anthropic-list element not found');
        return 0;
    }

    // Clear placeholder content
    listEl.innerHTML = '';

    // Get item count from config
    const itemCount = getItemsPerFeed('anthropic');
    const items = anthropicData.items.slice(0, itemCount);

    // Performance optimization: Use DocumentFragment for batched DOM insertion
    const fragment = document.createDocumentFragment();

    items.forEach((item, index) => {
        const itemEl = document.createElement('div');
        itemEl.className = 'list-item';
        itemEl.dataset.index = index;
        itemEl.dataset.link = item.link || '';

        // Store full content for detail panel
        // For changelog: preserve HTML formatting (sanitized in DetailPanel)
        // For other sources: strip HTML for safety
        const fullContent = item.content || item.description || '';
        itemEl.dataset.fullDescription = fullContent;
        itemEl.dataset.isHtmlContent = 'true'; // Flag to preserve HTML formatting

        // Resolve thumbnail: prefer item.thumbnail, fall back to enclosure URL
        const thumbnail = item.thumbnail ||
            (item.enclosure && item.enclosure.link ? item.enclosure.link : null);

        if (thumbnail) {
            itemEl.dataset.thumbnail = thumbnail;
            // Build img element via DOM API to avoid inline event handlers (XSS prevention)
            const imgEl = document.createElement('img');
            imgEl.className = 'list-item-thumbnail';
            imgEl.src = thumbnail;
            imgEl.alt = '';
            imgEl.loading = 'lazy';
            imgEl.addEventListener('error', function() { this.remove(); });
            itemEl.appendChild(imgEl);
        }

        const title = item.title || 'Untitled';

        const textEl = document.createElement('div');

        const titleEl = document.createElement('div');
        titleEl.className = 'list-item-title';
        titleEl.textContent = title;
        textEl.appendChild(titleEl);

        // No timestamp or description for changelog items - clean version-only display

        itemEl.appendChild(textEl);

        fragment.appendChild(itemEl);
    });

    // Single DOM write (one reflow)
    listEl.appendChild(fragment);

    console.log(`renderAnthropicList: Rendered ${items.length} Claude Code changelog items`);
    return items.length;
}

/**
 * Render Status page data (split-view with active incidents + incident history timeline)
 * @param {Object} statusData - GitHub Status API incidents data
 * @returns {number} Number of items rendered
 */
function renderStatusList(statusData) {
    const statusListEl = document.getElementById('status-list');
    const historyTimelineEl = document.getElementById('status-incident-history');
    
    if (!statusListEl || !historyTimelineEl) {
        console.error('renderStatusList: Required elements not found');
        return 0;
    }
    
    // Clear existing content
    statusListEl.innerHTML = '';
    historyTimelineEl.innerHTML = '';
    
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
    
    // Render incident history timeline (past 7 days, up to 10 resolved incidents)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    // Filter resolved incidents from past 7 days
    const recentResolvedIncidents = resolvedIncidents
        .filter(inc => {
            const createdAt = new Date(inc.created_at);
            return createdAt > sevenDaysAgo;
        })
        .slice(0, 10); // Limit to 10 most recent
    
    if (recentResolvedIncidents.length > 0) {
        // Performance optimization: Build timeline using DocumentFragment
        const fragment = document.createDocumentFragment();
        
        // Add header
        const headerEl = document.createElement('div');
        headerEl.className = 'incident-history-header';
        headerEl.textContent = 'Incident History (Past 7 Days)';
        fragment.appendChild(headerEl);
        
        // Create grid container for timeline cards
        const gridContainer = document.createElement('div');
        gridContainer.className = 'incident-history-items';
        
        // Render timeline cards
        recentResolvedIncidents.forEach(incident => {
            const impact = incident.impact || 'none';
            
            // Determine severity class and icon
            const severityClass = getSeverityClass(impact);
            const severityIcon = getSeverityIcon(impact);
            
            // Calculate incident duration
            const duration = formatDuration(incident.created_at, incident.resolved_at || incident.updated_at);
            
            // Extract affected services from components (if available)
            const affectedServices = getAffectedServices(incident);
            
            const cardEl = document.createElement('div');
            cardEl.className = `incident-history-card ${severityClass}`;
            
            // Build card HTML
            let cardHtml = `
                <div class="incident-history-card-header">
                    <span class="incident-severity-icon">${severityIcon}</span>
                    <span class="incident-history-title">${truncate(incident.name || 'Incident', 80)}</span>
                </div>
                <div class="incident-history-meta">
                    <span class="incident-meta-item">
                        <span class="incident-meta-label">Resolved:</span>
                        <span class="incident-meta-value">${formatDate(incident.resolved_at || incident.updated_at)}</span>
                    </span>
                    <span class="incident-meta-item">
                        <span class="incident-meta-label">Duration:</span>
                        <span class="incident-meta-value">${duration}</span>
                    </span>
                </div>`;
            
            // Add affected services if available
            if (affectedServices.length > 0) {
                cardHtml += `
                <div class="incident-services">
                    ${affectedServices.slice(0, 3).map(service => 
                        `<span class="incident-service-tag">${service}</span>`
                    ).join('')}
                    ${affectedServices.length > 3 ? `<span class="incident-service-tag">+${affectedServices.length - 3} more</span>` : ''}
                </div>`;
            }
            
            // Add resolution indicator
            cardHtml += `
                <div class="incident-resolution">Resolved</div>`;
            
            cardEl.innerHTML = cardHtml;
            gridContainer.appendChild(cardEl);
        });
        
        fragment.appendChild(gridContainer);
        
        // Single DOM write for entire timeline section
        historyTimelineEl.appendChild(fragment);
    }
    
    const totalItems = Math.max(activeIncidents.length, 1); // Count active incidents for highlighting
    console.log(`renderStatusList: Rendered ${activeIncidents.length} active incidents and ${recentResolvedIncidents.length} in incident history`);
    return totalItems;
}

/**
 * Get CSS class for incident severity
 * @param {string} impact - Impact level from GitHub Status API
 * @returns {string} CSS class for severity styling
 */
function getSeverityClass(impact) {
    switch (impact) {
        case 'critical':
        case 'major':
            return 'severity-major';
        case 'minor':
            return 'severity-minor';
        case 'maintenance':
            return 'severity-maintenance';
        default:
            return 'severity-none';
    }
}

/**
 * Get emoji icon for incident severity
 * @param {string} impact - Impact level from GitHub Status API
 * @returns {string} Emoji icon for severity
 */
function getSeverityIcon(impact) {
    switch (impact) {
        case 'critical':
        case 'major':
            return '🔴';
        case 'minor':
            return '🟡';
        case 'maintenance':
            return '🔵';
        default:
            return '🟢';
    }
}

/**
 * Extract affected service names from incident components
 * @param {Object} incident - Incident object from GitHub Status API
 * @returns {string[]} Array of affected service names
 */
function getAffectedServices(incident) {
    const services = [];
    
    // Try to extract from components array
    if (incident.components && Array.isArray(incident.components)) {
        incident.components.forEach(component => {
            if (component.name) {
                services.push(component.name);
            }
        });
    }
    
    // If no components, try to extract from incident_updates
    if (services.length === 0 && incident.incident_updates && incident.incident_updates.length > 0) {
        // Check for affected_components in updates
        incident.incident_updates.forEach(update => {
            if (update.affected_components && Array.isArray(update.affected_components)) {
                update.affected_components.forEach(comp => {
                    if (comp.name && !services.includes(comp.name)) {
                        services.push(comp.name);
                    }
                });
            }
        });
    }
    
    return services;
}

// Remove old placeholder functions - replaced by API integration above
// (Removed: fetchBlog, fetchChangelog, fetchStatus stubs)

// ============================================================================
// FrameSequenceAnimator Class - Loads and plays individual frame images
// ============================================================================

class FrameSequenceAnimator {
    constructor(config) {
        this.canvas = config.canvas;
        this.ctx = this.canvas.getContext('2d');
        this.framePaths = config.framePaths || [];
        
        this.fps = config.fps || 6;
        this.scale = config.scale || 1;
        
        this.chromaKeyEnabled = config.chromaKey !== false;
        this.chromaKeyColor = config.chromaKeyColor || '#161B22';
        this.chromaKeyTolerance = config.chromaKeyTolerance || 10;
        this.backgroundColor = config.backgroundColor || 'transparent';
        
        this.frames = [];
        this.currentFrame = 0;
        this.isPlaying = false;
        this.lastFrameTime = 0;
        this.animationId = null;
        
        this.onLoad = config.onLoad || null;
        
        this.loadFrames();
    }
    
    /**
     * Load all individual frame images in parallel
     */
    loadFrames() {
        if (this.framePaths.length === 0) {
            console.error('FrameSequenceAnimator: No frame paths provided');
            return;
        }
        
        let loadedCount = 0;
        this.frames = new Array(this.framePaths.length);
        
        this.framePaths.forEach((path, index) => {
            const img = new Image();
            img.onload = () => {
                this.frames[index] = img;
                loadedCount++;
                
                // All frames loaded
                if (loadedCount === this.framePaths.length) {
                    this.resizeCanvas();
                    this.draw();
                    if (this.onLoad) this.onLoad(this);
                }
            };
            img.onerror = () => {
                console.error(`FrameSequenceAnimator: Failed to load frame ${index} (${path})`);
                loadedCount++;
                if (loadedCount === this.framePaths.length) {
                    console.warn(`FrameSequenceAnimator: Loaded ${loadedCount} frames with errors`);
                    if (this.onLoad) this.onLoad(this);
                }
            };
            img.src = path;
        });
    }
    
    /**
     * Size canvas to fit the first loaded frame
     */
    resizeCanvas() {
        if (this.frames.length === 0 || !this.frames[0]) return;
        
        const firstFrame = this.frames[0];
        this.canvas.width = firstFrame.width * this.scale;
        this.canvas.height = firstFrame.height * this.scale;
        this.ctx.imageSmoothingEnabled = false;
    }
    
    /**
     * Draw current frame to canvas
     */
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (this.backgroundColor !== 'transparent') {
            this.ctx.fillStyle = this.backgroundColor;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
        
        const frame = this.frames[this.currentFrame];
        if (!frame) return;
        
        this.ctx.drawImage(frame, 0, 0, this.canvas.width, this.canvas.height);
        
        if (this.chromaKeyEnabled) this.applyChromaKey();
    }
    
    /**
     * Apply chroma key transparency to current frame
     */
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
    
    /**
     * Convert hex color to RGB object
     */
    hexToRgb(hex) {
        hex = hex.replace('#', '');
        return {
            r: parseInt(hex.substring(0, 2), 16),
            g: parseInt(hex.substring(2, 4), 16),
            b: parseInt(hex.substring(4, 6), 16)
        };
    }
    
    /**
     * Animation loop - advances frame based on FPS
     */
    animate(timestamp) {
        if (!this.isPlaying) return;
        
        const frameInterval = 1000 / this.fps;
        const elapsed = timestamp - this.lastFrameTime;
        
        if (elapsed >= frameInterval) {
            this.currentFrame = (this.currentFrame + 1) % this.frames.length;
            this.draw();
            this.lastFrameTime = timestamp - (elapsed % frameInterval);
        }
        
        this.animationId = requestAnimationFrame((ts) => this.animate(ts));
    }
    
    /**
     * Start animation playback
     */
    play() {
        if (this.isPlaying) return;
        this.isPlaying = true;
        this.lastFrameTime = performance.now();
        this.animationId = requestAnimationFrame((ts) => this.animate(ts));
    }
    
    /**
     * Pause animation playback
     */
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
        // Pause mode - freeze everything at current position
        pauseIcon.textContent = '▶';
        pauseText.textContent = 'Resume';
        updateLiveIndicator();
        
        // Pause data refresh (store elapsed for top progress bar)
        if (window.refreshIntervalController) {
            window.refreshIntervalController.pause();
        }
        // Store elapsed time for top progress bar
        if (progressStartTime) {
            progressElapsedBeforePause = Date.now() - progressStartTime;
        }
        if (progressAnimationFrame) {
            cancelAnimationFrame(progressAnimationFrame);
            progressAnimationFrame = null;
        }
        
        // Pause carousel (preserves position)
        if (window.carouselInstance) {
            window.carouselInstance.pause();
        }
        
        // Pause item highlighting (preserves current item)
        if (window.itemHighlighterInstance) {
            window.itemHighlighterInstance.pause();
        }
        
        // Show pause QR widget (unless user dismissed it or share modal triggered pause)
        if (!pausedByShareModal && !pauseQrWidgetDismissed) {
            showPauseQrWidget();
        }
    } else {
        // Resume mode - continue from where we left off
        pauseIcon.textContent = '⏸';
        pauseText.textContent = 'Pause';
        updateLiveIndicator();
        
        // Resume top progress bar from where it was
        if (progressElapsedBeforePause > 0) {
            progressStartTime = Date.now() - progressElapsedBeforePause;
            resumeProgressBar();
        }
        
        // Resume data refresh interval (don't fetch immediately to avoid jarring)
        if (window.refreshIntervalController) {
            window.refreshIntervalController.resume();
        }
        
        // Resume carousel rotation
        if (window.carouselInstance) {
            window.carouselInstance.resume();
        }
        
        // Resume item highlighting
        if (window.itemHighlighterInstance) {
            window.itemHighlighterInstance.resume();
        }
        
        // Hide pause QR widget and reset dismissed state for next pause
        hidePauseQrWidget();
        pauseQrWidgetDismissed = false;
    }
}

// Refresh Progress Bar Animation (RAF-based for smooth 60fps updates)
// Top bar (#progressBar) tracks 5-minute refresh cycle
// Octocat handled by CarouselController on bottom bar
let progressAnimationFrame = null;
let progressStartTime;
let progressElapsedBeforePause = 0;

function startProgressBar() {
    const progressBar = document.getElementById('progressBar');
    progressStartTime = Date.now();
    progressElapsedBeforePause = 0;
    
    progressBar.style.width = '0%';
    
    // Cancel any existing animation
    if (progressAnimationFrame) {
        cancelAnimationFrame(progressAnimationFrame);
    }
    
    function updateProgressBar() {
        const elapsed = Date.now() - progressStartTime;
        const progress = Math.min((elapsed / REFRESH_INTERVAL) * 100, 100);
        
        progressBar.style.width = progress + '%';
        
        // Continue animation until complete
        if (progress < 100) {
            progressAnimationFrame = requestAnimationFrame(updateProgressBar);
        } else {
            // Reset after brief hold at 100%
            setTimeout(() => {
                progressBar.style.width = '0%';
            }, 500);
        }
    }
    
    // Start animation loop
    progressAnimationFrame = requestAnimationFrame(updateProgressBar);
}

function resumeProgressBar() {
    const progressBar = document.getElementById('progressBar');
    
    // Cancel any existing animation
    if (progressAnimationFrame) {
        cancelAnimationFrame(progressAnimationFrame);
    }
    
    function updateProgressBar() {
        const elapsed = Date.now() - progressStartTime;
        const progress = Math.min((elapsed / REFRESH_INTERVAL) * 100, 100);
        
        progressBar.style.width = progress + '%';
        
        // Continue animation until complete
        if (progress < 100) {
            progressAnimationFrame = requestAnimationFrame(updateProgressBar);
        } else {
            // Reset after brief hold at 100%
            setTimeout(() => {
                progressBar.style.width = '0%';
            }, 500);
        }
    }
    
    // Resume animation loop
    progressAnimationFrame = requestAnimationFrame(updateProgressBar);
}

// Fetch all data
async function fetchAllData() {
    if (isPaused) return;
    updateTimestamp();
    startProgressBar();
    
    console.log('fetchAllData: Starting parallel API fetches...');
    
    try {
        // Track fetch failures for intelligent network status detection
        // We track failures per source to determine if we're truly offline
        let failureCount = 0;
        let totalSources = 6;
        
        // Parallel fetch with Promise.all (AC requirement)
        // Per-column error isolation: each fetch has its own catch block
        const [blogData, changelogData, statusData, vscodeData, visualstudioData, anthropicData] = await Promise.all([
            fetchBlogFromApiClient().catch(err => {
                console.error('fetchAllData: Blog fetch failed:', err);
                failureCount++;
                return null; // Per-column isolation
            }),
            fetchChangelogFromApiClient().catch(err => {
                console.error('fetchAllData: Changelog fetch failed:', err);
                failureCount++;
                return null;
            }),
            fetchStatusFromApiClient().catch(err => {
                console.error('fetchAllData: Status fetch failed:', err);
                failureCount++;
                return null;
            }),
            fetchVSCodeFromApiClient().catch(err => {
                console.error('fetchAllData: VS Code updates fetch failed:', err);
                failureCount++;
                return null;
            }),
            fetchVisualStudioFromApiClient().catch(err => {
                console.error('fetchAllData: Visual Studio updates fetch failed:', err);
                failureCount++;
                return null;
            }),
            fetchAnthropicFromApiClient().catch(err => {
                console.error('fetchAllData: Claude Code changelog fetch failed:', err);
                failureCount++;
                return null;
            })
        ]);
        
        // Update offline state based on failure threshold
        // Only mark as offline if majority of sources fail (> half of totalSources)
        // Deriving from totalSources keeps this correct if sources are added/removed
        const wasOffline = isOffline;
        isOffline = failureCount > totalSources / 2;
        
        // Log network status for debugging
        console.log(`Network status: ${failureCount}/${totalSources} sources failed, offline=${isOffline}`);
        
        // Update live indicator if offline state changed
        if (wasOffline !== isOffline) {
            updateLiveIndicator();
            if (isOffline) {
                console.log('Network issues detected - showing cached content');
            } else {
                console.log('Network recovered - fetching fresh data');
            }
        }
        
        // Render each page (with error handling for null data)
        if (blogData) {
            renderBlogList(blogData);
        } else {
            renderErrorState('blog-list', 'Unable to load blog posts');
        }
        
        if (changelogData) {
            renderChangelogList(changelogData);
        } else {
            renderErrorState('changelog-list', 'Unable to load changelog');
        }
        
        if (statusData) {
            renderStatusList(statusData);
            
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
            
            // Easter Egg: Check for new major/critical incidents and trigger Matrix rain
            try {
                checkForNewIncidents(statusData);
            } catch (error) {
                console.error('fetchAllData: Error checking for Matrix rain trigger:', error);
                // Non-critical - don't affect dashboard operation
            }
            
            // Easter Egg: Update GitHub Uptime Streak Counter with latest status data
            try {
                if (window.streakCounterInstance) {
                    if (!window.streakCounterInitialized) {
                        // First initialization with status data
                        window.streakCounterInstance.initialize(statusData);
                        window.streakCounterInitialized = true;
                    } else {
                        // Update with new data on refresh
                        window.streakCounterInstance.update(statusData);
                    }
                }
            } catch (error) {
                console.error('fetchAllData: Error updating streak counter:', error);
                // Non-critical - don't affect dashboard operation
            }
        } else {
            renderErrorState('status-list', 'Unable to load status');
            // Hide indicator if status fetch failed (no outage data available)
            if (window.persistentAlertInstance) {
                window.persistentAlertInstance.hide();
            }
        }
        
        // Easter Egg: Initialize/Update Claude Uptime Streak Counter
        // The Claude counter fetches its own data from Anthropic Status API
        // This is independent of GitHub status data
        try {
            if (window.claudeStreakCounterInstance) {
                if (!window.claudeStreakCounterInitialized) {
                    // First initialization - counter handles its own API fetch
                    await window.claudeStreakCounterInstance.initialize();
                    window.claudeStreakCounterInitialized = true;
                }
                // Note: Claude counter has its own 5-minute polling, no need to update here
            }
        } catch (error) {
            console.error('fetchAllData: Error initializing Claude streak counter:', error);
            // Non-critical - don't affect dashboard operation
        }

        if (vscodeData) {
            renderVSCodeList(vscodeData);
        } else {
            renderErrorState('vscode-list', 'Unable to load VS Code updates');
        }

        if (visualstudioData) {
            renderVisualStudioList(visualstudioData);
        } else {
            renderErrorState('visualstudio-list', 'Unable to load Visual Studio updates');
        }

        if (anthropicData) {
            renderAnthropicList(anthropicData);
        } else {
            renderErrorState('anthropic-list', 'Unable to load Claude Code changelog');
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
            // Refresh cached items in ItemHighlighter to reflect updated DOM
            if (window.itemHighlighterInstance && window.itemHighlighterInstance.refreshCache) {
                window.itemHighlighterInstance.refreshCache();
            }
            console.log('fetchAllData: Data refresh complete (timers preserved)');
        }

        // Update last-refreshed timestamp in the settings panel
        if (window.refreshIntervalController) {
            window.refreshIntervalController.markRefreshed();
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
        renderErrorState('visualstudio-list', 'Dashboard initialization failed');
        renderErrorState('anthropic-list', 'Dashboard initialization failed');
    }
}

// Individual fetch functions for per-source refresh intervals
/**
 * Fetch and render blog data
 */
async function fetchBlog() {
    if (isPaused) return;
    
    try {
        const blogData = await fetchBlogFromApiClient();
        if (blogData) {
            renderBlogList(blogData);
            console.log('✅ Blog data refreshed');
        } else {
            renderErrorState('blog-list', 'Unable to load blog posts');
        }
    } catch (err) {
        console.error('fetchBlog: Error:', err);
        renderErrorState('blog-list', 'Unable to load blog posts');
    }
}

/**
 * Fetch and render changelog data
 */
async function fetchChangelog() {
    if (isPaused) return;
    
    try {
        const changelogData = await fetchChangelogFromApiClient();
        if (changelogData) {
            renderChangelogList(changelogData);
            console.log('✅ Changelog data refreshed');
        } else {
            renderErrorState('changelog-list', 'Unable to load changelog');
        }
    } catch (err) {
        console.error('fetchChangelog: Error:', err);
        renderErrorState('changelog-list', 'Unable to load changelog');
    }
}

/**
 * Fetch and render status data (also handles outage detection and streak counter)
 */
async function fetchStatus() {
    if (isPaused) return;
    
    try {
        const statusData = await fetchStatusFromApiClient();
        if (statusData) {
            renderStatusList(statusData);
            
            // Check for active outages and update persistent indicator
            try {
                const outageData = detectActiveOutages(statusData);
                if (outageData && window.persistentAlertInstance) {
                    window.persistentAlertInstance.show(outageData);
                } else if (window.persistentAlertInstance) {
                    window.persistentAlertInstance.hide();
                }
            } catch (error) {
                console.error('fetchStatus: Error detecting outages:', error);
                if (window.persistentAlertInstance) {
                    window.persistentAlertInstance.hide();
                }
            }
            
            // Easter Egg: Check for new major/critical incidents
            try {
                checkForNewIncidents(statusData);
            } catch (error) {
                console.error('fetchStatus: Error checking for Matrix rain trigger:', error);
            }
            
            // Easter Egg: Update GitHub Uptime Streak Counter
            try {
                if (window.streakCounterInstance) {
                    if (!window.streakCounterInitialized) {
                        window.streakCounterInstance.initialize(statusData);
                        window.streakCounterInitialized = true;
                    } else {
                        window.streakCounterInstance.update(statusData);
                    }
                }
            } catch (error) {
                console.error('fetchStatus: Error updating streak counter:', error);
            }
            
            console.log('✅ Status data refreshed');
        } else {
            renderErrorState('status-list', 'Unable to load status');
            if (window.persistentAlertInstance) {
                window.persistentAlertInstance.hide();
            }
        }
    } catch (err) {
        console.error('fetchStatus: Error:', err);
        renderErrorState('status-list', 'Unable to load status');
        if (window.persistentAlertInstance) {
            window.persistentAlertInstance.hide();
        }
    }
}

/**
 * Fetch and render VS Code updates data
 */
async function fetchVSCode() {
    if (isPaused) return;
    
    try {
        const vscodeData = await fetchVSCodeFromApiClient();
        if (vscodeData) {
            renderVSCodeList(vscodeData);
            console.log('✅ VS Code data refreshed');
        } else {
            renderErrorState('vscode-list', 'Unable to load VS Code updates');
        }
    } catch (err) {
        console.error('fetchVSCode: Error:', err);
        renderErrorState('vscode-list', 'Unable to load VS Code updates');
    }
}

/**
 * Fetch and render Visual Studio updates data
 */
async function fetchVisualStudio() {
    if (isPaused) return;
    
    try {
        const visualstudioData = await fetchVisualStudioFromApiClient();
        if (visualstudioData) {
            renderVisualStudioList(visualstudioData);
            console.log('✅ Visual Studio data refreshed');
        } else {
            renderErrorState('visualstudio-list', 'Unable to load Visual Studio updates');
        }
    } catch (err) {
        console.error('fetchVisualStudio: Error:', err);
        renderErrorState('visualstudio-list', 'Unable to load Visual Studio updates');
    }
}

/**
 * Fetch and render Anthropic (Claude Code) changelog data
 */
async function fetchAnthropic() {
    if (isPaused) return;
    
    try {
        const anthropicData = await fetchAnthropicFromApiClient();
        if (anthropicData) {
            renderAnthropicList(anthropicData);
            console.log('✅ Anthropic data refreshed');
        } else {
            renderErrorState('anthropic-list', 'Unable to load Claude Code changelog');
        }
    } catch (err) {
        console.error('fetchAnthropic: Error:', err);
        renderErrorState('anthropic-list', 'Unable to load Claude Code changelog');
    }
}

// Initialize frame sequence animator with individual cut images
const canvas = document.getElementById('spriteCanvas');
const framePaths = Array.from({length: 15}, (_, i) => 
    `img/ghskatecat/ghskatecat_${String(i).padStart(4, '0')}_ghcatskatev2_${String(15 - i).padStart(2, '0')}.png`
);
skaterAnimator = new FrameSequenceAnimator({
    canvas: canvas,
    framePaths: framePaths,
    fps: 6,
    scale: 0.22,  // ~50% larger than original 0.15
    chromaKey: false,  // Images already have transparent background
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

// Initialize settings manager (localStorage persistence)
window.settingsManager = new SettingsManager();

// Initialize dashboard
updateTimestamp();
// NOTE: fetchAllData() is now called after config initialization in startDashboard()

// Initialize and start carousel rotation
// Store globally to prevent memory leaks during hot reload
if (window.carouselInstance) {
  window.carouselInstance.stop();
}

// Page and item intervals are now loaded from config
// These variables are set by initializeWithConfig()
let DEFAULT_PAGE_INTERVAL = 30000;
let PAGE_INTERVAL_OVERRIDES = {};
let DEFAULT_ITEM_INTERVAL = 5333;
let ITEM_INTERVAL_OVERRIDES = {};

/**
 * Initialize dashboard with user configuration
 * Loads config.json and sets up all intervals and pages
 */
async function initializeWithConfig() {
    // Load configuration from config.json (or use defaults if not found)
    const config = await loadConfig();
    
    // Update refresh interval from config
    REFRESH_INTERVAL = config.refreshInterval;
    
    // Set up page intervals from config (destructure to exclude 'default' key)
    DEFAULT_PAGE_INTERVAL = config.pageIntervals.default;
    const { default: _, ...pageOverrides } = config.pageIntervals;
    PAGE_INTERVAL_OVERRIDES = pageOverrides;
    
    // Set up item intervals from config (destructure to exclude 'default' key)
    DEFAULT_ITEM_INTERVAL = config.itemIntervals.default;
    const { default: __, ...itemOverrides } = config.itemIntervals;
    ITEM_INTERVAL_OVERRIDES = itemOverrides;
    
    // Log configuration summary
    console.log('📋 Dashboard configuration loaded:');
    console.log(`   - Refresh interval: ${REFRESH_INTERVAL / 1000}s`);
    console.log(`   - Pages: ${config.pages.join(', ')}`);
    console.log(`   - Default page interval: ${DEFAULT_PAGE_INTERVAL / 1000}s`);
    console.log(`   - Default item interval: ${DEFAULT_ITEM_INTERVAL / 1000}s`);
    
    // Initialize carousel with configured pages and intervals
    window.carouselInstance = new CarouselController({
        interval: DEFAULT_PAGE_INTERVAL,
        pages: config.pages,
        pageIntervals: PAGE_INTERVAL_OVERRIDES
    });
}

// Initialize item highlighter
if (window.itemHighlighterInstance) {
  window.itemHighlighterInstance.stop();
}

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

// Initialize status badges for all pages (Enhanced Error UI)
// Badges are positioned in top-left corner as fixed overlay
if (window.statusBadges) {
  // Clean up existing badges if any
  Object.values(window.statusBadges).forEach(badge => badge.destroy());
}

const statusBadgesContainer = document.getElementById('status-badges-overlay');

window.statusBadges = {
  blog: new StatusBadge('blog', statusBadgesContainer),
  changelog: new StatusBadge('changelog', statusBadgesContainer),
  status: new StatusBadge('status', statusBadgesContainer),
  vscode: new StatusBadge('vscode', statusBadgesContainer),
  visualstudio: new StatusBadge('visualstudio', statusBadgesContainer),
  anthropic: new StatusBadge('anthropic', statusBadgesContainer)
};

// Register status change callback to update badges; store unsubscribe for future cleanup
window.statusChangeUnsubscribe = onStatusChange((sourceName, statusData) => {
  if (window.statusBadges && window.statusBadges[sourceName]) {
    window.statusBadges[sourceName].update();
  }
});

// Start all status badges
Object.values(window.statusBadges).forEach(badge => badge.start());

// Initialize theme toggle
window.themeToggleInstance = new ThemeToggle();
window.themeToggleInstance.init();

// Sync theme changes to SettingsManager so the preference is saved in the
// unified 'github-dashboard-settings' key alongside other settings.
window.themeToggleInstance.onThemeChange = (theme) => {
  window.settingsManager.setSetting('theme', theme);
};

// Initialize time-based messages (Easter Egg)
if (window.timeBasedMessagesInstance) {
  // Clean up if exists (hot reload support)
  window.timeBasedMessagesInstance.stop();
  window.timeBasedMessagesInstance = null;
}

window.timeBasedMessagesInstance = new TimeBasedMessages();

// Initialize GitHub Uptime Streak Counter (Easter Egg)
if (window.streakCounterInstance) {
  // Clean up if exists (hot reload support)
  window.streakCounterInstance.stop();
  window.streakCounterInstance = null;
  // Reset initialization flag so new instance will be properly initialized
  window.streakCounterInitialized = false;
}

window.streakCounterInstance = new GitHubStreakCounter();

// Initialize Claude Uptime Streak Counter (Easter Egg)
// Shows days since last major Claude service incident
if (window.claudeStreakCounterInstance) {
  // Clean up if exists (hot reload support)
  window.claudeStreakCounterInstance.stop();
  window.claudeStreakCounterInstance = null;
  // Reset initialization flag so new instance will be properly initialized
  window.claudeStreakCounterInitialized = false;
}

window.claudeStreakCounterInstance = new ClaudeStreakCounter();

// Initialize Octocat cameo Easter egg
// Mona appears every 30 minutes and walks across the bottom of the screen
if (window.octocatCameoInstance) {
  // Clean up if exists (hot reload support)
  window.octocatCameoInstance.stop();
  window.octocatCameoInstance = null;
}

window.octocatCameoInstance = new OctocatCameo();
// Start the Easter egg timer (will trigger every 30 minutes)
window.octocatCameoInstance.start();

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

/**
 * Return the share link for the currently highlighted list item,
 * or null when no item is highlighted.
 * @returns {string|null}
 */
function getHighlightedItemLink() {
    const highlightedItem = document.querySelector('.list-item--highlighted');
    return highlightedItem?.dataset?.link || null;
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
  
  // Check if this is HTML content that should be preserved (like changelog)
  const isHtmlContent = itemElement.dataset.isHtmlContent === 'true';
  
  // Check if we're on the VS Code page - use async content fetching
  const isVSCodePage = activePage.id === 'page-vscode';
  
  // If this is HTML content (like changelog), render it directly with HTML preserved
  if (isHtmlContent && !isVSCodePage) {
    // Render with HTML formatting preserved
    window.detailPanelInstance.render(itemData, { preserveHtml: true });
    console.log(`DetailPanel rendering HTML content for item ${itemIndex}:`, itemData.title);
  } else if (isVSCodePage && itemData.link) {
    // Use async content fetching for VS Code items
    // Hide header since fetched article includes title
    // Show RSS description initially to avoid blank state while full article loads
    window.detailPanelInstance.renderWithAsyncContent(itemData, fetchArticleContent, { hideHeader: true, skipInitialContent: false });
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

/**
 * Start the dashboard after configuration is loaded
 * Sets up callbacks and starts all timers
 */
function startDashboard() {
    // Load persisted settings
    const savedSettings = window.settingsManager.loadSettings();

    // Set carousel callback BEFORE starting (Story 3.2/3.4)
    // This callback is triggered when the page changes (default 30s, extended on Blog/Changelog)
    window.carouselInstance.onPageChange = (pageName) => {
        console.log(`Page changed to: ${pageName}`);

        // Persist the new page so it is restored on next load
        window.settingsManager.setSetting('lastCarouselPage', pageName);
        
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

    // Restore last-viewed carousel page from settings (FR-8)
    if (savedSettings.lastCarouselPage) {
        window.carouselInstance.goToPage(savedSettings.lastCarouselPage);
    }
    
    // Start carousel
    window.carouselInstance.start();
    
    // Start time-based messages (Easter Egg)
    // Independent of carousel and item highlighting (FR-16)
    window.timeBasedMessagesInstance.start();
    
    // ItemHighlighter will be initialized in fetchAllData() after data is loaded
    // This ensures the first item is highlighted immediately when data is ready
    
    // Start per-source auto-refresh timers with configured intervals
    if (window.multiSourceRefreshController) {
        window.multiSourceRefreshController.startAll();
    }
    
    // Note: Global refresh interval controller is initialized for UI controls only
    // (provides "Refresh Now" button functionality). Per-source timers are used for
    // actual automatic refresh, allowing each source to refresh at its own optimal rate.
}

// Initialize with config and start dashboard
initializeWithConfig().then(() => {
    // Get configuration for per-source refresh intervals
    const config = getConfig();
    
    // Create multi-source refresh controller for per-source intervals
    if (window.multiSourceRefreshController) {
        window.multiSourceRefreshController.destroy();
    }
    window.multiSourceRefreshController = new MultiSourceRefreshController({
        refreshIntervals: config.refreshIntervals || {},
        defaultInterval: config.refreshInterval
    });
    
    // Register all data sources with their fetch functions
    window.multiSourceRefreshController.registerSource('blog', fetchBlog);
    window.multiSourceRefreshController.registerSource('changelog', fetchChangelog);
    window.multiSourceRefreshController.registerSource('status', fetchStatus);
    window.multiSourceRefreshController.registerSource('vscode', fetchVSCode);
    window.multiSourceRefreshController.registerSource('visualstudio', fetchVisualStudio);
    window.multiSourceRefreshController.registerSource('anthropic', fetchAnthropic);
    
    // Create refresh interval controller (reads intervals from localStorage,
    // fallback to defaults; user's UI selection takes precedence over config file).
    // This controller manages the UI "Refresh Now" button and global refresh interval
    // The multi-source controller handles actual per-source refresh timers
    if (window.refreshIntervalController) {
        window.refreshIntervalController.destroy();
    }
    window.refreshIntervalController = new RefreshIntervalController({
        onRefresh: fetchAllData,
        onIntervalChange: (newIntervalMs) => {
            // Update default interval for multi-source controller
            // This keeps per-source timers in sync when the user changes the global
            // refresh interval via UI controls (for sources without specific intervals)
            if (window.multiSourceRefreshController) {
                window.multiSourceRefreshController.updateDefaultInterval(newIntervalMs);
            }
            // Keep module-level REFRESH_INTERVAL in sync so the progress bar
            // uses the correct duration after an interval change.
            REFRESH_INTERVAL = newIntervalMs;
            startProgressBar();
        },
        onPageTimerChange: (newIntervalMs) => {
            // Update carousel default interval and reinitialize
            DEFAULT_PAGE_INTERVAL = newIntervalMs;
            if (window.carouselInstance) {
                window.carouselInstance.defaultInterval = newIntervalMs;
                window.carouselInstance.interval = newIntervalMs;
                // Reset timer with new interval if currently on a page without override
                window.carouselInstance.applyIntervalForCurrentPage();
            }
        },
        onCardTimerChange: (newIntervalMs) => {
            // Update item highlighter default interval
            DEFAULT_ITEM_INTERVAL = newIntervalMs;
            if (window.itemHighlighterInstance) {
                window.itemHighlighterInstance.setInterval(newIntervalMs);
            }
        }
    });
    // Sync the progress bar duration to the stored interval on startup
    REFRESH_INTERVAL = window.refreshIntervalController.getInterval();
    // Sync page timer to stored value on startup
    DEFAULT_PAGE_INTERVAL = window.refreshIntervalController.getPageTimer();
    // Sync card timer to stored value on startup
    DEFAULT_ITEM_INTERVAL = window.refreshIntervalController.getCardTimer();
    
    window.refreshIntervalController.init();

    startDashboard();
    // Initial data load after dashboard is initialized
    fetchAllData();
    console.log('🚀 Dashboard started with configuration');
}).catch((error) => {
    console.error('Failed to initialize dashboard:', error);
    // Fall back to defaults from config-loader and start anyway
    const defaults = getDefaultConfig();
    const { default: _, ...defaultPageOverrides } = defaults.pageIntervals;
    window.carouselInstance = new CarouselController({
        interval: defaults.pageIntervals.default,
        pages: defaults.pages,
        pageIntervals: defaultPageOverrides
    });
    // Create controller with defaults even on config failure
    if (!window.refreshIntervalController) {
        window.refreshIntervalController = new RefreshIntervalController({
            onRefresh: fetchAllData,
            onIntervalChange: (newIntervalMs) => {
                REFRESH_INTERVAL = newIntervalMs;
                startProgressBar();
            },
            onPageTimerChange: (newIntervalMs) => {
                DEFAULT_PAGE_INTERVAL = newIntervalMs;
                if (window.carouselInstance) {
                    window.carouselInstance.defaultInterval = newIntervalMs;
                    window.carouselInstance.interval = newIntervalMs;
                    window.carouselInstance.applyIntervalForCurrentPage();
                }
            },
            onCardTimerChange: (newIntervalMs) => {
                DEFAULT_ITEM_INTERVAL = newIntervalMs;
                if (window.itemHighlighterInstance) {
                    window.itemHighlighterInstance.setInterval(newIntervalMs);
                }
            }
        });
        REFRESH_INTERVAL = window.refreshIntervalController.getInterval();
        DEFAULT_PAGE_INTERVAL = window.refreshIntervalController.getPageTimer();
        DEFAULT_ITEM_INTERVAL = window.refreshIntervalController.getCardTimer();
        window.refreshIntervalController.init();
    }
    startDashboard();
});

// Pause button handler
document.getElementById('pauseButton').addEventListener('click', togglePause);

// Spacebar keyboard shortcut for pause/resume
// Provides quick keyboard access for kiosk/TV displays
window.addEventListener('keydown', (event) => {
    // Only trigger on spacebar, ignore if user is typing in an input field or contenteditable element
    if (event.code === 'Space' && 
        event.target.tagName !== 'INPUT' && 
        event.target.tagName !== 'TEXTAREA' &&
        event.target.contentEditable !== 'true') {
        event.preventDefault(); // Prevent page scroll
        
        // Toggle pause state
        togglePause();
        
        // Visual feedback: briefly pulse the pause button
        const pauseButton = document.getElementById('pauseButton');
        if (pauseButton) {
            pauseButton.classList.add('keyboard-activated');
            setTimeout(() => {
                pauseButton.classList.remove('keyboard-activated');
            }, 300);
        }
    }
});

// ============================================================================
// Export/Share Functionality
// ============================================================================

/**
 * Initialize export controller and share modal
 */
function initializeExportFunctionality() {
    exportController = new ExportController();
    
    const shareModal = document.getElementById('shareModal');
    const closeBtn = document.getElementById('closeShareModal');
    const backdrop = shareModal?.querySelector('.share-modal-backdrop');
    
    // Close modal handlers
    if (closeBtn) {
        closeBtn.addEventListener('click', closeShareModal);
    }
    
    if (backdrop) {
        backdrop.addEventListener('click', closeShareModal);
    }
    
    // Export format buttons (now only handles 'link' button)
    const exportButtons = document.querySelectorAll('.btn-export');
    exportButtons.forEach(btn => {
        btn.addEventListener('click', async () => {
            const format = btn.dataset.format;
            await handleExport(format);
        });
    });
    
    // Keyboard shortcut: Ctrl+Shift+S
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === 'S') {
            e.preventDefault();
            // Get currently highlighted item
            const highlightedItem = document.querySelector('.list-item--highlighted');
            if (highlightedItem) {
                const itemData = extractItemData(highlightedItem);
                openShareModal(itemData);
            }
        }
    });
}

/**
 * Open share modal with item data
 * Automatically pauses the dashboard while modal is open
 * Shows QR code immediately and starts 30-second auto-close timer
 * @param {Object} item - Item data
 */
async function openShareModal(item) {
    currentShareItem = item;
    const shareModal = document.getElementById('shareModal');
    const shareTitle = document.getElementById('share-item-title');
    const qrImage = document.getElementById('qrCodeImage');
    const qrTimer = document.getElementById('qrTimer');
    
    // Pause dashboard if not already paused
    if (!isPaused) {
        pausedByShareModal = true;
        togglePause();
    }
    
    if (shareTitle) {
        shareTitle.textContent = item.title || 'Untitled';
    }
    
    // Clear any existing timers
    clearQrDisplayTimers();
    
    // Generate QR code immediately
    if (qrImage && exportController && item.link) {
        try {
            const qrDataUrl = await exportController.generateQRCode(item, 'png');
            qrImage.src = qrDataUrl;
        } catch (error) {
            console.error('Failed to generate QR code:', error);
            // Set a placeholder or error image
            qrImage.alt = 'Failed to load QR code';
        }
    }
    
    if (shareModal) {
        shareModal.removeAttribute('hidden');
    }
    
    // Start 30 second countdown timer
    let secondsRemaining = 30;
    if (qrTimer) {
        qrTimer.textContent = `Auto-closing in ${secondsRemaining} seconds...`;
    }
    
    qrCountdownInterval = setInterval(() => {
        secondsRemaining--;
        if (qrTimer) {
            if (secondsRemaining > 0) {
                qrTimer.textContent = `Auto-closing in ${secondsRemaining} second${secondsRemaining === 1 ? '' : 's'}...`;
            } else {
                qrTimer.textContent = 'Closing...';
            }
        }
    }, 1000);
    
    // Auto-close after 30 seconds
    qrDisplayTimer = setTimeout(() => {
        closeShareModal();
    }, 30000);
}

/**
 * Close share modal
 * Resumes dashboard if it was paused by the modal
 */
function closeShareModal() {
    const shareModal = document.getElementById('shareModal');
    if (shareModal) {
        shareModal.setAttribute('hidden', '');
    }
    
    // Clear any QR display timers
    clearQrDisplayTimers();
    
    // Resume dashboard if we paused it
    if (pausedByShareModal && isPaused) {
        pausedByShareModal = false;
        togglePause();
    }
    
    currentShareItem = null;
}

/**
 * Clear QR display timers
 */
function clearQrDisplayTimers() {
    if (qrDisplayTimer) {
        clearTimeout(qrDisplayTimer);
        qrDisplayTimer = null;
    }
    if (qrCountdownInterval) {
        clearInterval(qrCountdownInterval);
        qrCountdownInterval = null;
    }
}

/**
 * Handle export based on selected format
 * Now only handles 'link' format since QR is shown automatically
 * @param {string} format - Export format ('link')
 */
async function handleExport(format) {
    if (!currentShareItem || !exportController) {
        console.error('No item selected or export controller not initialized');
        return;
    }
    
    try {
        if (format === 'link') {
            await exportController.copyLink(currentShareItem);
            // Don't close modal - let user see the QR code still
            // Timer will auto-close
        }
    } catch (error) {
        console.error('Export error:', error);
        exportController.showToast('Failed to copy link', 'error');
    }
}

// ============================================================================
// Pause QR Widget Functionality
// ============================================================================

/**
 * Show the pause QR widget with QR code for the currently highlighted card's link.
 * Falls back to the dashboard URL when no item is highlighted.
 */
function showPauseQrWidget() {
    const widget = document.getElementById('pauseQrWidget');
    const qrImage = document.getElementById('pauseQrImage');
    const hintEl = widget ? widget.querySelector('.pause-qr-widget__hint') : null;
    
    if (!widget || !qrImage) return;
    
    // Prefer the currently highlighted card's share link (same as share modal)
    const itemLink = getHighlightedItemLink();
    const urlToEncode = itemLink || window.location.href;
    const isItemLink = Boolean(itemLink);
    
    // Use the public QR API (same approach as ExportController for Pi 3B optimization)
    const qrSize = 160;
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&data=${encodeURIComponent(urlToEncode)}`;
    
    // Set QR code image and accessible label
    qrImage.src = qrApiUrl;
    qrImage.alt = isItemLink ? 'Scan to open this item on your device' : 'Scan to open dashboard on your device';
    
    // Update hint text to reflect what the QR code points to
    if (hintEl) {
        hintEl.textContent = isItemLink ? 'Scan to open this item' : 'Scan to view on your device';
    }
    
    // Show the widget with animation
    widget.classList.remove('pause-qr-widget--hiding');
    widget.removeAttribute('hidden');
}

/**
 * Hide the pause QR widget with animation
 */
function hidePauseQrWidget() {
    const widget = document.getElementById('pauseQrWidget');
    if (!widget || widget.hasAttribute('hidden')) return;
    
    // Add hiding animation class
    widget.classList.add('pause-qr-widget--hiding');
    
    // Hide after animation completes
    setTimeout(() => {
        widget.setAttribute('hidden', '');
        widget.classList.remove('pause-qr-widget--hiding');
    }, 200);
}

/**
 * Dismiss the pause QR widget (user closed it)
 * Sets the dismissed flag so it won't reappear until next resume
 */
function dismissPauseQrWidget() {
    pauseQrWidgetDismissed = true;
    hidePauseQrWidget();
}

/**
 * Initialize pause QR widget event handlers
 */
function initializePauseQrWidget() {
    const closeBtn = document.getElementById('closePauseQr');
    const shareBtn = document.getElementById('openFullShareBtn');
    
    // Close button handler
    if (closeBtn) {
        closeBtn.addEventListener('click', dismissPauseQrWidget);
    }
    
    // "Share Current Item" button - opens full share modal for highlighted item
    if (shareBtn) {
        shareBtn.addEventListener('click', () => {
            // Get currently highlighted item
            const highlightedItem = document.querySelector('.list-item--highlighted');
            if (highlightedItem) {
                const itemData = extractItemData(highlightedItem);
                // Hide the widget first, then open full share modal
                hidePauseQrWidget();
                openShareModal(itemData);
            } else {
                // No item highlighted - show toast message
                if (exportController) {
                    exportController.showToast('No item selected to share', 'error');
                }
            }
        });
    }
}

// Initialize export functionality and pause QR widget after DOM is fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initializePauseQrWidget();
        initializeExportFunctionality();
    });
} else {
    // DOM already loaded
    initializePauseQrWidget();
    initializeExportFunctionality();
}

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

// ============================================================================
// SETTINGS PANEL (localStorage persistence - Issue #40)
// ============================================================================

/**
 * Update the storage indicator to reflect whether settings exist in localStorage.
 */
function updateStorageIndicator() {
    const indicator = document.getElementById('storageIndicator');
    if (!indicator) return;

    if (!window.settingsManager.isStorageAvailable()) {
        indicator.textContent = '⚠️ Storage unavailable';
    } else {
        indicator.textContent = window.settingsManager.hasStoredSettings()
            ? '💾 Settings saved locally'
            : '💾 Using defaults';
    }
}

// Toggle settings panel visibility
const settingsButton = document.getElementById('settingsButton');
const settingsPanel = document.getElementById('settingsPanel');

if (settingsButton && settingsPanel) {
    settingsButton.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = settingsPanel.style.display !== 'none';
        settingsPanel.style.display = isOpen ? 'none' : 'flex';
        if (!isOpen) {
            updateStorageIndicator();
        }
    });

    // Close panel when clicking outside
    document.addEventListener('click', (e) => {
        if (!settingsPanel.contains(e.target) && e.target !== settingsButton) {
            settingsPanel.style.display = 'none';
        }
    });
}

// Reset to defaults button
const resetSettingsBtn = document.getElementById('resetSettingsBtn');
if (resetSettingsBtn) {
    resetSettingsBtn.addEventListener('click', () => {
        if (!window.confirm('Reset all settings to defaults?\n\nThis will clear your saved theme, last-viewed page, and any other stored preferences.')) {
            return;
        }

        const success = window.settingsManager.resetToDefaults();
        if (success) {
            // Close panel
            if (settingsPanel) settingsPanel.style.display = 'none';

            // Reload so that defaults are applied cleanly (theme, carousel page, etc.)
            window.location.reload();
        } else {
            window.alert('Failed to reset settings. Please try again.');
        }
    });
}

// Export settings button
const exportSettingsBtn = document.getElementById('exportSettingsBtn');
if (exportSettingsBtn) {
    exportSettingsBtn.addEventListener('click', () => {
        const json = window.settingsManager.exportSettings();
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'github-dashboard-settings.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        if (settingsPanel) settingsPanel.style.display = 'none';
    });
}

// Initialize the storage indicator on load
updateStorageIndicator();
