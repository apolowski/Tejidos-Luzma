import React, { useEffect, useMemo, useState } from "react";
import { api } from "../services/api";

export default function Orders() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  useEffect(() => {
    if (token) {
      load();
    }
  }, [token]);

  if (loading) return <div className="panel muted">Cargando...</div>;
  if (error) return <div className="panel danger">{error}</div>;

  return (
    <div className="stack">
      <h2>Pedidos</h2>
      {items.length ? (
        <div className="stack">
          {items.map((o) => (
            <div key={o.id} className="panel">
              <div className="row">
                <strong>#{o.id}</strong>
                <span className="chip">{o.status}</span>
              </div>
              <div className="row">
                <span className="muted">{new Date(o.created_at).toLocaleString("es-CO")}</span>
                <strong>{fmt.format(o.total_price)}</strong>
              </div>
              <div className="muted">Items: {o.items?.length || 0}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="panel muted">Aún no tienes pedidos.</div>
      )}
    </div>
  );
}

