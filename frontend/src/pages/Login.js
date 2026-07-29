import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const [correo, setCorreo] = useState("");
  const [clave, setClave] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const navegacion = useNavigate();
  const ubicacion = useLocation();

  async function handleIngresar(evento) {
    evento.preventDefault();
    setCargando(true);
    setError("");
    try {
      await login(correo, clave);
      navegacion(ubicacion.state?.from || "/");
    } catch (err) {
      setError(err?.response?.data?.detail || "No se pudo iniciar sesión. Verifique sus credenciales.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="authWrapper">
      <div className="authCard">
        {/* LADO HERO CON MARCA Y DETALLES */}
        <div className="authHeroSide">
          <div className="authHeroContent">
            <img src="/images/logo/logo.jpeg" alt="Luzma Tejidos Logo" className="authHeroLogo" />
            <h2 className="authHeroTitle">Luzma Tejidos</h2>
            <p className="authHeroDesc">
              Inicia sesión para explorar piezas exclusivas, gestionar tu carrito y realizar pedidos artesanales.
            </p>

            <div className="authHeroFeatures">
              <div className="authHeroFeatureItem">
                <span>✨</span> Productos 100% Hechos a Mano
              </div>
              <div className="authHeroFeatureItem">
                <span>🚚</span> Envíos Seguros a toda Colombia
              </div>
              <div className="authHeroFeatureItem">
                <span>🛡️</span> Pago Garantizado & Asesoría Directa
              </div>
            </div>
          </div>

          <div style={{ fontSize: "0.78rem", color: "rgba(247, 238, 223, 0.5)", marginTop: "20px" }}>
            © 2026 Luzma Tejidos • Artesanía Colombiana 🇨🇴
          </div>
        </div>

        {/* LADO FORMULARIO */}
        <div className="authFormSide">
          <h1 className="authTitle">¡Bienvenido de Nuevo!</h1>
          <p className="authSub">Ingresa tus credenciales para acceder a tu cuenta.</p>

          <form className="stack" onSubmit={handleIngresar}>
            <div className="field">
              <label>Correo Electrónico *</label>
              <input
                type="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                placeholder="ejemplo@correo.com"
                required
              />
            </div>

            <div className="field">
              <label>Contraseña *</label>
              <input
                type="password"
                value={clave}
                onChange={(e) => setClave(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <button className="btn primary" disabled={cargando} style={{ width: "100%", padding: "14px", marginTop: "10px" }}>
              {cargando ? "Entrando..." : "Iniciar Sesión →"}
            </button>

            {error && (
              <div className="panel danger" style={{ padding: "12px 16px", fontSize: "0.88rem" }}>
                {error}
              </div>
            )}
          </form>

          <p className="muted" style={{ marginTop: "24px", textAlign: "center", fontSize: "0.9rem" }}>
            ¿Aún no tienes cuenta?{" "}
            <Link to="/register" style={{ color: "var(--acento-hover)", fontWeight: 700 }}>
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
