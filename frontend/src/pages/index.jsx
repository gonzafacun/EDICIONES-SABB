import { useState, useEffect } from "react";
import Link from "next/link";
import { withLayout } from "../components/Layout";

import { getProductosDestacados } from "../services/productos";
import ProductCard from "../components/ProductCard";
import styles from "./index.module.css";

const CATEGORIAS = [
  { label: "Smart TVs", href: "/productos?categoria=Smart TV", icon: "📺" },
  { label: "Celulares", href: "/productos?categoria=Celulares", icon: "📱" },
  { label: "Climatización", href: "/productos?categoria=Ventiladores", icon: "🌬️" },
  { label: "Lavarropas", href: "/productos?categoria=Lavarropas", icon: "🧼" },
];

function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.heroBg} aria-hidden="true" />

      <div className={`container ${styles.heroContent}`}>
        <div className={styles.heroText}>
          <span className={styles.heroBadge}>Tecnología y Electrohogar</span>
          <h1 className={styles.heroTitle}>
            Ediciones Sab
            <span className={styles.heroAccent}> tecnología para tu hogar</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Encontrá los mejores electrodomésticos, televisores, notebooks y soluciones de climatización.
            Asesoramiento directo y catálogo completo con garantía oficial.
          </p>
          <div className={styles.heroActions}>
            <Link href="/productos" className="btn btn-primary">
              Ver catálogo completo
            </Link>
            <Link href="/checkout" className="btn btn-secondary">
              Ver mi carrito
            </Link>
          </div>
        </div>

        <div className={styles.heroLogoPanel} aria-label="Logo de Ediciones Sab">
          <div className={styles.logoRing}>
            <img src="/logo-ediciones-sab.jpg" alt="Ediciones Sab" />
          </div>
          <p>Equipamiento de marcas líderes con atención personalizada.</p>
        </div>


      </div>
    </section>
  );
}

function Categorias() {
  return (
    <section className={styles.section}>
      <div className="container">
        <h2 className={styles.sectionTitle}>Explorá por categoría</h2>
        <div className={styles.categoriasGrid}>
          {CATEGORIAS.map(({ label, icon, href }) => (
            <Link
              key={label}
              href={href}
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

function ProductosDestacados({ productos }) {
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
            <h2 className={styles.bannerTitle}>¿Buscás un modelo en específico?</h2>
            <p>Consultá por disponibilidad, envíos o especificaciones de cualquier electrodoméstico.</p>
          </div>
          <a
            href="https://wa.me/5493644677203?text=Hola%2C%20quiero%20hacer%20una%20consulta%20sobre%20un%20producto"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
          >
            Hacer una consulta
          </a>
        </div>
      </div>
    </section>
  );
}

export async function getStaticProps() {
  try {
    const destacados = await getProductosDestacados();
    return {
      props: {
        destacadosInitial: destacados || [],
      },
    };
  } catch (error) {
    console.error("Error en getStaticProps:", error);
    return {
      props: {
        destacadosInitial: [],
      },
    };
  }
}

export default function HomePage({ destacadosInitial }) {
  const [destacados, setDestacados] = useState(destacadosInitial || []);

  useEffect(() => {
    // Hidratación en caliente para asegurar stock y precios más recientes
    getProductosDestacados()
      .then(setDestacados)
      .catch(() => {});
  }, []);

  return (
    <>
      <Hero />
      <Categorias />
      <ProductosDestacados productos={destacados} />
      <BannerPromo />
    </>
  );
}

HomePage.getLayout = withLayout({
  title: "Inicio",
  description: "Ediciones Sab - catálogo online con atención personalizada",
});
