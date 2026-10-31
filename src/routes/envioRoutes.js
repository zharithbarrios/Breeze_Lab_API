const express = require('express');
const router = express.Router();

const envioController = require('../controllers/envioController');

router.get('/', envioController.getEnvios);
router.get('/:id', envioController.getEnvioById);
router.post('/', envioController.postEnvio);
router.put('/:id', envioController.putEnvio);
router.delete('/:id', envioController.deleteEnvio);

module.exports = router;
