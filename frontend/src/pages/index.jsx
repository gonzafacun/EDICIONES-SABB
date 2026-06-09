// src/pages/index.jsx
import { useState } from "react";
import Link from "next/link";
import { withLayout } from "../components/Layout";
import ProductCard from "../components/ProductCard";
import styles from "./index.module.css";

// ─── Datos de ejemplo (se reemplazarán con Firestore) ────
const PRODUCTOS_DESTACADOS = [
  {
    id: "1",
    nombre: "Notebook Lenovo IdeaPad 15",
    precio: 850000,
    precioOriginal: 1050000,
    categoria: "Notebooks",
    destacado: true,
    stock: 5,
    imagen: null,
  },
  {
    id: "2",
    nombre: "Monitor Samsung 27\" Full HD",
    precio: 420000,
    precioOriginal: null,
    categoria: "Monitores",
    destacado: true,
    stock: 3,
    imagen: null,
  },
  {
    id: "3",
    nombre: "Teclado Mecánico Redragon K552",
    precio: 95000,
    precioOriginal: 120000,
    categoria: "Periféricos",
    destacado: true,
    stock: 10,
    imagen: null,
  },
  {
    id: "4",
    nombre: "Mouse Logitech G305 Inalámbrico",
    precio: 78000,
    precioOriginal: null,
    categoria: "Periféricos",
    destacado: true,
    stock: 0,
    imagen: null,
  },
  {
    id: "5",
    nombre: "Auriculares HyperX Cloud II",
    precio: 185000,
    precioOriginal: 210000,
    categoria: "Audio",
    destacado: true,
    stock: 7,
    imagen: null,
  },
  {
    id: "6",
    nombre: "SSD Kingston 1TB NVMe M.2",
    precio: 130000,
    precioOriginal: null,
    categoria: "Almacenamiento",
    destacado: true,
    stock: 12,
    imagen: null,
  },
];

const CATEGORIAS = [
  { label: "Notebooks",      icon: "💻" },
  { label: "Monitores",      icon: "🖥️" },
  { label: "Periféricos",    icon: "🖱️" },
  { label: "Audio",          icon: "🎧" },
  { label: "Almacenamiento", icon: "💾" },
  { label: "Smartphones",    icon: "📱" },
];

// ─── Sección Hero ─────────────────────────────────────────
function Hero() {
  return (
    <section className={styles.hero}>
      {/* Fondo con gradiente animado */}
      <div className={styles.heroBg} aria-hidden="true">
        <div className={styles.heroBlob1} />
        <div className={styles.heroBlob2} />
        <div className={styles.heroGrid} />
      </div>

      <div className={`container ${styles.heroContent}`}>
        <div className={styles.heroText}>
          <span className={styles.heroBadge}>⚡ Nueva temporada</span>
          <h1 className={styles.heroTitle}>
            Tecnología que
            <span className={styles.heroAccent}> te mueve</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Los mejores precios en electrónica, con envío a todo el país
            y garantía oficial en todos los productos.
          </p>
          <div className={styles.heroActions}>
            <Link href="/productos" className="btn btn-primary">
              Ver productos
            </Link>
            <Link href="/productos?oferta=true" className="btn btn-secondary">
              Ofertas del día
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className={styles.heroStats}>
          {[
            { value: "+500",  label: "Productos" },
            { value: "24hs",  label: "Envío express" },
            { value: "12x",   label: "Sin interés" },
          ].map(({ value, label }) => (
            <div key={label} className={styles.statItem}>
              <span className={styles.statValue}>{value}</span>
              <span className={styles.statLabel}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Sección Categorías ───────────────────────────────────
function Categorias() {
  return (
    <section className={styles.section}>
      <div className="container">
        <h2 className={styles.sectionTitle}>Explorá por categoría</h2>
        <div className={styles.categoriasGrid}>
          {CATEGORIAS.map(({ label, icon }) => (
            <Link
              key={label}
              href={`/productos?categoria=${encodeURIComponent(label)}`}
              className={styles.categoriaCard}
            >
              <span className={styles.categoriaIcon}>{icon}</span>
              <span className={styles.categoriaLabel}>{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Sección Productos Destacados ────────────────────────
function ProductosDestacados({ onAddToCart }) {
  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Productos destacados</h2>
          <Link href="/productos" className={styles.verTodos}>
            Ver todos →
          </Link>
        </div>
        <div className={styles.productosGrid}>
          {PRODUCTOS_DESTACADOS.map((producto) => (
            <ProductCard
              key={producto.id}
              product={producto}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Banner promo ─────────────────────────────────────────
function BannerPromo() {
  return (
    <section className={styles.bannerPromo}>
      <div className="container">
        <div className={styles.bannerInner}>
          <div className={styles.bannerText}>
            <h2 className={styles.bannerTitle}>Hasta 12 cuotas sin interés</h2>
            <p>Pagá con todas las tarjetas a través de E-pagos.</p>
          </div>
          <Link href="/productos" className="btn btn-primary">
            Aprovechar oferta
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── Página principal ─────────────────────────────────────
export default function HomePage() {
  const [cartCount, setCartCount] = useState(0);

  const handleAddToCart = (product) => {
    setCartCount((prev) => prev + 1);
    // TODO: integrar con contexto global del carrito
  };

  return (
    <>
      <Hero />
      <Categorias />
      <ProductosDestacados onAddToCart={handleAddToCart} />
      <BannerPromo />
    </>
  );
}

HomePage.getLayout = withLayout({
  title: "Inicio",
  description: "TechStore — Electrónica y tecnología al mejor precio",
});
