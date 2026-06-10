// src/services/productos.js
// Todas las operaciones de Firestore para la colección /productos
// Las páginas públicas solo usan las funciones de lectura.
// El admin usa también crear, actualizar y eliminar.

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

const COL = "productos";

// ─── LECTURA ──────────────────────────────────────────────

/**
 * Obtiene todos los productos con filtros opcionales.
 * @param {{ categoria?: string, destacado?: boolean, limite?: number }} opciones
 */
export async function getProductos({ categoria, destacado, limite = 100 } = {}) {
  const constraints = [orderBy("creadoEn", "desc"), limit(limite)];

  if (categoria)           constraints.unshift(where("categoria",  "==", categoria));
  if (destacado !== undefined) constraints.unshift(where("destacado", "==", destacado));

  const q        = query(collection(db, COL), ...constraints);
  const snapshot = await getDocs(q);

  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Obtiene un único producto por su ID.
 */
export async function getProducto(id) {
  const snap = await getDoc(doc(db, COL, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

/**
 * Obtiene los productos destacados para la homepage.
 */
export async function getProductosDestacados(limite = 6) {
  return getProductos({ destacado: true, limite });
}

// ─── ESCRITURA (solo admin) ───────────────────────────────

/**
 * Crea un nuevo producto.
 * @returns {string} ID del documento creado
 */
export async function crearProducto(datos) {
  const ref = await addDoc(collection(db, COL), {
    ...datos,
    precio:          Number(datos.precio),
    precioOriginal:  datos.precioOriginal ? Number(datos.precioOriginal) : null,
    stock:           Number(datos.stock) || 0,
    destacado:       Boolean(datos.destacado),
    imagen:          datos.imagen || null,
    creadoEn:        serverTimestamp(),
    actualizadoEn:   serverTimestamp(),
  });
  return ref.id;
}

/**
 * Actualiza un producto existente.
 */
export async function actualizarProducto(id, datos) {
  const updates = {
    ...datos,
    actualizadoEn: serverTimestamp(),
  };
  if (updates.precio !== undefined)         updates.precio         = Number(updates.precio);
  if (updates.precioOriginal !== undefined) updates.precioOriginal = updates.precioOriginal ? Number(updates.precioOriginal) : null;
  if (updates.stock !== undefined)          updates.stock          = Number(updates.stock);

  await updateDoc(doc(db, COL, id), updates);
}

/**
 * Elimina un producto.
 */
export async function eliminarProducto(id) {
  await deleteDoc(doc(db, COL, id));
}
