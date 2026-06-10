// src/pages/pago/confirmado.jsx
// E-pagos redirige acá cuando el pago fue aprobado
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useCart } from "../../context/CartContext";
import { withLayout } from "../../components/Layout";
import styles from "./pago.module.css";

export default function PagoConfirmadoPage() {
  const router        = useRouter();
  const { vaciar }    = useCart();
  const [pedido, setPedido] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (!router.isReady) return;
    const { pedido: pedidoId } = router.query;

    // Vaciar carrito al confirmar el pago
    vaciar();

    // Consultar estado del pedido al backend
    if (pedidoId) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/pedido/${pedidoId}`)
        .then((r) => r.json())
        .then((data) => setPedido(data))
        .catch(console.error)
        .finally(() => setCargando(false));
    } else {
      setCargando(false);
    }
  }, [router.isReady]);

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={`${styles.icono} ${styles.iconoOk}`}>✓</div>
        <h1 className={styles.titulo}>¡Pago confirmado!</h1>
        <p className={styles.subtitulo}>
          Tu pedido fue procesado correctamente. Vas a recibir un email con los detalles.
        </p>

        {!cargando && pedido && (
          <div className={styles.detalle}>
            <div className={styles.detalleLinea}>
              <span>N° de operación</span>
              <span className={styles.detalleValor}>{pedido.nroOperacion}</span>
            </div>
            <div className={styles.detalleLinea}>
              <span>Total abonado</span>
              <span className={styles.detalleValor}>
                {new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(pedido.total)}
              </span>
            </div>
            <div className={styles.detalleLinea}>
              <span>Estado</span>
              <span className={`${styles.detalleValor} ${styles.estadoPagado}`}>Pagado</span>
            </div>
          </div>
        )}

        <div className={styles.acciones}>
          <Link href="/productos" className="btn btn-primary">Seguir comprando</Link>
          <Link href="/" className="btn btn-secondary">Ir al inicio</Link>
        </div>
      </div>
    </div>
  );
}

PagoConfirmadoPage.getLayout = withLayout({ title: "Pago confirmado" });
