/**
 * Persistent Alert Component
 * Displays critical GitHub outages as scrolling news ticker in header
 * @module persistent-alert
 */

/**
 * PersistentAlert class manages the cross-page outage ticker
 */
export class PersistentAlert {
  /**
   * Initialize persistent alert component
   */
  constructor() {
    this.element = document.getElementById('persistent-alert');
    this.trackElement = document.getElementById('persistent-alert-track');
    this.currentOutages = null;
    
    if (!this.element) {
      console.error('PersistentAlert: Element with id "persistent-alert" not found');
    }
    if (!this.trackElement) {
      console.error('PersistentAlert: Track element with id "persistent-alert-track" not found');
    }
  }
  
  /**
   * Show the outage indicator with provided data
   * @param {Object} outageData - Outage information
   * @param {string} outageData.severity - Severity level ('major_outage' or 'degraded_performance')
   * @param {number} outageData.count - Number of affected services
   * @param {Array} outageData.services - Array of affected services with name and status
   */
  show(outageData) {
    if (!this.element || !this.trackElement) return;
    
    this.currentOutages = outageData;
    this.render();
    
    // Show immediately (no opacity transition needed in header)
    this.element.style.display = 'block';
  }
  
  /**
   * Hide the outage indicator
   */
  hide() {
    if (!this.element) return;
    
    // Hide immediately
    this.element.style.display = 'none';
    this.currentOutages = null;
    
    // Stop any scrolling animation
    if (this.trackElement) {
      this.trackElement.classList.remove('persistent-alert__track--scrolling');
    }
  }
  
  /**
   * Render the indicator content as scrolling news ticker
   */
  render() {
    if (!this.element || !this.trackElement || !this.currentOutages) return;
    
    const { severity, services } = this.currentOutages;
    
    // Apply severity-specific styling class
    this.element.className = 'persistent-alert';
    if (severity === 'major_outage') {
      this.element.classList.add('persistent-alert--major');
    } else {
      this.element.classList.add('persistent-alert--degraded');
    }
    
    // Generate ticker content with clear separators
    const separator = ' • ';
    const tickerItems = services.map(service => {
      const statusText = this.formatStatus(service.status);
      return `⚠️ GitHub ${service.name}: ${statusText}`;
    });
    
    // Join items with separator
    const tickerContent = tickerItems.join(separator);
    
    // Set content (duplicate for seamless loop if scrolling)
    this.trackElement.textContent = tickerContent;
    
    // Check if scrolling is needed after render
    requestAnimationFrame(() => {
      this.checkScrolling(tickerContent, separator);
    });
  }
  
  /**
   * Check if scrolling is needed and enable it
   * @param {string} tickerContent - The ticker text content
   * @param {string} separator - Separator between items
   */
  checkScrolling(tickerContent, separator) {
    if (!this.trackElement || !this.element) return;
    
    // Measure content width vs container width
    const containerWidth = this.element.offsetWidth;
    const contentWidth = this.trackElement.offsetWidth;
    
    // If content overflows, enable scrolling with duplicated content
    if (contentWidth > containerWidth - 32) { // Account for padding
      // Duplicate content for seamless loop
      this.trackElement.textContent = tickerContent + separator + tickerContent;
      this.trackElement.classList.add('persistent-alert__track--scrolling');
    } else {
      // Content fits, no scrolling needed
      this.trackElement.classList.remove('persistent-alert__track--scrolling');
    }
  }
  
  /**
   * Format status text for display
   * @param {string} status - Raw status value
   * @returns {string} Formatted status text
   */
  formatStatus(status) {
    switch (status) {
      case 'major_outage':
        return 'Major Outage';
      case 'degraded_performance':
        return 'Degraded Performance';
      case 'partial_outage':
        return 'Partial Outage';
      case 'under_maintenance':
        return 'Under Maintenance';
      default:
        return status;
    }
  }
}
