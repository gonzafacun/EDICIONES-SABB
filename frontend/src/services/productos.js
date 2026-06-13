// src/services/productos.js
// Todas las operaciones de Supabase para la tabla productos
import { supabase } from "../config/supabase";

const TABLE = "productos";

function toCamelCase(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(toCamelCase);
  
  const newObj = {};
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    newObj[camelKey] = toCamelCase(value);
  }
  return newObj;
}

// ─── LECTURA ──────────────────────────────────────────────

/**
 * Obtiene todos los productos con filtros opcionales.
 * @param {{ categoria?: string, destacado?: boolean, limite?: number }} opciones
 */
export async function getProductos({ categoria, destacado, limite = 1000 } = {}) {
  let query = supabase
    .from(TABLE)
    .select("*")
    .order("creado_en", { ascending: false })
    .limit(limite);

  if (categoria) query = query.eq("categoria", categoria);

  const { data, error } = await query;

  if (error) throw error;
  return toCamelCase(data);
}

/**
 * Obtiene un único producto por su ID.
 */
export async function getProducto(id) {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return toCamelCase(data);
}

/**
 * Obtiene los productos destacados para la homepage.
 */
export async function getProductosDestacados(limite = 24) {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .order("creado_en", { ascending: false })
    .limit(limite);

  if (error) throw error;
  return toCamelCase(data);
}

/**
 * Obtiene las categorías únicas de productos.
 */
export async function getCategorias() {
  const { data, error } = await supabase
    .from(TABLE)
    .select("categoria")
    .order("categoria");

  if (error) throw error;
  const unicas = [...new Set(data.map((d) => d.categoria).filter(Boolean))];
  return unicas.sort();
}

// ─── ESCRITURA (solo admin) ───────────────────────────────

/**
 * Crea un nuevo producto.
 * @returns {string} ID del producto creado
 */
export async function crearProducto(datos) {
  const { data, error } = await supabase
    .from(TABLE)
    .insert([{
      nombre: datos.nombre,
      precio: Number(datos.precio),
      categoria: datos.categoria,
      stock: Number(datos.stock) || 0,
      creado_en: new Date().toISOString(),
      actualizado_en: new Date().toISOString(),
    }])
    .select()
    .single();

  if (error) throw error;
  return data.id;
}

/**
 * Actualiza un producto existente.
 */
export async function actualizarProducto(id, datos) {
  const updates = {
    actualizado_en: new Date().toISOString(),
  };

  if (datos.nombre !== undefined) updates.nombre = datos.nombre;
  if (datos.precio !== undefined) updates.precio = Number(datos.precio);
  if (datos.categoria !== undefined) updates.categoria = datos.categoria;
  if (datos.stock !== undefined) updates.stock = Number(datos.stock);

  const { error } = await supabase
    .from(TABLE)
    .update(updates)
    .eq("id", id);

  if (error) throw error;
}

/**
 * Elimina un producto.
 */
export async function eliminarProducto(id) {
  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq("id", id);

  if (error) throw error;
}