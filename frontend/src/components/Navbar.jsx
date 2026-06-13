import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCart } from "../context/CartContext";
import styles from "./Navbar.module.css";

function CartIcon({ count = 0 }) {
  return (
    <Link href="/checkout" className={styles.cartBtn} aria-label={`Carrito, ${count} productos`}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
      {count > 0 && (
        <span className={styles.cartBadge} aria-hidden="true">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}

function HamburgerIcon({ open }) {
  return (
    <svg
      className={styles.hamburgerIcon}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    >
      <line className={`${styles.lineTop} ${open ? styles.lineTopOpen : ""}`} x1="3" y1="6" x2="21" y2="6" />
      <line className={`${styles.lineMid} ${open ? styles.lineMidOpen : ""}`} x1="3" y1="12" x2="21" y2="12" />
      <line className={`${styles.lineBottom} ${open ? styles.lineBottomOpen : ""}`} x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

const NAV_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/productos", label: "Productos" },
];

const CATEGORIAS_MENU = [
  { href: "/productos?categoria=Termotanques", label: "Termotanques" },
  { href: "/productos?categoria=Smart TV", label: "Smart TV" },
  { href: "/productos?categoria=Celulares", label: "Celulares" },
  { href: "/productos?categoria=Notebooks", label: "Notebooks" },
  { href: "/productos?categoria=Impresoras", label: "Impresoras" },
  { href: "/productos?categoria=Ventiladores", label: "Ventiladores" },
  { href: "/productos?categoria=Cocinas", label: "Cocinas" },
  { href: "/productos?categoria=Anafes", label: "Anafes" },
  { href: "/productos?categoria=Pavas eléctricas", label: "Pavas eléctricas" },
  { href: "/productos?categoria=Colchones", label: "Colchones" },
  { href: "/productos?categoria=Lavarropas", label: "Lavarropas" },
  { href: "/productos?categoria=Secarropas", label: "Secarropas" },
  { href: "/productos?categoria=Freezer", label: "Freezer" },
  { href: "/productos?categoria=Hornos eléctricos", label: "Hornos eléctricos" },
  { href: "/productos?categoria=Freidoras de aire", label: "Freidoras de aire" },
  { href: "/productos?categoria=Planchas", label: "Planchas" },
  { href: "/productos?categoria=Aspiradoras", label: "Aspiradoras" },
];

function BrandMark({ compact = false }) {
  return (
    <span className={compact ? styles.logoMobileBrand : styles.logo}>
      <img
        className={styles.logoImage}
        src="/logo-ediciones-sab.jpg"
        alt=""
        width={compact ? "44" : "52"}
        height={compact ? "44" : "52"}
      />
      <span className={styles.logoText}>Ediciones Sab</span>
    </span>
  );
}

export default function Navbar() {
  const { totalItems } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();
  const menuRef = useRef(null);
  const hamburgerRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [router.pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        (!hamburgerRef.current || !hamburgerRef.current.contains(e.target))
      ) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <header className={`${styles.navbar} ${scrolled ? styles.scrolled : ""}`} role="banner">
        <div className={`container ${styles.inner}`}>
          {/* Hamburger a la izquierda */}
          <button
            ref={hamburgerRef}
            className={styles.hamburgerBtn}
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          >
            <HamburgerIcon open={menuOpen} />
          </button>

          <Link href="/" className={styles.logoLink} aria-label="Ir al inicio">
            <BrandMark />
          </Link>

          <nav className={styles.navDesktop} aria-label="Navegación principal">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`${styles.navLink} ${router.pathname === href ? styles.active : ""}`}
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className={styles.actions}>
            <CartIcon count={totalItems} />
          </div>
        </div>
      </header>

      <div
        className={`${styles.overlay} ${menuOpen ? styles.overlayVisible : ""}`}
        aria-hidden="true"
        onClick={() => setMenuOpen(false)}
      />

      <nav
        id="mobile-menu"
        ref={menuRef}
        className={`${styles.mobileMenu} ${menuOpen ? styles.mobileMenuOpen : ""}`}
        aria-label="Menú móvil"
        aria-hidden={!menuOpen}
      >
        <div className={styles.mobileMenuHeader}>
          <BrandMark compact />
          <button className={styles.closeBtn} onClick={() => setMenuOpen(false)} aria-label="Cerrar menú">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="4" y1="4" x2="14" y2="14" />
              <line x1="14" y1="4" x2="4" y2="14" />
            </svg>
          </button>
        </div>

        <ul className={styles.mobileNavList} role="list">
          {NAV_LINKS.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className={`${styles.mobileNavLink} ${router.pathname === href ? styles.active : ""}`}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Categorías en el menú móvil */}
        <div className={styles.mobileCategorias}>
          <h3 className={styles.mobileCategoriasTitle}>Explorá la tienda</h3>
          <ul className={styles.mobileCategoriasList} role="list">
            {CATEGORIAS_MENU.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className={styles.mobileCategoriaLink}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.mobileMenuFooter}>
          <Link href="/checkout" className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }}>
            Ver carrito {totalItems > 0 && `(${totalItems})`}
          </Link>
        </div>
      </nav>
    </>
  );
}