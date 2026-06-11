import { useState, useEffect } from "react";
import Link from "next/link";
import { withLayout } from "../components/Layout";
import { useCart } from "../context/CartContext";
import { getProductosDestacados } from "../services/firestore";
import ProductCard from "../components/ProductCard";
import styles from "./index.module.css";

const CATEGORIAS = [
  { label: "Catálogo", icon: "01" },
  { label: "Destacados", icon: "02" },
  { label: "Ofertas", icon: "03" },
  { label: "Novedades", icon: "04" },
];

function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.heroBg} aria-hidden="true" />

      <div className={`container ${styles.heroContent}`}>
        <div className={styles.heroText}>
          <span className={styles.heroBadge}>Catálogo oficial</span>
          <h1 className={styles.heroTitle}>
            Ediciones Sab
            <span className={styles.heroAccent}> selección y confianza</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Una tienda clara, cercana y cuidada para explorar productos,
            consultar disponibilidad y avanzar con tu compra de forma simple.
          </p>
          <div className={styles.heroActions}>
            <Link href="/productos" className="btn btn-primary">
              Ver catálogo
            </Link>
            <Link href="/checkout" className="btn btn-secondary">
              Ir al carrito
            </Link>
          </div>
        </div>

        <div className={styles.heroLogoPanel} aria-label="Logo de Ediciones Sab">
          <div className={styles.logoRing}>
            <img src="/logo-ediciones-sab.jpg" alt="Ediciones Sab" />
          </div>
          <p>Atención personalizada y catálogo actualizado.</p>
        </div>

        <div className={styles.heroStats}>
          {[
            { value: "Online", label: "Catálogo disponible" },
            { value: "24hs", label: "Respuesta estimada" },
            { value: "Seguro", label: "Compra acompañada" },
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

function Categorias() {
  return (
    <section className={styles.section}>
      <div className="container">
        <h2 className={styles.sectionTitle}>Explorá la tienda</h2>
        <div className={styles.categoriasGrid}>
          {CATEGORIAS.map(({ label, icon }) => (
            <Link
              key={label}
              href="/productos"
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

function ProductosDestacados({ productos, onAddToCart }) {
  if (!productos.length) return null;

  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Productos destacados</h2>
          <Link href="/productos" className={styles.verTodos}>
            Ver todos
          </Link>
        </div>
        <div className={styles.productosGrid}>
          {productos.map((producto) => (
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

function BannerPromo() {
  return (
    <section className={styles.bannerPromo}>
      <div className="container">
        <div className={styles.bannerInner}>
          <div className={styles.bannerText}>
            <h2 className={styles.bannerTitle}>Consultá disponibilidad y entrega</h2>
            <p>Coordiná tu pedido con atención personalizada desde el catálogo.</p>
          </div>
          <Link href="/productos" className="btn btn-primary">
            Empezar consulta
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  const { agregar } = useCart();
  const [destacados, setDestacados] = useState([]);

  useEffect(() => {
    getProductosDestacados()
      .then(setDestacados)
      .catch(() => setDestacados([]));
  }, []);

  return (
    <>
      <Hero />
      <Categorias />
      <ProductosDestacados productos={destacados} onAddToCart={agregar} />
      <BannerPromo />
    </>
  );
}

HomePage.getLayout = withLayout({
  title: "Inicio",
  description: "Ediciones Sab - catálogo online con atención personalizada",
});
