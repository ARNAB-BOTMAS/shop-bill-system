// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";
// import { getDatabase } from 'firebase/database';
import { getDatabase } from "firebase/database";


const firebaseConfig = {
    apiKey: "AIzaSyAhn101QM8GcmzgZelIVQDmfdXngubrJys",
    authDomain: "resturent-a0482.firebaseapp.com",
    projectId: "resturent-a0482",
    storageBucket: "resturent-a0482.appspot.com",
    messagingSenderId: "975609089799",
    appId: "1:975609089799:web:4b30e039d60e0035b43fa2"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth();
export const storage = getStorage();
export const db = getFirestore();
export const Rdb = getDatabase();