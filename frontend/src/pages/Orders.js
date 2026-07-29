import React, { useEffect, useMemo, useState } from "react";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Orders() {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [payingId, setPayingId] = useState(null);
  const [selectedOrderForPay, setSelectedOrderForPay] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("Nequi");
  const [paySuccessMessage, setPaySuccessMessage] = useState("");

  const fmt = useMemo(() => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP" }), []);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/orders");
      setItems(res.data || []);
    } catch {
      setError("No se pudieron cargar los pedidos.");
    } finally {
      setLoading(false);
    }
  }

  async function confirmPayment() {
    if (!selectedOrderForPay) return;
    const orderId = selectedOrderForPay.id;
    setPayingId(orderId);
    setPaySuccessMessage("");
    try {
      await api.post(`/orders/${orderId}/pay`);
      setPaySuccessMessage(`¡Pago del Pedido #${orderId} con ${paymentMethod} realizado con éxito! 🎉`);
      setSelectedOrderForPay(null);
      await load();
    } catch (e) {
      alert(e?.response?.data?.detail || "Error al procesar el pago.");
    } finally {
      setPayingId(null);
    }
  }

  useEffect(() => {
    if (token) {
      load();
    }
  }, [token]);

  if (!token) {
    return (
      <div className="panel stack" style={{ textAlign: "center", padding: "2.5rem 1.5rem" }}>
        <h2> Mis Pedidos</h2>
        <p className="muted">Debes iniciar sesión para consultar tus pedidos.</p>
        <div style={{ marginTop: "1rem" }}>
          <a href="/login" className="btn btnPrimary">Iniciar Sesión</a>
        </div>
      </div>
    );
  }

  if (loading) return <div className="panel muted">Cargando tus pedidos...</div>;
  if (error) return <div className="panel danger">{error}</div>;

  return (
    <div className="stack">
      <h2>Pedidos</h2>
      {paySuccessMessage && (
        <div className="panel" style={{ backgroundColor: "#d4edda", color: "#155724", borderColor: "#c3e6cb", fontWeight: "600", padding: "1rem" }}>
          {paySuccessMessage}
        </div>
      )}

      {items.length ? (
        <div className="stack">
          {items.map((o) => (
            <div key={o.id} className="panel">
              <div className="row" style={{ alignItems: "center" }}>
                <strong>Pedido #{o.id}</strong>
                <span
                  className="chip"
                  style={{
                    backgroundColor: o.status === "paid" ? "#28a745" : o.status === "pending" ? "#ffc107" : "#6c757d",
                    color: o.status === "pending" ? "#212529" : "#fff",
                    fontWeight: "bold",
                    padding: "0.25rem 0.6rem",
                    borderRadius: "1rem",
                    fontSize: "0.85rem"
                  }}
                >
                  {o.status === "paid" ? "✅ Pagado" : o.status === "pending" ? "⏳ Pendiente" : o.status}
                </span>
              </div>
              <div className="row">
                <span className="muted">{new Date(o.created_at).toLocaleString("es-CO")}</span>
                <strong>{fmt.format(o.total_price)}</strong>
              </div>
              <div className="row" style={{ marginTop: "0.75rem", alignItems: "center" }}>
                <span className="muted">Items: {o.items?.length || 0}</span>
                {o.status === "pending" && (
                  <button
                    className="btn btnPrimary"
                    style={{ background: "linear-gradient(135deg, #28a745, #218838)", color: "#fff", border: "none", padding: "0.4rem 1.2rem", fontWeight: "bold" }}
                    onClick={() => setSelectedOrderForPay(o)}
                  >
                    Pagar Pedido
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="panel muted">Aún no tienes pedidos.</div>
      )}

      {/* Modal de Pasarela de Pago */}
      {selectedOrderForPay && (
        <div className="drawerOverlay" style={{ display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.6)", position: "fixed", inset: 0, zIndex: 9999 }}>
          <div className="panel stack" style={{ maxWidth: "450px", width: "90%", backgroundColor: "#fff", padding: "2rem", borderRadius: "1rem", boxShadow: "0 10px 25px rgba(0,0,0,0.2)" }}>
            <h3 style={{ margin: 0, textAlign: "center" }}> Pasarela de Pago</h3>
            <p className="muted" style={{ textAlign: "center", margin: "0.5rem 0" }}>
              Pagar Pedido #{selectedOrderForPay.id} — Total: <strong>{fmt.format(selectedOrderForPay.total_price)}</strong>
            </p>

            <div style={{ margin: "1rem 0" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>Selecciona el medio de pago:</label>
              <select
                className="input"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                style={{ width: "100%", padding: "0.6rem", borderRadius: "0.5rem" }}
              >
                <option value="Nequi"> Nequi</option>
                <option value="Daviplata"> Daviplata</option>
                <option value="PSE"> PSE - Débito Bancario</option>
                <option value="Tarjeta de Crédito / Débito"> Tarjeta de Crédito / Débito</option>
              </select>
            </div>

            <div className="row" style={{ marginTop: "1rem", gap: "0.5rem" }}>
              <button
                className="btn ghost"
                style={{ flex: 1 }}
                onClick={() => setSelectedOrderForPay(null)}
                disabled={payingId === selectedOrderForPay.id}
              >
                Cancelar
              </button>
              <button
                className="btn btnPrimary"
                style={{ flex: 2, background: "linear-gradient(135deg, #28a745, #218838)", color: "#fff", border: "none", fontWeight: "bold" }}
                onClick={confirmPayment}
                disabled={payingId === selectedOrderForPay.id}
              >
                {payingId === selectedOrderForPay.id ? "Procesando pago..." : "Confirmar Pago"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}




