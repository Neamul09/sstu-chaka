// ============================================
// ETA CALCULATOR - Improved Algorithm
// ============================================

import { calculateDistance, findClosestPointOnRoute, calculateRouteDistance } from './utils.js';
import { routeCoords } from '../data/route.js';

/**
 * Calculate ETA for a stop considering actual route
 * @param {Object} busPosition - {lat, lng}
 * @param {Object} stop - {lat, lng}
 * @param {number} currentSpeed - Speed in km/h
 * @param {Array} speedHistory - Array of recent speeds for averaging
 * @returns {Object} {eta: minutes, distance: meters, status: string}
 */
export function calculateETA(busPosition, stop, currentSpeed, speedHistory = [], routePath = routeCoords) {
    // Find bus position on route
    const busOnRoute = findClosestPointOnRoute([busPosition.lat, busPosition.lng], routePath);

    // Find stop position on route
    const stopOnRoute = findClosestPointOnRoute([stop.lat, stop.lng], routePath);

    // If bus is past the stop
    if (busOnRoute.index >= stopOnRoute.index) {
        const distance = calculateDistance(busPosition.lat, busPosition.lng, stop.lat, stop.lng);
        if (distance < 50) { // Within 50m
            return {
                eta: 0,
                distance: distance,
                status: 'arriving'
            };
        } else {
            return {
                eta: null,
                distance: distance,
                status: 'passed'
            };
        }
    }

    // Calculate distance along route from bus to stop
    const distanceToStop = calculateRouteDistanceToStop(
        busOnRoute.point,
        busOnRoute.index,
        stopOnRoute.point,
        stopOnRoute.index,
        routePath // Pass path to helper
    );

    // Calculate average speed (use last 5 readings)
    const avgSpeed = calculateAverageSpeed(currentSpeed, speedHistory);

    // Use a minimum effective speed of 5 km/h for ETA to prevent infinity/massive spikes when stopped
    // This assumes "Traffic/Stop" delay rather than "Never arriving"
    const effectiveSpeed = Math.max(avgSpeed, 5);

    // Convert speed from km/h to m/s
    const speedMps = (effectiveSpeed * 1000) / 3600;

    // Calculate ETA in minutes
    const etaMinutes = distanceToStop / speedMps / 60;

    // Determine status
    let status = 'en-route';
    if (etaMinutes !== null) {
        if (etaMinutes < 2) status = 'arriving-soon';
        else if (etaMinutes < 5) status = 'nearby';
    }

    const isNext = status !== 'passed' && distanceToStop > 0;

    return {
        eta: etaMinutes ? Math.round(etaMinutes) : null,
        distance: Math.round(distanceToStop),
        status: status,
        speed: avgSpeed,
        isNext: isNext
    };
}

/**
 * Calculate distance along route between two points
 * @param {Array} startPoint - [lat, lng]
 * @param {number} startIndex
 * @param {Array} endPoint - [lat, lng]
 * @param {number} endIndex
 * @param {Array} routePath - Array of route coordinates
 * @returns {number} Distance in meters
 */
function calculateRouteDistanceToStop(startPoint, startIndex, endPoint, endIndex, routePath) {
    let distance = 0;

    // Distance from start point to next route vertex
    if (startIndex < routePath.length - 1) {
        distance += calculateDistance(
            startPoint[0], startPoint[1],
            routePath[startIndex + 1][0], routePath[startIndex + 1][1]
        );
    }

    // Sum all intermediate segments
    for (let i = startIndex + 1; i < endIndex; i++) {
        distance += calculateDistance(
            routePath[i][0], routePath[i][1],
            routePath[i + 1][0], routePath[i + 1][1]
        );
    }

    // Distance from last route vertex to end point
    if (endIndex < routePath.length) {
        distance += calculateDistance(
            routePath[endIndex][0], routePath[endIndex][1],
            endPoint[0], endPoint[1]
        );
    }

    return distance;
}

/**
 * Calculate average speed from recent readings
 * @param {number} currentSpeed - Current speed in km/h
 * @param {Array} speedHistory - Array of recent speeds
 * @returns {number} Average speed in km/h
 */
function calculateAverageSpeed(currentSpeed, speedHistory) {
    // If no history, use current speed
    if (!speedHistory || speedHistory.length === 0) {
        return currentSpeed || 25; // Default to 25 km/h
    }

    // Take last 5 readings
    const recentSpeeds = speedHistory.slice(-5);

    // Add current speed
    recentSpeeds.push(currentSpeed);

    // Filter out invalid speeds (e.g. GPS glitches > 150km/h), but KEEP 0 (stopped)
    const validSpeeds = recentSpeeds.filter(s => s >= 0 && s < 150);

    if (validSpeeds.length === 0) {
        return 25; // Default if no valid data
    }

    // Calculate average
    const sum = validSpeeds.reduce((acc, speed) => acc + speed, 0);
    return sum / validSpeeds.length;
}

/**
 * Calculate ETA range (min and max)
 * @param {number} eta - ETA in minutes
 * @returns {Object} {min, max}
 */
export function calculateETARange(eta) {
    if (eta === null || eta === undefined) {
        return { min: null, max: null };
    }

    // ±20% variance for realistic range
    const variance = Math.ceil(eta * 0.2);
    return {
        min: Math.max(0, eta - variance),
        max: eta + variance
    };
}

/**
 * Format ETA for display
 * @param {number} eta - ETA in minutes
 * @param {string} status - Status string
 * @returns {string} Formatted ETA string
 */
export function formatETA(eta, status) {
    if (status === 'passed') {
        return 'Passed';
    }

    if (status === 'arriving' || eta === 0) {
        return 'Arriving now';
    }

    if (status === 'arriving-soon' || eta < 2) {
        return `<span class="eta-urgent">Arriving in ${eta} min</span>`;
    }

    if (eta === null) {
        return 'Calculating...';
    }

    // User requested single time prediction instead of range
    return `${Math.round(eta)} min`;
}

/**
 * Get ETA status badge class
 * @param {string} status
 * @returns {string} CSS class name
 */
export function getETAStatusClass(status) {
    const statusClasses = {
        'arriving': 'badge-danger pulse',
        'arriving-soon': 'badge-warning pulse',
        'nearby': 'badge-info',
        'en-route': 'badge-success',
        'passed': 'badge'
    };

    return statusClasses[status] || 'badge';
}

/**
 * Calculate total trip progress
 * @param {Object} busPosition - {lat, lng}
 * @param {Array} routeCoords - Array of route coordinates
 * @returns {Object} {percentage: 0-100, covered: km, remaining: km}
 */
export function calculateTripProgress(busPosition, routeCoords) {
    const busOnRoute = findClosestPointOnRoute([busPosition.lat, busPosition.lng], routeCoords);

    // Calculate distance from start to bus position
    let distanceCovered = 0;
    for (let i = 0; i < busOnRoute.index; i++) {
        distanceCovered += calculateDistance(
            routeCoords[i][0], routeCoords[i][1],
            routeCoords[i + 1][0], routeCoords[i + 1][1]
        );
    }

    // Add distance from last vertex to bus position
    if (busOnRoute.index < routeCoords.length) {
        distanceCovered += calculateDistance(
            routeCoords[busOnRoute.index][0], routeCoords[busOnRoute.index][1],
            busOnRoute.point[0], busOnRoute.point[1]
        );
    }

    // Calculate total route distance
    let totalDistance = 0;
    for (let i = 0; i < routeCoords.length - 1; i++) {
        totalDistance += calculateDistance(
            routeCoords[i][0], routeCoords[i][1],
            routeCoords[i + 1][0], routeCoords[i + 1][1]
        );
    }

    const percentage = Math.min(100, Math.max(0, (distanceCovered / totalDistance) * 100));
    const covered = distanceCovered / 1000; // Convert to km
    const remaining = (totalDistance - distanceCovered) / 1000; // Convert to km

    return {
        percentage,
        covered,
        remaining
    };
}

/**
 * Speed history manager
 */
export class SpeedTracker {
    constructor(maxHistory = 10) {
        this.history = [];
        this.maxHistory = maxHistory;
    }

    addSpeed(speed) {
        if (speed > 0 && speed < 100) {
            this.history.push(speed);

            // Keep only last N readings
            if (this.history.length > this.maxHistory) {
                this.history.shift();
            }
        }
    }

    getHistory() {
        return this.history;
    }

    getAverage() {
        if (this.history.length === 0) return 25;
        const sum = this.history.reduce((acc, speed) => acc + speed, 0);
        return sum / this.history.length;
    }

    clear() {
        this.history = [];
    }
}

console.log('✅ ETA Calculator loaded');
