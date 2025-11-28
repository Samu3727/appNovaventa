const multer = require('multer');
const path = require('path');
const db = require('../models/conexion');

// Configurar almacenamiento de multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
    fileFilter: function (req, file, cb) {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, gif, webp)'));
        }
    }
});

// Subir foto de perfil
const uploadProfileImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No se proporcionó ninguna imagen' });
        }

        const userId = req.userId; // Viene del middleware de autenticación
        const imageUrl = `/uploads/${req.file.filename}`;

        // Actualizar la URL de la imagen en la base de datos
        await db.query('UPDATE usuarios SET imagen_perfil = ? WHERE id = ?', [imageUrl, userId]);

        res.json({ 
            message: 'Imagen subida exitosamente', 
            imageUrl: imageUrl 
        });
    } catch (error) {
        console.error('Error al subir imagen:', error);
        res.status(500).json({ error: error.message });
    }
};

// Obtener foto de perfil
const getProfileImage = async (req, res) => {
    try {
        const userId = req.userId;

        const [rows] = await db.query('SELECT imagen_perfil FROM usuarios WHERE id = ?', [userId]);
        
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.json({ imageUrl: rows[0].imagen_perfil });
    } catch (error) {
        console.error('Error al obtener imagen:', error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    upload,
    uploadProfileImage,
    getProfileImage
};
