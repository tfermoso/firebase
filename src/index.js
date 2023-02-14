// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirebaseConfig } from "./firebase-config";

const firebaseAppConfig = getFirebaseConfig();

// Initialize Firebase
const app = initializeApp(firebaseAppConfig);
const auth = getAuth();
let email="";
let password="";
signInWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    // Signed in 
    const user = userCredential.user;
    // ...
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    console.log(errorMessage);
  });