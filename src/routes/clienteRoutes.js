const express = require('express');
const router = express.Router();

const clienteController = require('../controllers/clienteController');

router.get('/', clienteController.getClientes);
router.get('/:id', clienteController.getClienteById);
router.post('/', clienteController.postCliente);
router.put('/:id', clienteController.putCliente);
router.delete('/:id', clienteController.deleteCliente);

module.exports = router;
