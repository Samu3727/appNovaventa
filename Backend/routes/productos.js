const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const productosController = require('../controllers/productos.controller');

router.get('/', productosController.listarProductos);
router.post('/', upload.single('imagen'), productosController.crearProducto);
router.put('/:id', upload.single('imagen'), productosController.actualizarProducto);
router.delete('/:id', productosController.eliminarProducto);

module.exports = router;
