import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import styles from "./AuthModal.module.css";

// Iconos ───────────────────────────────────────────────
function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.2 35 24 35c-6.1 0-11-4.9-11-11s4.9-11 11-11c2.8 0 5.4 1.1 7.3 2.9l5.7-5.7C33.6 6.1 29 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c2.8 0 5.4 1.1 7.3 2.9l5.7-5.7C33.6 6.1 29 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.1 0 9.7-1.9 13.2-5.1l-6.1-5.2C29.1 35.1 26.7 36 24 36c-5.2 0-9.6-3.6-11.2-8.4l-6.5 5C9.6 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.5l6.1 5.2C39.9 36.6 44 31 44 24c0-1.3-.1-2.3-.4-3.5z" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16.4 12.9c0-2.6 2.1-3.8 2.2-3.9-1.2-1.8-3.1-2-3.8-2-1.6-.2-3.1.9-3.9.9-.8 0-2-.9-3.3-.9-1.7 0-3.3 1-4.2 2.5-1.8 3.1-.5 7.7 1.3 10.2.9 1.2 1.9 2.6 3.2 2.5 1.3-.1 1.8-.8 3.3-.8s2 .8 3.3.8c1.4 0 2.3-1.2 3.1-2.5.6-.9.9-1.4 1.4-2.4-3.7-1.4-2.9-5.9-.9-7.9zM13.9 4.6c.7-.8 1.1-2 1-3.1-1 0-2.2.7-2.9 1.5-.6.7-1.2 1.9-1 3 1.1.1 2.2-.6 2.9-1.4z" />
    </svg>
  );
}

const VISTA = { BIENVENIDA: "bienvenida", LOGIN: "login", REGISTRO: "registro" };

export default function AuthModal({ abierto, onClose }) {
  const { login, registro, loginConProveedor } = useAuth();
  const [vista, setVista] = useState(VISTA.BIENVENIDA);
  const [form, setForm] = useState({ nombre: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");
  const [loading, setLoading] = useState(false);

  // Reset al abrir / cerrar y bloquear scroll de fondo
  useEffect(() => {
    if (abierto) {
      setVista(VISTA.BIENVENIDA);
      setForm({ nombre: "", email: "", password: "" });
      setError("");
      setAviso("");
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [abierto]);

  // Cerrar con ESC
  useEffect(() => {
    if (!abierto) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [abierto, onClose]);

  if (!abierto) return null;

  const setCampo = (k, v) => {
    setForm((p) => ({ ...p, [k]: v }));
    setError("");
  };

  const traducirError = (err) => {
    const msg = err?.message || "";
    if (msg.includes("Invalid login credentials")) return "Email o contraseña incorrectos.";
    if (msg.includes("already registered") || msg.includes("already been registered"))
      return "Ese email ya tiene una cuenta. Iniciá sesión.";
    if (msg.includes("Password should be")) return "La contraseña debe tener al menos 6 caracteres.";
    if (msg.includes("Email not confirmed")) return "Confirmá tu email antes de ingresar.";
    if (msg.includes("Unable to validate email")) return "Email inválido.";
    if (msg.includes("provider is not enabled")) return "Ese método aún no está habilitado.";
    return "Algo salió mal. Probá de nuevo.";
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(form.email.trim(), form.password);
      onClose();
    } catch (err) {
      setError(traducirError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleRegistro = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setAviso("");
    try {
      const { session } = await registro(form.email.trim(), form.password, form.nombre.trim());
      if (session) {
        onClose(); // login automático (confirmación de email desactivada)
      } else {
        setAviso("¡Listo! Te enviamos un email para confirmar tu cuenta.");
      }
    } catch (err) {
      setError(traducirError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleProveedor = async (provider) => {
    setError("");
    try {
      await loginConProveedor(provider);
      // signInWithOAuth redirige fuera del sitio; no cerramos manualmente
    } catch (err) {
      setError(traducirError(err));
    }
  };

  const enRegistro = vista === VISTA.REGISTRO;
  const enLogin = vista === VISTA.LOGIN;

  return (
    <div className={styles.overlay} onMouseDown={onClose}>
      <div
        className={styles.card}
        role="dialog"
        aria-modal="true"
        aria-label="Acceder a tu cuenta"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Cabecera violeta */}
        <div className={styles.header}>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Cerrar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <line x1="5" y1="5" x2="19" y2="19" />
              <line x1="19" y1="5" x2="5" y2="19" />
            </svg>
          </button>

          <div className={styles.avatar}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
            </svg>
          </div>

          <h2 className={styles.titulo}>
            {enLogin ? "Iniciá sesión" : enRegistro ? "Creá tu cuenta" : "¡Bienvenido!"}
          </h2>
          <p className={styles.subtitulo}>
            {enLogin
              ? "Ingresá con tu email y contraseña"
              : enRegistro
              ? "Es rápido y solo te lleva un minuto"
              : "¿Necesitas una cuenta?"}
          </p>
        </div>

        {/* Cuerpo */}
        <div className={styles.body}>
          {error && <div className={styles.errorBox} role="alert">{error}</div>}
          {aviso && <div className={styles.avisoBox}>{aviso}</div>}

          {/* ── VISTA BIENVENIDA ── */}
          {vista === VISTA.BIENVENIDA && (
            <>
              <button className={styles.btnPrimary} onClick={() => setVista(VISTA.LOGIN)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                  <polyline points="10 17 15 12 10 7" />
                  <line x1="15" y1="12" x2="3" y2="12" />
                </svg>
                Iniciar sesión
              </button>

              <div className={styles.separador}><span>o</span></div>

              <div className={styles.proveedores}>
                <button className={styles.btnProveedor} onClick={() => handleProveedor("google")}>
                  <GoogleIcon />
                </button>
                <button
                  className={`${styles.btnProveedor} ${styles.btnApple}`}
                  onClick={() => handleProveedor("apple")}
                >
                  <AppleIcon />
                </button>
              </div>

              <button className={styles.btnOutline} onClick={() => setVista(VISTA.REGISTRO)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="9" cy="8" r="4" />
                  <path d="M3 21c0-3.3 2.7-6 6-6s6 2.7 6 6" />
                  <line x1="19" y1="8" x2="19" y2="14" />
                  <line x1="22" y1="11" x2="16" y2="11" />
                </svg>
                Crear cuenta
              </button>

              <a
                className={styles.btnContacto}
                href="https://wa.me/5493644677203"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M21 11.5a8.5 8.5 0 0 1-12.5 7.5L3 21l2-5.5A8.5 8.5 0 1 1 21 11.5z" />
                </svg>
                Contáctanos
              </a>
            </>
          )}

          {/* ── VISTA LOGIN ── */}
          {enLogin && (
            <form onSubmit={handleLogin} className={styles.form} noValidate>
              <label className={styles.label}>Email</label>
              <input
                className={styles.input}
                type="email"
                placeholder="tucorreo@email.com"
                value={form.email}
                onChange={(e) => setCampo("email", e.target.value)}
                autoComplete="email"
                required
              />

              <label className={styles.label}>Contraseña</label>
              <input
                className={styles.input}
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setCampo("password", e.target.value)}
                autoComplete="current-password"
                required
              />

              <button className={styles.btnPrimary} type="submit" disabled={loading}>
                {loading ? <span className={styles.spinner} /> : "Ingresar"}
              </button>

              <p className={styles.switchTxt}>
                ¿No tenés cuenta?{" "}
                <button type="button" className={styles.linkBtn} onClick={() => setVista(VISTA.REGISTRO)}>
                  Registrate
                </button>
              </p>
            </form>
          )}

          {/* ── VISTA REGISTRO ── */}
          {enRegistro && (
            <form onSubmit={handleRegistro} className={styles.form} noValidate>
              <label className={styles.label}>Nombre</label>
              <input
                className={styles.input}
                type="text"
                placeholder="Tu nombre"
                value={form.nombre}
                onChange={(e) => setCampo("nombre", e.target.value)}
                autoComplete="name"
                required
              />

              <label className={styles.label}>Email</label>
              <input
                className={styles.input}
                type="email"
                placeholder="tucorreo@email.com"
                value={form.email}
                onChange={(e) => setCampo("email", e.target.value)}
                autoComplete="email"
                required
              />

              <label className={styles.label}>Contraseña</label>
              <input
                className={styles.input}
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={form.password}
                onChange={(e) => setCampo("password", e.target.value)}
                autoComplete="new-password"
                minLength={6}
                required
              />

              <button className={styles.btnPrimary} type="submit" disabled={loading}>
                {loading ? <span className={styles.spinner} /> : "Crear cuenta"}
              </button>

              <p className={styles.switchTxt}>
                ¿Ya tenés cuenta?{" "}
                <button type="button" className={styles.linkBtn} onClick={() => setVista(VISTA.LOGIN)}>
                  Iniciá sesión
                </button>
              </p>
            </form>
          )}

          {/* Volver a bienvenida */}
          {vista !== VISTA.BIENVENIDA && (
            <button className={styles.volverBtn} onClick={() => setVista(VISTA.BIENVENIDA)}>
              ← Volver
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
