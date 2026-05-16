import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCKqKb0zcrsm01CXhKIy7k1mY4G5dukl9E",
  authDomain: "selleros-e7bb4.firebaseapp.com",
  projectId: "selleros-e7bb4",
  storageBucket: "selleros-e7bb4.firebasestorage.app",
  messagingSenderId: "657210162420",
  appId: "1:657210162420:web:90ece114db7f0cf499f2a1",
  measurementId: "G-T4RLNZJE7H"
};

const app = initializeApp(firebaseConfig);

console.log("PROJECT ID:", import.meta.env.VITE_FIREBASE_PROJECT_ID);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);