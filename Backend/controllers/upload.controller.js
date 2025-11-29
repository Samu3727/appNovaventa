const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const db = require('../models/conexion');

// Configurar Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configurar almacenamiento en Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'novaventa/profiles',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        transformation: [{ width: 500, height: 500, crop: 'limit' }],
        public_id: (req, file) => 'profile-' + Date.now() + '-' + Math.round(Math.random() * 1E9)
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
});

// Subir foto de perfil
const uploadProfileImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No se proporcionó ninguna imagen' });
        }

        const userId = req.userId; // Viene del middleware de autenticación
        const imageUrl = req.file.path; // Cloudinary devuelve la URL completa en req.file.path

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
