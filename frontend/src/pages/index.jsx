import { useState } from "react";
import Link from "next/link";
import { withLayout } from "../components/Layout";
import ProductCard from "../components/ProductCard";
import styles from "./index.module.css";

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
    nombre: 'Monitor Samsung 27" Full HD',
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
];

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

function ProductosDestacados({ onAddToCart }) {
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
  const [cartCount, setCartCount] = useState(0);

  const handleAddToCart = () => {
    setCartCount((prev) => prev + 1);
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
  description: "Ediciones Sab - catálogo online con atención personalizada",
});
