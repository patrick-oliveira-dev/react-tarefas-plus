
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDeUQDrOLjKRaUBKVb_zyjySwMNJtsknuo",
  authDomain: "tarefas-plus-36874.firebaseapp.com",
  projectId: "tarefas-plus-36874",
  storageBucket: "tarefas-plus-36874.appspot.com",
  messagingSenderId: "30555609420",
  appId: "1:30555609420:web:a01da433867f8616df17e9"
};


const firebaseApp = initializeApp(firebaseConfig);

const db = getFirestore(firebaseApp)

export {db}