import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { withLayout } from "../../components/Layout";
import { useCart } from "../../context/CartContext";
import { getProducto } from "../../services/productos";
import formatPrice from "../../utils/formatPrice";
import styles from "./[id].module.css";

function Galeria({ imagenes, nombre }) {
  const [activa, setActiva] = useState(0);
  const lista = imagenes && imagenes.length > 0 ? imagenes : [null];

  return (
    <div className={styles.galeria}>
      <div className={styles.imagenPrincipal}>
        {lista[activa] ? (
          <img src={lista[activa]} alt={nombre} className={styles.img} />
        ) : (
          <div className={styles.imagenPlaceholder}>
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1" strokeLinecap="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="m21 15-5-5L5 21" />
            </svg>
          </div>
        )}
      </div>

      {lista.length > 1 && (
        <div className={styles.miniaturas}>
          {lista.map((img, i) => (
            <button
              key={i}
              className={`${styles.miniatura} ${i === activa ? styles.miniaturaActiva : ""}`}
              onClick={() => setActiva(i)}
              aria-label={`Ver imagen ${i + 1}`}
            >
              {img ? (
                <img src={img} alt="" />
              ) : (
                <div className={styles.miniPlaceholder} />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SelectorCantidad({ cantidad, onChange, max }) {
  return (
    <div className={styles.cantidad}>
      <button
        className={styles.cantidadBtn}
        onClick={() => onChange(Math.max(1, cantidad - 1))}
        disabled={cantidad <= 1}
        aria-label="Restar uno"
      >−</button>
      <span className={styles.cantidadValor}>{cantidad}</span>
      <button
        className={styles.cantidadBtn}
        onClick={() => onChange(Math.min(max, cantidad + 1))}
        disabled={cantidad >= max}
        aria-label="Sumar uno"
      >+</button>
    </div>
  );
}

export default function ProductoDetallePage() {
  const router = useRouter();
  const { id } = router.query;
  const { agregar } = useCart();

  const [producto, setProducto] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [cantidadLocal, setCantidadLocal] = useState(1);
  const [agregado, setAgregado] = useState(false);
  const [tabActiva, setTabActiva] = useState("descripcion");

  useEffect(() => {
    if (!id) return;
    setCargando(true);
    getProducto(id)
      .then((data) => setProducto(data))
      .catch(() => setProducto(null))
      .finally(() => setCargando(false));
  }, [id]);

  if (!router.isReady || cargando) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
      </div>
    );
  }

  if (!producto) {
    return (
      <div className={styles.notFound}>
        <span>😕</span>
        <h2>Producto no encontrado</h2>
        <p>El producto que buscás no existe o fue eliminado.</p>
        <Link href="/productos" className="btn btn-primary">
          Ver catálogo
        </Link>
      </div>
    );
  }

  const tieneDescuento = producto.precioOriginal && producto.precioOriginal > producto.precio;
  const descuento = tieneDescuento ? Math.round((1 - producto.precio / producto.precioOriginal) * 100) : null;
  const sinStock = producto.stock === 0;

  const handleAgregar = () => {
    agregar(producto, cantidadLocal);
    setAgregado(true);
    setTimeout(() => setAgregado(false), 2000);
  };

  return (
    <div className={styles.page}>
      <div className="container">

        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/">Inicio</Link>
          <span aria-hidden="true">›</span>
          <Link href="/productos">Productos</Link>
          <span aria-hidden="true">›</span>
          {producto.categoria && (
            <>
              <Link href={`/productos?categoria=${encodeURIComponent(producto.categoria)}`}>
                {producto.categoria}
              </Link>
              <span aria-hidden="true">›</span>
            </>
          )}
          <span aria-current="page">{producto.nombre}</span>
        </nav>

        <div className={styles.layout}>

          <Galeria imagenes={producto.imagenes} nombre={producto.nombre} />

          <div className={styles.info}>
            {producto.categoria && (
              <span className={styles.categoria}>{producto.categoria}</span>
            )}
            <h1 className={styles.nombre}>{producto.nombre}</h1>

            <div className={styles.precioWrapper}>
              <span className={styles.precio}>{formatPrice(producto.precio)}</span>
              {tieneDescuento && (
                <>
                  <span className={styles.precioOriginal}>{formatPrice(producto.precioOriginal)}</span>
                  <span className={styles.badgeDescuento}>−{descuento}%</span>
                </>
              )}
            </div>

            <p className={styles.cuotas}>
              hasta <strong>12 cuotas sin interés</strong> de{" "}
              {formatPrice(Math.ceil(producto.precio / 12))} con E-pagos
            </p>

            <div className={styles.stockInfo}>
              {sinStock ? (
                <span className={styles.sinStock}>✗ Sin stock</span>
              ) : (
                <span className={styles.conStock}>✓ En stock ({producto.stock} disponibles)</span>
              )}
            </div>

            {!sinStock && (
              <div className={styles.compraWrapper}>
                <div className={styles.cantidadWrapper}>
                  <label className={styles.cantidadLabel}>Cantidad</label>
                  <SelectorCantidad
                    cantidad={cantidadLocal}
                    onChange={setCantidadLocal}
                    max={producto.stock}
                  />
                </div>

                <button
                  className={`btn btn-primary ${styles.btnAgregar} ${agregado ? styles.btnAgregado : ""}`}
                  onClick={handleAgregar}
                >
                  {agregado ? (
                    <>✓ Agregado al carrito</>
                  ) : (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                        <line x1="3" y1="6" x2="21" y2="6" />
                        <path d="M16 10a4 4 0 0 1-8 0" />
                      </svg>
                      Agregar al carrito
                    </>
                  )}
                </button>

                <Link href="/checkout" className="btn btn-secondary" style={{ textAlign: "center" }}>
                  Comprar ahora
                </Link>
              </div>
            )}

            <ul className={styles.garantias}>
              {[
                { icon: "🚚", texto: "Envío a todo el país" },
                { icon: "🛡️", texto: "Garantía oficial" },
                { icon: "↩️", texto: "30 días de devolución" },
              ].map(({ icon, texto }) => (
                <li key={texto} className={styles.garantiaItem}>
                  <span>{icon}</span>
                  <span>{texto}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className={styles.tabs}>
          <div className={styles.tabsNav} role="tablist">
            {[
              { id: "descripcion", label: "Descripción" },
              { id: "especificaciones", label: "Especificaciones" },
            ].map(({ id: tabId, label }) => (
              <button
                key={tabId}
                role="tab"
                aria-selected={tabActiva === tabId}
                className={`${styles.tabBtn} ${tabActiva === tabId ? styles.tabActivo : ""}`}
                onClick={() => setTabActiva(tabId)}
              >
                {label}
              </button>
            ))}
          </div>

          <div className={styles.tabContent} role="tabpanel">
            {tabActiva === "descripcion" && (
              <p className={styles.descripcion}>{producto.descripcion}</p>
            )}
            {tabActiva === "especificaciones" && producto.especificaciones && (
              <table className={styles.especTable}>
                <tbody>
                  {producto.especificaciones.map(({ label, valor }) => (
                    <tr key={label} className={styles.especRow}>
                      <td className={styles.especLabel}>{label}</td>
                      <td className={styles.especValor}>{valor}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

ProductoDetallePage.getLayout = withLayout({ title: "Detalle de producto" });
