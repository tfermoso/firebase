// Import the functions you need from the SDKs you need
import { initializeApp, firebase } from "firebase/app";
import {
  getAuth, signInWithEmailAndPassword, onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signOut
} from "firebase/auth";
import {
  firestore,
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  doc,
  query,
  orderBy,
  limit,
  where,
  onSnapshot,
  deleteDoc,
  updateDoc,
  setDoc,
  getDoc,
  FieldPath
} from 'firebase/firestore';
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from 'firebase/storage';
import { getFirebaseConfig } from "./firebase-config";

const firebaseAppConfig = getFirebaseConfig();

// Initialize Firebase
const app = initializeApp(firebaseAppConfig);
const auth = getAuth();
var docRef = null;




window.onload = () => {
  //Seleccionamos elementos de la página
  let btnLogin = document.getElementById("btnLogin");
  let btnGoogle = document.getElementById("btnGoogle");
  let btnCerrar = document.getElementById("btnCerrar");
  let inputEmail = document.getElementById("email");
  let inputPassword = document.getElementById("password");
  let inputSearch = document.getElementById("inputSearch");
  let sectionLogin = document.getElementById("section_login");
  let sectionMain = document.getElementById("section_main");
  let btnCrearCita = document.getElementById("btnCrearCita");
  let btnEditarCita = document.getElementsByClassName("btnEditarCita")[0];
  let inputNombre = document.getElementById("nombre");
  let inputApellido = document.getElementById("apellido");
  let inputTelefono = document.getElementById("telefono");
  let inputHora = document.getElementById("hora");
  let inputFecha = document.getElementById("fecha");
  let inputSintomas = document.getElementById("sintomas");
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

  inputSearch.addEventListener("keyup", (e) => {
    cargarCitas();

  })






  btnCerrar.addEventListener("click", () => {
    signOut(auth);
  })

  btnCrearCita.addEventListener("click", () => {
    let cita = {
      nombre: inputNombre.value,
      apellido: inputApellido.value,
      telefono: inputTelefono.value,
      fecha: inputFecha.value,
      hora: inputHora.value,
      sintomas: inputSintomas.value
    }
    crearCita(cita);
  })
  btnEditarCita.addEventListener("click", () => {
    let cita = {
      nombre: inputNombre.value,
      apellido: inputApellido.value,
      fecha: inputFecha.value,
      hora: inputHora.value,
      sintomas: inputSintomas.value,
      telefono: inputTelefono.value
    }
    updateDoc(docRef, cita)
      .then(() => {
        borrarCampos();
      })
      .catch((err) => { alert(err) })


  })


  onAuthStateChanged(auth, (user) => {
    if (user) {
      //Login
      sectionLogin.hidden = true;
      sectionMain.hidden = false;
      let username = user.displayName != null ? user.displayName : user.email;
      document.getElementById("username").innerText = username;
      cargarCitas();
    } else {

      sectionLogin.hidden = false;
      sectionMain.hidden = true;
      //logout
    }
  });

  function borrarCampos() {
    let inputs = document.getElementsByClassName("nuevacita");
    for (let i = 0; i < inputs.length; i++) {
      const element = inputs[i];
      element.value = "";
    }
    btnCrearCita.classList.remove("d-none");
    btnCrearCita.classList.add("d-block");
    btnEditarCita.id = "";
    btnEditarCita.classList.remove("d-block");
    btnEditarCita.classList.add("d-none");
  }
  async function signIn() {
    // Sign in Firebase using popup auth and Google as the identity provider.
    var provider = new GoogleAuthProvider();
    await signInWithPopup(getAuth(), provider);
  }

  // Saves a new Object to Cloud Firestore.
  async function crearCita(cita) {
    // Add a new object entry to the Firebase database.
    cita.timestamp = serverTimestamp();
    cita.user = getAuth().currentUser.email;
    try {
      await addDoc(collection(getFirestore(), 'citas'), cita);
      borrarCampos();
    }
    catch (error) {
      alert('Error writing new cita to Firebase Database', error);
    }
  }

  function cargarCitas() {
    let texto = inputSearch.value;
    // Create the query to load the last 12 messages and listen for new ones.
    const recentCitasQuery = query(collection(getFirestore(), 'citas'), where("user", "==", auth.currentUser.email), orderBy('timestamp', 'desc'), limit(8));

    // Start listening to the query.
    onSnapshot(recentCitasQuery, function (snapshot) {
      let citas = "";
      snapshot.forEach(doc => {
        let cita = doc.data();
        if (cita.nombre.toLowerCase().indexOf(texto.toLowerCase()) >= 0 || cita.apellido.toLowerCase().indexOf(texto.toLowerCase()) >= 0) {
          citas += `<div id=${doc.id} class="cita col-md-6 col-sm-12"><p>Paciente:${cita.nombre} ${cita.apellido}</p>
        <p>Fecha: ${cita.fecha} - ${cita.hora}</p>
        <p>Sintomas: ${cita.sintomas}</p>
        <i class="fa-solid fa-trash borrarCita"></i>
        <i class="fa-solid fa-pen-to-square editarCita"></i>
        <label>
        <input  class="inputFile d-none" type="file" accept="image/gif, image/jpeg, application/pdf" > 
        <i class="fa-solid fa-image subirFichero" (click)=""></i>
        </label>
        </div>`;
        }
      })

      document.getElementById("citas").innerHTML = citas;
      let btnsBorrar = document.getElementsByClassName("borrarCita");
      for (let i = 0; i < btnsBorrar.length; i++) {
        btnsBorrar[i].addEventListener("click", (e) => {
          let idDoc = e.currentTarget.parentElement.id;
          borrarCita(idDoc);
        })
      }
      let btnsEditar = document.getElementsByClassName("editarCita");
      for (let i = 0; i < btnsEditar.length; i++) {
        btnsEditar[i].addEventListener("click", (e) => {
          let idDoc = e.currentTarget.parentElement.id;
          editarCita(idDoc)
        })
      }
      let inputsFile = document.getElementsByClassName("inputFile");
      for (let i = 0; i < inputsFile.length; i++) {
        inputsFile[i].addEventListener("change", (e) => {
          let idDoc = e.currentTarget.parentElement.parentElement.id;
          let file = e.target.files[0];
          if (file){
             if (file.type.match("image.*") || file.type.match("application/pdf")) {
              if (file.size < 3 * 1024 * 1024) {
                //Subo el fichero a firestorage
                saveImageCita(file,idDoc)
              
              } else {
                alert("Imagen no válida");
              }
            }else{
              alert("Fichero no válido")
            }
          }else{
            alert("Fichero no válido")
          }
           

        })
      }
    });
  }
  async function saveImageCita(file,idDoc) {
    try {
        
      // 2 - Upload the image to Cloud Storage.
      const filePath = `${getAuth().currentUser.uid}/${idDoc}/${file.name}`;
      const newImageRef = ref(getStorage(), filePath);
      const fileSnapshot = await uploadBytesResumable(newImageRef, file);
      
      // 3 - Generate a public URL for the file.
      const publicImageUrl = await getDownloadURL(newImageRef);
      let docRef = doc(getFirestore(), "citas", idDoc);

      
      // 4 - Update the chat message placeholder with the image's URL.
      await updateDoc(docRef,{
        imageUrl: publicImageUrl,
        storageUri: fileSnapshot.metadata.fullPath
      });
    } catch (error) {
      console.error('There was an error uploading a file to Cloud Storage:', error);
    }
  }
  function borrarCita(idDoc) {
    docRef = doc(getFirestore(), "citas", idDoc);
    deleteDoc(docRef)
      .then(() => {

      })
      .catch((err) => {
        alert(err)
      })
  }
  async function editarCita(idDoc) {
    docRef = doc(getFirestore(), "citas", idDoc);

    let citaSnap = await getDoc(docRef);
    inputNombre.value = citaSnap.data().nombre;
    inputApellido.value = citaSnap.data().apellido;
    inputHora.value = citaSnap.data().hora;
    inputFecha.value = citaSnap.data().fecha;
    inputTelefono.value = citaSnap.data().telefono;
    inputSintomas.value = citaSnap.data().sintomas;
    btnCrearCita.classList.remove("d-block");
    btnCrearCita.classList.add("d-none");
    btnEditarCita.id = "btn-" + citaSnap.id;
    btnEditarCita.classList.remove("d-none");
    btnEditarCita.classList.add("d-block");


  }


}


