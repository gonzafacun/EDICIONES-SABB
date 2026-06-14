// src/pages/admin/test-pagos.jsx
// Página interna para correr el Plan de Pruebas de certificación de E-pagos.
// Cada botón dispara un escenario con los campos que pide el instructivo oficial.
import { useState } from "react";
import { withAdminLayout } from "../../components/AdminLayout";
import { iniciarPago } from "../../services/epagos";
import styles from "./test-pagos.module.css";

// Fecha de hoy en formato aaaa-mm-dd (para la prueba con vencimiento)
function hoyISO() {
  return new Date().toISOString().slice(0, 10);
}

// Comprador de prueba (datos ficticios para certificación)
const COMPRADOR_TEST = {
  nombre: "PRUEBA",
  apellido: "CERTIFICACION",
  email: "pruebas@edicionessab.com",
  telefono: "3644000000",
  dni: "30000000",
  direccion: "Calle de Prueba 123, Sáenz Peña, Chaco",
};

const TESTS = [
  {
    id: "11002",
    titulo: "Tarjeta crédito/débito — Acreditación",
    obligatorio: true,
    canal: "Tarjeta",
    instrucciones: "Completá con una tarjeta de prueba (titular cualquiera). Debe quedar ACREDITADA y volver a la página de éxito.",
  },
  {
    id: "11003",
    titulo: "Tarjeta crédito/débito — Rechazo",
    obligatorio: true,
    canal: "Tarjeta",
    instrucciones: "En el titular de la tarjeta poné CALL. Debe quedar RECHAZADA y volver a la página de error.",
  },
  {
    id: "11004",
    titulo: "Tarjeta crédito/débito — Cancelación",
    obligatorio: true,
    canal: "Tarjeta",
    instrucciones: "En la pasarela apretá Cancelar. Debe quedar CANCELADA y volver a la página de error.",
  },
  {
    id: "11005",
    titulo: "Efectivo / Homebanking — Generación",
    obligatorio: true,
    canal: "Efectivo",
    instrucciones: "Elegí Efectivo u Homebanking. Debe quedar ADEUDADA y permitir descargar la boleta.",
  },
  {
    id: "11006",
    titulo: "Efectivo / Homebanking — Cancelación",
    obligatorio: true,
    canal: "Efectivo",
    instrucciones: "Iniciá la operación y cancelala con el botón Cancelar. Debe quedar CANCELADA.",
  },
  {
    id: "11007",
    titulo: "Operación con fecha de vencimiento",
    obligatorio: true,
    canal: "Efectivo",
    conVencimiento: true,
    instrucciones: "Se genera con fecha de vencimiento de hoy. Debe quedar ACREDITADA y volver a la página de éxito.",
  },
  {
    id: "11008",
    titulo: "Transferencia — Generación (opcional)",
    obligatorio: false,
    canal: "Transferencia",
    instrucciones: "Elegí Transferencia y completá CUIT = 30715084291. Debe quedar ACREDITADA.",
  },
  {
    id: "11009",
    titulo: "DEBIN — Generación (opcional)",
    obligatorio: false,
    canal: "Debin",
    instrucciones: "Usá un CBU/CUIT de la tabla de prueba. Debe quedar ADEUDADA.",
  },
];

const TARJETAS = [
  { tipo: "VISA", numero: "4507 9900 0000 4905", cvv: "123", venc: "12/2026" },
  { tipo: "Mastercard", numero: "5323 6222 7777 7785", cvv: "123", venc: "12/2026" },
  { tipo: "AMEX", numero: "3766 341249 71005", cvv: "1234", venc: "12/2026" },
  { tipo: "Visa Débito", numero: "4517 7210 0485 6075", cvv: "123", venc: "12/2026" },
];

export default function TestPagosPage() {
  const [cargandoId, setCargandoId] = useState(null);
  const [error, setError] = useState("");

  const correrTest = async (test) => {
    setCargandoId(test.id);
    setError("");
    try {
      const monto = Number(test.id); // el monto debe ser el ID del test (ej: 11002)
      const extra = { identificador_externo_2: test.id };
      if (test.conVencimiento) extra.opc_fecha_vencimiento = hoyISO();

      await iniciarPago({
        items: [{ id: test.id, nombre: `Prueba ${test.id}`, precio: monto, cantidad: 1 }],
        comprador: { ...COMPRADOR_TEST, test: true },
        total: monto,
        extra,
      });
      // iniciarPago redirige a E-pagos
    } catch (err) {
      console.error(err);
      setError(`Error en la prueba ${test.id}: ${err.message}`);
      setCargandoId(null);
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.titulo}>Pruebas de certificación E-pagos</h1>
        <p className={styles.subtitulo}>
          Plan oficial de pruebas (sandbox). Corré cada caso y verificá el resultado esperado.
          Cuando completes los obligatorios, E-pagos habilita producción.
        </p>
        <span className={styles.badgeSandbox}>⚠️ Modo Sandbox — no se cobra dinero real</span>
      </header>

      {error && <div className={styles.errorBox}>{error}</div>}

      {/* Tarjetas de prueba */}
      <section className={styles.tarjetasSeccion}>
        <h2 className={styles.seccionTitulo}>Tarjetas de prueba</h2>
        <div className={styles.tarjetasGrid}>
          {TARJETAS.map((t) => (
            <div key={t.numero} className={styles.tarjeta}>
              <span className={styles.tarjetaTipo}>{t.tipo}</span>
              <span className={styles.tarjetaNumero}>{t.numero}</span>
              <span className={styles.tarjetaDatos}>CVV {t.cvv} · Vence {t.venc}</span>
            </div>
          ))}
        </div>
        <p className={styles.nota}>
          Para forzar un <strong>rechazo</strong>, usá titular <code>CALL</code>. El vencimiento no se valida en sandbox.
        </p>
      </section>

      {/* Casos de prueba */}
      <section>
        <h2 className={styles.seccionTitulo}>Casos de prueba</h2>
        <div className={styles.tests}>
          {TESTS.map((test) => (
            <div key={test.id} className={styles.testCard}>
              <div className={styles.testHead}>
                <span className={styles.testId}>{test.id}</span>
                <span className={`${styles.testBadge} ${test.obligatorio ? styles.oblig : styles.opc}`}>
                  {test.obligatorio ? "Obligatorio" : "Opcional"}
                </span>
                <span className={styles.testCanal}>{test.canal}</span>
              </div>
              <h3 className={styles.testTitulo}>{test.titulo}</h3>
              <p className={styles.testInstrucciones}>{test.instrucciones}</p>
              <button
                className={styles.btnCorrer}
                onClick={() => correrTest(test)}
                disabled={cargandoId !== null}
              >
                {cargandoId === test.id ? "Abriendo pasarela..." : "Correr prueba ▶"}
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

TestPagosPage.getLayout = withAdminLayout("Pruebas E-pagos");
