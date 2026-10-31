const express = require('express');
const router = express.Router();

const detallePedidoController = require('../controllers/detallePedidoController');

router.get('/', detallePedidoController.getDetallesPedido);
router.get('/:id', detallePedidoController.getDetallePedidoById);
router.post('/', detallePedidoController.postDetallePedido);
router.put('/:id', detallePedidoController.putDetallePedido);
router.delete('/:id', detallePedidoController.deleteDetallePedido);

module.exports = router;
