import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { withLayout } from "../components/Layout";
import styles from "./pago-error.module.css";

export default function PagoErrorPage() {
  const router = useRouter();
  const { id } = router.query;

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.card}>
          <div className={styles.icono}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none"
              stroke="var(--color-danger)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>

          <h1 className={styles.titulo}>No se pudo completar el pago</h1>
          <p className={styles.descripcion}>
            {id
              ? `El pago del pedido #${id.slice(0, 8).toUpperCase()} fue rechazado. Podés intentar nuevamente.`
              : "Hubo un problema al procesar tu pago. Por favor, intentá nuevamente."
            }
          </p>

          <div className={styles.detalles}>
            <p>Posibles causas:</p>
            <ul>
              <li>Fondos insuficientes</li>
              <li>Datos de la tarjeta incorrectos</li>
              <li>La transacción fue rechazada por el banco</li>
            </ul>
          </div>

          <div className={styles.acciones}>
            <Link href="/checkout" className="btn btn-primary">
              Reintentar pago
            </Link>
            <Link href="/productos" className="btn btn-ghost">
              Volver al catálogo
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

PagoErrorPage.getLayout = withLayout({
  title: "Pago rechazado",
  description: "No se pudo completar el pago",
});
