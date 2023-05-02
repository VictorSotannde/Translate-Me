// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https: //firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAyOod5CjsifnuE7jTnS-2MZy6nR9-37HE",
  authDomain: "capstone-499-c0653.firebaseapp.com",
  projectId: "capstone-499-c0653",
  storageBucket: "capstone-499-c0653.appspot.com",
  messagingSenderId: "697858795309",
  appId: "1:697858795309:web:272aba9037252897c1d5a4",
  measurementId: "G-4TT0ZMT8R3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export   const auth = getAuth(app);
 
