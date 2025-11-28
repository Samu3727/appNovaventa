const express = require('express');
const cors = require('cors');
const path = require('path');

require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

//Carpeta de imagenes.

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
