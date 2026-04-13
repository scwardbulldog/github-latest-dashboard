/**
 * StatusBadge Component
 * Displays real-time health indicators for each data source
 * @module status-badge
 */

import { getSourceStatus } from './api-client.js';
import { formatDate } from './utils.js';

/**
 * StatusBadge class manages per-source status indicators
 */
export class StatusBadge {
  /**
   * Initialize status badge for a data source
   * @param {string} sourceName - Name of the data source (e.g., 'blog', 'changelog')
   * @param {HTMLElement} container - Container element for the badge
   */
  constructor(sourceName, container) {
    this.sourceName = sourceName;
    this.container = container;
    this.updateIntervalId = null;
    
    // Create badge element
    this.element = document.createElement('div');
    this.element.className = 'status-badge';
    this.element.setAttribute('data-source', sourceName);
    
    // Add to container
    if (this.container) {
      this.container.appendChild(this.element);
    }
  }
  
  /**
   * Start real-time updates
   */
  start() {
    // Initial render
    this.update();
    
    // Update every second for countdown timers
    this.updateIntervalId = setInterval(() => this.update(), 1000);
  }
  
  /**
   * Stop real-time updates
   */
  stop() {
    if (this.updateIntervalId) {
      clearInterval(this.updateIntervalId);
      this.updateIntervalId = null;
    }
  }
  
  /**
   * Update badge display
   */
  update() {
    const status = getSourceStatus(this.sourceName);
    this.render(status);
  }
  
  /**
   * Render badge content
   * @param {Object} status - Current status data
   */
  render(status) {
    if (!this.element) return;
    
    // Determine display state and color
    let stateClass = 'status-badge--idle';
    let stateIcon = '';
    let stateText = '';
    let detailText = '';
    
    const now = Date.now();
    
    switch (status.state) {
      case 'success':
      case 'fetching':
        stateClass = 'status-badge--success';
        stateIcon = '🟢';
        stateText = 'Fresh';
        
        if (status.lastFetch > 0) {
          const ageMinutes = Math.floor((now - status.lastFetch) / 60000);
          if (ageMinutes === 0) {
            detailText = 'just now';
          } else if (ageMinutes === 1) {
            detailText = '1 min ago';
          } else if (ageMinutes < 60) {
            detailText = `${ageMinutes} min ago`;
          } else {
            const ageHours = Math.floor(ageMinutes / 60);
            detailText = ageHours === 1 ? '1 hr ago' : `${ageHours} hrs ago`;
          }
        }
        break;
        
      case 'retrying':
        stateClass = 'status-badge--retrying';
        stateIcon = '🟡';
        stateText = 'Retrying';
        
        if (status.nextRetry && status.nextRetry > now) {
          const secondsToRetry = Math.ceil((status.nextRetry - now) / 1000);
          detailText = `attempt ${status.retryAttempt}/3, next in ${secondsToRetry}s`;
        } else {
          detailText = `attempt ${status.retryAttempt}/3`;
        }
        break;
        
      case 'cached':
        // Determine if cache is stale (> 1 hour old)
        const cacheAgeHours = status.cacheAge / (60 * 60 * 1000);
        
        if (cacheAgeHours > 1) {
          stateClass = 'status-badge--stale';
          stateIcon = '🟠';
          stateText = 'Stale';
          detailText = `${Math.floor(cacheAgeHours)}+ hrs old`;
        } else {
          stateClass = 'status-badge--cached';
          stateIcon = '🟡';
          stateText = 'Cached';
          const ageMinutes = Math.floor(status.cacheAge / 60000);
          detailText = ageMinutes === 1 ? '1 min old' : `${ageMinutes} min old`;
        }
        break;
        
      case 'failed':
        stateClass = 'status-badge--failed';
        stateIcon = '🔴';
        stateText = 'Failed';
        detailText = 'no data';
        break;
        
      case 'idle':
      default:
        stateClass = 'status-badge--idle';
        stateIcon = '⚪';
        stateText = 'Idle';
        detailText = '';
        break;
    }
    
    // Update badge classes
    this.element.className = `status-badge ${stateClass}`;
    
    // Update badge content using DOM manipulation (safer than innerHTML)
    // Clear existing content
    this.element.textContent = '';
    
    // Create icon span
    const iconSpan = document.createElement('span');
    iconSpan.className = 'status-badge__icon';
    iconSpan.textContent = stateIcon;
    this.element.appendChild(iconSpan);
    
    // Create text container
    const textSpan = document.createElement('span');
    textSpan.className = 'status-badge__text';
    
    // Create state span
    const stateSpan = document.createElement('span');
    stateSpan.className = 'status-badge__state';
    stateSpan.textContent = stateText;
    textSpan.appendChild(stateSpan);
    
    // Add detail span if needed
    if (detailText) {
      const detailSpan = document.createElement('span');
      detailSpan.className = 'status-badge__detail';
      detailSpan.textContent = `(${detailText})`;
      textSpan.appendChild(detailSpan);
    }
    
    this.element.appendChild(textSpan);
  }
  
  /**
   * Clean up resources
   */
  destroy() {
    this.stop();
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    this.element = null;
    this.container = null;
  }
}
