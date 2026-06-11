// src/services/pedidos.js
// Operaciones de Supabase para la tabla pedidos

import { supabase } from "../config/supabase";

const TABLE = "pedidos";

/**
 * Obtiene un pedido por su ID.
 */
export async function getPedido(id) {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Lista pedidos para el panel admin.
 * @param {{ estado?: string, limite?: number }} opciones
 */
export async function getPedidos({ estado, limite = 50 } = {}) {
  let query = supabase
    .from(TABLE)
    .select("*")
    .order("creado_en", { ascending: false })
    .limit(limite);

  if (estado) query = query.eq("estado", estado);

  const { data, error } = await query;

  if (error) throw error;
  return data;
}

/**
 * Crea un nuevo pedido.
 * @returns {string} ID del pedido creado
 */
export async function crearPedido(datos) {
  const { data, error } = await supabase
    .from(TABLE)
    .insert([{
      ...datos,
      total: Number(datos.total),
      creado_en: new Date().toISOString(),
    }])
    .select()
    .single();

  if (error) throw error;
  return data.id;
}

/**
 * Actualiza el estado de un pedido.
 */
export async function actualizarPedido(id, estado) {
  const { error } = await supabase
    .from(TABLE)
    .update({ estado, actualizado_en: new Date().toISOString() })
    .eq("id", id);

  if (error) throw error;
}