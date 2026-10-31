const express = require('express');
const router = express.Router();

const productoController = require('../controllers/productoController');

router.get('/', productoController.getProductos);
router.get('/:id', productoController.getProductoById);
router.post('/', productoController.postProducto);
router.put('/:id', productoController.putProducto);
router.delete('/:id', productoController.deleteProducto);

module.exports = router;
