import { initializeApp } from "firebase/app";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

export const firebaseConfig = {
  apiKey: "AIzaSyAf0qROFvQyloV8D5Czd6D0B12pdpV3GWI",
  authDomain: "flashcardgpt.firebaseapp.com",
  databaseURL: "https://flashcardgpt-default-rtdb.firebaseio.com",
  projectId: "flashcardgpt",
  storageBucket: "flashcardgpt.appspot.com",
  messagingSenderId: "807857176798",
  appId: "1:807857176798:web:f3d8219704ba4c37d1024f"
};

const app = initializeApp(firebaseConfig);
initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export const auth = getAuth(app);

// Configurar Google Sign-In
GoogleSignin.configure({
  webClientId: '807857176798-qp428c9f33eo6s8cmc0cnjoatbt0pk06.apps.googleusercontent.com',
  offlineAccess: true,
});

