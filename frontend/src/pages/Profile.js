import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [address, setAddress] = useState(user?.address || "");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const userRoleText = user?.role === "admin" ? "Administrador" : "Cliente";

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setSuccess("");
    setError("");
    try {
      const res = await api.put("/auth/profile", {
        name,
        phone: phone || null,
        address: address || null,
      });
      updateUser(res.data);
      setSuccess("¡Perfil actualizado con éxito!");
    } catch (err) {
      setError(err?.response?.data?.detail || "No se pudo actualizar el perfil.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth" style={{ maxWidth: "600px", margin: "2rem auto" }}>
      <div className="panel authCard">
        <h2>Mi Perfil</h2>
        <div style={{ marginBottom: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span className="muted">Tipo de Cuenta:</span>
          <span className="chip" style={{ background: user?.role === "admin" ? "#ffd700" : "#00bcd4", color: "#000", fontWeight: "bold" }}>
            {userRoleText}
          </span>
        </div>

        <form className="stack" onSubmit={onSubmit}>
          <div className="field">
            <label>Correo Electrónico (No editable)</label>
            <input value={user?.email || ""} type="email" disabled style={{ opacity: 0.7, cursor: "not-allowed" }} />
          </div>

          <div className="field">
            <label>Nombre Completo</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Tu nombre" />
          </div>

          <div className="field">
            <label>Celular / Teléfono</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Ej: +57 300 123 4567" />
          </div>

          <div className="field">
            <label>Dirección de Envío</label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Calle, Número, Apto, Ciudad"
              rows={3}
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "14px",
                border: "1px solid var(--line)",
                background: "rgba(255,255,255,.06)",
                color: "var(--text)",
                fontFamily: "inherit",
                fontSize: "14px"
              }}
            />
          </div>

          <button className="btn" disabled={loading} style={{ width: "100%", marginTop: "1rem" }}>
            {loading ? "Guardando..." : "Guardar Cambios"}
          </button>

          {success ? <div style={{ color: "var(--ok)", backgroundColor: "rgba(81, 207, 102, 0.1)", border: "1px solid var(--ok)", padding: "0.75rem", borderRadius: "14px", textAlign: "center", fontWeight: "600" }}>{success}</div> : null}
          {error ? <div className="danger" style={{ textAlign: "center" }}>{error}</div> : null}
        </form>
      </div>
    </div>
  );
}
