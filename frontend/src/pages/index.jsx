// src/pages/index.jsx
import { useState } from "react";
import Link from "next/link";
import { withLayout } from "../components/Layout";
import ProductCard from "../components/ProductCard";
import { useFetch } from "../hooks/useFetch";
import { getProductosDestacados } from "../services/productos";
import { useCart } from "../context/CartContext";
import styles from "./index.module.css";

const CATEGORIAS = [
  { label: "Notebooks",      icon: "💻" },
  { label: "Monitores",      icon: "🖥️" },
  { label: "Periféricos",    icon: "🖱️" },
  { label: "Audio",          icon: "🎧" },
  { label: "Almacenamiento", icon: "💾" },
  { label: "Smartphones",    icon: "📱" },
];

// ─── Skeleton loader para las cards ──────────────────────
function SkeletonCard() {
  return <div className={styles.skeleton} aria-hidden="true" />;
}

// ─── Hero ─────────────────────────────────────────────────
function Hero() {
  return (
    <section className={styles.hero}>
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
            <Link href="/productos" className="btn btn-primary">Ver productos</Link>
            <Link href="/productos?oferta=true" className="btn btn-secondary">Ofertas del día</Link>
          </div>
        </div>
        <div className={styles.heroStats}>
          {[
            { value: "+500", label: "Productos"     },
            { value: "24hs", label: "Envío express" },
            { value: "12x",  label: "Sin interés"   },
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

// ─── Categorías ───────────────────────────────────────────
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

// ─── Productos destacados (con Firestore) ────────────────
function ProductosDestacados() {
  const { agregar } = useCart();
  const { data: productos, cargando, error } = useFetch(
    () => getProductosDestacados(6),
    []
  );

  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Productos destacados</h2>
          <Link href="/productos" className={styles.verTodos}>Ver todos →</Link>
        </div>

        {error && (
          <p className={styles.errorTxt}>No se pudieron cargar los productos. Intentá de nuevo.</p>
        )}

        <div className={styles.productosGrid}>
          {cargando
            ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
            : (productos || []).map((p) => (
                <ProductCard key={p.id} product={p} onAddToCart={() => agregar(p)} />
              ))
          }
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
          <Link href="/productos" className="btn btn-primary">Aprovechar oferta</Link>
        </div>
      </div>
    </section>
  );
}

// ─── Página ───────────────────────────────────────────────
export default function HomePage() {
  return (
    <>
      <Hero />
      <Categorias />
      <ProductosDestacados />
      <BannerPromo />
    </>
  );
}

HomePage.getLayout = withLayout({
  title: "Inicio",
  description: "TechStore — Electrónica y tecnología al mejor precio",
});
