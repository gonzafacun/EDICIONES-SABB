// src/pages/admin/login.jsx
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { useAuth } from "../../context/AuthContext";
import styles from "./login.module.css";

export default function AdminLoginPage() {
  const { login, usuario, cargando } = useAuth();
  const router = useRouter();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [verPass, setVerPass]   = useState(false);

  // Si ya está logueado redirigir al dashboard
  useEffect(() => {
    if (!cargando && usuario) router.replace("/admin/dashboard");
  }, [usuario, cargando, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      router.push("/admin/dashboard");
    } catch (err) {
      switch (err.code) {
        case "auth/user-not-found":
        case "auth/wrong-password":
        case "auth/invalid-credential":
          setError("Email o contraseña incorrectos.");
          break;
        case "auth/too-many-requests":
          setError("Demasiados intentos. Esperá unos minutos.");
          break;
        default:
          setError("Error al iniciar sesión. Intentá de nuevo.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (cargando) return null;

  return (
    <>
      <Head>
        <title>Admin Login | Ediciones Sab</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>📚</span>
          <span className={styles.logoText}>Ediciones Sab</span>
        </div>

        <h1 className={styles.titulo}>Panel de administración</h1>
        <p className={styles.subtitulo}>Ingresá tus credenciales para continuar</p>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          {/* Email */}
          <div className={styles.grupo}>
            <label className={styles.label} htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className={styles.input}
              placeholder="admin@edicionessab.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            {/* Password */}
            <div className={styles.grupo}>
              <label className={styles.label} htmlFor="password">Contraseña</label>
              <div className={styles.passwordWrapper}>
                <input
                  id="password"
                  type={verPass ? "text" : "password"}
                  className={styles.input}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className={styles.verPassBtn}
                  onClick={() => setVerPass((v) => !v)}
                  aria-label={verPass ? "Ocultar contraseña" : "Ver contraseña"}
                >
                  {verPass ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className={styles.errorBox} role="alert">
                {error}
              </div>
            )}

            <button
              type="submit"
              className={`btn btn-primary ${styles.btnSubmit}`}
              disabled={loading || !email || !password}
            >
              {loading ? (
                <><span className={styles.spinner} /> Ingresando...</>
              ) : (
                "Ingresar"
              )}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
