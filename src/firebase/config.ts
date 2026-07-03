import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Replace these with your Firebase project's own values after you import
// this repo. Firebase console → Project settings → General → Your apps →
// SDK setup and configuration. These are safe to commit: Firebase web config
// values are not secret, access is controlled by firestore.rules instead.
const firebaseConfig = {
  apiKey: 'REPLACE_API_KEY',
  authDomain: 'REPLACE_AUTH_DOMAIN',
  projectId: 'REPLACE_PROJECT_ID',
  storageBucket: 'REPLACE_STORAGE_BUCKET',
  messagingSenderId: 'REPLACE_SENDER_ID',
  appId: 'REPLACE_APP_ID',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
