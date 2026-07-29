import React, { useMemo, useState } from "react";
import { Navigate, Route, Routes, useLocation, Link } from "react-router-dom";
import Navbar from "./components/Navbar";
import CartDrawer from "./components/CartDrawer";
import Home from "./pages/Home";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Orders from "./pages/Orders";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import { useAuth } from "./context/AuthContext";

function Protegido({ children }) {
  const { token } = useAuth();
  const ubicacion = useLocation();
  if (!token) return <Navigate to="/login" replace state={{ from: ubicacion.pathname }} />;
  return children;
}

export default function App() {
  const [carritoAbierto, setCarritoAbierto] = useState(false);
  const interfazUsuario = useMemo(() => ({ cartOpen: carritoAbierto, setCartOpen: setCarritoAbierto }), [carritoAbierto]);

  return (
    <div className="appShell">
      <Navbar ui={interfazUsuario} />
      <CartDrawer open={carritoAbierto} onClose={() => setCarritoAbierto(false)} />
      
      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products/:id" element={<ProductDetail ui={interfazUsuario} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/admin" element={<Admin />} />
          <Route
            path="/profile"
            element={
              <Protegido>
                <Profile />
              </Protegido>
            }
          />
        </Routes>
      </main>

      {/* FOOTER */}
      <footer className="footer">
        <div className="container">
          <div className="footerGrid">
            <div>
              <span className="footerBrand">Luzma Tejidos</span>
              <p className="footerDesc">
                E-commerce especializado en artesanías y tejiduría colombiana hecha a mano.
                Creamos prendas, bolsos y accesorios con calidez, elegancia y tradición.
              </p>
            </div>

            <div className="footerCol">
              <h4>Navegación</h4>
              <ul>
                <li><Link to="/">Catálogo</Link></li>
                <li><Link to="/orders">Mis Pedidos</Link></li>
                <li><Link to="/admin">Panel Admin 🔑</Link></li>
                <li><Link to="/profile">Mi Perfil</Link></li>
              </ul>
            </div>

            <div className="footerCol">
              <h4>Categorías</h4>
              <ul>
                <li><Link to="/">Bolsos Tejidos</Link></li>
              </ul>
            </div>

            <div className="footerCol">
              <h4>Contacto</h4>
              <ul>
                <li><span>📍 Colombia</span></li>
                <li><span>📱 WhatsApp: +57 300 000 0000</span></li>
                <li><span>✉️ contacto@luzmatejidos.com</span></li>
              </ul>
            </div>
          </div>

          <div className="footerBottom">
            <span>© 2026 Luzma Tejidos - Todos los derechos reservados.</span>
            <span>Diseño & Artesanía Colombiana 🇨🇴</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
