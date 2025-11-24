import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAjX6r_Nuf88Ha2Fa-_GQSCMzPbSjPY7jg",
  authDomain: "snapshare2-2839a.firebaseapp.com",
  projectId: "snapshare2-2839a",
  storageBucket: "snapshare2-2839a.appspot.com",
  messagingSenderId: "818068688404",
  appId: "1:818068688404:web:d20d79667fd7eb8fbc6101"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);