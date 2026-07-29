import React, { useEffect, useMemo, useState } from "react";
import ProductCard from "../components/ProductCard";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { user } = useAuth();
  const [categorias, setCategorias] = useState([]);
  const [productos, setProductos] = useState([]);
  const [total, setTotal] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [tamanoPagina] = useState(8);
  const [busqueda, setBusqueda] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  // Estados del Formulario de Administración
  const [adminNombre, setAdminNombre] = useState("");
  const [adminDescripcion, setAdminDescripcion] = useState("");
  const [adminPrecio, setAdminPrecio] = useState(0);
  const [adminCategoria, setAdminCategoria] = useState("");
  const [adminVarianteTalla, setAdminVarianteTalla] = useState("");
  const [adminVarianteColor, setAdminVarianteColor] = useState("");
  const [adminVarianteStock, setAdminVarianteStock] = useState(1);
  const [adminArchivoImagen, setAdminArchivoImagen] = useState(null);
  const [adminEstado, setAdminEstado] = useState({ tipo: "", mensaje: "" });

  const totalPaginas = useMemo(() => Math.max(1, Math.ceil(total / tamanoPagina)), [total, tamanoPagina]);

  async function cargarCategorias() {
    try {
      const respuesta = await api.get("/categories");
      const bolsosTejidos = (respuesta.data || []).filter(
        (c) => c.name.toLowerCase().trim() === "bolsos tejidos"
      );
      setCategorias(bolsosTejidos.length ? bolsosTejidos : (respuesta.data || []).slice(0, 1));
    } catch {
      // ignorar
    }
  }

  async function cargarProductos(siguientePagina = pagina, catId = categoriaId, qVal = busqueda) {
    setCargando(true);
    setError("");
    try {
      const parametros = { page: siguientePagina, page_size: tamanoPagina };
      const qClean = (qVal !== undefined ? qVal : busqueda).trim();
      const targetCatId = catId !== undefined ? catId : categoriaId;

      if (qClean) parametros.q = qClean;
      if (targetCatId) parametros.category_id = Number(targetCatId);

      const respuesta = await api.get("/products", { params: parametros });
      setProductos(respuesta.data.items || []);
      setTotal(respuesta.data.total || 0);
    } catch {
      setError("No se pudieron cargar los productos.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarCategorias();
  }, []);

  useEffect(() => {
    cargarProductos(pagina);
  }, [pagina]); // eslint-disable-line react-hooks/exhaustive-deps

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

  async function handleCrearProducto(evento) {
    evento.preventDefault();
    setAdminEstado({ tipo: "", mensaje: "" });
    if (!adminNombre.trim() || !adminPrecio || !adminCategoria) {
      setAdminEstado({ tipo: "danger", mensaje: "Completa los campos obligatorios." });
      return;
    }

    try {
      const respuesta = await api.post("/products", {
        name: adminNombre.trim(),
        description: adminDescripcion.trim() || null,
        price: Number(adminPrecio),
        category_id: Number(adminCategoria),
      });

      if (adminVarianteTalla || adminVarianteColor) {
        await api.post(`/products/${respuesta.data.id}/variants`, {
          size: adminVarianteTalla.trim() || "Única",
          color: adminVarianteColor.trim() || "Multicolor",
          stock: Number(adminVarianteStock) || 0,
        });
      }

      if (adminArchivoImagen) {
        const imagenComprimida = await comprimirImagenProducto(adminArchivoImagen);
        const datosFormulario = new FormData();
        datosFormulario.append("archivo", imagenComprimida);
        await api.post(`/products/${respuesta.data.id}/image`, datosFormulario);
      }

      setAdminEstado({ tipo: "ok", mensaje: "¡Producto creado con éxito!" });
      setAdminNombre("");
      setAdminDescripcion("");
      setAdminPrecio(0);
      setAdminCategoria("");
      setAdminVarianteTalla("");
      setAdminVarianteColor("");
      setAdminVarianteStock(1);
      setAdminArchivoImagen(null);
      cargarProductos(1);
    } catch (err) {
      const mensaje = err.response?.data?.detail || "Error al crear el producto.";
      setAdminEstado({ tipo: "danger", mensaje: mensaje });
    }
  }

  function aplicarFiltros(evento) {
    if (evento && evento.preventDefault) evento.preventDefault();
    setPagina(1);
    cargarProductos(1, categoriaId, busqueda);
  }

  return (
    <div className="stack">
      {/* HERO BANNER */}
      <section className="homeHero">
        <div className="heroOverlay" />
        <div className="heroInner">
          <div className="heroContent">
            <div className="heroBadge">
              ✨ NUEVA COLECCIÓN 2026 <span>•</span> EDICIÓN ARTESANAL
            </div>
            <h1 className="heroTitle">
              Calidez, Estilo & Tradición en Cada Tejido
            </h1>
            <p className="heroSub">
              Descubre bolsos, mochilas y piezas únicas tejidas a mano por artesanas colombianas.
              Diseños auténticos hechos con pasión y materiales de la mejor calidad.
            </p>
            <div className="heroActions">
              <button
                className="btn primary"
                type="button"
                onClick={() => {
                  const elemento = document.getElementById("seccionCatalogo");
                  elemento?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Explorar Catálogo
              </button>
              <button
                className="btn ghost"
                type="button"
                onClick={() => {
                  setBusqueda("");
                  setCategoriaId("");
                  setPagina(1);
                  cargarProductos(1, "", "");
                }}
              >
                Ver Colecciones
              </button>
            </div>
          </div>

          <div className="heroVisual">
            <div className="heroCard">
              <span className="eyebrow">Destacados de la Semana</span>
              <h2>Bolsos & Tejidos Únicos</h2>
              <p>Cada prenda y bolso cuenta una historia tejida con hilo, color y dedicación.</p>
              <div className="heroStats">
                <div>
                  <strong>+120</strong>
                  <span>Diseños Artesanales</span>
                </div>
                <div>
                  <strong>Envío Seguro</strong>
                  <span>Toda Colombia</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORY SHOWCASE GRID */}
      <section className="categoryShowcase">
        <div 
          className="catCard" 
          onClick={() => { setCategoriaId(""); setPagina(1); cargarProductos(1, "", ""); }}
        >
          <img src="/images/hero/hero-bg.jpeg" alt="Bolsos Tejidos" className="catCardImg" />
          <div className="catCardContent">
            <div className="catCardTag">Colección Principal</div>
            <div className="catCardTitle">Bolsos & Mochilas →</div>
          </div>
        </div>

        {categorias.slice(0, 3).map((categoria, indice) => (
          <div 
            key={categoria.id} 
            className="catCard"
            onClick={() => { setCategoriaId(String(categoria.id)); setPagina(1); cargarProductos(1, String(categoria.id)); }}
          >
            <img 
              src={`/images/products/WhatsApp Image 2026-07-25 at 09.59.1${indice + 1}.jpeg`} 
              alt={categoria.name} 
              className="catCardImg" 
            />
            <div className="catCardContent">
              <div className="catCardTag">Categoría Destacada</div>
              <div className="catCardTitle">{categoria.name} →</div>
            </div>
          </div>
        ))}
      </section>

      {/* PANEL ADMIN (Si el usuario es Admin) */}
      {user?.role === "admin" ? (
        <section className="panel adminSection" style={{ marginBottom: "30px" }}>
          <div className="adminHeader" style={{ marginBottom: "20px" }}>
            <h2>Panel Administrador</h2>
            <p className="muted">Crea productos nuevos para el catálogo.</p>
          </div>
          <form className="adminForm" onSubmit={handleCrearProducto}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
              <div className="field">
                <label>Nombre del producto</label>
                <input value={adminNombre} onChange={(e) => setAdminNombre(e.target.value)} placeholder="Ej: Bolso Guajiro Especial" />
              </div>
              <div className="field">
                <label>Descripción</label>
                <input value={adminDescripcion} onChange={(e) => setAdminDescripcion(e.target.value)} placeholder="Detalles de la prenda" />
              </div>
              <div className="field">
                <label>Precio (COP)</label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={adminPrecio}
                  onChange={(e) => setAdminPrecio(e.target.value)}
                  placeholder="85000"
                />
              </div>
              <div className="field">
                <label>Categoría</label>
                <select value={adminCategoria} onChange={(e) => setAdminCategoria(e.target.value)}>
                  <option value="">Selecciona categoría</option>
                  {categorias.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", marginTop: "14px" }}>
              <div className="field">
                <label>Talla</label>
                <input value={adminVarianteTalla} onChange={(e) => setAdminVarianteTalla(e.target.value)} placeholder="Única, S, M..." />
              </div>
              <div className="field">
                <label>Color</label>
                <input value={adminVarianteColor} onChange={(e) => setAdminVarianteColor(e.target.value)} placeholder="Multicolor, Beige..." />
              </div>
              <div className="field">
                <label>Stock</label>
                <input
                  type="number"
                  min="0"
                  value={adminVarianteStock}
                  onChange={(e) => setAdminVarianteStock(Number(e.target.value))}
                />
              </div>
              <div className="field">
                <label>Imagen</label>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(e) => setAdminArchivoImagen(e.target.files?.[0] || null)}
                />
              </div>
            </div>

            <div style={{ marginTop: "20px" }}>
              <button className="btn primary" type="submit">
                + Crear Producto
              </button>
            </div>
            {adminEstado.mensaje ? (
              <div className={`panel ${adminEstado.tipo}`} style={{ marginTop: "14px", padding: "12px 18px" }}>
                {adminEstado.mensaje}
              </div>
            ) : null}
          </form>
        </section>
      ) : null}

      {/* TOOLBAR Y FILTROS */}
      <div id="seccionCatalogo" className="sectionHeader">
        <div>
          <h2>Nuestro Catálogo</h2>
          <p>Explora nuestras piezas artesanales hechas con amor y tradición colombiana.</p>
        </div>
        <div className="muted" style={{ fontWeight: 600, fontSize: "0.9rem" }}>
          Mostrando {total} productos
        </div>
      </div>

      <section className="catalogToolbar">
        <div className="filterHeader">
          <form className="searchBox" onSubmit={aplicarFiltros}>
            <span className="searchIcon">🔍</span>
            <input
              id="searchInput"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por bolso, mochila, tejido, accesorios..."
            />
          </form>

          <div style={{ display: "flex", gap: "10px" }}>
            <button className="btn primary" type="button" onClick={aplicarFiltros} style={{ padding: "10px 20px" }}>
              Buscar
            </button>
            {(busqueda || categoriaId) && (
              <button
                className="btn ghost"
                type="button"
                onClick={() => {
                  setBusqueda("");
                  setCategoriaId("");
                  setPagina(1);
                  cargarProductos(1, "", "");
                }}
                style={{ padding: "10px 18px" }}
              >
                Limpiar
              </button>
            )}
          </div>
        </div>

        {/* Pestañas de Categorías */}
        <div className="categoryPills">
          <button
            type="button"
            className={categoriaId === "" ? "chip active" : "chip"}
            onClick={() => {
              setCategoriaId("");
              setPagina(1);
              cargarProductos(1, "", busqueda);
            }}
          >
            Todas las Categorías
          </button>
          {categorias.map((categoria) => (
            <button
              key={categoria.id}
              type="button"
              className={categoriaId === String(categoria.id) ? "chip active" : "chip"}
              onClick={() => {
                setCategoriaId(String(categoria.id));
                setPagina(1);
                cargarProductos(1, String(categoria.id), busqueda);
              }}
            >
              {categoria.name}
            </button>
          ))}
        </div>
      </section>

      {/* GRILLA DE PRODUCTOS */}
      {cargando && <div className="panel muted" style={{ textAlign: "center", padding: "40px" }}>Cargando catálogo artesanal...</div>}
      {error && <div className="panel danger">{error}</div>}

      <section className="grid">
        {productos.length
          ? productos.map((producto) => <ProductCard key={producto.id} p={producto} />)
          : !cargando && (
              <div className="panel muted" style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px" }}>
                No hay productos disponibles para esta búsqueda o categoría.
              </div>
            )}
      </section>

      {/* PAGINADOR */}
      {totalPaginas > 1 && (
        <section className="pager">
          <button className="btn ghost" disabled={pagina <= 1} onClick={() => setPagina((v) => v - 1)}>
            ← Anterior
          </button>
          <span className="muted" style={{ fontWeight: 600 }}>
            Página {pagina} de {totalPaginas}
          </span>
          <button className="btn ghost" disabled={pagina >= totalPaginas} onClick={() => setPagina((v) => v + 1)}>
            Siguiente →
          </button>
        </section>
      )}

      {/* PROPUESTA DE VALOR */}
      <section className="valueProps">
        <div className="valueCard">
          <div className="valueIcon">🧶</div>
          <div>
            <div className="valueTitle">100% Hecho a Mano</div>
            <div className="valueDesc">Piezas artesanales tejidas con tradición y esmero por tejedoras colombianas.</div>
          </div>
        </div>

        <div className="valueCard">
          <div className="valueIcon">🚚</div>
          <div>
            <div className="valueTitle">Envío Nacional Seguro</div>
            <div className="valueDesc">Llegamos a todas las ciudades de Colombia con entrega garantizada.</div>
          </div>
        </div>

        <div className="valueCard">
          <div className="valueIcon">🛡️</div>
          <div>
            <div className="valueTitle">Calidad Garantizada</div>
            <div className="valueDesc">Materiales seleccionados de alta resistencia, suavidad y durabilidad.</div>
          </div>
        </div>

        <div className="valueCard">
          <div className="valueIcon">💬</div>
          <div>
            <div className="valueTitle">Atención Personalizada</div>
            <div className="valueDesc">Asesoría directa en cada compra y acompañamiento constante.</div>
          </div>
        </div>
      </section>
    </div>
  );
}
