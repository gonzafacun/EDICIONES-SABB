import { initializeApp, getApps } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  orderBy,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

export async function getProductos() {
  const snapshot = await getDocs(collection(db, "productos"));
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getProductosDestacados() {
  const q = query(
    collection(db, "productos"),
    where("destacado", "==", true),
    orderBy("nombre")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getProductoById(id) {
  const snap = await getDoc(doc(db, "productos", id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function getCategorias() {
  const snapshot = await getDocs(collection(db, "categorias"));
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}
