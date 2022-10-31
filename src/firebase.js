 // Import the functions you need from the SDKs you need
 import { initializeApp } from "firebase/app";
 import { getFirestore } from "firebase/firestore";
 // TODO: Add SDKs for Firebase products that you want to use
 // https://firebase.google.com/docs/web/setup#available-libraries
 // Your web app's Firebase configuration
 const firebaseConfig = {
    apiKey: "AIzaSyCROeycY868bUvvFEqaXXb0oTTRwLurAnc",
    authDomain: "reddit-e8914.firebaseapp.com",
    projectId: "reddit-e8914",
    storageBucket: "reddit-e8914.appspot.com",
    messagingSenderId: "957831509465",
    appId: "1:957831509465:web:022f1ed449dcbe9295d5c8",
    measurementId: "G-1MZKQQ42L1"
  };
 // Initialize Firebase
 
 const app = initializeApp(firebaseConfig);
 // Export firestore database
 // It will be imported into your react app whenever it is needed
 export const db = getFirestore(app);