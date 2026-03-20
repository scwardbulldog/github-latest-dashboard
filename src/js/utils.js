/**
 * Format a date string to a relative time format (e.g., "2 hours ago", "3 days ago")
 * @param {string} dateString - ISO date string to format
 * @returns {string} Formatted relative time string
 */
export function formatDate(dateString) {
    // Handle null, undefined, or invalid date strings
    if (!dateString || dateString === 'null') {
        return 'Unknown date';
    }
    
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
        return 'Unknown date';
    }
    
    // Check if date is suspiciously old (before 1970) - likely invalid
    if (date.getFullYear() < 1970) {
        return 'Unknown date';
    }
    
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
        const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
        if (diffHours === 0) {
            const diffMinutes = Math.floor(diffTime / (1000 * 60));
            return diffMinutes <= 1 ? 'Just now' : `${diffMinutes} minutes ago`;
        }
        return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
    } else if (diffDays === 1) {
        return 'Yesterday';
    } else if (diffDays < 7) {
        return `${diffDays} days ago`;
    }
    
    return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
    });
}

/**
 * Strip HTML tags from a string
 * @param {string} html - HTML string to strip tags from
 * @returns {string} Plain text content without HTML tags
 */
export function stripHtml(html) {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
}

/**
 * Truncate text to a maximum length and add ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length before truncation
 * @returns {string} Truncated text with ellipsis if needed
 */
export function truncate(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}
