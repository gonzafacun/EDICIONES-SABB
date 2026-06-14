import { useState, useEffect, useCallback } from "react";
import { withAdminLayout } from "../../components/AdminLayout";
import { getPedidos, actualizarPedido } from "../../services/pedidos";
import formatPrice from "../../utils/formatPrice";
import styles from "./pedidos.module.css";

const ESTADOS = {
  pendiente: { label: "Pendiente", color: styles.estadoPendiente },
  adeudada: { label: "Adeudada", color: styles.estadoAdeudada },
  pagado: { label: "Pagado", color: styles.estadoPagado },
  acreditado: { label: "Acreditado", color: styles.estadoAcreditado },
  rechazado: { label: "Rechazado", color: styles.estadoRechazado },
  cancelado: { label: "Cancelado", color: styles.estadoCancelado },
  reembolsado: { label: "Reembolsado", color: styles.estadoReembolsado },
  enviado: { label: "Enviado", color: styles.estadoEnviado },
  entregado: { label: "Entregado", color: styles.estadoEntregado },
};

const ESTADOS_SELECT = [
  { value: "", label: "Todos los estados" },
  { value: "pendiente", label: "Pendiente" },
  { value: "adeudada", label: "Adeudada" },
  { value: "pagado", label: "Pagado" },
  { value: "enviado", label: "Enviado" },
  { value: "entregado", label: "Entregado" },
  { value: "rechazado", label: "Rechazado" },
  { value: "cancelado", label: "Cancelado" },
  { value: "reembolsado", label: "Reembolsado" },
];

const ESTADOS_UPDATE = ["pendiente", "pagado", "enviado", "entregado", "rechazado", "cancelado", "reembolsado"];

function ModalDetalle({ pedido, onCerrar, onActualizarEstado }) {
  const [actualizando, setActualizando] = useState(false);
  const estadoInfo = ESTADOS[pedido.estado] || { label: pedido.estado, color: "" };

  const handleEstado = async (nuevoEstado) => {
    setActualizando(true);
    await onActualizarEstado(pedido.id, nuevoEstado);
    setActualizando(false);
  };

  const creadoEn = pedido.creado_en
    ? new Date(pedido.creado_en).toLocaleString("es-AR")
    : "—";

  return (
    <div className={styles.modalOverlay} onClick={(e) => e.target === e.currentTarget && onCerrar()}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitulo}>Pedido #{pedido.id.slice(0, 8).toUpperCase()}</h2>
          <button className={styles.modalClose} onClick={onCerrar} aria-label="Cerrar">✕</button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.detalleGrid}>
            <div className={styles.detalleGrupo}>
              <h3 className={styles.detalleLabel}>Estado</h3>
              <span className={`${styles.estadoBadge} ${estadoInfo.color}`}>{estadoInfo.label}</span>
            </div>

            <div className={styles.detalleGrupo}>
              <h3 className={styles.detalleLabel}>Total</h3>
              <span className={styles.detalleValor}>{formatPrice(pedido.total)}</span>
            </div>

            <div className={styles.detalleGrupo}>
              <h3 className={styles.detalleLabel}>Fecha</h3>
              <span className={styles.detalleValor}>{creadoEn}</span>
            </div>

            <div className={`${styles.detalleGrupo} ${styles.fullWidth}`}>
              <h3 className={styles.detalleLabel}>Comprador</h3>
              <div className={styles.compradorInfo}>
                <p><strong>{pedido.comprador?.nombre} {pedido.comprador?.apellido}</strong></p>
                <p>{pedido.comprador?.email}</p>
                <p>Tel: {pedido.comprador?.telefono} — DNI: {pedido.comprador?.dni}</p>
                <p>{pedido.comprador?.direccion}</p>
              </div>
            </div>

            <div className={`${styles.detalleGrupo} ${styles.fullWidth}`}>
              <h3 className={styles.detalleLabel}>Items</h3>
              <table className={styles.itemsTable}>
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Precio</th>
                    <th>Cant.</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {(pedido.items || []).map((item, i) => (
                    <tr key={i}>
                      <td>{item.nombre}</td>
                      <td>{formatPrice(item.precio)}</td>
                      <td>{item.cantidad}</td>
                      <td>{formatPrice(item.precio * item.cantidad)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button className="btn btn-secondary" onClick={onCerrar}>Cerrar</button>
          <div className={styles.estadoAcciones}>
            {ESTADOS_UPDATE.filter((e) => e !== pedido.estado).map((estado) => (
              <button
                key={estado}
                className={`btn ${["rechazado", "cancelado", "reembolsado"].includes(estado) ? styles.btnDanger : "btn-primary"}`}
                onClick={() => handleEstado(estado)}
                disabled={actualizando}
              >
                {actualizando ? "..." : `Marcar ${ESTADOS[estado]?.label || estado}`}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [modalDetalle, setModalDetalle] = useState(null);

  const fetchPedidos = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const data = await getPedidos({ estado: filtroEstado || undefined });
      setPedidos(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }, [filtroEstado]);

  useEffect(() => {
    fetchPedidos();
  }, [fetchPedidos]);

  const handleActualizarEstado = async (pedidoId, nuevoEstado) => {
    try {
      await actualizarPedido(pedidoId, nuevoEstado);
      setModalDetalle(null);
      fetchPedidos();
    } catch (err) {
      console.error("Error actualizando estado:", err);
      alert("Error al actualizar estado: " + err.message);
    }
  };

  const pedidosFiltrados = pedidos.filter((p) => {
    if (!busqueda.trim()) return true;
    const q = busqueda.toLowerCase();
    const nombre = `${p.comprador?.nombre || ""} ${p.comprador?.apellido || ""}`.toLowerCase();
    const email = (p.comprador?.email || "").toLowerCase();
    const id = p.id.toLowerCase();
    return nombre.includes(q) || email.includes(q) || id.includes(q);
  });

  const stats = {
    total: pedidos.length,
    pendientes: pedidos.filter((p) => p.estado === "pendiente" || p.estado === "adeudada").length,
    pagados: pedidos.filter((p) => p.estado === "pagado" || p.estado === "acreditado" || p.estado === "enviado" || p.estado === "entregado").length,
    rechazados: pedidos.filter((p) => p.estado === "rechazado" || p.estado === "cancelado" || p.estado === "reembolsado").length,
  };

  if (cargando) {
    return (
      <div className={styles.page}>
        <div style={{ textAlign: "center", padding: "4rem 0" }}>
          <div className={styles.spinner} />
          <p>Cargando pedidos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page}>
        <div style={{ textAlign: "center", padding: "4rem 0" }}>
          <p>Error: {error}</p>
          <button className="btn btn-primary" onClick={fetchPedidos}>Reintentar</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.stats}>
        {[
          { label: "Total pedidos", valor: stats.total, icon: "🛒" },
          { label: "Pendientes", valor: stats.pendientes, icon: "⏳", alerta: stats.pendientes > 0 },
          { label: "Pagados", valor: stats.pagados, icon: "✅" },
          { label: "Rechazados", valor: stats.rechazados, icon: "❌", alerta: stats.rechazados > 0 },
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
            placeholder="Buscar por nombre, email o ID..."
            className={styles.searchInput}
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        <select
          className={styles.selectEstado}
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
        >
          {ESTADOS_SELECT.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <button className="btn btn-secondary" onClick={fetchPedidos}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
          </svg>
          Actualizar
        </button>
      </div>

      <div className={styles.tablaWrapper}>
        <table className={styles.tabla}>
          <thead>
            <tr className={styles.thead}>
              <th className={styles.th}>ID</th>
              <th className={styles.th}>Comprador</th>
              <th className={styles.th}>Total</th>
              <th className={styles.th}>Estado</th>
              <th className={styles.th}>Fecha</th>
              <th className={styles.th}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pedidosFiltrados.length === 0 ? (
              <tr>
                <td colSpan={6} className={styles.vacio}>
                  No hay pedidos que coincidan con la búsqueda.
                </td>
              </tr>
            ) : (
              pedidosFiltrados.map((p) => {
                const estadoInfo = ESTADOS[p.estado] || { label: p.estado, color: "" };
                const fecha = p.creado_en
                  ? new Date(p.creado_en).toLocaleDateString("es-AR")
                  : "—";
                return (
                  <tr key={p.id} className={styles.fila}>
                    <td className={styles.tdId}>#{p.id.slice(0, 8).toUpperCase()}</td>
                    <td className={styles.tdComprador}>
                      <span className={styles.compradorNombre}>{p.comprador?.nombre} {p.comprador?.apellido}</span>
                      <span className={styles.compradorEmail}>{p.comprador?.email}</span>
                    </td>
                    <td className={styles.tdTotal}>{formatPrice(p.total)}</td>
                    <td className={styles.tdEstado}>
                      <span className={`${styles.estadoBadge} ${estadoInfo.color}`}>{estadoInfo.label}</span>
                    </td>
                    <td className={styles.tdFecha}>{fecha}</td>
                    <td className={styles.tdAcciones}>
                      <button className={styles.btnVer} onClick={() => setModalDetalle(p)}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                        Ver
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {modalDetalle && (
        <ModalDetalle
          pedido={modalDetalle}
          onCerrar={() => setModalDetalle(null)}
          onActualizarEstado={handleActualizarEstado}
        />
      )}
    </div>
  );
}

PedidosPage.getLayout = withAdminLayout("Pedidos");
