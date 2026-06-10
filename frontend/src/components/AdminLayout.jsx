// src/components/AdminLayout.jsx
// Layout separado para las páginas /admin (sin Navbar público ni Footer)
import { useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Head from "next/head";
import { useAuth } from "../context/AuthContext";
import styles from "./AdminLayout.module.css";

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Productos",  icon: "📦" },
  { href: "/admin/pedidos",   label: "Pedidos",    icon: "🛒" },
];

function AdminSidebar({ onLogout }) {
  const router = useRouter();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarLogo}>
        <span>⚡</span>
        <span>Admin</span>
      </div>

      <nav className={styles.sidebarNav}>
        {NAV_ITEMS.map(({ href, label, icon }) => (
          <Link
            key={href}
            href={href}
            className={`${styles.navItem} ${router.pathname === href ? styles.navActivo : ""}`}
          >
            <span>{icon}</span>
            <span>{label}</span>
          </Link>
        ))}
      </nav>

      <div className={styles.sidebarFooter}>
        <Link href="/" className={styles.verSitio} target="_blank">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
          Ver sitio
        </Link>
        <button className={styles.logoutBtn} onClick={onLogout}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}

export default function AdminLayout({ children, title = "Admin" }) {
  const { usuario, cargando, logout } = useAuth();
  const router = useRouter();

  // Redirigir si no está logueado
  useEffect(() => {
    if (!cargando && !usuario) {
      router.replace("/admin/login");
    }
  }, [usuario, cargando, router]);

  const handleLogout = async () => {
    await logout();
    router.push("/admin/login");
  };

  if (cargando || !usuario) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{title} | TechStore Admin</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <div className={styles.wrapper}>
        <AdminSidebar onLogout={handleLogout} />
        <main className={styles.main}>
          {children}
        </main>
      </div>
    </>
  );
}

// Helper para asignar AdminLayout a una página admin
export function withAdminLayout(title = "Admin") {
  return (page) => <AdminLayout title={title}>{page}</AdminLayout>;
}
