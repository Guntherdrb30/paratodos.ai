// frontend/firebase/config.js
import { initializeApp } from "firebase/app"
import { getAuth, GoogleAuthProvider } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

const firebaseConfig = {
  apiKey: "AIzaSyBcrW4SOYXWpYtV9iBcKzN0F01P6EqMHyU",
  authDomain: "carpihogaria.firebaseapp.com",
  projectId: "carpihogaria",
  storageBucket: "carpihogaria.appspot.com",
  messagingSenderId: "837973633322",
  appId: "1:837973633322:web:b134e078f7f5159e185653"
  // measurementId no es necesario para login
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const provider = new GoogleAuthProvider()
const db = getFirestore(app)
const storage = getStorage(app)

export { auth, provider, db, storage }
