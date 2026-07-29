import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import CartItem from "../components/CartItem";

export default function Cart() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { token } = useAuth();
  const navigate = useNavigate();

  const subtotalLabel = useMemo(() => {
    const v = cart?.subtotal || 0;
    return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP" }).format(v);
  }, [cart]);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/cart");
      setCart(res.data);
    } catch {
      setError("No se pudo cargar el carrito.");
    } finally {
      setLoading(false);
    }
  }

  async function remove(variantId) {
    try {
      const res = await api.delete("/cart/remove", { data: { product_variant_id: variantId } });
      setCart(res.data);
    } catch {
      setError("No se pudo eliminar el item.");
    }
  }

  async function checkout() {
    setError("");
    try {
      await api.post("/orders");
      navigate("/orders");
    } catch (e) {
      setError(e?.response?.data?.detail || "No se pudo crear el pedido.");
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
      <h2>Carrito</h2>
      {cart?.items?.length ? (
        <div className="panel">
          {cart.items.map((it) => (
            <CartItem key={it.id} item={it} onRemove={remove} />
          ))}
        </div>
      ) : (
        <div className="panel muted">Tu carrito está vacío.</div>
      )}

      <div className="panel">
        <div className="row">
          <span className="muted">Subtotal</span>
          <strong>{subtotalLabel}</strong>
        </div>
        <button className="btn" onClick={checkout} disabled={!cart?.items?.length}>
          Crear pedido
        </button>
      </div>
    </div>
  );
}

