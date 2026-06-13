// src/components/ProductCard.jsx
import { useState } from "react";
import Link from "next/link";
import { useCart } from "../context/CartContext";
import formatPrice from "../utils/formatPrice";
import styles from "./ProductCard.module.css";

export default function ProductCard({ product }) {
  const { agregar, items } = useCart();
  const [agregado, setAgregado] = useState(false);

  const {
    id,
    nombre,
    precio,
    precioOriginal,
    imagen,
    categoria,
    destacado,
    stock,
  } = product;

  const tieneDescuento = precioOriginal && precioOriginal > precio;
  const descuento = tieneDescuento
    ? Math.round((1 - precio / precioOriginal) * 100)
    : null;
  const sinStock = stock === 0;

  const enCarrito = items.find((i) => i.id === id);
  const cantidadEnCarrito = enCarrito ? enCarrito.cantidad : 0;

  const handleAgregar = () => {
    agregar(product);
    setAgregado(true);
    setTimeout(() => setAgregado(false), 1500);
  };

  return (
    <article className={`${styles.card} ${sinStock ? styles.sinStock : ""}`}>

      {/* Imagen */}
      <Link href={`/productos/${id}`} className={styles.imageWrapper} tabIndex={-1}>
        {imagen ? (
          <img src={imagen} alt={nombre} className={styles.image} loading="lazy" />
        ) : (
          <div className={styles.imagePlaceholder}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="m21 15-5-5L5 21" />
            </svg>
          </div>
        )}

        {/* Badges superpuestos */}
        <div className={styles.badges}>
          {destacado && <span className={styles.badge_destacado}>Destacado</span>}
          {tieneDescuento && <span className={styles.badge_descuento}>-{descuento}%</span>}
          {sinStock && <span className={styles.badge_sinStock}>Sin stock</span>}
        </div>
      </Link>

      {/* Info */}
      <div className={styles.body}>
        {categoria && (
          <span className={styles.categoria}>{categoria}</span>
        )}

        <Link href={`/productos/${id}`} className={styles.nombreLink}>
          <h3 className={styles.nombre}>{nombre}</h3>
        </Link>

        {/* Precio */}
        <div className={styles.precioWrapper}>
          <span className={styles.precio}>{formatPrice(precio)}</span>
          {tieneDescuento && (
            <span className={styles.precioOriginal}>{formatPrice(precioOriginal)}</span>
          )}
        </div>

        {/* Botón agregar */}
        <button
          className={`btn btn-primary ${styles.btnAgregar} ${agregado ? styles.btnAgregado : ""}`}
          onClick={handleAgregar}
          disabled={sinStock}
          aria-label={`Agregar ${nombre} al carrito`}
        >
          {sinStock ? "Sin stock" : agregado ? (
            <>✓ En el carrito{cantidadEnCarrito > 1 ? ` (${cantidadEnCarrito})` : ""}</>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              Agregar{cantidadEnCarrito > 0 ? ` (${cantidadEnCarrito} en carrito)` : ""}
            </>
          )}
        </button>
      </div>

    </article>
  );
}
