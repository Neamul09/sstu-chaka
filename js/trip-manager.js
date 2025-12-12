// ============================================
// TRIP MANAGER MODULE
// Handles trip state persistence and restoration
// ============================================

import { db, ref, set, get } from './config.js';
import { showToast } from './utils.js';

class TripManager {
    constructor() {
        this.currentTripId = null;
        this.isTracking = false;
        this.watchId = null;
        this.currentUser = null;
    }

    /**
     * Initialize trip manager with user
     */
    init(user) {
        this.currentUser = user;
    }

    /**
     * Check for and restore active trip on page load
     * ONLY restores trips that are:
     * - Active or paused
     * - Started within last 12 hours
     * - Not completed (no endTime)
     */
    async restoreActiveTrip() {
        if (!this.currentUser?.assignedBus) {
            console.log('No bus assigned to driver');
            return null;
        }

        try {
            const tripsRef = ref(db, 'trips');
            const snapshot = await get(tripsRef);

            if (!snapshot.exists()) {
                console.log('No trips in database');
                return null;
            }

            const trips = snapshot.val();
            const now = Date.now();
            const twelveHoursAgo = now - (12 * 60 * 60 * 1000); // 12 hours

            let activeTrip = null;
            let activeTripId = null;

            Object.entries(trips).forEach(([tripId, tripData]) => {
                // Strict checks to prevent restoring old/completed trips
                const isRecentTrip = tripData.startTime && tripData.startTime > twelveHoursAgo;
                const isActiveStatus = tripData.status === 'active' || tripData.status === 'paused';
                const isNotCompleted = !tripData.endTime;
                const isMyTrip = tripData.driverId === this.currentUser.uid;
                const isNewer = !activeTrip || tripData.startTime > activeTrip.startTime;

                if (isMyTrip && isActiveStatus && isRecentTrip && isNotCompleted && isNewer) {
                    activeTrip = tripData;
                    activeTripId = tripId;
                }
            });

            if (activeTrip) {
                this.currentTripId = activeTripId;
                this.isTracking = activeTrip.status === 'active';

                const tripAge = Math.round((now - activeTrip.startTime) / (1000 * 60)); // minutes
                console.log(`✅ Restored trip from ${tripAge} minutes ago - Status: ${activeTrip.status}`);

                return {
                    tripId: activeTripId,
                    tripData: activeTrip,
                    shouldResumeGPS: activeTrip.status === 'active'
                };
            }

            console.log('No recent active trips found to restore');
            return null;
        } catch (error) {
            console.error('Error restoring active trip:', error);
            showToast('Could not restore trip state', 'warning');
            return null;
        }
    }

    /**
     * Start a new trip
     */
    async startTrip() {
        if (!this.currentUser?.assignedBus) {
            throw new Error('No bus assigned');
        }

        this.currentTripId = `trip_${Date.now()}`;
        const tripRef = ref(db, `trips/${this.currentTripId}`);

        await set(tripRef, {
            busId: this.currentUser.assignedBus,
            driverId: this.currentUser.uid,
            driverName: this.currentUser.displayName || 'Driver',
            startTime: Date.now(),
            status: 'active',
            lastUpdate: Date.now()
        });

        this.isTracking = true;
        return this.currentTripId;
    }

    /**
     * Update trip status
     */
    async updateTripStatus(status) {
        if (!this.currentTripId) return;

        const tripRef = ref(db, `trips/${this.currentTripId}`);
        const snapshot = await get(tripRef);

        if (snapshot.exists()) {
            const tripData = snapshot.val();
            const updates = {
                ...tripData,
                status,
                lastUpdate: Date.now()
            };

            if (status === 'completed') {
                updates.endTime = Date.now();
            } else if (status === 'paused') {
                updates.pausedAt = Date.now();
            } else if (status === 'active' && tripData.pausedAt) {
                updates.resumedAt = Date.now();
            }

            await set(tripRef, updates);
        }
    }

    /**
     * End current trip
     */
    async endTrip() {
        if (!this.currentTripId) return;

        await this.updateTripStatus('completed');

        this.isTracking = false;
        const endedTripId = this.currentTripId;
        this.currentTripId = null;

        return endedTripId;
    }

    /**
     * Pause current trip
     */
    async pauseTrip() {
        if (!this.currentTripId) return;

        await this.updateTripStatus('paused');
        this.isTracking = false;
    }

    /**
     * Resume paused trip
     */
    async resumeTrip() {
        if (!this.currentTripId) return;

        await this.updateTripStatus('active');
        this.isTracking = true;
    }

    /**
     * Get current trip info
     */
    async getCurrentTripInfo() {
        if (!this.currentTripId) return null;

        const tripRef = ref(db, `trips/${this.currentTripId}`);
        const snapshot = await get(tripRef);

        return snapshot.exists() ? snapshot.val() : null;
    }

    /**
     * Get trip statistics
     */
    async getTripStats() {
        const tripInfo = await this.getCurrentTripInfo();

        if (!tripInfo) return null;

        const duration = Date.now() - tripInfo.startTime;
        const hours = Math.floor(duration / (1000 * 60 * 60));
        const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));

        return {
            duration: `${hours}h ${minutes}m`,
            startTime: tripInfo.startTime,
            status: tripInfo.status
        };
    }

    /**
     * Check if currently tracking
     */
    isCurrentlyTracking() {
        return this.isTracking;
    }

    /**
     * Get current trip ID
     */
    getCurrentTripId() {
        return this.currentTripId;
    }
}

// Export singleton instance
export const tripManager = new TripManager();
