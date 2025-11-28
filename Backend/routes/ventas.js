const express = require('express');
const router = express.Router();
const ventasController = require('../controllers/ventas.controller');

router.post('/', ventasController.crearVenta);
router.get('/', ventasController.listarVentas);
router.get('/:id', ventasController.getVentaPorId);

module.exports = router;
