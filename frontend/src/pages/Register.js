import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await register(name, email, password);
      navigate("/");
    } catch (e2) {
      setError(e2?.response?.data?.detail || "No se pudo crear la cuenta.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth">
      <div className="panel authCard">
        <h2>Crear cuenta</h2>
        <form className="stack" onSubmit={onSubmit}>
          <div className="field">
            <label>Nombre</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="field">
            <label>Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
          </div>
          <div className="field">
            <label>Contraseña</label>
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" minLength={8} required />
          </div>
          <button className="btn" disabled={loading}>
            {loading ? "Creando..." : "Crear"}
          </button>
          {error ? <div className="danger">{error}</div> : null}
        </form>
        <p className="muted">
          ¿Ya tienes cuenta? <Link to="/login">Entrar</Link>
        </p>
      </div>
    </div>
  );
}

