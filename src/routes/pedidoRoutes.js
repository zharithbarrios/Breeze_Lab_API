const express = require('express');
const router = express.Router();

const pedidoController = require('../controllers/pedidoController');

router.get('/', pedidoController.getPedidos);
router.get('/:id', pedidoController.getPedidoById);
router.post('/', pedidoController.postPedido);
router.put('/:id', pedidoController.putPedido);
router.delete('/:id', pedidoController.deletePedido);

module.exports = router;
