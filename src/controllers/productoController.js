const productoModel = require('../models/productoModel');
const { validarDatos, idValido } = require('../utils/validator');
const { manejarErrorBD, responderActualizacion } = require('../utils/errores');

// se realiza llamado al modelo

const reglas = [
    { campo: 'id_categoria', tipo: 'entero', requerido: true, min: 1 },
    { campo: 'id_marca', tipo: 'entero', requerido: true, min: 1 },
    { campo: 'codigo_producto', tipo: 'texto', requerido: true, max: 30 },
    { campo: 'nombre', tipo: 'texto', requerido: true, max: 120 },
    { campo: 'descripcion', tipo: 'texto', requerido: false, max: 65535 },
    { campo: 'modelo', tipo: 'texto', requerido: false, max: 80 },
    { campo: 'precio', tipo: 'decimal', requerido: true, min: 0 },
    { campo: 'stock', tipo: 'entero', requerido: false, min: 0 },
    { campo: 'imagen_url', tipo: 'texto', requerido: false, max: 500 },
    { campo: 'estado', tipo: 'booleano', requerido: false }
];

module.exports = {

    getProductos: (req, res) => {
        productoModel.getProductos(req.query, (err, result) => {
            if (err) return manejarErrorBD(err, res);
            res.status(200).json({ ok: true, total: result.length, data: result });
        });
    },

    getProductoById: (req, res) => {
        const { id } = req.params;
        if (!idValido(id)) {
            return res.status(400).json({ ok: false, error: 'El id debe ser un número entero positivo' });
        }

        productoModel.getProductoById(id, (err, result) => {
            if (err) return manejarErrorBD(err, res);
            if (result.length === 0) {
                return res.status(404).json({ ok: false, error: 'Producto no encontrado' });
            }
            res.status(200).json({ ok: true, data: result[0] });
        });
    },

    postProducto: (req, res) => {
        const errores = validarDatos(req.body, reglas);
        if (errores.length > 0) {
            return res.status(400).json({ ok: false, error: 'Datos inválidos', detalles: errores });
        }

        productoModel.postProducto(req.body, (err, result) => {
            if (err) return manejarErrorBD(err, res);
            res.status(201).json({ ok: true, message: 'Producto creado correctamente', data: { id_producto: result.insertId } });
        });
    },

    putProducto: (req, res) => {
        const { id } = req.params;
        if (!idValido(id)) {
            return res.status(400).json({ ok: false, error: 'El id debe ser un número entero positivo' });
        }

        const errores = validarDatos(req.body, reglas);
        if (errores.length > 0) {
            return res.status(400).json({ ok: false, error: 'Datos inválidos', detalles: errores });
        }

        productoModel.putProducto(id, req.body, (err, result) => {
            if (err) return manejarErrorBD(err, res);
            responderActualizacion(
                res,
                result,
                id,
                productoModel.getProductoById.bind(productoModel),
                'Producto no encontrado',
                'Producto actualizado correctamente'
            );
        });
    },

    deleteProducto: (req, res) => {
        const { id } = req.params;
        if (!idValido(id)) {
            return res.status(400).json({ ok: false, error: 'El id debe ser un número entero positivo' });
        }

        productoModel.deleteProducto(id, (err, result) => {
            if (err) return manejarErrorBD(err, res);
            if (result.affectedRows === 0) {
                return res.status(404).json({ ok: false, error: 'Producto no encontrado' });
            }
            res.status(200).json({ ok: true, message: 'Producto eliminado correctamente' });
        });
    }
};
