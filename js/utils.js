// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in meters
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
}

/**
 * Format distance for display
 * @param {number} meters - Distance in meters
 * @returns {string} Formatted distance string
 */
export function formatDistance(meters) {
    if (meters < 1000) {
        return `${Math.round(meters)} m`;
    }
    return `${(meters / 1000).toFixed(1)} km`;
}

/**
 * Calculate bearing between two points
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Bearing in degrees (0-360)
 */
export function calculateBearing(lat1, lon1, lat2, lon2) {
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const y = Math.sin(Δλ) * Math.cos(φ2);
    const x = Math.cos(φ1) * Math.sin(φ2) -
        Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
    const θ = Math.atan2(y, x);

    return (θ * 180 / Math.PI + 360) % 360;
}

/**
 * Find closest point on a polyline to a given point
 * @param {Array} point - [lat, lng] of the point
 * @param {Array} polyline - Array of [lat, lng] coordinates
 * @returns {Object} {point: [lat, lng], index: number, distance: number}
 */
export function findClosestPointOnRoute(point, polyline) {
    let minDistance = Infinity;
    let closestPoint = null;
    let closestIndex = 0;

    for (let i = 0; i < polyline.length - 1; i++) {
        const segmentStart = polyline[i];
        const segmentEnd = polyline[i + 1];
        const projected = projectPointOnSegment(point, segmentStart, segmentEnd);
        const distance = calculateDistance(point[0], point[1], projected[0], projected[1]);

        if (distance < minDistance) {
            minDistance = distance;
            closestPoint = projected;
            closestIndex = i;
        }
    }

    return { point: closestPoint, index: closestIndex, distance: minDistance };
}

/**
 * Project a point onto a line segment
 * @param {Array} point - [lat, lng]
 * @param {Array} segmentStart - [lat, lng]
 * @param {Array} segmentEnd - [lat, lng]
 * @returns {Array} Projected point [lat, lng]
 */
function projectPointOnSegment(point, segmentStart, segmentEnd) {
    const [lat, lng] = point;
    const [lat1, lng1] = segmentStart;
    const [lat2, lng2] = segmentEnd;

    const dx = lng2 - lng1;
    const dy = lat2 - lat1;

    if (dx === 0 && dy === 0) {
        return segmentStart;
    }

    const t = Math.max(0, Math.min(1,
        ((lng - lng1) * dx + (lat - lat1) * dy) / (dx * dx + dy * dy)
    ));

    return [lat1 + t * dy, lng1 + t * dx];
}

/**
 * Calculate distance along route from a point to the end
 * @param {Array} startPoint - [lat, lng]
 * @param {number} startIndex - Index in route array
 * @param {Array} route - Full route coordinates
 * @returns {number} Distance in meters
 */
export function calculateRouteDistance(startPoint, startIndex, route) {
    let distance = 0;

    // Distance from start point to next route point
    if (startIndex < route.length - 1) {
        distance += calculateDistance(
            startPoint[0], startPoint[1],
            route[startIndex + 1][0], route[startIndex + 1][1]
        );
    }

    // Sum distances for remaining segments
    for (let i = startIndex + 1; i < route.length - 1; i++) {
        distance += calculateDistance(
            route[i][0], route[i][1],
            route[i + 1][0], route[i + 1][1]
        );
    }

    return distance;
}

/**
 * Format time duration
 * @param {number} minutes - Duration in minutes
 * @returns {string} Formatted time string
 */
export function formatDuration(minutes) {
    if (minutes < 1) {
        return 'Arriving now';
    }
    if (minutes < 60) {
        return `${Math.round(minutes)} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
}

/**
 * Format timestamp to readable time
 * @param {number} timestamp - Unix timestamp in milliseconds
 * @returns {string} Formatted time string
 */
export function formatTime(timestamp) {
    if (!timestamp) return '--:--';
    const date = new Date(timestamp);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const time = date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });

    // If today, show "Today at HH:MM AM/PM"
    if (date >= today) {
        return `Today at ${time}`;
    }
    // If yesterday, show "Yesterday at HH:MM AM/PM"
    else if (date >= yesterday) {
        return `Yesterday at ${time}`;
    }
    // Otherwise show full date
    else {
        const dateStr = date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
        return `${dateStr} at ${time}`;
    }
}

/**
 * Format date
 * @param {number} timestamp - Unix timestamp in milliseconds
 * @returns {string} Formatted date string
 */
export function formatDate(timestamp) {
    if (!timestamp) return '--';
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

/**
 * Get relative time (e.g., "2 minutes ago")
 * @param {number} timestamp - Unix timestamp in milliseconds
 * @returns {string} Relative time string
 */
export function getRelativeTime(timestamp) {
    if (!timestamp) return 'Unknown';

    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 10) return 'Just now';
    if (seconds < 60) return `${seconds} seconds ago`;
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return `${days} day${days > 1 ? 's' : ''} ago`;
}

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function
 * @param {Function} func - Function to throttle
 * @param {number} limit - Limit in milliseconds
 * @returns {Function} Throttled function
 */
export function throttle(func, limit) {
    let inThrottle;
    return function (...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Show toast notification
 * @param {string} message - Message to display
 * @param {string} type - Type: 'success', 'error', 'warning', 'info'
 * @param {number} duration - Duration in milliseconds
 */
export function showToast(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type} animate-slideInRight`;
    toast.innerHTML = `
    <div class="toast-content">
      <i class="fas fa-${getToastIcon(type)}"></i>
      <span>${message}</span>
    </div>
  `;

    // Add toast container if it doesn't exist
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    container.appendChild(toast);

    // Remove toast after duration
    setTimeout(() => {
        toast.classList.add('notification-exit');
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

function getToastIcon(type) {
    const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };
    return icons[type] || 'info-circle';
}

/**
 * Local storage helpers with error handling
 */
export const storage = {
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('Storage set error:', e);
            return false;
        }
    },

    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.error('Storage get error:', e);
            return defaultValue;
        }
    },

    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.error('Storage remove error:', e);
            return false;
        }
    },

    clear() {
        try {
            localStorage.clear();
            return true;
        } catch (e) {
            console.error('Storage clear error:', e);
            return false;
        }
    }
};

/**
 * Generate unique ID
 * @returns {string} Unique ID
 */
export function generateId() {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Validate email
 * @param {string} email
 * @returns {boolean}
 */
export function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

/**
 * Validate phone number (Bangladesh)
 * @param {string} phone
 * @returns {boolean}
 */
export function isValidPhone(phone) {
    const re = /^(\+88)?01[3-9]\d{8}$/;
    return re.test(phone);
}

/**
 * Get appropriate speed based on GPS speed value
 * @param {number} gpsSpeed - Speed from GPS in m/s
 * @returns {number} Speed in km/h (fallback to 20 if invalid)
 */
export function normalizeSpeed(gpsSpeed) {
    // Convert m/s to km/h
    const speedKmh = gpsSpeed * 3.6;

    // If speed is unrealistic or null, use default
    if (!speedKmh || speedKmh < 0 || speedKmh > 100) {
        return 20; // Default bus speed
    }

    return Math.round(speedKmh);
}

console.log('✅ Utility functions loaded');
