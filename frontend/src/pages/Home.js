import React, { useEffect, useMemo, useState } from "react";
import ProductCard from "../components/ProductCard";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
  const [q, setQ] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [adminName, setAdminName] = useState("");
  const [adminDescription, setAdminDescription] = useState("");
  const [adminPrice, setAdminPrice] = useState(0);
  const [adminCategory, setAdminCategory] = useState("");
  const [adminVariantSize, setAdminVariantSize] = useState("");
  const [adminVariantColor, setAdminVariantColor] = useState("");
  const [adminVariantStock, setAdminVariantStock] = useState(1);
  const [adminImageFile, setAdminImageFile] = useState(null);
  const [adminStatus, setAdminStatus] = useState({ type: "", message: "" });

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize]);

  async function loadCategories() {
    try {
      const res = await api.get("/categories");
      setCategories(res.data);
    } catch {
      // ignore
    }
  }

  async function loadProducts(nextPage = page) {
    setLoading(true);
    setError("");
    try {
      const params = { page: nextPage, page_size: pageSize };
      if (q.trim()) params.q = q.trim();
      if (categoryId) params.category_id = Number(categoryId);
      const res = await api.get("/products", { params });
      setItems(res.data.items || []);
      setTotal(res.data.total || 0);
    } catch {
      setError("No se pudieron cargar los productos.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadProducts(page);
  }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  function compressProductImage(file) {
    return new Promise((resolve) => {
      if (!file || !file.type.startsWith("image/")) {
        resolve(file);
        return;
      }

      const image = new Image();
      const objectUrl = URL.createObjectURL(file);

      image.onload = () => {
        const maxSize = 1200;
        const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
        const width = Math.max(1, Math.round(image.width * scale));
        const height = Math.max(1, Math.round(image.height * scale));
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const context = canvas.getContext("2d");
        if (!context) {
          URL.revokeObjectURL(objectUrl);
          resolve(file);
          return;
        }

        context.drawImage(image, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(objectUrl);
            if (!blob) {
              resolve(file);
              return;
            }

            const filename = file.name.replace(/\.[^.]+$/, "") || "producto";
            resolve(new File([blob], `${filename}.webp`, { type: "image/webp" }));
          },
          "image/webp",
          0.78
        );
      };

      image.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(file);
      };

      image.src = objectUrl;
    });
  }

  async function handleCreateProduct(e) {
    e.preventDefault();
    if (!adminName || !adminPrice || !adminCategory) {
      setAdminStatus({ type: "danger", message: "Completa el nombre, precio y categoría." });
      return;
    }

    try {
      const payload = {
        name: adminName,
        description: adminDescription,
        price: Number(adminPrice),
        category_id: Number(adminCategory),
      };

      const res = await api.post("/products", payload);

      if (adminVariantSize && adminVariantColor) {
        try {
          await api.post(`/products/${res.data.id}/variants`, {
            size: adminVariantSize,
            color: adminVariantColor,
            stock: Number(adminVariantStock) || 1,
          });
        } catch {
          setAdminStatus({ type: "danger", message: "Producto creado, pero no se pudo crear la variante." });
          setAdminName("");
          setAdminDescription("");
          setAdminPrice(0);
          setAdminCategory("");
          setAdminVariantSize("");
          setAdminVariantColor("");
          setAdminVariantStock(1);
          setAdminImageFile(null);
          e.target.reset();
          setPage(1);
          loadProducts(1);
          return;
        }
      }

      if (adminImageFile) {
        const compressedImage = await compressProductImage(adminImageFile);
        const formData = new FormData();
        formData.append("archivo", compressedImage);
        await api.post(`/products/${res.data.id}/image`, formData);
      }

      setAdminStatus({ type: "ok", message: "Producto creado exitosamente." });
      setAdminName("");
      setAdminDescription("");
      setAdminPrice(0);
      setAdminCategory("");
      setAdminImageFile(null);
      e.target.reset();
      setPage(1);
      loadProducts(1);
    } catch (err) {
      setAdminStatus({ type: "danger", message: "No se pudo crear el producto." });
    }
  }

  function applyFilters(e) {
    e.preventDefault();
    setPage(1);
    loadProducts(1);
  }

  return (
    <div className="homePage stack">
      <section className="homeHero">
        <div className="heroOverlay" />
        <div className="container heroContent">
          <div className="heroTopNav">
            <span className="heroTag">NIGHT SALE 🔥</span>
            <button className="heroCTA" type="button">
              Ver todo
            </button>
          </div>
          <div className="heroCopy">
            <span className="eyebrow">Tienda pastel</span>
            <h1>Legacy de estilo y color en cada look.</h1>
            <p className="heroText">
              Descubre prendas con actitud suave, banner llamativo y un catálogo moderno para tu tienda.
            </p>
            <div className="heroActions">
              <button className="btn" type="button" onClick={() => document.getElementById("searchInput")?.focus()}>
                Comprar ahora
              </button>
              <button
                className="btn ghost"
                type="button"
                onClick={() => {
                  setQ("");
                  setCategoryId("");
                  setPage(1);
                  loadProducts(1);
                }}
              >
                Explorar catálogo
              </button>
            </div>
          </div>
          <div className="heroVisual">
            <div className="heroCard">
              <span className="eyebrow">Destacados</span>
              <h2>Prendas de temporada</h2>
              <p>La mejor selección para quienes buscan calidad, color y un estilo urbano suave.</p>
              <div className="heroStats">
                <div>
                  <strong>+120</strong>
                  <span>Productos</span>
                </div>
                <div>
                  <strong>Envío rápido</strong>
                  <span>48 horas</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {user?.role === "admin" ? (
        <section className="panel adminSection">
          <div className="adminHeader">
            <div>
              <h2>Panel administrador</h2>
              <p>Crea productos rápidos para la tienda desde aquí.</p>
            </div>
          </div>
          <form className="adminForm" onSubmit={handleCreateProduct}>
            <div className="field">
              <label>Nombre</label>
              <input value={adminName} onChange={(e) => setAdminName(e.target.value)} placeholder="Nombre del producto" />
            </div>
            <div className="field">
              <label>Descripción</label>
              <input value={adminDescription} onChange={(e) => setAdminDescription(e.target.value)} placeholder="Descripción breve" />
            </div>
            <div className="field">
              <label>Precio</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={adminPrice}
                onChange={(e) => setAdminPrice(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className="field">
              <label>Categoría</label>
              <select value={adminCategory} onChange={(e) => setAdminCategory(e.target.value)}>
                <option value="">Selecciona categoría</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Talla</label>
              <input
                value={adminVariantSize}
                onChange={(e) => setAdminVariantSize(e.target.value)}
                placeholder="Única, S, M, L..."
              />
            </div>
            <div className="field">
              <label>Color</label>
              <input
                value={adminVariantColor}
                onChange={(e) => setAdminVariantColor(e.target.value)}
                placeholder="Rojo, Negro, Azul..."
              />
            </div>
            <div className="field">
              <label>Stock variante</label>
              <input
                type="number"
                min="0"
                step="1"
                value={adminVariantStock}
                onChange={(e) => setAdminVariantStock(Number(e.target.value))}
                placeholder="1"
              />
            </div>
            <div className="field">
              <label>Imagen del producto</label>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(e) => setAdminImageFile(e.target.files?.[0] || null)}
              />
              <small className="fieldHint">Se optimiza antes de subirla. En la base solo se guarda la URL.</small>
            </div>
            <div className="field actions adminActions">
              <button className="btn" type="submit">
                Crear producto
              </button>
            </div>
            {adminStatus.message ? (
              <div className={`panel ${adminStatus.type}`}>{adminStatus.message}</div>
            ) : null}
          </form>
        </section>
      ) : null}

      <section className="shopIntro">
        <div className="container shopIntroInner">
          <div>
            <h2>Nuestro catálogo</h2>
            <p>Una galería con prendas suaves, combinaciones versátiles y precios claros.</p>
          </div>
          <div className="shopChips">
            <button
              type="button"
              className={categoryId === "" ? "chip active" : "chip"}
              onClick={() => {
                setCategoryId("");
                setPage(1);
                loadProducts(1);
              }}
            >
              Todas
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                className={categoryId === String(c.id) ? "chip active" : "chip"}
                onClick={() => {
                  setCategoryId(String(c.id));
                  setPage(1);
                  loadProducts(1);
                }}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="panel productFilter">
        <form className="filters" onSubmit={applyFilters}>
          <div className="field">
            <label htmlFor="searchInput">Buscar</label>
            <input
              id="searchInput"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Camisa, jean, chaqueta..."
            />
          </div>
          <div className="field">
            <label>Categoría</label>
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              <option value="">Todas</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="field actions">
            <button className="btn" type="submit">
              Aplicar
            </button>
            <button
              className="btn ghost"
              type="button"
              onClick={() => {
                setQ("");
                setCategoryId("");
                setPage(1);
                setTimeout(() => loadProducts(1), 0);
              }}
            >
              Limpiar
            </button>
          </div>
        </form>
      </section>

      {loading && <div className="panel muted">Cargando productos...</div>}
      {error && <div className="panel danger">{error}</div>}

      <section className="grid">
        {items.length
          ? items.map((p) => <ProductCard key={p.id} p={p} />)
          : !loading && <div className="panel muted">No hay productos disponibles para esta búsqueda.</div>}
      </section>

      <section className="pager">
        <button className="btn ghost" disabled={page <= 1} onClick={() => setPage((v) => v - 1)}>
          Anterior
        </button>
        <span className="muted">
          Página {page} de {totalPages}
        </span>
        <button className="btn ghost" disabled={page >= totalPages} onClick={() => setPage((v) => v + 1)}>
          Siguiente
        </button>
      </section>
    </div>
  );
}
