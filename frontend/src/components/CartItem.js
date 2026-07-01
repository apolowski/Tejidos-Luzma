import React from "react";

export default function CartItem({ item, onRemove }) {
  return (
    <div className="cartItem">
      <div className="cartThumb">
        {item.image_url ? <img src={item.image_url} alt={item.product_name} /> : <div className="thumbPh" />}
      </div>
      <div className="cartInfo">
        <div className="cartName">{item.product_name}</div>
        <div className="cartMeta">
          <span className="muted">
            {item.size} / {item.color}
          </span>
          <span className="muted">x{item.quantity}</span>
        </div>
        <div className="cartPrice">
          {new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP" }).format(item.unit_price * item.quantity)}
        </div>
      </div>
      <button className="iconBtn" onClick={() => onRemove(item.product_variant_id)} aria-label="Eliminar">
        ✕
      </button>
    </div>
  );
}

