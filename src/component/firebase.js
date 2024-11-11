import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBoIy-ddIOhkI1WTFRg-fVpGDS6TudAZWM",
  authDomain: "cletolab3-e28bd.firebaseapp.com",
  projectId: "cletolab3-e28bd",
  storageBucket: "cletolab3-e28bd.firebasestorage.app",
  messagingSenderId: "783828782442",
  appId: "1:783828782442:web:164d380f4983f5ad8ee913",
  measurementId: "G-G1JF109WKF"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
// Initialize Firestore
const db = getFirestore(app);

export { db };