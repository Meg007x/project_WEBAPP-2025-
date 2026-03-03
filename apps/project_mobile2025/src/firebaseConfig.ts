// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // ต้องมีบรรทัดนี้
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC-yGMqfhXeoCS-gT4io2hYNGdZJA-y7DA",
  authDomain: "final-project-mobile-deb35.firebaseapp.com",
  projectId: "final-project-mobile-deb35",
  storageBucket: "final-project-mobile-deb35.firebasestorage.app",
  messagingSenderId: "569662269180",
  appId: "1:569662269180:web:d00044cd22346ac6d89979",
  measurementId: "G-GLG9ME1WRP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);