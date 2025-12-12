// ============================================
// FIREBASE CONFIGURATION MODULE
// ============================================

// NOTE: Replace these values with your own Firebase project credentials
// After creating your Firebase project, you'll get these values from:
// Firebase Console > Project Settings > General > Your apps > SDK setup and configuration

const firebaseConfig = {
    apiKey: "AIzaSyBrS3OZTGRuMNksEjGAktIk5CxlWgT3-_s",
    authDomain: "sstu-chaka.firebaseapp.com",
    databaseURL: "https://sstu-chaka-default-rtdb.asia-southeast1.firebasedatabase.app",  // Asia-Southeast1 (Singapore) - Best for Bangladesh!
    projectId: "sstu-chaka",
    storageBucket: "sstu-chaka.firebasestorage.app",
    messagingSenderId: "981907203512",
    appId: "1:981907203512:web:0474e6b53cd95d26d49b4d",
    measurementId: "G-HKY78EQ60P"
};

// Initialize Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// Initialize Firebase app
export const app = initializeApp(firebaseConfig);

// Initialize services
export const db = getDatabase(app);
export const auth = getAuth(app);

// Export Firebase SDK modules for use in other files
export {
    ref,
    set,
    get,
    update,
    remove,
    onValue,
    off,
    push,
    serverTimestamp,
    onDisconnect
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

export {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    sendPasswordResetEmail,
    updateProfile
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// Connection status monitoring - Simplified approach
import { ref as dbRef, onValue as onValueDb } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

export function monitorConnection(callback) {
    // Simple approach: assume connected if we can create a ref
    // More reliable than .info/connected which requires special permissions
    try {
        const testRef = dbRef(db, 'buses');
        if (testRef) {
            // Connected
            callback(true);

            // Listen for value changes to detect disconnection
            const unsubscribe = onValueDb(testRef,
                () => callback(true),  // On success
                (error) => {
                    console.warn('Connection error:', error);
                    callback(false);  // On error
                }
            );
        } else {
            callback(false);
        }
    } catch (error) {
        console.error('Connection monitoring error:', error);
        callback(false);
    }
}

// Helper function to check if Firebase is configured
export function isFirebaseConfigured() {
    return firebaseConfig.apiKey !== "YOUR_API_KEY_HERE";
}

console.log('✅ Firebase modules loaded');
if (!isFirebaseConfigured()) {
    console.warn('⚠️ Firebase not configured yet. Please update config.js with your Firebase credentials.');
}
