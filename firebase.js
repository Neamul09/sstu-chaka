import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyD6br3QtQ501Xuax74NbrAVOfoVDYHBVDU",
  authDomain: "sstu-101.firebaseapp.com",
  databaseURL: "https://sstu-101-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "sstu-101",
  storageBucket: "sstu-101.appspot.com",
  messagingSenderId: "1017619149093",
  appId: "1:1017619149093:web:e118be402fc2b34c18eacc",
  measurementId: "G-CC9NN6NS8S"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
