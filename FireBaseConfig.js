import firebase from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: "AIzaSyAf0qROFvQyloV8D5Czd6D0B12pdpV3GWI",
  authDomain: 'flashcardgpt.firebaseapp.com',
  databaseURL: 'https://flashcardgpt-default-rtdb.firebaseio.com',
  projectId: 'flashcardgpt',
  storageBucket: 'flashcardgpt.appspot.com',
  messagingSenderId: '807857176798',
  appId: '1:807857176798:web:f3d8219704ba4c37d1024f',
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export const uploadImageToFirebase = async (imageUri, flashcardId) => {
  const imageRef = ref(storage, `images/${flashcardId}.jpg`);
  const response = await fetch(imageUri);
  const blob = await response.blob();
  const snapshot = await uploadBytes(imageRef, blob);
  const imageUrl = await getDownloadURL(imageRef);
  return imageUrl;
};

