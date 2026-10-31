const detallePedidoModel = require('../models/detallePedidoModel');
const { validarDatos, idValido } = require('../utils/validator');
const { manejarErrorBD, responderActualizacion } = require('../utils/errores');

// se realiza llamado al modelo

const reglas = [
    { campo: 'id_pedido', tipo: 'entero', requerido: true, min: 1 },
    { campo: 'id_producto', tipo: 'entero', requerido: true, min: 1 },
    { campo: 'cantidad', tipo: 'entero', requerido: true, min: 1 },
    { campo: 'precio_unitario', tipo: 'decimal', requerido: true, min: 0 }
];

module.exports = {

    getDetallesPedido: (req, res) => {
        detallePedidoModel.getDetallesPedido(req.query, (err, result) => {
            if (err) return manejarErrorBD(err, res);
            res.status(200).json({ ok: true, total: result.length, data: result });
        });
    },

    getDetallePedidoById: (req, res) => {
        const { id } = req.params;
        if (!idValido(id)) {
            return res.status(400).json({ ok: false, error: 'El id debe ser un número entero positivo' });
        }

        detallePedidoModel.getDetallePedidoById(id, (err, result) => {
            if (err) return manejarErrorBD(err, res);
            if (result.length === 0) {
                return res.status(404).json({ ok: false, error: 'Detalle de pedido no encontrado' });
            }
            res.status(200).json({ ok: true, data: result[0] });
        });
    },

    postDetallePedido: (req, res) => {
        const errores = validarDatos(req.body, reglas);
        if (errores.length > 0) {
            return res.status(400).json({ ok: false, error: 'Datos inválidos', detalles: errores });
        }

        detallePedidoModel.postDetallePedido(req.body, (err, result) => {
            if (err) return manejarErrorBD(err, res);
            res.status(201).json({ ok: true, message: 'Detalle de pedido creado correctamente', data: { id_detalle: result.insertId } });
        });
    },

    putDetallePedido: (req, res) => {
        const { id } = req.params;
        if (!idValido(id)) {
            return res.status(400).json({ ok: false, error: 'El id debe ser un número entero positivo' });
        }

        const errores = validarDatos(req.body, reglas);
        if (errores.length > 0) {
            return res.status(400).json({ ok: false, error: 'Datos inválidos', detalles: errores });
        }

        detallePedidoModel.putDetallePedido(id, req.body, (err, result) => {
            if (err) return manejarErrorBD(err, res);
            responderActualizacion(
                res,
                result,
                id,
                detallePedidoModel.getDetallePedidoById.bind(detallePedidoModel),
                'Detalle de pedido no encontrado',
                'Detalle de pedido actualizado correctamente'
            );
        });
    },

    deleteDetallePedido: (req, res) => {
        const { id } = req.params;
        if (!idValido(id)) {
            return res.status(400).json({ ok: false, error: 'El id debe ser un número entero positivo' });
        }

        detallePedidoModel.deleteDetallePedido(id, (err, result) => {
            if (err) return manejarErrorBD(err, res);
            if (result.affectedRows === 0) {
                return res.status(404).json({ ok: false, error: 'Detalle de pedido no encontrado' });
            }
            res.status(200).json({ ok: true, message: 'Detalle de pedido eliminado correctamente' });
        });
    }
};
