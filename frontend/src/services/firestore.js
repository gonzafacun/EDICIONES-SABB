import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../config/firebase";

const COL_PRODUCTOS = "productos";
const COL_CATEGORIAS = "categorias";

export async function getProductos({ categoria, destacado, limite = 100 } = {}) {
  const constraints = [orderBy("creadoEn", "desc"), limit(limite)];

  if (categoria) constraints.unshift(where("categoria", "==", categoria));
  if (destacado !== undefined) constraints.unshift(where("destacado", "==", destacado));

  const q = query(collection(db, COL_PRODUCTOS), ...constraints);
  const snapshot = await getDocs(q);

  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getProducto(id) {
  const snap = await getDoc(doc(db, COL_PRODUCTOS, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function getProductosDestacados(limite = 6) {
  return getProductos({ destacado: true, limite });
}

export async function getCategorias() {
  const snapshot = await getDocs(collection(db, COL_CATEGORIAS));
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function crearProducto(datos) {
  const ref = await addDoc(collection(db, COL_PRODUCTOS), {
    ...datos,
    precio: Number(datos.precio),
    precioOriginal: datos.precioOriginal ? Number(datos.precioOriginal) : null,
    stock: Number(datos.stock) || 0,
    destacado: Boolean(datos.destacado),
    imagen: datos.imagen || null,
    creadoEn: serverTimestamp(),
    actualizadoEn: serverTimestamp(),
  });
  return ref.id;
}

export async function actualizarProducto(id, datos) {
  const updates = {
    ...datos,
    actualizadoEn: serverTimestamp(),
  };
  if (updates.precio !== undefined) updates.precio = Number(updates.precio);
  if (updates.precioOriginal !== undefined) updates.precioOriginal = updates.precioOriginal ? Number(updates.precioOriginal) : null;
  if (updates.stock !== undefined) updates.stock = Number(updates.stock);

  await updateDoc(doc(db, COL_PRODUCTOS, id), updates);
}

export async function eliminarProducto(id) {
  await deleteDoc(doc(db, COL_PRODUCTOS, id));
}
