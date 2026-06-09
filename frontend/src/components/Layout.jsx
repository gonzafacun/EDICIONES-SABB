// src/components/Layout.jsx
// Estructura visual común que envuelve todas las páginas públicas
// Las páginas de /admin usan su propio layout

import Head from "next/head";
import Link from "next/link";
import Navbar from "./Navbar";
import styles from "./Layout.module.css";

// ─── Footer ──────────────────────────────────────────────
function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.footerInner}`}>

        {/* Col 1: Marca */}
        <div className={styles.footerBrand}>
          <span className={styles.footerLogo}>
            <span>⚡</span> TechStore
          </span>
          <p className={styles.footerTagline}>
            Tecnología al mejor precio,<br />con envío a todo el país.
          </p>
        </div>

        {/* Col 2: Links */}
        <div className={styles.footerCol}>
          <h4 className={styles.footerHeading}>Tienda</h4>
          <ul className={styles.footerLinks}>
            <li><Link href="/productos">Todos los productos</Link></li>
            <li><Link href="/checkout">Carrito</Link></li>
          </ul>
        </div>

        {/* Col 3: Contacto */}
        <div className={styles.footerCol}>
          <h4 className={styles.footerHeading}>Contacto</h4>
          <ul className={styles.footerLinks}>
            <li>
              <a
                href="https://wa.me/5491100000000"
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp
              </a>
            </li>
            <li>
              <a href="mailto:info@techstore.com">info@techstore.com</a>
            </li>
          </ul>
        </div>

      </div>

      {/* Barra inferior */}
      <div className={styles.footerBottom}>
        <div className="container">
          <p className={styles.footerCopy}>
            © {year} TechStore. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}

// ─── Layout principal ─────────────────────────────────────
export default function Layout({
  children,
  title = "TechStore",
  description = "E-commerce de tecnología y electrónica",
  cartCount = 0,
}) {
  const fullTitle = title === "TechStore" ? title : `${title} | TechStore`;

  return (
    <>
      <Head>
        <title>{fullTitle}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta charSet="UTF-8" />
        {/* Open Graph */}
        <meta property="og:title"       content={fullTitle} />
        <meta property="og:description" content={description} />
        <meta property="og:type"        content="website" />
        {/* Favicon placeholder */}
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.pageWrapper}>
        <Navbar cartCount={cartCount} />

        <main className={styles.pageContent} id="main-content">
          {children}
        </main>

        <Footer />
      </div>
    </>
  );
}

// ─── Helper: asignar Layout a una página ─────────────────
// Uso en cualquier page:
//   MiPagina.getLayout = withLayout({ title: "..." });
export function withLayout(props = {}) {
  return (page) => <Layout {...props}>{page}</Layout>;
}
