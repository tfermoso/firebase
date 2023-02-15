// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth, signInWithEmailAndPassword, onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signOut
} from "firebase/auth";
import {getFirestore,
  collection,
  addDoc,
  serverTimestamp,} from 'firebase/firestore';
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
  let sectionLogin = document.getElementById("section_login");
  let sectionMain = document.getElementById("section_main");
  let btnCrearCita=document.getElementById("btnCrearCita");
  let inputNombre=document.getElementById("nombre");
  let inputApellido=document.getElementById("apellido");
  let inputTelefono=document.getElementById("telefono");
  let inputHora=document.getElementById("hora");
  let inputFecha=document.getElementById("fecha");
  let inputSintomas=document.getElementById("sintomas");
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

  btnCrearCita.addEventListener("click",()=>{
    let cita={
      nombre:inputNombre.value,
      apellido:inputApellido.value,
      telefono:inputTelefono.value,
      fecha:inputFecha.value,
      hora:inputHora.value,
      sintomas:inputSintomas.value
    }
    crearCita(cita);
  })


  onAuthStateChanged(auth, (user) => {
    if (user) {
      //Login
      sectionLogin.hidden = true;
      sectionMain.hidden=false;
      let username=user.displayName!=null?user.displayName:user.email;
      document.getElementById("username").innerText=username;
    
    } else {

      sectionLogin.hidden = false;
      sectionMain.hidden=true;
      //logout
    }
  });
}

async function signIn() {
  // Sign in Firebase using popup auth and Google as the identity provider.
  var provider = new GoogleAuthProvider();
  await signInWithPopup(getAuth(), provider);
}

// Saves a new Object to Cloud Firestore.
async function crearCita(cita) {
  // Add a new object entry to the Firebase database.
  cita.timestamp=serverTimestamp();
  cita.user=getAuth().currentUser.email;
  try {
    await addDoc(collection(getFirestore(), 'citas'), cita);
  }
  catch(error) {
    alert('Error writing new cita to Firebase Database', error);
  }
}