import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [clave, setClave] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const navegacion = useNavigate();

  async function handleRegistro(evento) {
    evento.preventDefault();
    setCargando(true);
    setError("");
    try {
      await register(nombre, correo, clave);
      navegacion("/");
    } catch (err) {
      setError(err?.response?.data?.detail || "No se pudo crear la cuenta. Intente nuevamente.");
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
            <h2 className="authHeroTitle">Únete a Luzma Tejidos</h2>
            <p className="authHeroDesc">
              Crea tu cuenta para guardar tus bolsos favoritos, rastrear tus pedidos y recibir ofertas artesanales exclusivas.
            </p>

            <div className="authHeroFeatures">
              <div className="authHeroFeatureItem">
                <span>🧶</span> Catálogo de Edición Limitada
              </div>
              <div className="authHeroFeatureItem">
                <span>🛍️</span> Proceso de Compra Rápido & Seguro
              </div>
              <div className="authHeroFeatureItem">
                <span>💬</span> Atención Directa por WhatsApp
              </div>
            </div>
          </div>

          <div style={{ fontSize: "0.78rem", color: "rgba(247, 238, 223, 0.5)", marginTop: "20px" }}>
            © 2026 Luzma Tejidos • Artesanía Colombiana 🇨🇴
          </div>
        </div>

        {/* LADO FORMULARIO */}
        <div className="authFormSide">
          <h1 className="authTitle">Crear Cuenta</h1>
          <p className="authSub">Diligencia tus datos para registrarte en la tienda.</p>

          <form className="stack" onSubmit={handleRegistro}>
            <div className="field">
              <label>Nombre Completo *</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="María Perez"
                required
              />
            </div>

            <div className="field">
              <label>Correo Electrónico *</label>
              <input
                type="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                placeholder="maria@ejemplo.com"
                required
              />
            </div>

            <div className="field">
              <label>Contraseña (Mínimo 8 caracteres) *</label>
              <input
                type="password"
                value={clave}
                onChange={(e) => setClave(e.target.value)}
                placeholder="••••••••"
                minLength={8}
                required
              />
            </div>

            <button className="btn primary" disabled={cargando} style={{ width: "100%", padding: "14px", marginTop: "10px" }}>
              {cargando ? "Creando Cuenta..." : "Registrarme →"}
            </button>

            {error && (
              <div className="panel danger" style={{ padding: "12px 16px", fontSize: "0.88rem" }}>
                {error}
              </div>
            )}
          </form>

          <p className="muted" style={{ marginTop: "24px", textAlign: "center", fontSize: "0.9rem" }}>
            ¿Ya tienes una cuenta registrada?{" "}
            <Link to="/login" style={{ color: "var(--acento-hover)", fontWeight: 700 }}>
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
