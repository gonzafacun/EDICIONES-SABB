// src/services/pedidos.js
// Operaciones de Firestore para la colección /pedidos

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "../config/firebase";

const COL = "pedidos";

/**
 * Obtiene un pedido por su ID.
 */
export async function getPedido(id) {
  const snap = await getDoc(doc(db, COL, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

/**
 * Lista pedidos para el panel admin.
 * @param {{ estado?: string, limite?: number }} opciones
 */
export async function getPedidos({ estado, limite = 50 } = {}) {
  const constraints = [orderBy("creadoEn", "desc"), limit(limite)];
  if (estado) constraints.unshift(where("estado", "==", estado));

  const q        = query(collection(db, COL), ...constraints);
  const snapshot = await getDocs(q);

  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}
