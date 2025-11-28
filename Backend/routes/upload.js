const express = require('express');
const router = express.Router();
const { upload, uploadProfileImage, getProfileImage } = require('../controllers/upload.controller');
const { verificarToken } = require('../middleware/auth');

// Subir imagen de perfil
router.post('/profile-image', verificarToken, upload.single('image'), uploadProfileImage);

// Obtener imagen de perfil
router.get('/profile-image', verificarToken, getProfileImage);

module.exports = router;
