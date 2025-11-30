// Declare global firebase object since we are loading it via script tags
declare global {
  interface Window {
    firebase: any;
  }
}

// ⭐ UPDATED FIREBASE CONFIGURATION
const firebaseConfig = {
  apiKey: "AIzaSyBhBmooW_emzQ6BWmB-PKKflwimPxLqDXo",
  authDomain: "prizio-basic.firebaseapp.com",
  projectId: "prizio-basic",
  storageBucket: "prizio-basic.firebasestorage.app",
  messagingSenderId: "1067173777504",
  appId: "1:1067173777504:web:5af14e592fda0daab23305",
  measurementId: "G-KVLSRMEXME"
};

let auth: any = null;
let db: any = null;

// robust mock user
export const mockUser = {
  uid: 'demo-user-123',
  displayName: 'Guest User',
  email: 'guest@savepath.app',
  photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
};

export const initFirebase = () => {
  if (typeof window !== 'undefined' && window.firebase) {
    if (!window.firebase.apps.length) {
      window.firebase.initializeApp(firebaseConfig);
    }
    auth = window.firebase.auth();
    db = window.firebase.firestore();
  } else {
    // Silent fail if SDK not loaded yet
  }
};

// Initialize immediately
initFirebase();

export const signInWithGoogle = async () => {
  if (!auth) initFirebase();
  
  // If SDK failed to load completely
  if (!auth) {
    console.warn("Firebase Auth not initialized. Using Mock User.");
    return mockUser;
  }

  const provider = new window.firebase.auth.GoogleAuthProvider();
  
  try {
    const result = await auth.signInWithPopup(provider);
    return result.user;
  } catch (error: any) {
    const errorCode = error.code || '';
    const errorMessage = error.message || '';

    // Check for Environment/Popup blocking errors -> Use Mock Fallback
    const isBlocking = 
      errorCode === 'auth/operation-not-supported-in-this-environment' ||
      errorCode === 'auth/popup-blocked' ||
      errorCode === 'auth/unauthorized-domain' ||
      errorCode === 'auth/cancelled-popup-request' ||
      errorMessage.includes('protocol') ||
      errorMessage.includes('environment');

    if (isBlocking) {
      console.warn(`Environment restriction detected (${errorCode}). Logging in as Guest.`);
      return mockUser;
    }

    // Only log real errors
    console.error("Firebase Login Error:", errorCode, errorMessage);
    throw error;
  }
};

export const signOutUser = async () => {
  if (!auth) return;
  try {
    await auth.signOut();
  } catch (error) {
    console.error("Logout Error", error);
  }
};

export const getAuth = () => auth;
export const getDb = () => db;