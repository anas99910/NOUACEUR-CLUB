// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDxQUIs2zv9zFaKdE-nCWuywszmIuTbYXE",
    authDomain: "csnos-website.firebaseapp.com",
    projectId: "csnos-website",
    storageBucket: "csnos-website.firebasestorage.app",
    messagingSenderId: "588518361942",
    appId: "1:588518361942:web:fb5f4bd40fb7ed60fe24f7",
    measurementId: "G-5X99RXV96J"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
