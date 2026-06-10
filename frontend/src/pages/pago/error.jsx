// src/pages/pago/error.jsx
// E-pagos redirige acá cuando el pago fue rechazado o cancelado
import Link from "next/link";
import { withLayout } from "../../components/Layout";
import styles from "./pago.module.css";

export default function PagoErrorPage() {
  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={`${styles.icono} ${styles.iconoError}`}>✕</div>
        <h1 className={styles.titulo}>El pago no se completó</h1>
        <p className={styles.subtitulo}>
          Hubo un problema al procesar tu pago. Tu pedido no fue confirmado y no se realizó ningún cobro.
        </p>

        <div className={styles.sugerencias}>
          <p>Podés intentar:</p>
          <ul>
            <li>Verificar los datos de tu tarjeta</li>
            <li>Usar otro método de pago</li>
            <li>Contactarnos por WhatsApp si el problema persiste</li>
          </ul>
        </div>

        <div className={styles.acciones}>
          <Link href="/checkout" className="btn btn-primary">Reintentar pago</Link>
          <a
            href="https://wa.me/5491100000000"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
          >
            Contactar por WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}

PagoErrorPage.getLayout = withLayout({ title: "Error en el pago" });
