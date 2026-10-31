const metodoPagoModel = require('../models/metodoPagoModel');
const { validarDatos, idValido } = require('../utils/validator');
const { manejarErrorBD, responderActualizacion } = require('../utils/errores');

// se realiza llamado al modelo

const reglas = [
    { campo: 'nombre', tipo: 'texto', requerido: true, max: 60 },
    { campo: 'descripcion', tipo: 'texto', requerido: false, max: 255 },
    { campo: 'estado', tipo: 'booleano', requerido: false }
];

module.exports = {

    getMetodosPago: (req, res) => {
        metodoPagoModel.getMetodosPago(req.query, (err, result) => {
            if (err) return manejarErrorBD(err, res);
            res.status(200).json({ ok: true, total: result.length, data: result });
        });
    },

    getMetodoPagoById: (req, res) => {
        const { id } = req.params;
        if (!idValido(id)) {
            return res.status(400).json({ ok: false, error: 'El id debe ser un número entero positivo' });
        }

        metodoPagoModel.getMetodoPagoById(id, (err, result) => {
            if (err) return manejarErrorBD(err, res);
            if (result.length === 0) {
                return res.status(404).json({ ok: false, error: 'Método de pago no encontrado' });
            }
            res.status(200).json({ ok: true, data: result[0] });
        });
    },

    postMetodoPago: (req, res) => {
        const errores = validarDatos(req.body, reglas);
        if (errores.length > 0) {
            return res.status(400).json({ ok: false, error: 'Datos inválidos', detalles: errores });
        }

        metodoPagoModel.postMetodoPago(req.body, (err, result) => {
            if (err) return manejarErrorBD(err, res);
            res.status(201).json({ ok: true, message: 'Método de pago creado correctamente', data: { id_metodo_pago: result.insertId } });
        });
    },

    putMetodoPago: (req, res) => {
        const { id } = req.params;
        if (!idValido(id)) {
            return res.status(400).json({ ok: false, error: 'El id debe ser un número entero positivo' });
        }

        const errores = validarDatos(req.body, reglas);
        if (errores.length > 0) {
            return res.status(400).json({ ok: false, error: 'Datos inválidos', detalles: errores });
        }

        metodoPagoModel.putMetodoPago(id, req.body, (err, result) => {
            if (err) return manejarErrorBD(err, res);
            responderActualizacion(
                res,
                result,
                id,
                metodoPagoModel.getMetodoPagoById.bind(metodoPagoModel),
                'Método de pago no encontrado',
                'Método de pago actualizado correctamente'
            );
        });
    },

    deleteMetodoPago: (req, res) => {
        const { id } = req.params;
        if (!idValido(id)) {
            return res.status(400).json({ ok: false, error: 'El id debe ser un número entero positivo' });
        }

        metodoPagoModel.deleteMetodoPago(id, (err, result) => {
            if (err) return manejarErrorBD(err, res);
            if (result.affectedRows === 0) {
                return res.status(404).json({ ok: false, error: 'Método de pago no encontrado' });
            }
            res.status(200).json({ ok: true, message: 'Método de pago eliminado correctamente' });
        });
    }
};
