// src/pages/productos/index.jsx
import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/router";
import { withLayout } from "../../components/Layout";
import ProductCard from "../../components/ProductCard";
import styles from "./index.module.css";

// ─── Datos de ejemplo (se reemplazarán con Firestore) ────
const TODOS_LOS_PRODUCTOS = [
  { id: "1",  nombre: "Notebook Lenovo IdeaPad 15",      precio: 850000,  precioOriginal: 1050000, categoria: "Notebooks",      destacado: true,  stock: 5,  imagen: null },
  { id: "2",  nombre: 'Monitor Samsung 27" Full HD',     precio: 420000,  precioOriginal: null,    categoria: "Monitores",      destacado: true,  stock: 3,  imagen: null },
  { id: "3",  nombre: "Teclado Mecánico Redragon K552",  precio: 95000,   precioOriginal: 120000,  categoria: "Periféricos",    destacado: true,  stock: 10, imagen: null },
  { id: "4",  nombre: "Mouse Logitech G305 Inalámbrico", precio: 78000,   precioOriginal: null,    categoria: "Periféricos",    destacado: true,  stock: 0,  imagen: null },
  { id: "5",  nombre: "Auriculares HyperX Cloud II",     precio: 185000,  precioOriginal: 210000,  categoria: "Audio",          destacado: true,  stock: 7,  imagen: null },
  { id: "6",  nombre: "SSD Kingston 1TB NVMe M.2",       precio: 130000,  precioOriginal: null,    categoria: "Almacenamiento", destacado: true,  stock: 12, imagen: null },
  { id: "7",  nombre: "Notebook HP Pavilion 14",         precio: 720000,  precioOriginal: 800000,  categoria: "Notebooks",      destacado: false, stock: 2,  imagen: null },
  { id: "8",  nombre: "Webcam Logitech C920 HD Pro",     precio: 95000,   precioOriginal: null,    categoria: "Periféricos",    destacado: false, stock: 6,  imagen: null },
  { id: "9",  nombre: "Disco Rígido Seagate 2TB",        precio: 85000,   precioOriginal: 95000,   categoria: "Almacenamiento", destacado: false, stock: 8,  imagen: null },
  { id: "10", nombre: "Smartphone Samsung Galaxy A55",   precio: 650000,  precioOriginal: null,    categoria: "Smartphones",    destacado: false, stock: 4,  imagen: null },
  { id: "11", nombre: "Tablet Lenovo Tab M10",           precio: 310000,  precioOriginal: 380000,  categoria: "Tablets",        destacado: false, stock: 3,  imagen: null },
  { id: "12", nombre: "Router TP-Link WiFi 6 AX1800",   precio: 145000,  precioOriginal: null,    categoria: "Redes",          destacado: false, stock: 9,  imagen: null },
];

const CATEGORIAS = [
  "Notebooks", "Monitores", "Periféricos", "Audio",
  "Almacenamiento", "Smartphones", "Tablets", "Redes",
];

const ORDENAR_OPCIONES = [
  { value: "destacado",   label: "Destacados primero" },
  { value: "precio_asc",  label: "Menor precio"       },
  { value: "precio_desc", label: "Mayor precio"       },
  { value: "nombre_asc",  label: "A → Z"              },
];

// ─── Panel de filtros ─────────────────────────────────────
function Filtros({ filtros, onChange, onReset, totalResultados }) {
  return (
    <aside className={styles.filtros}>
      <div className={styles.filtrosHeader}>
        <h2 className={styles.filtrosTitulo}>Filtros</h2>
        <button className={styles.resetBtn} onClick={onReset}>Limpiar</button>
      </div>

      {/* Categorías */}
      <div className={styles.filtroGrupo}>
        <h3 className={styles.filtroLabel}>Categoría</h3>
        <ul className={styles.filtroList}>
          <li>
            <button
              className={`${styles.filtroItem} ${!filtros.categoria ? styles.filtroActivo : ""}`}
              onClick={() => onChange("categoria", "")}
            >
              Todas
            </button>
          </li>
          {CATEGORIAS.map((cat) => (
            <li key={cat}>
              <button
                className={`${styles.filtroItem} ${filtros.categoria === cat ? styles.filtroActivo : ""}`}
                onClick={() => onChange("categoria", cat)}
              >
                {cat}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Solo ofertas */}
      <div className={styles.filtroGrupo}>
        <h3 className={styles.filtroLabel}>Ofertas</h3>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={filtros.soloOfertas}
            onChange={(e) => onChange("soloOfertas", e.target.checked)}
            className={styles.checkbox}
          />
          Solo productos en oferta
        </label>
      </div>

      {/* Solo con stock */}
      <div className={styles.filtroGrupo}>
        <h3 className={styles.filtroLabel}>Disponibilidad</h3>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={filtros.soloConStock}
            onChange={(e) => onChange("soloConStock", e.target.checked)}
            className={styles.checkbox}
          />
          Con stock disponible
        </label>
      </div>

      <p className={styles.totalResultados}>
        {totalResultados} resultado{totalResultados !== 1 ? "s" : ""}
      </p>
    </aside>
  );
}

// ─── Barra superior (búsqueda + orden) ───────────────────
function BarraSuperior({ busqueda, onBusqueda, orden, onOrden }) {
  return (
    <div className={styles.barraSuperior}>
      <div className={styles.searchWrapper}>
        <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="search"
          placeholder="Buscar productos..."
          value={busqueda}
          onChange={(e) => onBusqueda(e.target.value)}
          className={styles.searchInput}
          aria-label="Buscar productos"
        />
      </div>

      <select
        value={orden}
        onChange={(e) => onOrden(e.target.value)}
        className={styles.selectOrden}
        aria-label="Ordenar productos"
      >
        {ORDENAR_OPCIONES.map(({ value, label }) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>
    </div>
  );
}

// ─── Página catálogo ──────────────────────────────────────
export default function ProductosPage() {
  const router = useRouter();

  const [filtros, setFiltros] = useState({
    categoria: "",
    soloOfertas: false,
    soloConStock: false,
  });
  const [busqueda, setBusqueda]       = useState("");
  const [orden, setOrden]             = useState("destacado");
  const [menuFiltros, setMenuFiltros] = useState(false);

  // Leer query params al cargar (ej: /productos?categoria=Notebooks)
  useEffect(() => {
    if (!router.isReady) return;
    const { categoria, oferta } = router.query;
    if (categoria) setFiltros((f) => ({ ...f, categoria }));
    if (oferta === "true") setFiltros((f) => ({ ...f, soloOfertas: true }));
  }, [router.isReady, router.query]);

  const handleFiltro = (key, value) => setFiltros((prev) => ({ ...prev, [key]: value }));

  const handleReset = () => {
    setFiltros({ categoria: "", soloOfertas: false, soloConStock: false });
    setBusqueda("");
    setOrden("destacado");
  };

  // Filtrar y ordenar
  const productosFiltrados = useMemo(() => {
    let lista = [...TODOS_LOS_PRODUCTOS];

    if (filtros.categoria)    lista = lista.filter((p) => p.categoria === filtros.categoria);
    if (filtros.soloOfertas)  lista = lista.filter((p) => p.precioOriginal && p.precioOriginal > p.precio);
    if (filtros.soloConStock) lista = lista.filter((p) => p.stock > 0);

    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      lista = lista.filter(
        (p) => p.nombre.toLowerCase().includes(q) || p.categoria.toLowerCase().includes(q)
      );
    }

    switch (orden) {
      case "precio_asc":  lista.sort((a, b) => a.precio - b.precio); break;
      case "precio_desc": lista.sort((a, b) => b.precio - a.precio); break;
      case "nombre_asc":  lista.sort((a, b) => a.nombre.localeCompare(b.nombre)); break;
      default:            lista.sort((a, b) => (b.destacado ? 1 : 0) - (a.destacado ? 1 : 0));
    }

    return lista;
  }, [filtros, busqueda, orden]);

  return (
    <div className={styles.page}>
      <div className="container">

        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Productos</h1>
          <button
            className={styles.btnFiltrosMobile}
            onClick={() => setMenuFiltros((v) => !v)}
            aria-expanded={menuFiltros}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="8" y1="12" x2="20" y2="12" />
              <line x1="12" y1="18" x2="20" y2="18" />
            </svg>
            Filtros
          </button>
        </div>

        <div className={styles.layout}>

          {/* Sidebar */}
          <div className={`${styles.sidebar} ${menuFiltros ? styles.sidebarOpen : ""}`}>
            <Filtros
              filtros={filtros}
              onChange={handleFiltro}
              onReset={handleReset}
              totalResultados={productosFiltrados.length}
            />
          </div>

          {/* Grilla */}
          <div className={styles.main}>
            <BarraSuperior
              busqueda={busqueda}
              onBusqueda={setBusqueda}
              orden={orden}
              onOrden={setOrden}
            />

            {productosFiltrados.length === 0 ? (
              <div className={styles.sinResultados}>
                <span className={styles.sinResultadosIcon}>🔍</span>
                <h3>Sin resultados</h3>
                <p>Probá con otros filtros o términos de búsqueda.</p>
                <button className="btn btn-secondary" onClick={handleReset}>
                  Limpiar filtros
                </button>
              </div>
            ) : (
              <div className={styles.grid}>
                {productosFiltrados.map((producto) => (
                  <ProductCard key={producto.id} product={producto} />
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

ProductosPage.getLayout = withLayout({
  title: "Productos",
  description: "Catálogo completo de electrónica y tecnología",
});
