// ============================================
//AUTHENTICATION MODULE
// ============================================

import {
    auth,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from './config.js';

import { db, ref, set, get } from './config.js';
import { showToast } from './utils.js';

// Current user state
let currentUser = null;

/**
 * Initialize authentication state listener
 */
export function initAuth(callback) {
    return onAuthStateChanged(auth, async (user) => {
        if (user) {
            currentUser = user;

            try {
                const userRef = ref(db, `drivers/${user.uid}`);
                const snapshot = await get(userRef);

                if (snapshot.exists()) {
                    const userData = snapshot.val();
                    currentUser.role = userData.role || 'driver';
                    currentUser.assignedBus = userData.assignedBus;
                    currentUser.displayName = userData.name || user.displayName;
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            }

            callback(currentUser);
        } else {
            currentUser = null;
            callback(null);
        }
    });
}

/**
 * Login
 */
export async function login(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        showToast('Login successful!', 'success');
        return userCredential.user;
    } catch (error) {
        console.error('Login error:', error);
        let message = 'Login failed';

        switch (error.code) {
            case 'auth/invalid-credential':
            case 'auth/wrong-password':
            case 'auth/user-not-found':
                message = 'Invalid email or password';
                break;
            case 'auth/too-many-requests':
                message = 'Too many attempts. Try again later';
                break;
            default:
                message = error.message;
        }

        showToast(message, 'error');
        throw error;
    }
}

/**
 * Logout
 */
export async function logout() {
    try {
        await signOut(auth);
        currentUser = null;
        showToast('Logged out successfully', 'info');
    } catch (error) {
        console.error('Logout error:', error);
        showToast('Error logging out', 'error');
        throw error;
    }
}

/**
 * Get current user
 */
export function getCurrentUser() {
    return currentUser;
}

/**
 * Check if authenticated
 */
export function isAuthenticated() {
    return currentUser !== null;
}

/**
 * Require authentication
 */
export function requireDriver() {
    if (!auth.currentUser) {
        window.location.href = './login.html';
        return false;
    }
    return true;
}

/**
 * Export auth for direct use
 */
export { auth };

console.log('✅ Authentication module loaded');
