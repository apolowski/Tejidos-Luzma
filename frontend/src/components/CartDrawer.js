import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import CartItem from "./CartItem";

export default function CartDrawer({ open, onClose }) {
  const { token } = useAuth();
  const [carrito, setCarrito] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const etiquetaSubtotal = useMemo(() => {
    const valor = carrito?.subtotal || 0;
    return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP" }).format(valor);
  }, [carrito]);

  async function cargarCarrito() {
    if (!token) return;
    setCargando(true);
    setError("");
    try {
      const respuesta = await api.get("/cart");
      setCarrito(respuesta.data);
    } catch {
      setError("No se pudo cargar el carrito.");
    } finally {
      setCargando(false);
    }
  }

  async function eliminarElemento(varianteId) {
    try {
      const respuesta = await api.delete("/cart/remove", { data: { product_variant_id: varianteId } });
      setCarrito(respuesta.data);
    } catch {
      setError("No se pudo eliminar el elemento.");
    }
  }

  useEffect(() => {
    if (open && token) {
      cargarCarrito();
    }
  }, [open, token]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!open) return null;

  return (
    <div className="drawerOverlay" onMouseDown={onClose} role="presentation">
      <aside className="drawer" onMouseDown={(e) => e.stopPropagation()}>
        <div className="drawerHeader">
          <div className="drawerTitle">Carrito</div>
          <button className="iconBtn" onClick={onClose} aria-label="Cerrar">
            ✕
          </button>
        </div>

        {!token ? (
          <div className="panel">
            <p className="muted">Inicia sesión para comprar.</p>
            <Link className="btn" to="/login" onClick={onClose}>
              Entrar
            </Link>
          </div>
        ) : cargando ? (
          <div className="panel muted">Cargando...</div>
        ) : error ? (
          <div className="panel danger">{error}</div>
        ) : (
          <>
            <div className="drawerBody">
              {carrito?.items?.length ? (
                carrito.items.map((elemento) => (
                  <CartItem key={elemento.id} item={elemento} onRemove={eliminarElemento} />
                ))
              ) : (
                <div className="panel muted">Tu carrito está vacío.</div>
              )}
            </div>
            <div className="drawerFooter">
              <div className="row">
                <span className="muted">Subtotal</span>
                <strong>{etiquetaSubtotal}</strong>
              </div>
              <div className="row">
                <Link className="btn ghost" to="/cart" onClick={onClose}>
                  Ver carrito
                </Link>
                <button className="btn" onClick={onClose} disabled={!carrito?.items?.length}>
                  Continuar
                </button>
              </div>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
