import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/router";
import { withLayout } from "../../components/Layout";
import { getProductos, getCategorias } from "../../services/productos";
import ProductCard from "../../components/ProductCard";
import styles from "./index.module.css";

const ORDENAR_OPCIONES = [
  { value: "nuevos", label: "Más nuevos" },
  { value: "precio_asc", label: "Menor precio" },
  { value: "precio_desc", label: "Mayor precio" },
  { value: "nombre_asc", label: "A → Z" },
];

function Filtros({ filtros, categorias, onChange, onReset, totalResultados }) {
  return (
    <aside className={styles.filtros}>
      <div className={styles.filtrosHeader}>
        <h2 className={styles.filtrosTitulo}>Filtros</h2>
        <button className={styles.resetBtn} onClick={onReset}>Limpiar</button>
      </div>

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
          {categorias.map((cat) => (
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

function BarraSuperior({ busqueda, onBusqueda, orden, onOrden, viewMode, onViewMode }) {
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

      <div className={styles.viewToggle}>
        <button
          className={`${styles.viewToggleBtn} ${viewMode === "list" ? styles.active : ""}`}
          onClick={() => onViewMode("list")}
          aria-label="Vista de lista"
          title="Ver en lista"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="8" y1="6" x2="21" y2="6"></line>
            <line x1="8" y1="12" x2="21" y2="12"></line>
            <line x1="8" y1="18" x2="21" y2="18"></line>
            <line x1="3" y1="6" x2="3.01" y2="6"></line>
            <line x1="3" y1="12" x2="3.01" y2="12"></line>
            <line x1="3" y1="18" x2="3.01" y2="18"></line>
          </svg>
        </button>
        <button
          className={`${styles.viewToggleBtn} ${viewMode === "grid" ? styles.active : ""}`}
          onClick={() => onViewMode("grid")}
          aria-label="Vista de cuadrícula"
          title="Ver en cuadrícula"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function ProductosPage() {
  const router = useRouter();

  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);

  const [filtros, setFiltros] = useState({
    categoria: "",
    soloConStock: false,
  });
  const [busqueda, setBusqueda] = useState("");
  const [orden, setOrden] = useState("nuevos");
  const [menuFiltros, setMenuFiltros] = useState(false);
  const [viewMode, setViewMode] = useState("grid"); // "grid" o "list"

  useEffect(() => {
    Promise.all([getProductos(), getCategorias()])
      .then(([prods, cats]) => {
        setProductos(prods);
        setCategorias(Array.isArray(cats) ? cats : []);
      })
      .catch(() => {})
      .finally(() => setCargando(false));
  }, []);

  useEffect(() => {
    if (!router.isReady) return;
    const { categoria } = router.query;
    if (categoria) setFiltros((f) => ({ ...f, categoria }));
  }, [router.isReady, router.query]);

  const handleFiltro = (key, value) => setFiltros((prev) => ({ ...prev, [key]: value }));

  const handleReset = () => {
    setFiltros({ categoria: "", soloConStock: false });
    setBusqueda("");
    setOrden("nuevos");
  };

  const productosFiltrados = useMemo(() => {
    let lista = [...productos];

    if (filtros.categoria) lista = lista.filter((p) => p.categoria === filtros.categoria);
    if (filtros.soloConStock) lista = lista.filter((p) => p.stock > 0);

    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      lista = lista.filter(
        (p) => p.nombre.toLowerCase().includes(q) || (p.categoria || "").toLowerCase().includes(q)
      );
    }

    switch (orden) {
      case "precio_asc": lista.sort((a, b) => a.precio - b.precio); break;
      case "precio_desc": lista.sort((a, b) => b.precio - a.precio); break;
      case "nombre_asc": lista.sort((a, b) => a.nombre.localeCompare(b.nombre)); break;
      default: lista.sort((a, b) => new Date(b.creado_en) - new Date(a.creado_en));
    }

    return lista;
  }, [productos, filtros, busqueda, orden]);

  if (cargando) {
    return (
      <div className={styles.page}>
        <div className="container" style={{ textAlign: "center", padding: "4rem 0" }}>
          <p>Cargando productos...</p>
        </div>
      </div>
    );
  }

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

          <div className={`${styles.sidebar} ${menuFiltros ? styles.sidebarOpen : ""}`}>
            <Filtros
              filtros={filtros}
              categorias={categorias}
              onChange={handleFiltro}
              onReset={handleReset}
              totalResultados={productosFiltrados.length}
            />
          </div>

          <div className={styles.main}>
            <BarraSuperior
              busqueda={busqueda}
              onBusqueda={setBusqueda}
              orden={orden}
              onOrden={setOrden}
              viewMode={viewMode}
              onViewMode={setViewMode}
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
              <div className={viewMode === "grid" ? styles.grid : styles.list}>
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
