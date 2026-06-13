import Head from "next/head";
import Link from "next/link";
import Navbar from "./Navbar";
import styles from "./Layout.module.css";

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.footerInner}`}>
        <div className={styles.footerBrand}>
          <span className={styles.footerLogo}>
            <img src="/logo-ediciones-sab.jpg" alt="" width="58" height="58" />
            <span>Ediciones Sab</span>
          </span>
          <p className={styles.footerTagline}>
            Electrodomésticos y tecnología.
            <br />
            🚀 ¡Tenemos las mejores promos para vos!
          </p>
        </div>

        <div className={styles.footerCol}>
          <h4 className={styles.footerHeading}>Tienda</h4>
          <ul className={styles.footerLinks}>
            <li><Link href="/productos">Todos los productos</Link></li>
            <li><Link href="/checkout">Carrito</Link></li>
          </ul>
        </div>

        <div className={styles.footerCol}>
          <h4 className={styles.footerHeading}>Contacto & Horarios</h4>
          <ul className={styles.footerLinks}>
            <li>📍 Sáenz Peña, Chaco</li>
            <li>🕘 Lun a Vier: 9:00hs - 18:00hs</li>
            <li>
              <a href="https://wa.me/5493644677203" target="_blank" rel="noopener noreferrer" style={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>
                💬 Escribinos por WhatsApp
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className={styles.footerBottom}>
        <div className="container">
          <p className={styles.footerCopy}>
            © {year} Ediciones Sab. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function Layout({
  children,
  title = "Ediciones Sab",
  description = "Catálogo online de Ediciones Sab",
}) {
  const fullTitle = title === "Ediciones Sab" ? title : `${title} | Ediciones Sab`;

  return (
    <>
      <Head>
        <title>{fullTitle}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta charSet="UTF-8" />
        <meta property="og:title" content={fullTitle} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/logo-ediciones-sab.jpg" />
        <link rel="icon" href="/logo-ediciones-sab.jpg" />
      </Head>

      <div className={styles.pageWrapper}>
        <Navbar />

        <main className={styles.pageContent} id="main-content">
          {children}
        </main>

        <Footer />
      </div>
    </>
  );
}

export function withLayout(props = {}) {
  return (page) => <Layout {...props}>{page}</Layout>;
}
