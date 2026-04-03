/**
 * FIREBASE-CONFIG.JS — Firebase Initialization
 * Connects the frontend to the CivicPulse Firebase project.
 */

const firebaseConfig = {
   apiKey: "AIzaSyAya3NaW5X9dfNbr3RXRtxJ2FWh5dh2Kys",
   authDomain: "mini-project--civic-pulse.firebaseapp.com",
   projectId: "mini-project--civic-pulse",
   storageBucket: "mini-project--civic-pulse.firebasestorage.app",
   messagingSenderId: "701548656681",
   appId: "1:701548656681:web:b6b45b3bedc048bad64438"
};


// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Export commonly used services as global variables
// so auth.js and future scripts can access them directly
const auth = firebase.auth();
const db = firebase.firestore();
// const storage = firebase.storage(); // Uncomment when Blaze plan is activated

const googleProvider = new firebase.auth.GoogleAuthProvider();
googleProvider.addScope('email');
