# Frontend del e-commerce RopaShop

Este frontend es la parte visual del proyecto. Permite que el usuario vea productos, se registre, inicie sesión, agregue artículos al carrito y haga pedidos.

## ¿Qué hace este frontend?

El frontend se encarga de:
- mostrar la interfaz del e-commerce,
- captar la interacción del usuario,
- enviar peticiones al backend,
- mostrar productos, carrito, pedidos y perfil,
- guardar el estado de autenticación del usuario.

En otras palabras, el frontend es la parte que el usuario ve y usa.

---

## Requisitos previos

Necesitas tener instalado:
- Node.js 18 o superior
- npm

---

## 1. Instalar dependencias

Entra a la carpeta del frontend y ejecuta:

```powershell
cd d:\proyectoecomerceenca\frontend
npm install
```

---

## 2. Ejecutar el frontend

Una vez instaladas las dependencias, inicia el proyecto con:

```powershell
npm run dev
```

La aplicación normalmente quedará disponible en:
- http://localhost:5173

---

## 3. Estructura del frontend y qué hace cada carpeta

### src/
Carpeta principal del proyecto frontend.

### src/main.js
Es el punto de entrada de la aplicación React.
Aquí se renderiza la app en el navegador.

### src/App.js
Es el componente principal que arma la navegación general del proyecto.

### src/pages/
Aquí están las páginas principales de la tienda:
- `Home.js`: página principal con productos.
- `ProductDetail.js`: detalle de un producto.
- `Cart.js`: vista del carrito.
- `Login.js`: formulario para iniciar sesión.
- `Register.js`: formulario para crear cuenta.
- `Profile.js`: perfil del usuario.
- `Orders.js`: historial de pedidos.

### src/components/
Aquí están los componentes reutilizables de la interfaz:
- `Navbar.js`: barra de navegación.
- `ProductCard.js`: tarjeta de producto.
- `CartDrawer.js`: panel lateral del carrito.
- `CartItem.js`: elemento de producto dentro del carrito.

### src/context/
Aquí van los contextos de React para compartir datos globales.
- `AuthContext.js`: guarda el usuario autenticado y el token JWT.

### src/services/
Aquí están los archivos que se conectan con el backend.
- `api.js`: configuración de Axios para hacer peticiones a la API.

### src/styles/
Aquí están los estilos globales del proyecto.
- `global.css`: estilos generales de la aplicación.

### index.html
Archivo base de la aplicación Vite.

---

## 4. ¿Cómo se comunican las carpetas?

El flujo del frontend es este:

1. El usuario interactúa con una página.
2. El componente llama a un servicio en `src/services`.
3. Ese servicio envía una petición al backend.
4. El backend responde con datos.
5. La página actualiza su estado y muestra la información.

Ejemplo simple:
- El usuario entra a la página principal.
- `Home.js` pide productos al backend.
- `api.js` hace la petición.
- el backend responde con los datos.
- `ProductCard` muestra cada producto.

---

## 5. ¿Qué hace cada pieza importante?

### React Router
Permite navegar entre páginas sin recargar toda la app.

### Axios
Es la librería que hace peticiones HTTP al backend.

### Context API
Permite compartir información global como:
- usuario logueado,
- token de acceso,
- datos del carrito.

### Vite
Es la herramienta que crea y ejecuta la app frontend de forma rápida.

---

## 6. Cómo se conecta con el backend

El frontend se comunica con el backend usando la URL de la API.
Normalmente se define en `src/services/api.js`.

Ejemplo de idea general:
- frontend envía `POST /api/auth/login`
- backend responde con un token
- frontend guarda el token y lo usa en futuras peticiones

---

## 7. Comandos útiles

Instalar dependencias:
```powershell
npm install
```

Iniciar el proyecto:
```powershell
npm run dev
```

Construir versión lista para producción:
```powershell
npm run build
```

---

## 8. Resumen rápido

El frontend es la parte visual del proyecto. Su trabajo es:
- mostrar la tienda,
- recibir acciones del usuario,
- comunicarse con el backend,
- mostrar resultados como productos, carrito y pedidos.

Las partes más importantes son:
- `pages`: páginas del sitio,
- `components`: piezas reutilizables,
- `context`: estado global,
- `services`: conexión con la API,
- `styles`: diseño visual.

Si quieres, también puedo hacer una versión de esta guía más corta y más visual, tipo resumen para estudiantes. 