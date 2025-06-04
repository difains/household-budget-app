import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyAZBsZGa_oibrh9sZwZSvmxMKmzWd8rI88",
  authDomain: "budget-c37e0.firebaseapp.com",
  projectId: "budget-c37e0",
  storageBucket: "budget-c37e0.firebasestorage.app",
  messagingSenderId: "110975779165",
  appId: "1:110975779165:web:02527ddf64bfa0df9728b4",
  measurementId: "G-RBSW0ZJF6C"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);
