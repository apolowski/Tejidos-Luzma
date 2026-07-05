# Backend del e-commerce RopaShop

Este backend permite administrar usuarios, productos, categorías, carrito de compras y órdenes para un e-commerce de ropa. Está construido con Python, FastAPI y SQLAlchemy.

## ¿Qué hace este backend?

El backend se encarga de:
- recibir peticiones del frontend,
- validar los datos que llegan,
- conectarse a la base de datos,
- aplicar la lógica de negocio,
- devolver respuestas en formato JSON,
- gestionar autenticación con JWT y contraseñas seguras.

En otras palabras, este backend es el cerebro del sistema: organiza la información, la protege y la entrega a la interfaz del usuario.

---

## Requisitos previos

Necesitas tener instalado:
- Python 3.10 o superior
- pip
- Git
- una base de datos (en desarrollo se puede usar SQLite, y en producción PostgreSQL)

---

## 1. Crear el entorno virtual

Ve a la carpeta del backend y crea un entorno virtual.

En Windows PowerShell:

```powershell
cd d:\proyectoecomerceenca\backend
python -m venv .venv
```

Activar el entorno:

```powershell
.\.venv\Scripts\Activate.ps1
```

Si PowerShell bloquea la ejecución, puedes usar:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\.venv\Scripts\Activate.ps1
```

---

## 2. Instalar dependencias

Puedes instalar todo con este comando:

```powershell
pip install fastapi==0.115.12 uvicorn[standard]==0.34.0 SQLAlchemy==2.0.39 psycopg[binary]==3.2.6 alembic==1.15.1 pydantic==2.10.6 pydantic-settings==2.8.1 python-jose[cryptography]==3.3.0 passlib[bcrypt]==1.7.4 python-multipart==0.0.20 email-validator==2.2.0
```

O también puedes usar el archivo de requirements:

```powershell
pip install -r requirements.txt
```

---

## 3. Configurar variables de entorno

El proyecto usa un archivo `.env` para configuración. Si no existe, créalo en la carpeta `backend`.

Ejemplo mínimo:

```env
DATABASE_URL=sqlite:///./app.db
JWT_SECRET_KEY=dev-secret-key-change-me
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
CORS_ORIGINS=http://localhost:5173
```

Si vas a usar PostgreSQL, la línea podría verse así:

```env
DATABASE_URL=postgresql://usuario:password@localhost:5432/ropashop
```

---

## 4. Ejecutar el backend

Desde la carpeta `backend`:

```powershell
python -m uvicorn app.main:app --reload
```

La API quedará disponible en:
- http://localhost:8000
- http://localhost:8000/docs para la documentación interactiva de FastAPI

---

## 5. Estructura del backend y qué hace cada carpeta

### app/
Carpeta principal del proyecto backend.

### app/main.py
Es el punto de entrada de la aplicación.
Aquí se:
- crea la app FastAPI,
- se activan middlewares,
- se montan archivos estáticos,
- se registran los routers,
- se define la ruta `/health`.

### app/config/
Contiene la configuración del proyecto.
- `database.py`: conecta SQLAlchemy con la base de datos y crea la sesión.
- `settings.py`: guarda variables como la URL de la base de datos y la clave secreta del JWT.

### app/models/
Aquí están los modelos de base de datos.
Cada archivo representa una tabla o entidad del sistema, por ejemplo:
- `user.py`: usuarios
- `product.py`: productos
- `category.py`: categorías
- `cart.py`: carrito
- `order.py`: órdenes

Estos modelos se usan con SQLAlchemy para crear y consultar datos.

### app/schemas/
Aquí están los esquemas de validación.
Se usan para definir qué datos entran y salen de la API.
Por ejemplo:
- `user_schema.py`: datos de login y registro
- `product_schema.py`: datos de productos
- `cart_schema.py`: datos del carrito
- `order_schema.py`: datos de órdenes

Son importantes porque ayudan a validar que los datos sean correctos antes de procesarlos.

### app/routers/
Aquí están los endpoints del API.
Cada router define rutas como:
- `/api/auth`
- `/api/products`
- `/api/cart`
- `/api/orders`

Un router recibe la petición y la envía a la lógica de negocio.

### app/services/
Aquí va la lógica de negocio.
Por ejemplo:
- crear un usuario,
- iniciar sesión,
- agregar un producto al carrito,
- convertir el carrito en una orden.

La idea es separar la lógica del código de los endpoints.

### app/dependencies/
Aquí van funciones reutilizables para las rutas.
Por ejemplo:
- `get_current_user`: obtiene el usuario autenticado desde el token JWT.
- `require_admin`: valida si el usuario tiene permisos de administrador.

### app/middleware/
Aquí van componentes que se ejecutan antes o después de cada petición.
Por ejemplo:
- autenticación contextual,
- límite de peticiones,
- registro de logs.

### app/security/
Aquí está todo lo relacionado con seguridad.
- `jwt_handler.py`: crear y leer tokens JWT.
- `password_hash.py`: encriptar y verificar contraseñas.

### app/__init__.py
Marca la carpeta `app` como paquete de Python.

---

## 6. ¿Cómo se comunican estas carpetas?

La comunicación del backend sigue este flujo:

1. El frontend manda una petición a una ruta del API.
2. El router recibe esa petición.
3. El router llama a un servicio.
4. El servicio usa los modelos y la base de datos.
5. Se valida la respuesta con los schemas.
6. El router devuelve la respuesta al frontend.

Ejemplo simple:

- El frontend envía login.
- `auth_router` recibe la petición.
- llama a `auth_service`.
- `auth_service` revisa el usuario en la base de datos.
- si todo está bien, genera un token JWT.
- el endpoint responde con el token.

### Flujo general

```text
Frontend -> Router -> Service -> Model -> Base de datos
                      ^                     |
                      |                     |
                      +---- Schema / Response <---+
```

---

## 7. Endpoints principales

### Autenticación
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Productos
- `GET /api/products`
- `GET /api/products/{id}`

### Carrito
- `GET /api/cart`
- `POST /api/cart/add`
- `DELETE /api/cart/remove`

### Órdenes
- `POST /api/orders`
- `GET /api/orders`
- `GET /api/orders/{id}`

---

## 8. Consejos útiles

- Usa siempre el entorno virtual activado antes de trabajar.
- Si cambias dependencias, reinicia el entorno o vuelve a instalar.
- Si el backend falla al iniciar, revisa primero que la base de datos esté disponible y que el archivo `.env` tenga los valores correctos.
- Para ver la documentación automática, entra a `/docs`.

---

## 9. Resumen rápido

Este backend es la parte lógica del proyecto. Se encarga de:
- recibir peticiones,
- validar datos,
- trabajar con la base de datos,
- proteger usuarios,
- manejar productos, carrito y órdenes.

Cada carpeta tiene un rol claro:
- routers = rutas de la API,
- services = lógica de negocio,
- models = tablas de la base de datos,
- schemas = validación,
- config = configuración,
- security = seguridad.

