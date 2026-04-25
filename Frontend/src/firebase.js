import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "projects1m.firebaseapp.com",
  projectId: "projects1m",
  storageBucket: "projects1m.firebasestorage.app",
  messagingSenderId: "476755376237",
  appId: "1:476755376237:web:7c04d4d112805db128e764",
  measurementId: "G-G387XW8X51",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth, GoogleAuthProvider };
