// src/pages/checkout.jsx
import { useState } from "react";
import Link from "next/link";
import { useCart } from "../context/CartContext";
import { withLayout } from "../components/Layout";
import formatPrice from "../utils/formatPrice";
import styles from "./checkout.module.css";

// ─── Ítem del resumen ─────────────────────────────────────
function CartItem({ item, onCantidad, onEliminar }) {
  return (
    <div className={styles.cartItem}>
      <div className={styles.cartItemImg}>
        {item.imagen ? (
          <img src={item.imagen} alt={item.nombre} />
        ) : (
          <div className={styles.imgPlaceholder}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="m21 15-5-5L5 21" />
            </svg>
          </div>
        )}
      </div>

      <div className={styles.cartItemInfo}>
        <span className={styles.cartItemNombre}>{item.nombre}</span>
        <span className={styles.cartItemCategoria}>{item.categoria}</span>

        <div className={styles.cartItemControles}>
          <div className={styles.cantidad}>
            <button onClick={() => onCantidad(item.id, item.cantidad - 1)} disabled={item.cantidad <= 1}>−</button>
            <span>{item.cantidad}</span>
            <button onClick={() => onCantidad(item.id, item.cantidad + 1)} disabled={item.cantidad >= item.stock}>+</button>
          </div>
          <button className={styles.eliminarBtn} onClick={() => onEliminar(item.id)} aria-label="Eliminar">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
            </svg>
            Eliminar
          </button>
        </div>
      </div>

      <div className={styles.cartItemPrecio}>
        {formatPrice(item.precio * item.cantidad)}
      </div>
    </div>
  );
}

// ─── Formulario de datos del comprador ───────────────────
function FormularioDatos({ datos, onChange, errores }) {
  return (
    <div className={styles.formulario}>
      <h2 className={styles.formTitulo}>Tus datos</h2>

      <div className={styles.formGrid}>
        <div className={styles.formGrupo}>
          <label className={styles.formLabel}>Nombre *</label>
          <input
            className={`${styles.formInput} ${errores.nombre ? styles.inputError : ""}`}
            type="text"
            placeholder="Juan"
            value={datos.nombre}
            onChange={(e) => onChange("nombre", e.target.value)}
          />
          {errores.nombre && <span className={styles.errorMsg}>{errores.nombre}</span>}
        </div>

        <div className={styles.formGrupo}>
          <label className={styles.formLabel}>Apellido *</label>
          <input
            className={`${styles.formInput} ${errores.apellido ? styles.inputError : ""}`}
            type="text"
            placeholder="García"
            value={datos.apellido}
            onChange={(e) => onChange("apellido", e.target.value)}
          />
          {errores.apellido && <span className={styles.errorMsg}>{errores.apellido}</span>}
        </div>

        <div className={`${styles.formGrupo} ${styles.fullWidth}`}>
          <label className={styles.formLabel}>Email *</label>
          <input
            className={`${styles.formInput} ${errores.email ? styles.inputError : ""}`}
            type="email"
            placeholder="juan@email.com"
            value={datos.email}
            onChange={(e) => onChange("email", e.target.value)}
          />
          {errores.email && <span className={styles.errorMsg}>{errores.email}</span>}
        </div>

        <div className={styles.formGrupo}>
          <label className={styles.formLabel}>Teléfono *</label>
          <input
            className={`${styles.formInput} ${errores.telefono ? styles.inputError : ""}`}
            type="tel"
            placeholder="3624000000"
            value={datos.telefono}
            onChange={(e) => onChange("telefono", e.target.value)}
          />
          {errores.telefono && <span className={styles.errorMsg}>{errores.telefono}</span>}
        </div>

        <div className={styles.formGrupo}>
          <label className={styles.formLabel}>DNI *</label>
          <input
            className={`${styles.formInput} ${errores.dni ? styles.inputError : ""}`}
            type="text"
            placeholder="30000000"
            value={datos.dni}
            onChange={(e) => onChange("dni", e.target.value)}
          />
          {errores.dni && <span className={styles.errorMsg}>{errores.dni}</span>}
        </div>

        <div className={`${styles.formGrupo} ${styles.fullWidth}`}>
          <label className={styles.formLabel}>Dirección de entrega *</label>
          <input
            className={`${styles.formInput} ${errores.direccion ? styles.inputError : ""}`}
            type="text"
            placeholder="Av. Mitre 1234, Sáenz Peña, Chaco"
            value={datos.direccion}
            onChange={(e) => onChange("direccion", e.target.value)}
          />
          {errores.direccion && <span className={styles.errorMsg}>{errores.direccion}</span>}
        </div>
      </div>
    </div>
  );
}

// ─── Resumen del pedido ───────────────────────────────────
function ResumenPedido({ subtotal, onPagar, cargando }) {
  const envio = 0; // envío gratis como promo
  const total = subtotal + envio;

  return (
    <div className={styles.resumen}>
      <h2 className={styles.resumenTitulo}>Resumen</h2>

      <div className={styles.resumenLineas}>
        <div className={styles.resumenLinea}>
          <span>Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className={styles.resumenLinea}>
          <span>Envío</span>
          <span className={styles.envioGratis}>Gratis</span>
        </div>
        <div className={`${styles.resumenLinea} ${styles.resumenTotal}`}>
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>

      <div className={styles.cuotasInfo}>
        <span>⚡</span>
        <span>hasta <strong>12 cuotas sin interés</strong> de {formatPrice(Math.ceil(total / 12))}</span>
      </div>

      <button
        className={`btn btn-primary ${styles.btnPagar}`}
        onClick={onPagar}
        disabled={cargando}
      >
        {cargando ? (
          <><span className={styles.spinnerBtn} /> Procesando...</>
        ) : (
          <>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <rect x="1" y="4" width="22" height="16" rx="2" />
              <line x1="1" y1="10" x2="23" y2="10" />
            </svg>
            Pagar con E-pagos
          </>
        )}
      </button>

      <p className={styles.seguroTxt}>
        🔒 Pago seguro con encriptación SSL
      </p>

      {/* Logos de métodos de pago */}
      <div className={styles.metodosPago}>
        {["Visa", "Mastercard", "AMEX", "Débito"].map((m) => (
          <span key={m} className={styles.metodoBadge}>{m}</span>
        ))}
      </div>
    </div>
  );
}

// ─── Carrito vacío ────────────────────────────────────────
function CarritoVacio() {
  return (
    <div className={styles.carritoVacio}>
      <span className={styles.carritoVacioIcon}>🛒</span>
      <h2>Tu carrito está vacío</h2>
      <p>Agregá productos desde el catálogo para continuar.</p>
      <Link href="/productos" className="btn btn-primary">
        Ver productos
      </Link>
    </div>
  );
}

// ─── Página checkout ──────────────────────────────────────
export default function CheckoutPage() {
  const { items, setCantidad, eliminar, vaciar, subtotal } = useCart();

  const [datos, setDatos] = useState({
    nombre: "", apellido: "", email: "",
    telefono: "", dni: "", direccion: "",
  });
  const [errores, setErrores] = useState({});
  const [cargando, setCargando] = useState(false);

  const handleDato = (key, value) => {
    setDatos((prev) => ({ ...prev, [key]: value }));
    setErrores((prev) => ({ ...prev, [key]: "" }));
  };

  const validar = () => {
    const e = {};
    if (!datos.nombre.trim())    e.nombre    = "Requerido";
    if (!datos.apellido.trim())  e.apellido  = "Requerido";
    if (!datos.email.includes("@")) e.email  = "Email inválido";
    if (datos.telefono.length < 7)  e.telefono = "Teléfono inválido";
    if (datos.dni.length < 7)       e.dni      = "DNI inválido";
    if (!datos.direccion.trim())    e.direccion = "Requerido";
    setErrores(e);
    return Object.keys(e).length === 0;
  };

  const handlePagar = async () => {
    if (!validar()) return;
    setCargando(true);

    try {
      const pedido = {
        items: items.map((i) => ({
          id: i.id,
          nombre: i.nombre,
          precio: i.precio,
          cantidad: i.cantidad,
        })),
        comprador: datos,
        total: subtotal,
      };

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error("No se configuró NEXT_PUBLIC_SUPABASE_URL / ANON_KEY");
      }

      const res = await fetch(`${supabaseUrl}/functions/v1/crear-pago`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${supabaseAnonKey}`,
          apikey: supabaseAnonKey,
        },
        body: JSON.stringify(pedido),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Error del servidor: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();

      if (data.urlPago) {
        window.location.href = data.urlPago;
      } else {
        throw new Error(data.error || "No se recibió URL de pago");
      }
    } catch (err) {
      console.error("Error al crear pago:", err);
      alert("Hubo un error al procesar el pago. Intentá de nuevo.");
    } finally {
      setCargando(false);
    }
  };

  if (items.length === 0) return (
    <div className={styles.page}>
      <div className="container"><CarritoVacio /></div>
    </div>
  );

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Checkout</h1>
          <Link href="/productos" className={styles.seguirComprando}>
            ← Seguir comprando
          </Link>
        </div>

        <div className={styles.layout}>
          {/* Columna izquierda */}
          <div className={styles.columnaIzq}>
            {/* Items del carrito */}
            <div className={styles.carritoSeccion}>
              <h2 className={styles.seccionTitulo}>
                Tu carrito ({items.length} {items.length === 1 ? "producto" : "productos"})
              </h2>
              <div className={styles.cartItems}>
                {items.map((item) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    onCantidad={setCantidad}
                    onEliminar={eliminar}
                  />
                ))}
              </div>
            </div>

            {/* Formulario */}
            <FormularioDatos datos={datos} onChange={handleDato} errores={errores} />
          </div>

          {/* Columna derecha */}
          <div className={styles.columnaDer}>
            <ResumenPedido
              subtotal={subtotal}
              onPagar={handlePagar}
              cargando={cargando}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

CheckoutPage.getLayout = withLayout({
  title: "Checkout",
  description: "Finalizá tu compra",
});
