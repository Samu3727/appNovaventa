const express = require('express');
const cors = require('cors');
const path = require('path');

require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', async (req, res) => {
    try {
        const db = require('./models/conexion');
        await db.query('SELECT 1');
        res.json({ 
            status: 'ok', 
            message: 'Server and database are running',
            env: {
                DB_HOST: process.env.DB_HOST ? 'configured' : 'missing',
                DB_USER: process.env.DB_USER ? 'configured' : 'missing',
                DB_NAME: process.env.DB_NAME ? 'configured' : 'missing',
                DB_PORT: process.env.DB_PORT ? 'configured' : 'missing',
                SECRET_KEY: process.env.SECRET_KEY ? 'configured' : 'missing'
            }
        });
    } catch (error) {
        res.status(500).json({ 
            status: 'error', 
            message: error.message,
            env: {
                DB_HOST: process.env.DB_HOST ? 'configured' : 'missing',
                DB_USER: process.env.DB_USER ? 'configured' : 'missing',
                DB_NAME: process.env.DB_NAME ? 'configured' : 'missing',
                DB_PORT: process.env.DB_PORT ? 'configured' : 'missing',
                SECRET_KEY: process.env.SECRET_KEY ? 'configured' : 'missing'
            }
        });
    }
});

// Rutas API
const authRoutes = require('./routes/auth');
const usuariosRoutes = require('./routes/usuarios');
const productosRoutes = require('./routes/productos');
const ventasRoutes = require('./routes/ventas');
const utilidadesRoutes = require('./routes/utilidades');

app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/ventas', ventasRoutes);
app.use('/api/utilidades', utilidadesRoutes);

//Carpeta de imagenes.

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ruta raíz informativa
app.get('/', (req, res) => {
    res.json({
        message: 'API Novaventa',
        version: '1.0.0',
        endpoints: {
            health: '/api/health',
            auth: '/api/auth/login',
            usuarios: '/api/usuarios',
            productos: '/api/productos',
            ventas: '/api/ventas'
        },
        status: 'running'
    });
});

//Manejo de rutas inexistentes.

app.use((req, res, next) => {
    res.status(404).json({error: 'Ruta no encontrada'});
});

//Manejo de errores internos del servidor.

app.use((err,req, res, next) => {
    console.error('Error en el servidor: ', err);
    res.status(500).json({error: 'Error interno del servidor'});
});

//Llamado al puerto.

const PORT = process.env.PORT || 8000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor corriendo en http://0.0.0.0:${PORT}`);
});
