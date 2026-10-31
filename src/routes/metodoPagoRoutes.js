const express = require('express');
const router = express.Router();

const metodoPagoController = require('../controllers/metodoPagoController');

router.get('/', metodoPagoController.getMetodosPago);
router.get('/:id', metodoPagoController.getMetodoPagoById);
router.post('/', metodoPagoController.postMetodoPago);
router.put('/:id', metodoPagoController.putMetodoPago);
router.delete('/:id', metodoPagoController.deleteMetodoPago);

module.exports = router;
