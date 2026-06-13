// src/hooks/useFetch.js
// Hook genérico para llamadas async con loading + error
import { useState, useEffect, useCallback } from "react";

/**
 * Ejecuta una función async y expone { data, cargando, error, recargar }
 *
 * Uso:
 *   const { data: productos, cargando, error } = useFetch(
 *     () => getProductos({ categoria: "Notebooks" }),
 *     [categoria]  // dependencias que re-disparan el fetch
 *   );
 */
export function useFetch(fn, deps = []) {
  const [data,     setData]     = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error,    setError]    = useState(null);

  const ejecutar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const resultado = await fn();
      setData(resultado);
    } catch (err) {
      console.error("useFetch error:", err);
      // Mejor manejo de errores: intenta usar message, luego toString()
      const mensajeError = err?.message || err?.toString?.() || "Error al cargar datos";
      setError(mensajeError);
    } finally {
      setCargando(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => { 
    ejecutar(); 
  }, [ejecutar]);

  return { data, cargando, error, recargar: ejecutar };
}
