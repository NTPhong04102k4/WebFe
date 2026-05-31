import { initializeApp, getApps } from "firebase/app";
import { getMessaging, isSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyB9VeIQA752Y5S5iJ4Gyc2_gikPKSDm_ck",
  authDomain: "lazynerdcarweb.firebaseapp.com",
  projectId: "lazynerdcarweb",
  storageBucket: "lazynerdcarweb.firebasestorage.app",
  messagingSenderId: "637322035022",
  appId: "1:637322035022:web:5505bb2546d3b89542a81f",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const getFirebaseMessaging = async () => {
  const supported = await isSupported();
  if (!supported) return null;
  return getMessaging(app);
};
