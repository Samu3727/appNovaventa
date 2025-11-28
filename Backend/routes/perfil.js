const express = require('express');
const router = express.Router();
const { actualizarPerfil } = require('../controllers/perfil.controller');
const { verificarToken } = require('../middleware/auth');

// Actualizar perfil del usuario autenticado
router.put('/', verificarToken, actualizarPerfil);

module.exports = router;
