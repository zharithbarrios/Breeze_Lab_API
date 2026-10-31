const pedidoModel = require('../models/pedidoModel');
const { validarDatos, idValido } = require('../utils/validator');
const { manejarErrorBD, responderActualizacion } = require('../utils/errores');

// se realiza llamado al modelo

const reglas = [
    { campo: 'id_cliente', tipo: 'entero', requerido: true, min: 1 },
    { campo: 'id_metodo_pago', tipo: 'entero', requerido: true, min: 1 },
    { campo: 'numero_pedido', tipo: 'texto', requerido: true, max: 30 },
    { campo: 'fecha_pedido', tipo: 'fecha', requerido: false },
    { campo: 'estado', tipo: 'opcion', requerido: false, valores: ['Pendiente', 'Pagado', 'Enviado', 'Entregado', 'Cancelado'] },
    { campo: 'subtotal', tipo: 'decimal', requerido: true, min: 0 },
    { campo: 'total', tipo: 'decimal', requerido: true, min: 0 },
    { campo: 'direccion_entrega', tipo: 'texto', requerido: true, max: 180 },
    { campo: 'ciudad_entrega', tipo: 'texto', requerido: true, max: 80 },
    { campo: 'departamento_entrega', tipo: 'texto', requerido: true, max: 80 }
];

module.exports = {

    getPedidos: (req, res) => {
        pedidoModel.getPedidos(req.query, (err, result) => {
            if (err) return manejarErrorBD(err, res);
            res.status(200).json({ ok: true, total: result.length, data: result });
        });
    },

    getPedidoById: (req, res) => {
        const { id } = req.params;
        if (!idValido(id)) {
            return res.status(400).json({ ok: false, error: 'El id debe ser un número entero positivo' });
        }

        pedidoModel.getPedidoById(id, (err, result) => {
            if (err) return manejarErrorBD(err, res);
            if (result.length === 0) {
                return res.status(404).json({ ok: false, error: 'Pedido no encontrado' });
            }
            res.status(200).json({ ok: true, data: result[0] });
        });
    },

    postPedido: (req, res) => {
        const errores = validarDatos(req.body, reglas);
        if (errores.length > 0) {
            return res.status(400).json({ ok: false, error: 'Datos inválidos', detalles: errores });
        }

        pedidoModel.postPedido(req.body, (err, result) => {
            if (err) return manejarErrorBD(err, res);
            res.status(201).json({ ok: true, message: 'Pedido creado correctamente', data: { id_pedido: result.insertId } });
        });
    },

    putPedido: (req, res) => {
        const { id } = req.params;
        if (!idValido(id)) {
            return res.status(400).json({ ok: false, error: 'El id debe ser un número entero positivo' });
        }

        const errores = validarDatos(req.body, reglas);
        if (errores.length > 0) {
            return res.status(400).json({ ok: false, error: 'Datos inválidos', detalles: errores });
        }

        pedidoModel.putPedido(id, req.body, (err, result) => {
            if (err) return manejarErrorBD(err, res);
            responderActualizacion(
                res,
                result,
                id,
                pedidoModel.getPedidoById.bind(pedidoModel),
                'Pedido no encontrado',
                'Pedido actualizado correctamente'
            );
        });
    },

    deletePedido: (req, res) => {
        const { id } = req.params;
        if (!idValido(id)) {
            return res.status(400).json({ ok: false, error: 'El id debe ser un número entero positivo' });
        }

        pedidoModel.deletePedido(id, (err, result) => {
            if (err) return manejarErrorBD(err, res);
            if (result.affectedRows === 0) {
                return res.status(404).json({ ok: false, error: 'Pedido no encontrado' });
            }
            res.status(200).json({ ok: true, message: 'Pedido eliminado correctamente' });
        });
    }
};
