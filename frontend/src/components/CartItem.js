import React from "react";

export default function CartItem({ item: elemento, onRemove: alEliminar }) {
  const precioFormateado = new Intl.NumberFormat("es-CO", { 
    style: "currency", 
    currency: "COP",
    maximumFractionDigits: 0 
  }).format(elemento.unit_price * elemento.quantity);

  return (
    <div className="cartItem">
      <div className="cartThumb">
        {elemento.image_url ? (
          <img src={elemento.image_url} alt={elemento.product_name} />
        ) : (
          <div className="thumbPh" />
        )}
      </div>
      <div className="cartInfo">
        <div className="cartName">{elemento.product_name}</div>
        <div className="cartMeta">
          <span className="muted">
            {elemento.size} / {elemento.color}
          </span>
          <span className="muted">x{elemento.quantity}</span>
        </div>
        <div className="cartPrice">{precioFormateado}</div>
      </div>
      <button className="iconBtn" onClick={() => alEliminar(elemento.product_variant_id)} aria-label="Eliminar">
        ✕
      </button>
    </div>
  );
}
