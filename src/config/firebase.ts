import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Configuration Firebase pour PetCare+
const firebaseConfig = {
  apiKey: "AIzaSyD5m4nhQG2axSfKVwlc16YR6G3ujYYbQeU",
  authDomain: "petcare-2a317.firebaseapp.com",
  projectId: "petcare-2a317",
  storageBucket: "petcare-2a317.firebasestorage.app",
  messagingSenderId: "828878305795",
  appId: "1:828878305795:web:d763e6771dec4535fa6c36"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);

// Initialiser les services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;

