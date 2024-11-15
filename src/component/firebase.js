import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAYyHzo4s2mjq0RQk9eQPIbfP_Y__x9tNE",
  authDomain: "cletolab3-8efeb.firebaseapp.com",
  projectId: "cletolab3-8efeb",
  storageBucket: "cletolab3-8efeb.firebasestorage.app",
  messagingSenderId: "1024206044583",
  appId: "1:1024206044583:web:29ad5919dd820c2fef0a82",
  measurementId: "G-8LSTEJ2664"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
// Initialize Firestore
const db = getFirestore(app);

export { db };