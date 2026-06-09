// src/pages/productos/[id].jsx
import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { withLayout } from "../../components/Layout";
import styles from "./[id].module.css";

// ─── Datos de ejemplo (se reemplazarán con Firestore) ────
const PRODUCTOS = [
  {
    id: "1",
    nombre: "Notebook Lenovo IdeaPad 15",
    precio: 850000,
    precioOriginal: 1050000,
    categoria: "Notebooks",
    destacado: true,
    stock: 5,
    imagen: null,
    imagenes: [null, null, null],
    descripcion: "Notebook ideal para trabajo y estudio. Procesador Intel Core i5 de 12va generación, memoria RAM DDR4 de 8GB ampliable hasta 32GB, almacenamiento SSD NVMe de 512GB para arranques ultra rápidos. Pantalla Full HD de 15.6\" anti-reflejos con panel IPS.",
    especificaciones: [
      { label: "Procesador",    valor: "Intel Core i5-1235U" },
      { label: "RAM",           valor: "8GB DDR4 3200MHz"    },
      { label: "Almacenamiento",valor: "512GB SSD NVMe"      },
      { label: "Pantalla",      valor: '15.6" Full HD IPS'   },
      { label: "Sistema Op.",   valor: "Windows 11 Home"     },
      { label: "Batería",       valor: "45Wh, hasta 8hs"     },
      { label: "Peso",          valor: "1.7 kg"              },
      { label: "Garantía",      valor: "12 meses oficial"    },
    ],
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
    imagenes: [null, null],
    descripcion: "Monitor Samsung de 27 pulgadas con resolución Full HD 1920x1080. Panel IPS con 75Hz de frecuencia de actualización, tiempo de respuesta de 5ms y tecnología FreeSync para una experiencia visual fluida.",
    especificaciones: [
      { label: "Tamaño",        valor: '27"'                 },
      { label: "Resolución",    valor: "1920×1080 Full HD"   },
      { label: "Panel",         valor: "IPS"                 },
      { label: "Frecuencia",    valor: "75 Hz"               },
      { label: "Respuesta",     valor: "5ms"                 },
      { label: "Conectividad",  valor: "HDMI, DisplayPort"   },
      { label: "Garantía",      valor: "12 meses oficial"    },
    ],
  },
  {
    id: "3",  nombre: "Teclado Mecánico Redragon K552",    precio: 95000,  precioOriginal: 120000, categoria: "Periféricos",    stock: 10, imagen: null, imagenes: [null], descripcion: "Teclado mecánico compacto TKL con switches Red (lineales). Retroiluminación RGB por tecla, construcción robusta con base de metal. Ideal para gaming y productividad.", especificaciones: [{ label: "Switches", valor: "Red (Outemu)" }, { label: "Layout", valor: "TKL 87 teclas" }, { label: "Retroiluminación", valor: "RGB por tecla" }, { label: "Conexión", valor: "USB-A" }, { label: "Garantía", valor: "12 meses" }],
  },
  {
    id: "4",  nombre: "Mouse Logitech G305 Inalámbrico",   precio: 78000,  precioOriginal: null,   categoria: "Periféricos",    stock: 0,  imagen: null, imagenes: [null], descripcion: "Mouse gaming inalámbrico con sensor HERO 12K. Hasta 250 horas de batería con 1 pila AA, receptor USB LIGHTSPEED de baja latencia.", especificaciones: [{ label: "Sensor", valor: "HERO 12K" }, { label: "DPI", valor: "200 - 12.000" }, { label: "Conexión", valor: "LIGHTSPEED / Bluetooth" }, { label: "Batería", valor: "250hs (1x AA)" }, { label: "Garantía", valor: "24 meses Logitech" }],
  },
  {
    id: "5",  nombre: "Auriculares HyperX Cloud II",       precio: 185000, precioOriginal: 210000, categoria: "Audio",          stock: 7,  imagen: null, imagenes: [null, null], descripcion: "Auriculares gaming con sonido surround virtual 7.1. Micrófono desmontable con cancelación de ruido, drivers de 53mm y almohadillas de memory foam.", especificaciones: [{ label: "Drivers", valor: "53mm" }, { label: "Frecuencia", valor: "15Hz - 25KHz" }, { label: "Micrófono", valor: "Desmontable, cancelación ruido" }, { label: "Conexión", valor: "USB + 3.5mm" }, { label: "Garantía", valor: "24 meses" }],
  },
  {
    id: "6",  nombre: "SSD Kingston 1TB NVMe M.2",         precio: 130000, precioOriginal: null,   categoria: "Almacenamiento", stock: 12, imagen: null, imagenes: [null], descripcion: "SSD NVMe PCIe 4.0 con velocidades de lectura de hasta 3500 MB/s y escritura de 2500 MB/s. Factor de forma M.2 2280, compatible con la mayoría de notebooks y PCs de escritorio.", especificaciones: [{ label: "Capacidad", valor: "1TB" }, { label: "Interfaz", valor: "NVMe PCIe 4.0 M.2" }, { label: "Lectura", valor: "3500 MB/s" }, { label: "Escritura", valor: "2500 MB/s" }, { label: "Garantía", valor: "5 años Kingston" }],
  },
];

function formatPrice(price) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(price);
}

// ─── Galería de imágenes ──────────────────────────────────
function Galeria({ imagenes, nombre }) {
  const [activa, setActiva] = useState(0);

  return (
    <div className={styles.galeria}>
      {/* Imagen principal */}
      <div className={styles.imagenPrincipal}>
        {imagenes[activa] ? (
          <img src={imagenes[activa]} alt={nombre} className={styles.img} />
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

      {/* Miniaturas */}
      {imagenes.length > 1 && (
        <div className={styles.miniaturas}>
          {imagenes.map((img, i) => (
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

// ─── Selector de cantidad ─────────────────────────────────
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

// ─── Página de detalle ────────────────────────────────────
export default function ProductoDetallePage() {
  const router   = useRouter();
  const { id }   = router.query;
  const producto = PRODUCTOS.find((p) => p.id === id);

  const [cantidad, setCantidad]       = useState(1);
  const [agregado, setAgregado]       = useState(false);
  const [tabActiva, setTabActiva]     = useState("descripcion");

  // Loading state mientras Next.js resuelve el id
  if (!router.isReady) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
      </div>
    );
  }

  // 404 si no existe el producto
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
  const descuento      = tieneDescuento ? Math.round((1 - producto.precio / producto.precioOriginal) * 100) : null;
  const sinStock       = producto.stock === 0;

  const handleAgregar = () => {
    // TODO: integrar con contexto global del carrito
    setAgregado(true);
    setTimeout(() => setAgregado(false), 2000);
  };

  return (
    <div className={styles.page}>
      <div className="container">

        {/* Breadcrumb */}
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/">Inicio</Link>
          <span aria-hidden="true">›</span>
          <Link href="/productos">Productos</Link>
          <span aria-hidden="true">›</span>
          <Link href={`/productos?categoria=${encodeURIComponent(producto.categoria)}`}>
            {producto.categoria}
          </Link>
          <span aria-hidden="true">›</span>
          <span aria-current="page">{producto.nombre}</span>
        </nav>

        {/* Layout principal */}
        <div className={styles.layout}>

          {/* Galería */}
          <Galeria imagenes={producto.imagenes} nombre={producto.nombre} />

          {/* Info del producto */}
          <div className={styles.info}>
            <span className={styles.categoria}>{producto.categoria}</span>
            <h1 className={styles.nombre}>{producto.nombre}</h1>

            {/* Precio */}
            <div className={styles.precioWrapper}>
              <span className={styles.precio}>{formatPrice(producto.precio)}</span>
              {tieneDescuento && (
                <>
                  <span className={styles.precioOriginal}>{formatPrice(producto.precioOriginal)}</span>
                  <span className={styles.badgeDescuento}>−{descuento}%</span>
                </>
              )}
            </div>

            {/* Cuotas */}
            <p className={styles.cuotas}>
              hasta <strong>12 cuotas sin interés</strong> de{" "}
              {formatPrice(Math.ceil(producto.precio / 12))} con E-pagos
            </p>

            {/* Stock */}
            <div className={styles.stockInfo}>
              {sinStock ? (
                <span className={styles.sinStock}>✗ Sin stock</span>
              ) : (
                <span className={styles.conStock}>✓ En stock ({producto.stock} disponibles)</span>
              )}
            </div>

            {/* Cantidad + botón */}
            {!sinStock && (
              <div className={styles.compraWrapper}>
                <div className={styles.cantidadWrapper}>
                  <label className={styles.cantidadLabel}>Cantidad</label>
                  <SelectorCantidad
                    cantidad={cantidad}
                    onChange={setCantidad}
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

            {/* Garantías */}
            <ul className={styles.garantias}>
              {[
                { icon: "🚚", texto: "Envío a todo el país" },
                { icon: "🛡️", texto: "Garantía oficial"    },
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

        {/* Tabs: descripción + especificaciones */}
        <div className={styles.tabs}>
          <div className={styles.tabsNav} role="tablist">
            {[
              { id: "descripcion",      label: "Descripción"      },
              { id: "especificaciones", label: "Especificaciones"  },
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
            {tabActiva === "especificaciones" && (
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
