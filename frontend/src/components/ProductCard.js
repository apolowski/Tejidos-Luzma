import React from "react";
import { Link } from "react-router-dom";

export default function ProductCard({ p }) {
  const precioFormateado = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0
  }).format(p.price);

  return (
    <div className="card">
      <Link to={`/products/${p.id}`} className="cardMedia">
        {p.image_url ? (
          <img src={p.image_url} alt={p.name} loading="lazy" />
        ) : (
          <div className="placeholder">Sin imagen</div>
        )}
      </Link>
      <div className="cardBody">
        <div>
          <div className="cardCategoryName">Colección Luzma</div>
          <Link to={`/products/${p.id}`} className="cardTitle">
            {p.name}
          </Link>
        </div>
        <div className="cardMeta">
          <div>
            <div className="price">{precioFormateado}</div>
            <div className="stockBadge">{p.stock > 0 ? `${p.stock} disponibles` : "Agotado"}</div>
          </div>
          <Link to={`/products/${p.id}`} className="btn ghost" style={{ padding: "8px 14px", fontSize: "0.82rem" }}>
            Ver detalle
          </Link>
        </div>
      </div>
    </div>
  );
}
