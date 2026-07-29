import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";

export default function ProductDetail({ ui }) {
  const { id } = useParams();
  const { token, createGuestSession } = useAuth();
  const [producto, setProducto] = useState(null);
  const [varianteId, setVarianteId] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const etiquetaPrecio = useMemo(() => {
    const valor = producto?.price || 0;
    return new Intl.NumberFormat("es-CO", { 
      style: "currency", 
      currency: "COP",
      maximumFractionDigits: 0 
    }).format(valor);
  }, [producto]);

  const varianteSeleccionada = useMemo(
    () => producto?.variants?.find((variante) => String(variante.id) === varianteId),
    [producto, varianteId]
  );

  const puedeAgregarAlCarrito = Boolean(
    (varianteSeleccionada && varianteSeleccionada.stock > 0) || (!varianteSeleccionada && producto?.stock > 0)
  );

  async function cargarProducto() {
    setCargando(true);
    setError("");
    setMensaje("");
    try {
      const respuesta = await api.get(`/products/${id}`);
      setProducto(respuesta.data);
      const primeraVariante = respuesta.data?.variants?.[0]?.id || "";
      setVarianteId(primeraVariante ? String(primeraVariante) : "");
    } catch {
      setError("No se pudo cargar el producto.");
    } finally {
      setCargando(false);
    }
  }

  async function agregarAlCarrito() {
    setMensaje("");
    setError("");
    if (!varianteId && !producto?.id) {
      setError("No hay variante disponible.");
      return;
    }
    try {
      let tokenActivo = token;
      if (!tokenActivo) {
        tokenActivo = await createGuestSession();
        if (!tokenActivo) {
          throw new Error("No se pudo autenticar como invitado.");
        }
      }
      const datosEnvio = {
        quantity: Number(cantidad),
      };
      if (varianteId) {
        datosEnvio.product_variant_id = Number(varianteId);
      } else {
        datosEnvio.product_id = Number(id);
      }
      await api.post("/cart/add", datosEnvio);
      ui?.setCartOpen(true);
      setMensaje("¡Producto agregado al carrito con éxito!");
    } catch (e) {
      setError(e?.response?.data?.detail || e?.message || "No se pudo agregar al carrito.");
    }
  }

  useEffect(() => {
    cargarProducto();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (cargando) return <div className="panel muted" style={{ textAlign: "center", padding: "60px" }}>Cargando detalle del producto...</div>;
  if (error) return <div className="panel danger" style={{ margin: "30px 0" }}>{error}</div>;
  if (!producto) return null;

  return (
    <div className="detail">
      <div className="detailMedia">
        {producto.image_url ? (
          <img src={producto.image_url} alt={producto.name} />
        ) : (
          <div className="placeholder big" style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--atenuado)" }}>
            Sin imagen disponible
          </div>
        )}
      </div>

      <div className="detailBody">
        <Link to="/" className="btn ghost" style={{ alignSelf: "flex-start", padding: "8px 16px", fontSize: "0.85rem" }}>
          ← Volver al catálogo
        </Link>

        <div>
          <div className="cardCategoryName" style={{ fontSize: "0.85rem", marginBottom: "6px" }}>
            Colección Artesanal Luzma
          </div>
          <h1 style={{ fontFamily: "var(--fuente-titulo)", fontSize: "2.2rem", fontWeight: 800, color: "var(--texto-oscuro)", lineHeight: 1.2 }}>
            {producto.name}
          </h1>
        </div>

        <div className="detailMeta">
          <span className="price">{etiquetaPrecio}</span>
          <span className="stockBadge">
            {producto.stock > 0 ? `Stock disponible: ${producto.stock}` : "Agotado"}
          </span>
        </div>

        {producto.description && (
          <p style={{ color: "var(--atenuado)", fontSize: "1rem", lineHeight: 1.6, background: "rgba(255,255,255,0.6)", padding: "16px", borderRadius: "12px", border: "1px solid var(--linea)" }}>
            {producto.description}
          </p>
        )}

        <div className="panel" style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <h3 style={{ fontFamily: "var(--fuente-titulo)", fontSize: "1.1rem", fontWeight: 700 }}>Opciones de compra</h3>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div className="field">
              <label>Variante / Color</label>
              <select value={varianteId} onChange={(e) => setVarianteId(e.target.value)}>
                {producto.variants?.length ? (
                  producto.variants.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.size} / {v.color} (stock: {v.stock})
                    </option>
                  ))
                ) : (
                  <option value="">Única / Estándar</option>
                )}
              </select>
            </div>

            <div className="field">
              <label>Cantidad</label>
              <input 
                type="number" 
                min="1" 
                max="50" 
                value={cantidad} 
                onChange={(e) => setCantidad(e.target.value)} 
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px", marginTop: "10px" }}>
            <button
              className="btn primary"
              onClick={agregarAlCarrito}
              disabled={!puedeAgregarAlCarrito || Number(cantidad) < 1 || (varianteSeleccionada && Number(cantidad) > varianteSeleccionada.stock)}
              style={{ flex: 1, padding: "14px 24px" }}
            >
              🛒 Agregar al Carrito
            </button>
          </div>

          {varianteSeleccionada && varianteSeleccionada.stock <= 0 && (
            <div className="danger" style={{ fontSize: "0.9rem" }}>Esta variante no tiene stock disponible.</div>
          )}
          {mensaje && <div className="ok" style={{ fontWeight: 600 }}>{mensaje}</div>}
          {error && <div className="danger">{error}</div>}
        </div>
      </div>
    </div>
  );
}
