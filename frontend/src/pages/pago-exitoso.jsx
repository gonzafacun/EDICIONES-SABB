import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { withLayout } from "../components/Layout";
import { useCart } from "../context/CartContext";
import formatPrice from "../utils/formatPrice";
import styles from "./pago-exitoso.module.css";

export default function PagoExitosoPage() {
  const router = useRouter();
  const { id } = router.query;
  const { vaciar } = useCart();
  const [pedido, setPedido] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    vaciar();
  }, [vaciar]);

  useEffect(() => {
    if (!id) { setCargando(false); return; }

    const fetchPedido = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pedido/${id}`);
        if (res.ok) {
          const data = await res.json();
          setPedido(data);
        }
      } catch {} finally {
        setCargando(false);
      }
    };

    fetchPedido();
  }, [id]);

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.card}>
          <div className={styles.icono}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none"
              stroke="var(--color-success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>

          <h1 className={styles.titulo}>¡Pago procesado!</h1>
          <p className={styles.descripcion}>
            {cargando
              ? "Verificando tu pedido..."
              : pedido
                ? `Tu pedido #${id?.slice(0, 8).toUpperCase()} fue registrado. Recibirás un email de confirmación.`
                : id
                  ? `Tu pedido #${id?.slice(0, 8).toUpperCase()} está siendo procesado. Te notificaremos cuando se acredite el pago.`
                  : "Tu pago está siendo procesado. Te notificaremos cuando se acredite."
            }
          </p>

          {pedido && (
            <div className={styles.resumen}>
              <div className={styles.resumenLinea}>
                <span>Estado</span>
                <span className={styles.estadoBadge}>{pedido.estado}</span>
              </div>
              <div className={styles.resumenLinea}>
                <span>Total</span>
                <span className={styles.total}>
                  {formatPrice(pedido.total)}
                </span>
              </div>
            </div>
          )}

          <div className={styles.acciones}>
            <Link href="/productos" className="btn btn-primary">
              Seguir comprando
            </Link>
            <Link href="/" className="btn btn-ghost">
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

PagoExitosoPage.getLayout = withLayout({
  title: "Pago exitoso",
  description: "Tu pago fue procesado correctamente",
});
