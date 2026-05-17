import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import firebaseConfig from './firebaseConfig';

const app = initializeApp(firebaseConfig);

// Modern Way to Enable Offline Persistence
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({}), // Default back to single tab synchronization to prevent lease errors in sandboxed environments
  experimentalAutoDetectLongPolling: true
}, firebaseConfig.firestoreDatabaseId);

export const auth = getAuth(app);

export const loginWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  try {
    await signInWithPopup(auth, provider);
  } catch (error) {
    console.error("Login failed:", error);
    throw error;
  }
};

export const logout = () => signOut(auth);
