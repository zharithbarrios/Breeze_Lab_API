const envioModel = require('../models/envioModel');
const { validarDatos, idValido } = require('../utils/validator');
const { manejarErrorBD, responderActualizacion } = require('../utils/errores');

// se realiza llamado al modelo

const reglas = [
    { campo: 'id_pedido', tipo: 'entero', requerido: true, min: 1 },
    { campo: 'transportadora', tipo: 'texto', requerido: false, max: 100 },
    { campo: 'numero_guia', tipo: 'texto', requerido: false, max: 60 },
    { campo: 'costo_envio', tipo: 'decimal', requerido: true, min: 0 },
    { campo: 'fecha_envio', tipo: 'fecha', requerido: false },
    { campo: 'fecha_entrega', tipo: 'fecha', requerido: false },
    { campo: 'estado_envio', tipo: 'opcion', requerido: false, valores: ['Pendiente', 'En tránsito', 'Entregado', 'Cancelado'] }
];

module.exports = {

    getEnvios: (req, res) => {
        envioModel.getEnvios(req.query, (err, result) => {
            if (err) return manejarErrorBD(err, res);
            res.status(200).json({ ok: true, total: result.length, data: result });
        });
    },

    getEnvioById: (req, res) => {
        const { id } = req.params;
        if (!idValido(id)) {
            return res.status(400).json({ ok: false, error: 'El id debe ser un número entero positivo' });
        }

        envioModel.getEnvioById(id, (err, result) => {
            if (err) return manejarErrorBD(err, res);
            if (result.length === 0) {
                return res.status(404).json({ ok: false, error: 'Envío no encontrado' });
            }
            res.status(200).json({ ok: true, data: result[0] });
        });
    },

    postEnvio: (req, res) => {
        const errores = validarDatos(req.body, reglas);
        if (errores.length > 0) {
            return res.status(400).json({ ok: false, error: 'Datos inválidos', detalles: errores });
        }

        envioModel.postEnvio(req.body, (err, result) => {
            if (err) return manejarErrorBD(err, res);
            res.status(201).json({ ok: true, message: 'Envío creado correctamente', data: { id_envio: result.insertId } });
        });
    },

    putEnvio: (req, res) => {
        const { id } = req.params;
        if (!idValido(id)) {
            return res.status(400).json({ ok: false, error: 'El id debe ser un número entero positivo' });
        }

        const errores = validarDatos(req.body, reglas);
        if (errores.length > 0) {
            return res.status(400).json({ ok: false, error: 'Datos inválidos', detalles: errores });
        }

        envioModel.putEnvio(id, req.body, (err, result) => {
            if (err) return manejarErrorBD(err, res);
            responderActualizacion(
                res,
                result,
                id,
                envioModel.getEnvioById.bind(envioModel),
                'Envío no encontrado',
                'Envío actualizado correctamente'
            );
        });
    },

    deleteEnvio: (req, res) => {
        const { id } = req.params;
        if (!idValido(id)) {
            return res.status(400).json({ ok: false, error: 'El id debe ser un número entero positivo' });
        }

        envioModel.deleteEnvio(id, (err, result) => {
            if (err) return manejarErrorBD(err, res);
            if (result.affectedRows === 0) {
                return res.status(404).json({ ok: false, error: 'Envío no encontrado' });
            }
            res.status(200).json({ ok: true, message: 'Envío eliminado correctamente' });
        });
    }
};
