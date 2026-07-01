import React from "react";
import { Link } from "react-router-dom";

export default function ProductCard({ p }) {
  return (
    <Link to={`/products/${p.id}`} className="card">
      <div className="cardMedia">
        {p.image_url ? <img src={p.image_url} alt={p.name} loading="lazy" /> : <div className="placeholder">Sin imagen</div>}
      </div>
      <div className="cardBody">
        <div className="cardTitle">{p.name}</div>
        <div className="cardMeta">
          <span className="price">
            {new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP" }).format(p.price)}
          </span>
          <span className="muted">{p.stock} stock</span>
        </div>
      </div>
    </Link>
  );
}

