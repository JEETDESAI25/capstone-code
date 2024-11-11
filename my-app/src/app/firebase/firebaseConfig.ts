// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBR27cCDF4m-b_KUUY42Bzh3ZnKVvPxGmk",
  authDomain: "unite-2c9e0.firebaseapp.com",
  projectId: "unite-2c9e0",
  storageBucket: "unite-2c9e0.appspot.com",
  messagingSenderId: "512188623074",
  appId: "1:512188623074:web:ab542b8d034d3dae3116bb",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
