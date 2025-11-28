# NovaVenta - Sistema de Gestión de Ventas

Sistema completo de gestión de ventas con backend Node.js y frontend móvil React Native/Expo.

## 🚀 Características

### Backend (Node.js + Express + MySQL)
- ✅ Autenticación con JWT
- ✅ CRUD completo de Usuarios
- ✅ CRUD completo de Productos
- ✅ Sistema de Ventas con múltiples productos
- ✅ Soft Delete (eliminación lógica)
- ✅ Buscadores con paginación
- ✅ API RESTful

### Frontend (React Native + Expo)
- ✅ Pantalla de Login con autenticación JWT
- ✅ Perfil de usuario con opción de cerrar sesión
- ✅ Gestión de Usuarios (listar, crear, editar, eliminar, buscar)
- ✅ Gestión de Productos (listar, crear, editar, eliminar, buscar)
- ✅ Registro de Ventas con selección de productos
- ✅ Diseño profesional y moderno
- ✅ Navegación por tabs

## 📋 Requisitos previos

- Node.js (v16 o superior)
- MySQL (v8 o superior)
- Expo CLI
- Android Studio (emulador Android) o Xcode (iOS)

## 🔧 Instalación

### 1. Base de Datos
```bash
mysql -u root -p < Backend/db.sql
```

### 2. Backend
```powershell
cd Backend
npm install
npm start
```
Servidor en `http://localhost:8000`

### 3. Frontend
```powershell
cd novaventa
npm install
npm start
```

### 4. Configurar URL del Backend
Si usas dispositivo físico o iOS simulator, actualiza `http://10.0.2.2:8000` por tu IP local en:
- `components/AuthContext.jsx`
- `app/(tabs)/Pages/Usuarios/listarUsuarios.jsx`
- `app/(tabs)/productos.jsx`
- `app/(tabs)/ventas.jsx`

## 📱 Uso de la Aplicación

### Login
Ingresa correo y contraseña para acceder al sistema

### Usuarios
- Listar, crear, editar, eliminar (soft delete)
- Buscador en tiempo real
- Modal para formularios

### Productos
- CRUD completo con buscador
- Gestión de precios e inventario
- Diseño con cards profesionales

### Ventas
- Crear ventas por usuario
- Agregar múltiples productos
- Ajustar cantidades
- Cálculo automático del total
- Historial de ventas

### Perfil
- Ver información del usuario
- Cerrar sesión segura

## 🗄️ Estructura de Base de Datos

### Usuarios
- id, nombres, apellidos, correo, contrasena, estado

### Productos
- id, nombre_producto, codigo_producto, precio_producto, imagen_producto, estado

### Ventas
- id, usuario_id, fecha, total, estado

### VentasProductos (N:M)
- id, venta_id, producto_id, cantidad, precio_unitario

## 🔌 API Endpoints

**Autenticación**
- POST /api/auth/login

**Usuarios**
- GET /api/usuarios
- GET /api/usuarios/buscar?letra=X
- POST /api/usuarios
- PUT /api/usuarios/:id
- DELETE /api/usuarios/:id

**Productos**
- GET /api/productos?q=X
- POST /api/productos
- PUT /api/productos/:id
- DELETE /api/productos/:id

**Ventas**
- POST /api/ventas
- GET /api/ventas
- GET /api/ventas/:id

## 🎨 Stack Tecnológico

**Backend**: Node.js, Express, MySQL, JWT, bcryptjs, multer

**Frontend**: React Native, Expo Router, AsyncStorage, Picker

**Diseño**: Componentes personalizados, paleta moderna

## 🛠️ Solución de Problemas

### Error de conexión
- Verifica que el backend esté en puerto 8000
- En Android Emulator usa `10.0.2.2`
- En iOS usa `localhost`
- En dispositivo físico usa tu IP local

### Error de dependencias
```powershell
rm -rf node_modules
rm package-lock.json
npm install
```

---

**Desarrollado con ❤️ usando Node.js, React Native y Expo**
