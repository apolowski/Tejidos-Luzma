import React from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar({ ui }) {
  const { token, user, logout } = useAuth();

  return (
    <>
      {/* Top Announcement Bar (Nike / Under Armour style) */}
      <div className="announcementBar">
        🧵 Tejidos 100% Artesanales Hechos a Mano <span>•</span> Envíos Gratis a toda Colombia por compras +$150.000 COP
      </div>

      <header className="nav">
        <div className="container navInner">
          <Link to="/" className="brand">
            <img src="/images/logo/logo.jpeg" alt="Luzma Tejidos Logo" className="brandMarkImage" />
            <div className="brandInfo">
              <span className="brandName">Luzma Tejidos</span>
              <span className="brandTagline">Artesanía Colombiana</span>
            </div>
          </Link>

          <nav className="navLinks">
            <NavLink to="/" className={({ isActive }) => (isActive ? "active" : "")}>
              Catálogo
            </NavLink>
            <NavLink to="/orders" className={({ isActive }) => (isActive ? "active" : "")}>
              Pedidos
            </NavLink>
            <NavLink to="/admin" className={({ isActive }) => (isActive ? "active" : "")}>
              Panel Admin
            </NavLink>
          </nav>

          <div className="navRight">
            <button className="cartBtnBadge" onClick={() => ui.setCartOpen(true)}>
              <span>🛒 Carrito</span>
            </button>

            {token ? (
              <>
                <NavLink to="/profile" className={({ isActive }) => (isActive ? "chip active" : "chip")}>
                  👤 {user?.name || "Mi Cuenta"}
                </NavLink>
                <button className="btn ghost" onClick={logout} style={{ padding: "8px 16px", fontSize: "0.85rem" }}>
                  Salir
                </button>
              </>
            ) : (
              <>
                <Link className="btn ghost" to="/login" style={{ padding: "8px 18px", fontSize: "0.88rem" }}>
                  Entrar
                </Link>
                <Link className="btn" to="/register" style={{ padding: "8px 18px", fontSize: "0.88rem" }}>
                  Crear cuenta
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
