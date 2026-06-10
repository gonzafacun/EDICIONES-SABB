// src/context/CartContext.jsx
// Contexto global del carrito — disponible en toda la app
import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  // Persistir en localStorage
  useEffect(() => {
    try {
      const guardado = localStorage.getItem("techstore_cart");
      if (guardado) setItems(JSON.parse(guardado));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("techstore_cart", JSON.stringify(items));
    } catch {}
  }, [items]);

  // Agregar producto (o aumentar cantidad si ya existe)
  const agregar = (producto, cantidad = 1) => {
    setItems((prev) => {
      const existe = prev.find((i) => i.id === producto.id);
      if (existe) {
        return prev.map((i) =>
          i.id === producto.id
            ? { ...i, cantidad: Math.min(i.cantidad + cantidad, producto.stock) }
            : i
        );
      }
      return [...prev, { ...producto, cantidad }];
    });
  };

  // Cambiar cantidad de un item
  const setCantidad = (id, cantidad) => {
    if (cantidad <= 0) return eliminar(id);
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, cantidad } : i))
    );
  };

  // Eliminar un item
  const eliminar = (id) => setItems((prev) => prev.filter((i) => i.id !== id));

  // Vaciar carrito
  const vaciar = () => setItems([]);

  // Totales
  const totalItems    = items.reduce((acc, i) => acc + i.cantidad, 0);
  const subtotal      = items.reduce((acc, i) => acc + i.precio * i.cantidad, 0);

  return (
    <CartContext.Provider value={{ items, agregar, setCantidad, eliminar, vaciar, totalItems, subtotal }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de CartProvider");
  return ctx;
}
