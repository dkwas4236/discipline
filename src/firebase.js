// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; 
import { getFirestore } from "firebase/firestore"; 
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDZ3szuhQfrPaTqJFIQI5M0MrdNtkWl52c",
  authDomain: "discipline-51fd9.firebaseapp.com",
  projectId: "discipline-51fd9",
  storageBucket: "discipline-51fd9.firebasestorage.app",
  messagingSenderId: "377470663523",
  appId: "1:377470663523:web:47399042ae2f357c163156",
  measurementId: "G-YC2PL4168J",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
//const analytics = getAnalytics(app);

// Initialize Firebase Auth and export it for use in your app
export const auth = getAuth(app);
export const db = getFirestore(app);
