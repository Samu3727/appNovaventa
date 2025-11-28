# Configuración de Railway

## Paso 1: Obtener la URL de tu servicio en Railway

Una vez que Railway termine de desplegar tu backend, obtendrás una URL similar a:
```
https://appnovaventa-production.up.railway.app
```

## Paso 2: Actualizar la URL en la app móvil

Edita el archivo `novaventa/config/api.js` y reemplaza la URL:

```javascript
// Cambia esta línea:
export const API_BASE_URL = 'https://tu-app.up.railway.app/api';

// Por tu URL real de Railway (agrega /api al final):
export const API_BASE_URL = 'https://appnovaventa-production.up.railway.app/api';
```

## Paso 3: Variables de entorno en Railway

Asegúrate de configurar estas variables en Railway:

- `DB_HOST` - Host de MySQL (proporcionado por Railway)
- `DB_USER` - Usuario de MySQL (proporcionado por Railway)
- `DB_PASSWORD` - Contraseña de MySQL (proporcionado por Railway)
- `DB_NAME` - `Novaventa`
- `DB_PORT` - `3306`
- `SECRET_KEY` - Una clave secreta segura para JWT
- `PORT` - Railway lo asigna automáticamente

## Paso 4: Ejecutar el SQL

Conecta a la base de datos MySQL de Railway y ejecuta el archivo `Backend/db.sql`

## Desarrollo local

Para desarrollar localmente, cambia en `novaventa/config/api.js`:

```javascript
export const API_BASE_URL = 'http://localhost:8000/api';
```

## Nota importante

Después de cambiar la URL, reinicia el servidor de Expo:
```bash
cd novaventa
npx expo start --clear
```
