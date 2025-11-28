# Setup de Base de Datos en Railway

## Opción 1: Desde tu computadora local

### Paso 1: Copia las credenciales de Railway

Ve a tu proyecto en Railway → MySQL service → Variables, y copia los valores de:
- `MYSQLHOST` o `MYSQL_HOST`
- `MYSQLUSER` o `MYSQL_USER`  
- `MYSQLPASSWORD` o `MYSQL_PASSWORD`
- `MYSQLPORT` o `MYSQL_PORT`

### Paso 2: Crea un archivo .env temporal

Crea el archivo `Backend/.env` con las credenciales de Railway:

```env
DB_HOST=tu-host.railway.app
DB_USER=root
DB_PASSWORD=tu-password
DB_NAME=Novaventa
DB_PORT=3306
```

### Paso 3: Ejecuta los scripts

```bash
cd Backend

# 1. Crear las tablas
node setupDatabase.js

# 2. Crear usuario de prueba
node crearUsuarioPrueba.js
```

### Paso 4: Limpia el archivo .env

Después de ejecutar los scripts, elimina el archivo `.env` local para evitar conflictos.

---

## Opción 2: Desde Railway CLI (más seguro)

### Instalar Railway CLI
```bash
npm install -g @railway/cli
railway login
railway link
```

### Ejecutar scripts en Railway
```bash
cd Backend
railway run node setupDatabase.js
railway run node crearUsuarioPrueba.js
```

---

## Opción 3: Desde un cliente MySQL

1. Descarga un cliente como **MySQL Workbench** o **DBeaver**
2. Usa las credenciales de Railway para conectarte
3. Ejecuta manualmente el contenido de `Backend/db.sql`
4. Ejecuta este SQL para crear un usuario:

```sql
USE Novaventa;

INSERT INTO Usuarios (nombres, apellidos, correo, contrasena, estado) 
VALUES ('Admin', 'Test', 'admin@test.com', '$2a$10$X3PW9PBhq4VnV1W8y8OKXeZjYvV8qL4wZ4xgOKL4w4Q4w4Q4w4Q4w', 1);
```

**Nota:** Esta contraseña hasheada corresponde a `123456`

---

## Verificar que todo funciona

Una vez configurada la base de datos:

1. Verifica que las tablas existan en Railway
2. Verifica que el usuario de prueba se haya creado
3. Prueba hacer login en la app con:
   - **Email:** `admin@test.com`
   - **Password:** `123456`
