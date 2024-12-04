// Firebase Configuration and Setup
import { initializeApp } from 'firebase/app';
import { 
  getAuth
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyDUllCIW21CzR6RXGUuz7je1dHluZTSCQU",
    authDomain: "school-management-132ef.firebaseapp.com",
    projectId: "school-management-132ef",
    storageBucket: "school-management-132ef.firebasestorage.app",
    messagingSenderId: "259571680475",
    appId: "1:259571680475:web:3c8852251f9f697ecf38fe"
  };

  const app = initializeApp(firebaseConfig);
  export const auth = getAuth(app);
  export const db = getFirestore(app);