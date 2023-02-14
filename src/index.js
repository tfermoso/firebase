// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {
  getAuth, signInWithEmailAndPassword, onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signOut
} from "firebase/auth";
import { getFirebaseConfig } from "./firebase-config";

const firebaseAppConfig = getFirebaseConfig();

// Initialize Firebase
const app = initializeApp(firebaseAppConfig);
const auth = getAuth();


window.onload = () => {
  //Seleccionamos elementos de la página
  let btnLogin = document.getElementById("btnLogin");
  let btnGoogle = document.getElementById("btnGoogle");
  let btnCerrar = document.getElementById("btnCerrar");
  let inputEmail = document.getElementById("email");
  let inputPassword = document.getElementById("password");
  var sectionLogin = document.getElementById("section_login");
  //Asociamos eventos
  btnLogin.addEventListener("click", () => {
    let email = inputEmail.value;
    let password = inputPassword.value;
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in 

        const user = userCredential.user;
        console.log(user);
        // ...
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        alert(errorMessage);
      });
  })

  btnGoogle.addEventListener("click", () => {
    signIn();
  })

  btnCerrar.addEventListener("click", () => {
    signOut(auth);
  })


  onAuthStateChanged(auth, (user) => {
    if (user) {
      //Login
      alert(auth.currentUser.email)
      sectionLogin.hidden = true;
    } else {
      alert("cerrando sesión");
      sectionLogin.hidden = false;
      //logout
    }
  });
}

async function signIn() {
  // Sign in Firebase using popup auth and Google as the identity provider.
  var provider = new GoogleAuthProvider();
  await signInWithPopup(getAuth(), provider);
}