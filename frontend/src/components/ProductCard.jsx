// src/components/ProductCard.jsx
import Link from "next/link";
import { useCart } from "../context/CartContext";
import styles from "./ProductCard.module.css";

// ─── Helpers ─────────────────────────────────────────────
function formatPrice(price) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(price);
}

// ─── Badge de categoría / oferta ─────────────────────────
function Badge({ text, variant = "default" }) {
  return (
    <span className={`${styles.badge} ${styles[`badge_${variant}`]}`}>
      {text}
    </span>
  );
}

// ─── Componente principal ─────────────────────────────────
export default function ProductCard({ product }) {
  const { agregar } = useCart();
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
          {destacado && <Badge text="Destacado" variant="accent" />}
          {tieneDescuento && <Badge text={`-${descuento}%`} variant="success" />}
          {sinStock && <Badge text="Sin stock" variant="danger" />}
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
          className={`btn btn-primary ${styles.btnAgregar}`}
          onClick={() => agregar(product)}
          disabled={sinStock}
          aria-label={`Agregar ${nombre} al carrito`}
        >
          {sinStock ? "Sin stock" : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              Agregar
            </>
          )}
        </button>
      </div>

    </article>
  );
}
