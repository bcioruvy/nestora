import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Replace these with your Firebase project's own values after you import
// this repo. Firebase console → Project settings → General → Your apps →
// SDK setup and configuration. These are safe to commit: Firebase web config
// values are not secret, access is controlled by firestore.rules instead.
const firebaseConfig = {
  apiKey: 'AIzaSyBuLn60WnXNo2ZjPugC2xJMzxKVAor0to0',
  authDomain: 'nestora-30fca.firebaseapp.com',
  projectId: 'nestora-30fca',
  storageBucket: 'nestora-30fca.firebasestorage.app',
  messagingSenderId: '462676867608',
  appId: '1:462676867608:web:f53ec6e32f07b068cca16d',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
