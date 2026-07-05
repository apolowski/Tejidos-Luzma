-- RopaShop - Esquema de base de datos PostgreSQL
-- Este archivo contiene la estructura principal del proyecto.
-- Se puede ejecutar completo en PostgreSQL 13+.

BEGIN;

-- Extensión opcional para búsquedas más flexibles.
-- CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Tabla de usuarios: guarda datos de autenticación y perfil.
CREATE TABLE IF NOT EXISTS users (
  id              SERIAL PRIMARY KEY,
  name            VARCHAR(120) NOT NULL,
  email           VARCHAR(255) NOT NULL,
  password_hash   VARCHAR(255) NOT NULL,
  role            VARCHAR(20) NOT NULL DEFAULT 'user',
  phone           VARCHAR(32) NULL,
  address         VARCHAR(500) NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_users_email UNIQUE (email)
);

-- Tabla de categorías: agrupa productos por tipo.
CREATE TABLE IF NOT EXISTS categories (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(120) NOT NULL,
  description TEXT NULL,
  CONSTRAINT uq_categories_name UNIQUE (name)
);

-- Tabla de productos: representa cada artículo del catálogo.
CREATE TABLE IF NOT EXISTS products (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(200) NOT NULL,
  description TEXT NULL,
  price       NUMERIC(12,2) NOT NULL CHECK (price > 0),
  stock       INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
  category_id INT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  image_url   VARCHAR(500) NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabla de variantes: permite separar stock por talla/color.
CREATE TABLE IF NOT EXISTS product_variants (
  id          SERIAL PRIMARY KEY,
  product_id  INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size        VARCHAR(32) NOT NULL,
  color       VARCHAR(64) NOT NULL,
  stock       INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
  CONSTRAINT uq_product_variant_product_size_color UNIQUE (product_id, size, color)
);

-- Tabla de carrito: cada usuario tiene un carrito único.
CREATE TABLE IF NOT EXISTS cart (
  id          SERIAL PRIMARY KEY,
  user_id     INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_cart_user_id UNIQUE (user_id)
);

-- Tabla de items del carrito: guarda los productos agregados por el usuario.
CREATE TABLE IF NOT EXISTS cart_items (
  id                  SERIAL PRIMARY KEY,
  cart_id             INT NOT NULL REFERENCES cart(id) ON DELETE CASCADE,
  product_variant_id  INT NOT NULL REFERENCES product_variants(id) ON DELETE RESTRICT,
  quantity            INT NOT NULL DEFAULT 1 CHECK (quantity >= 1),
  CONSTRAINT uq_cart_item_cart_variant UNIQUE (cart_id, product_variant_id)
);

-- Tabla de órdenes: representa la compra final del usuario.
CREATE TABLE IF NOT EXISTS orders (
  id               SERIAL PRIMARY KEY,
  user_id          INT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  status           VARCHAR(20) NOT NULL DEFAULT 'pending',
  total_price      NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (total_price >= 0),
  currency         CHAR(3) NOT NULL DEFAULT 'COP',
  shipping_address VARCHAR(500) NULL,
  shipping_phone   VARCHAR(32) NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabla de detalles de la orden: guarda los productos incluidos en cada pedido.
CREATE TABLE IF NOT EXISTS order_items (
  id                  SERIAL PRIMARY KEY,
  order_id            INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_variant_id  INT NOT NULL REFERENCES product_variants(id) ON DELETE RESTRICT,
  quantity            INT NOT NULL CHECK (quantity >= 1),
  price               NUMERIC(12,2) NOT NULL CHECK (price > 0)
);

COMMIT;
