// src/pages/index.jsx
import Layout, { withLayout } from "../components/Layout";

export default function HomePage() {
  return (
    <div style={{ padding: "4rem 0", textAlign: "center" }}>
      <h1>Bienvenido a TechStore</h1>
      <p style={{ marginTop: "1rem" }}>
        Página de inicio — próximamente el hero y los productos destacados.
      </p>
    </div>
  );
}

// Asigna el Layout público a esta página
HomePage.getLayout = withLayout({
  title: "Inicio",
  description: "TechStore — Electrónica y tecnología al mejor precio",
});
