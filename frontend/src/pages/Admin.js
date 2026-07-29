import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";

export default function Admin() {
  const { user, login } = useAuth();
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [estadoMensaje, setEstadoMensaje] = useState({ tipo: "", texto: "" });

  // Estados del formulario para agregar / editar
  const [editandoId, setEditandoId] = useState(null); // null = nuevo, número = editar
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [precio, setPrecio] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [archivoImagen, setArchivoImagen] = useState(null);
  const [talla, setTalla] = useState("Única");
  const [color, setColor] = useState("Multicolor");
  const [stock, setStock] = useState(5);

  // Formulario para nueva categoría
  const [nuevoNombreCat, setNuevoNombreCat] = useState("");
  const [nuevaDescCat, setNuevaDescCat] = useState("");

  const esAdmin = user?.role === "admin";

  async function cargarDatos() {
    setCargando(true);
    setError("");
    try {
      const [respuestaProd, respuestaCat] = await Promise.all([
        api.get("/products?page=1&page_size=50"),
        api.get("/categories"),
      ]);
      setProductos(respuestaProd.data.items || []);
      const bolsosTejidos = (respuestaCat.data || []).filter(
        (c) => c.name.toLowerCase().trim() === "bolsos tejidos"
      );
      setCategorias(bolsosTejidos.length ? bolsosTejidos : respuestaCat.data || []);
    } catch {
      setError("No se pudieron cargar los datos del panel.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarDatos();
  }, []);

  async function handleLoginPruebaAdmin() {
    try {
      await login("admin@ropashop.com", "admin12345");
      setEstadoMensaje({ tipo: "ok", texto: "¡Sesión de administrador iniciada correctamente!" });
      cargarDatos();
    } catch {
      setEstadoMensaje({ tipo: "danger", texto: "Error al iniciar sesión de administrador de prueba." });
    }
  }

  function reiniciarFormulario() {
    setEditandoId(null);
    setNombre("");
    setDescripcion("");
    setPrecio("");
    setCategoriaId("");
    setArchivoImagen(null);
    setTalla("Única");
    setColor("Multicolor");
    setStock(5);
  }

  function iniciarEdicion(producto) {
    setEditandoId(producto.id);
    setNombre(producto.name || "");
    setDescripcion(producto.description || "");
    setPrecio(producto.price || "");
    setCategoriaId(producto.category_id ? String(producto.category_id) : "");
    setArchivoImagen(null);
    setTalla(producto.variants?.[0]?.size || "Única");
    setColor(producto.variants?.[0]?.color || "Multicolor");
    setStock(producto.stock || 5);
    window.scrollTo({ top: 300, behavior: "smooth" });
  }

  function comprimirImagenProducto(archivo) {
    return new Promise((resolver) => {
      if (!archivo || !archivo.type.startsWith("image/")) {
        resolver(archivo);
        return;
      }
      const imagen = new Image();
      const urlObjeto = URL.createObjectURL(archivo);
      imagen.onload = () => {
        const tamanoMaximo = 1200;
        const escala = Math.min(1, tamanoMaximo / Math.max(imagen.width, imagen.height));
        const ancho = Math.max(1, Math.round(imagen.width * escala));
        const alto = Math.max(1, Math.round(imagen.height * escala));
        const lienzo = document.createElement("canvas");
        lienzo.width = ancho;
        lienzo.height = alto;
        const contexto = lienzo.getContext("2d");
        if (!contexto) {
          URL.revokeObjectURL(urlObjeto);
          resolver(archivo);
          return;
        }
        contexto.drawImage(imagen, 0, 0, ancho, alto);
        lienzo.toBlob(
          (blob) => {
            URL.revokeObjectURL(urlObjeto);
            if (!blob) {
              resolver(archivo);
              return;
            }
            const nombreArchivo = archivo.name.replace(/\.[^.]+$/, "") || "producto";
            resolver(new File([blob], `${nombreArchivo}.webp`, { type: "image/webp" }));
          },
          "image/webp",
          0.82
        );
      };
      imagen.onerror = () => {
        URL.revokeObjectURL(urlObjeto);
        resolver(archivo);
      };
      imagen.src = urlObjeto;
    });
  }

  async function handleGuardarProducto(evento) {
    evento.preventDefault();
    setEstadoMensaje({ tipo: "", texto: "" });

    if (!nombre.trim() || !precio || !categoriaId) {
      setEstadoMensaje({ tipo: "danger", texto: "Nombre, precio y categoría son obligatorios." });
      return;
    }

    try {
      let productoGuardado = null;
      if (editandoId) {
        const respuesta = await api.put(`/products/${editandoId}`, {
          name: nombre.trim(),
          description: descripcion.trim() || null,
          price: Number(precio),
          category_id: Number(categoriaId),
        });
        productoGuardado = respuesta.data;
        setEstadoMensaje({ tipo: "ok", texto: `¡Producto "${nombre}" actualizado con éxito!` });
      } else {
        const respuesta = await api.post("/products", {
          name: nombre.trim(),
          description: descripcion.trim() || null,
          price: Number(precio),
          category_id: Number(categoriaId),
        });
        productoGuardado = respuesta.data;

        await api.post(`/products/${productoGuardado.id}/variants`, {
          size: talla.trim() || "Única",
          color: color.trim() || "Multicolor",
          stock: Number(stock) || 1,
        });

        setEstadoMensaje({ tipo: "ok", texto: `¡Producto "${nombre}" creado con éxito!` });
      }

      if (archivoImagen && productoGuardado) {
        const imagenComprimida = await comprimirImagenProducto(archivoImagen);
        const datosFormulario = new FormData();
        datosFormulario.append("archivo", imagenComprimida);
        await api.post(`/products/${productoGuardado.id}/image`, datosFormulario);
      }

      reiniciarFormulario();
      cargarDatos();
    } catch (err) {
      const mensaje = err.response?.data?.detail || "Error al guardar el producto.";
      setEstadoMensaje({ tipo: "danger", texto: mensaje });
    }
  }

  async function handleEliminarProducto(id, nombreProducto) {
    if (!window.confirm(`¿Estás seguro de eliminar el producto "${nombreProducto}"?`)) return;
    setEstadoMensaje({ tipo: "", texto: "" });
    try {
      await api.delete(`/products/${id}`);
      setEstadoMensaje({ tipo: "ok", texto: `Producto "${nombreProducto}" eliminado correctamente.` });
      cargarDatos();
    } catch {
      setEstadoMensaje({ tipo: "danger", texto: "No se pudo eliminar el producto." });
    }
  }

  async function handleCrearCategoria(evento) {
    evento.preventDefault();
    if (!nuevoNombreCat.trim()) return;
    try {
      await api.post("/categories", {
        name: nuevoNombreCat.trim(),
        description: nuevaDescCat.trim() || null,
      });
      setNuevoNombreCat("");
      setNuevaDescCat("");
      setEstadoMensaje({ tipo: "ok", texto: "¡Categoría creada correctamente!" });
      cargarDatos();
    } catch {
      setEstadoMensaje({ tipo: "danger", texto: "Error al crear la categoría." });
    }
  }

  if (!esAdmin) {
    return (
      <div className="panel" style={{ maxWidth: "600px", margin: "40px auto", textAlign: "center", padding: "40px" }}>
        <h2 style={{ fontFamily: "var(--fuente-titulo)", fontSize: "1.8rem", color: "var(--texto-oscuro)" }}>
          🔒 Acceso Administrador Requerido
        </h2>
        <p className="muted" style={{ margin: "14px 0 24px", lineHeight: 1.6 }}>
          Para ingresar al panel de administración debes iniciar sesión con una cuenta de administrador.
        </p>

        <div style={{ background: "var(--acento-claro)", padding: "16px", borderRadius: "12px", marginBottom: "24px", textAlign: "left", fontSize: "0.88rem" }}>
          <strong>Credenciales de Prueba Administrador:</strong>
          <div style={{ marginTop: "6px" }}> <strong>Email:</strong> admin@ropashop.com</div>
          <div><strong>Contraseña:</strong> admin12345</div>
        </div>

        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
          <button className="btn primary" onClick={handleLoginPruebaAdmin}>
            Iniciar Sesión como Admin (1-Clic)
          </button>
          <Link to="/login" className="btn ghost">
            Ir a Login
          </Link>
        </div>

        {estadoMensaje.texto && (
          <div className={`panel ${estadoMensaje.tipo}`} style={{ marginTop: "20px", padding: "12px" }}>
            {estadoMensaje.texto}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="stack" style={{ gap: "30px" }}>
      {/* HEADER DEL PANEL */}
      <div className="panel" style={{ background: "var(--hero-oscuro)", color: "#ffffff", padding: "32px 36px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <span style={{ color: "var(--oro-marca)", fontWeight: 700, fontSize: "0.78rem", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Panel de Control Dueño
            </span>
            <h1 style={{ fontFamily: "var(--fuente-titulo)", fontSize: "2.2rem", fontWeight: 800, marginTop: "4px" }}>
              Gestión de Productos & Tienda
            </h1>
          </div>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <span className="chip" style={{ background: "rgba(255,255,255,0.15)", color: "#ffffff", borderColor: "rgba(255,255,255,0.3)" }}>
              {user?.name} (Admin)
            </span>
          </div>
        </div>
      </div>

      {estadoMensaje.texto && (
        <div className={`panel ${estadoMensaje.tipo}`} style={{ padding: "14px 20px" }}>
          {estadoMensaje.texto}
        </div>
      )}

      {/* METRICAS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
        <div className="panel" style={{ textAlign: "center", padding: "20px" }}>
          <span style={{ fontSize: "2rem" }}>📦</span>
          <h3 style={{ fontFamily: "var(--fuente-titulo)", fontSize: "1.8rem", fontWeight: 800, margin: "6px 0 2px" }}>{productos.length}</h3>
          <span className="muted" style={{ fontSize: "0.85rem", fontWeight: 600 }}>Total Productos</span>
        </div>

        <div className="panel" style={{ textAlign: "center", padding: "20px" }}>
          <span style={{ fontSize: "2rem" }}>📂</span>
          <h3 style={{ fontFamily: "var(--fuente-titulo)", fontSize: "1.8rem", fontWeight: 800, margin: "6px 0 2px" }}>{categorias.length}</h3>
          <span className="muted" style={{ fontSize: "0.85rem", fontWeight: 600 }}>Categorías</span>
        </div>

        <div className="panel" style={{ textAlign: "center", padding: "20px" }}>
          <span style={{ fontSize: "2rem" }}>⚠️</span>
          <h3 style={{ fontFamily: "var(--fuente-titulo)", fontSize: "1.8rem", fontWeight: 800, margin: "6px 0 2px" }}>
            {productos.filter((p) => (p.stock || 0) < 3).length}
          </h3>
          <span className="muted" style={{ fontSize: "0.85rem", fontWeight: 600 }}>Stock Bajo (&lt; 3)</span>
        </div>

        <div className="panel" style={{ textAlign: "center", padding: "20px" }}>
          <span style={{ fontSize: "2rem" }}>🟢</span>
          <h3 style={{ fontFamily: "var(--fuente-titulo)", fontSize: "1.8rem", fontWeight: 800, margin: "6px 0 2px" }}>Activo</h3>
          <span className="muted" style={{ fontSize: "0.85rem", fontWeight: 600 }}>Servidor FastAPI</span>
        </div>
      </div>

      {/* FORMULARIO AGREGAR / EDITAR */}
      <section className="panel">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
          <div>
            <h2 style={{ fontFamily: "var(--fuente-titulo)", fontSize: "1.4rem", fontWeight: 700 }}>
              {editandoId ? `✏️ Modificar Producto #${editandoId}` : "✨ Agregar Nuevo Producto"}
            </h2>
            <p className="muted" style={{ fontSize: "0.88rem" }}>
              {editandoId ? "Actualiza los datos o cambia la imagen del producto existente." : "Agrega un nuevo producto con su foto, precio y categoría."}
            </p>
          </div>
          {editandoId && (
            <button className="btn ghost" onClick={reiniciarFormulario} style={{ padding: "8px 16px", fontSize: "0.82rem" }}>
              Cancelar Edición
            </button>
          )}
        </div>

        <form onSubmit={handleGuardarProducto}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
            <div className="field">
              <label>Nombre del Producto *</label>
              <input
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Bolso Mochila Wayúu Especial"
                required
              />
            </div>

            <div className="field">
              <label>Precio (COP) *</label>
              <input
                type="number"
                min="0"
                step="1000"
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
                placeholder="95000"
                required
              />
            </div>

            <div className="field">
              <label>Categoría *</label>
              <select value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)} required>
                <option value="">Selecciona Categoría</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="field" style={{ marginTop: "12px" }}>
            <label>Descripción del Producto</label>
            <textarea
              rows={3}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Detalles sobre los materiales, técnicas de tejido, colores y cuidados."
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", marginTop: "12px" }}>
            <div className="field">
              <label>Foto del Producto</label>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(e) => setArchivoImagen(e.target.files?.[0] || null)}
              />
              <small className="muted">Formatos: JPG, PNG, WEBP (Máx 5MB)</small>
            </div>

            {!editandoId && (
              <>
                <div className="field">
                  <label>Talla / Medida</label>
                  <input value={talla} onChange={(e) => setTalla(e.target.value)} placeholder="Única, Mediana..." />
                </div>

                <div className="field">
                  <label>Color</label>
                  <input value={color} onChange={(e) => setColor(e.target.value)} placeholder="Multicolor, Beige..." />
                </div>

                <div className="field">
                  <label>Stock Inicial</label>
                  <input type="number" min="0" value={stock} onChange={(e) => setStock(Number(e.target.value))} />
                </div>
              </>
            )}
          </div>

          <div style={{ marginTop: "24px", display: "flex", gap: "12px" }}>
            <button className="btn primary" type="submit" style={{ padding: "12px 28px" }}>
              {editandoId ? "Guardar Cambios" : "+ Publicar Producto"}
            </button>
            {editandoId && (
              <button className="btn ghost" type="button" onClick={reiniciarFormulario}>
                Cancelar
              </button>
            )}
          </div>
        </form>
      </section>

      {/* TABLA DE INVENTARIO */}
      <section className="panel">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
          <div>
            <h2 style={{ fontFamily: "var(--fuente-titulo)", fontSize: "1.4rem", fontWeight: 700 }}>
              📋 Inventario de Productos ({productos.length})
            </h2>
            <p className="muted" style={{ fontSize: "0.88rem" }}>
              Edita, cambia fotos o elimina productos existentes en tu catálogo.
            </p>
          </div>
        </div>

        {cargando ? (
          <div className="muted" style={{ padding: "20px", textAlign: "center" }}>Cargando inventario...</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--linea)", color: "var(--texto-oscuro)" }}>
                  <th style={{ padding: "12px" }}>Foto</th>
                  <th style={{ padding: "12px" }}>Producto</th>
                  <th style={{ padding: "12px" }}>Categoría</th>
                  <th style={{ padding: "12px" }}>Precio</th>
                  <th style={{ padding: "12px" }}>Stock</th>
                  <th style={{ padding: "12px", textAlign: "right" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {productos.map((producto) => {
                  const nombreCat = categorias.find((c) => c.id === producto.category_id)?.name || "Sin categoría";
                  const precioFormateado = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(producto.price);
                  return (
                    <tr key={producto.id} style={{ borderBottom: "1px solid var(--linea)" }}>
                      <td style={{ padding: "12px" }}>
                        {producto.image_url ? (
                          <img src={producto.image_url} alt={producto.name} style={{ width: "48px", height: "48px", borderRadius: "8px", objectFit: "cover" }} />
                        ) : (
                          <div style={{ width: "48px", height: "48px", borderRadius: "8px", background: "var(--linea)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", color: "var(--atenuado)" }}>Sin foto</div>
                        )}
                      </td>
                      <td style={{ padding: "12px" }}>
                        <div style={{ fontWeight: 700, color: "var(--texto-oscuro)" }}>{producto.name}</div>
                        <div className="muted" style={{ fontSize: "0.78rem" }}>ID: #{producto.id}</div>
                      </td>
                      <td style={{ padding: "12px" }}>
                        <span className="chip" style={{ fontSize: "0.75rem", padding: "4px 10px" }}>{nombreCat}</span>
                      </td>
                      <td style={{ padding: "12px", fontWeight: 700 }}>{precioFormateado}</td>
                      <td style={{ padding: "12px" }}>
                        <span className={producto.stock < 3 ? "danger" : "ok"} style={{ fontWeight: 700 }}>
                          {producto.stock} unid.
                        </span>
                      </td>
                      <td style={{ padding: "12px", textAlign: "right" }}>
                        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                          <button
                            className="btn ghost"
                            onClick={() => iniciarEdicion(producto)}
                            style={{ padding: "6px 12px", fontSize: "0.8rem" }}
                          >
                            ✏️ Editar
                          </button>
                          <button
                            className="btn secondary"
                            onClick={() => handleEliminarProducto(producto.id, producto.name)}
                            style={{ padding: "6px 12px", fontSize: "0.8rem", color: "var(--peligro)" }}
                          >
                            🗑️ Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* NUEVA CATEGORIA */}
      <section className="panel" style={{ maxWidth: "600px" }}>
        <h2 style={{ fontFamily: "var(--fuente-titulo)", fontSize: "1.3rem", fontWeight: 700, marginBottom: "14px" }}>
          📁 Crear Nueva Categoría
        </h2>
        <form onSubmit={handleCrearCategoria}>
          <div className="field">
            <label>Nombre de Categoría *</label>
            <input value={nuevoNombreCat} onChange={(e) => setNuevoNombreCat(e.target.value)} placeholder="Ej: Ruana & Ponchos" required />
          </div>
          <div className="field">
            <label>Descripción</label>
            <input value={nuevaDescCat} onChange={(e) => setNuevaDescCat(e.target.value)} placeholder="Descripción breve" />
          </div>
          <button className="btn primary" type="submit" style={{ marginTop: "10px" }}>
            + Guardar Categoría
          </button>
        </form>
      </section>
    </div>
  );
}
