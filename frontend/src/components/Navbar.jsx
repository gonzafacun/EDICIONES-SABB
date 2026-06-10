// src/components/Navbar.jsx
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
      className={`${styles.hamburgerIcon} ${open ? styles.open : ""}`}
      width="24" height="24" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round"
    >
      <line className={styles.lineTop}    x1="3" y1="6"  x2="21" y2="6"  />
      <line className={styles.lineMid}    x1="3" y1="12" x2="21" y2="12" />
      <line className={styles.lineBottom} x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

const NAV_LINKS = [
  { href: "/",          label: "Inicio"    },
  { href: "/productos", label: "Productos" },
];

export default function Navbar() {
  const { totalItems }               = useCart();
  const [menuOpen, setMenuOpen]      = useState(false);
  const [scrolled, setScrolled]      = useState(false);
  const router                       = useRouter();
  const menuRef                      = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [router.pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  return (
    <>
      <header className={`${styles.navbar} ${scrolled ? styles.scrolled : ""}`} role="banner">
        <div className={`container ${styles.inner}`}>
          <Link href="/" className={styles.logo} aria-label="Ir al inicio">
            <span className={styles.logoIcon}>⚡</span>
            <span className={styles.logoText}>TechStore</span>
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
            <button
              className={styles.hamburgerBtn}
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            >
              <HamburgerIcon open={menuOpen} />
            </button>
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
          <span className={styles.logoText}>TechStore</span>
          <button className={styles.closeBtn} onClick={() => setMenuOpen(false)} aria-label="Cerrar menú">✕</button>
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

        <div className={styles.mobileMenuFooter}>
          <Link href="/checkout" className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }}>
            Ver carrito {totalItems > 0 && `(${totalItems})`}
          </Link>
        </div>
      </nav>
    </>
  );
}
