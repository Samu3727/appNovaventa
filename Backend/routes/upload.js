const express = require('express');
const router = express.Router();
const { upload, uploadProfileImage, getProfileImage, testCloudinary } = require('../controllers/upload.controller');
const { verificarToken } = require('../middleware/auth');

// Test de configuración de Cloudinary
router.get('/test-cloudinary', testCloudinary);

// Subir imagen de perfil
router.post('/profile-image', verificarToken, upload.single('image'), uploadProfileImage);

// Obtener imagen de perfil
router.get('/profile-image', verificarToken, getProfileImage);

module.exports = router;
