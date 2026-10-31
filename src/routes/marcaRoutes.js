const express = require('express');
const router = express.Router();

const marcaController = require('../controllers/marcaController');

router.get('/', marcaController.getMarcas);
router.get('/:id', marcaController.getMarcaById);
router.post('/', marcaController.postMarca);
router.put('/:id', marcaController.putMarca);
router.delete('/:id', marcaController.deleteMarca);

module.exports = router;
