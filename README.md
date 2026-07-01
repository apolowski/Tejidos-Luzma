# RopaShop (Ecommerce de Ropa)

Stack:
- Backend: Python + FastAPI + PostgreSQL + SQLAlchemy + Alembic
- Seguridad: JWT + bcrypt (passlib) + CORS + rate limit basico
- Frontend: React (Vite) + CSS puro + Axios

## Arquitectura (resumen)

Backend:
- `backend/app/main.py`: FastAPI, CORS, rate limit, static `/static`
- `backend/app/models/`: SQLAlchemy models (users, categories, products, variants, cart, orders)
- `backend/app/schemas/`: Pydantic (validacion / response models)
- `backend/app/security/`: JWT + password hashing
- `backend/app/dependencies/auth.py`: `get_current_user` y `require_admin`
- `backend/app/routers/`: endpoints REST
- `backend/app/services/`: logica de negocio (auth, catalogo, carrito, pedidos)
- `backend/alembic/`: migraciones (init incluida)

Frontend:
- `frontend/src/pages/`: Home (busqueda/filtros/paginacion), detalle, carrito, login/register, pedidos
- `frontend/src/components/`: Navbar, ProductCard, CartItem, CartDrawer
- `frontend/src/context/AuthContext.js`: token JWT + user (localStorage)
- `frontend/src/services/api.js`: Axios client

## Base de datos

Opcion A (recomendada): Alembic
1) Crear base en Postgres (ejemplo: `ropashop`)
2) Configurar `backend/.env` (ver `backend/.env.example`)
3) Ejecutar migraciones:
   - `cd backend`
   - `pip install -r requirements.txt`
   - `alembic -c alembic.ini upgrade head`

Opcion B: Script SQL
- Ejecutar `database/schema.sql` en tu DB (mismo resultado logico; util para auditoria o instalacion manual).

## Backend (dev)

1) Crear `backend/.env` desde `backend/.env.example`
2) Instalar deps y correr:
   - `cd backend`
   - `pip install -r requirements.txt`
   - `uvicorn app.main:app --reload`

API base: `http://localhost:8000/api`
Static uploads: `http://localhost:8000/static/...`

Endpoints principales:
- Auth: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- Catalogo: `GET /api/products` (paginacion + filtros), `GET /api/products/{id}`
- Carrito: `GET /api/cart`, `POST /api/cart/add`, `DELETE /api/cart/remove`
- Pedidos: `POST /api/orders` (checkout con pago simulado), `GET /api/orders`, `GET /api/orders/{id}`

Notas de seguridad:
- JWT con expiracion (`ACCESS_TOKEN_EXPIRE_MINUTES`)
- Hash de password con bcrypt
- CORS configurable (`CORS_ORIGINS`)
- Rate limit basico in-memory por IP (`RATE_LIMIT_PER_MINUTE`)
- Rutas admin: crear/editar/eliminar productos, categorias, variantes e imagen

Crear admin (manual):
- Registra un usuario normal via `POST /api/auth/register`
- En PostgreSQL: `UPDATE users SET role='admin' WHERE email='tu@email.com';`
- Vuelve a loguearte para obtener un token con rol admin

## Frontend (dev)

1) Crear `frontend/.env` desde `frontend/.env.example` (apuntar a tu API)
2) Ejecutar:
   - `cd frontend`
   - `npm install`
   - `npm run dev`

Build:
- `npm run build`

## Manejo de imagenes

Admin:
- `POST /api/products/{id}/image` (multipart/form-data `file`)
- Se guarda en `backend/uploads/` y se sirve como `/static/...`
