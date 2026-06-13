import { useState, useEffect } from "react";
import { withAdminLayout } from "../../components/AdminLayout";
import { useFetch } from "../../hooks/useFetch";
import { getProductos, crearProducto, actualizarProducto, eliminarProducto } from "../../services/productos";
import formatPrice from "../../utils/formatPrice";
import styles from "./dashboard.module.css";

const CATEGORIAS = [
  "Termotanques",
  "Smart TV",
  "Celulares",
  "Notebooks",
  "Impresoras",
  "Ventiladores",
  "Cocinas",
  "Anafes",
  "Pavas eléctricas",
  "Colchones",
  "Lavarropas",
  "Secarropas",
  "Freezer",
  "Hornos eléctricos",
  "Otros"
];

const PRODUCTO_VACIO = {
  nombre: "", precio: "",
  categoria: "", stock: "",
};

function ModalProducto({ producto, onGuardar, onCerrar }) {
  const esNuevo = !producto?.id;
  const [form, setForm] = useState(producto || PRODUCTO_VACIO);
  const [errores, setErrores] = useState({});
  const [guardando, setGuardando] = useState(false);

  const set = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrores((e) => ({ ...e, [key]: "" }));
  };

  const validar = () => {
    const e = {};
    if (!form.nombre.trim()) e.nombre = "Requerido";
    if (!form.precio || form.precio <= 0) e.precio = "Precio inválido";
    if (!form.categoria) e.categoria = "Requerido";
    if (form.stock === "" || form.stock < 0) e.stock = "Stock inválido";
    setErrores(e);
    return Object.keys(e).length === 0;
  };

  const handleGuardar = async () => {
    if (!validar()) return;
    setGuardando(true);
    try {
      await onGuardar({
        ...form,
        precio: Number(form.precio),
        precioOriginal: form.precioOriginal ? Number(form.precioOriginal) : null,
        stock: Number(form.stock),
      });
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={(e) => e.target === e.currentTarget && onCerrar()}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitulo}>{esNuevo ? "Nuevo producto" : "Editar producto"}</h2>
          <button className={styles.modalClose} onClick={onCerrar} aria-label="Cerrar">✕</button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.formGrid}>

            <div className={`${styles.formGrupo} ${styles.fullWidth}`}>
              <label className={styles.formLabel}>Nombre *</label>
              <input className={`${styles.formInput} ${errores.nombre ? styles.inputError : ""}`}
                type="text" placeholder='Ej: Smart TV 50" 4K'
                value={form.nombre} onChange={(e) => set("nombre", e.target.value)} />
              {errores.nombre && <span className={styles.errorMsg}>{errores.nombre}</span>}
            </div>

            <div className={styles.formGrupo}>
              <label className={styles.formLabel}>Categoría *</label>
              <select className={`${styles.formInput} ${errores.categoria ? styles.inputError : ""}`}
                value={form.categoria} onChange={(e) => set("categoria", e.target.value)}>
                <option value="">Seleccioná...</option>
                {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              {errores.categoria && <span className={styles.errorMsg}>{errores.categoria}</span>}
            </div>

            <div className={styles.formGrupo}>
              <label className={styles.formLabel}>Stock *</label>
              <input className={`${styles.formInput} ${errores.stock ? styles.inputError : ""}`}
                type="number" min="0" placeholder="0"
                value={form.stock} onChange={(e) => set("stock", e.target.value)} />
              {errores.stock && <span className={styles.errorMsg}>{errores.stock}</span>}
            </div>

            <div className={styles.formGrupo}>
              <label className={styles.formLabel}>Precio *</label>
              <input className={`${styles.formInput} ${errores.precio ? styles.inputError : ""}`}
                type="number" min="0" placeholder="50000"
                value={form.precio} onChange={(e) => set("precio", e.target.value)} />
              {errores.precio && <span className={styles.errorMsg}>{errores.precio}</span>}
            </div>



          </div>
        </div>

        <div className={styles.modalFooter}>
          <button className="btn btn-secondary" onClick={onCerrar}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleGuardar} disabled={guardando}>
            {guardando ? <><span className={styles.spinner} /> Guardando...</> : (esNuevo ? "Crear producto" : "Guardar cambios")}
          </button>
        </div>
      </div>
    </div>
  );
}

function ModalConfirmar({ nombre, onConfirmar, onCancelar }) {
  return (
    <div className={styles.modalOverlay}>
      <div className={`${styles.modal} ${styles.modalChico}`}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitulo}>¿Eliminar producto?</h2>
        </div>
        <div className={styles.modalBody}>
          <p className={styles.confirmarTxt}>
            Vas a eliminar <strong>{nombre}</strong>. Esta acción no se puede deshacer.
          </p>
        </div>
        <div className={styles.modalFooter}>
          <button className="btn btn-secondary" onClick={onCancelar}>Cancelar</button>
          <button className={`btn ${styles.btnEliminar}`} onClick={onConfirmar}>Eliminar</button>
        </div>
      </div>
    </div>
  );
}

function FilaProducto({ producto, onEditar, onEliminar }) {
  return (
    <tr className={styles.fila}>
      <td className={styles.tdNombre}>
        <span className={styles.nombreProducto}>{producto.nombre}</span>
      </td>
      <td className={styles.tdCategoria}>{producto.categoria}</td>
      <td className={styles.tdPrecio}>
        <span>{formatPrice(producto.precio)}</span>
      </td>
      <td className={styles.tdStock}>
        <span className={`${styles.stockBadge} ${producto.stock === 0 ? styles.stockCero : producto.stock <= 3 ? styles.stockBajo : styles.stockOk}`}>
          {producto.stock === 0 ? "Sin stock" : `${producto.stock} uds`}
        </span>
      </td>
      <td className={styles.tdAcciones}>
        <button className={styles.btnEditar} onClick={() => onEditar(producto)} aria-label="Editar">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          Editar
        </button>
        <button className={styles.btnBorrar} onClick={() => onEliminar(producto)} aria-label="Eliminar">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
          </svg>
          Eliminar
        </button>
      </td>
    </tr>
  );
}

export default function DashboardPage() {
  const { data: productos, cargando, error, recargar } = useFetch(() => getProductos(), []);
  const [busqueda, setBusqueda] = useState("");
  const [modalEditar, setModalEditar] = useState(null);
  const [modalNuevo, setModalNuevo] = useState(false);
  const [modalBorrar, setModalBorrar] = useState(null);

  const lista = productos || [];
  const productosFiltrados = lista.filter((p) =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    (p.categoria || "").toLowerCase().includes(busqueda.toLowerCase())
  );

  const handleGuardar = async (prod) => {
    if (prod.id) {
      await actualizarProducto(prod.id, {
        nombre: prod.nombre,
        precio: Number(prod.precio),
        categoria: prod.categoria,
        stock: Number(prod.stock),
      });
    } else {
      await crearProducto({
        nombre: prod.nombre,
        precio: Number(prod.precio),
        categoria: prod.categoria,
        stock: Number(prod.stock),
      });
    }
    setModalEditar(null);
    setModalNuevo(false);
    recargar();
  };

  const handleEliminar = async () => {
    await eliminarProducto(modalBorrar.id);
    setModalBorrar(null);
    recargar();
  };

  const totalProductos = lista.length;
  const sinStock = lista.filter((p) => p.stock === 0).length;

  if (cargando) {
    return (
      <div className={styles.page}>
        <div style={{ textAlign: "center", padding: "4rem 0" }}>
          <div className={styles.spinner} />
          <p>Cargando productos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page}>
        <div style={{ textAlign: "center", padding: "4rem 0" }}>
          <p>Error al cargar productos: {error}</p>
          <button className="btn btn-primary" onClick={recargar}>Reintentar</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>

      <div className={styles.stats}>
        {[
          { label: "Total productos", valor: totalProductos, icon: "📦" },
          { label: "Sin stock", valor: sinStock, icon: "⚠️", alerta: sinStock > 0 },
        ].map(({ label, valor, icon, alerta }) => (
          <div key={label} className={`${styles.statCard} ${alerta ? styles.statAlerta : ""}`}>
            <span className={styles.statIcon}>{icon}</span>
            <div>
              <p className={styles.statValor}>{valor}</p>
              <p className={styles.statLabel}>{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.acciones}>
        <div className={styles.searchWrapper}>
          <svg className={styles.searchIcon} width="15" height="15" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="search"
            placeholder="Buscar producto..."
            className={styles.searchInput}
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        <button className="btn btn-primary" onClick={() => setModalNuevo(true)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Nuevo producto
        </button>
      </div>

      <div className={styles.tablaWrapper}>
        <table className={styles.tabla}>
          <thead>
            <tr className={styles.thead}>
              <th className={styles.th}>Nombre</th>
              <th className={styles.th}>Categoría</th>
              <th className={styles.th}>Precio</th>
              <th className={styles.th}>Stock</th>
              <th className={styles.th}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productosFiltrados.length === 0 ? (
              <tr>
                <td colSpan={6} className={styles.vacio}>
                  No hay productos que coincidan con la búsqueda.
                </td>
              </tr>
            ) : (
              productosFiltrados.map((p) => (
                <FilaProducto
                  key={p.id}
                  producto={p}
                  onEditar={setModalEditar}
                  onEliminar={setModalBorrar}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {(modalNuevo || modalEditar) && (
        <ModalProducto
          producto={modalEditar || null}
          onGuardar={handleGuardar}
          onCerrar={() => { setModalNuevo(false); setModalEditar(null); }}
        />
      )}

      {modalBorrar && (
        <ModalConfirmar
          nombre={modalBorrar.nombre}
          onConfirmar={handleEliminar}
          onCancelar={() => setModalBorrar(null)}
        />
      )}
    </div>
  );
}

DashboardPage.getLayout = withAdminLayout("Productos");
