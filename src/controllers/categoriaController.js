const categoriaModel = require('../models/categoriaModel');
const { validarDatos, idValido } = require('../utils/validator');
const { manejarErrorBD, responderActualizacion } = require('../utils/errores');

// se realiza llamado al modelo

const reglas = [
    { campo: 'nombre', tipo: 'texto', requerido: true, max: 80 },
    { campo: 'descripcion', tipo: 'texto', requerido: false, max: 255 },
    { campo: 'estado', tipo: 'booleano', requerido: false }
];

module.exports = {

    getCategorias: (req, res) => {
        categoriaModel.getCategorias(req.query, (err, result) => {
            if (err) return manejarErrorBD(err, res);
            res.status(200).json({ ok: true, total: result.length, data: result });
        });
    },

    getCategoriaById: (req, res) => {
        const { id } = req.params;
        if (!idValido(id)) {
            return res.status(400).json({ ok: false, error: 'El id debe ser un número entero positivo' });
        }

        categoriaModel.getCategoriaById(id, (err, result) => {
            if (err) return manejarErrorBD(err, res);
            if (result.length === 0) {
                return res.status(404).json({ ok: false, error: 'Categoría no encontrada' });
            }
            res.status(200).json({ ok: true, data: result[0] });
        });
    },

    postCategoria: (req, res) => {
        const errores = validarDatos(req.body, reglas);
        if (errores.length > 0) {
            return res.status(400).json({ ok: false, error: 'Datos inválidos', detalles: errores });
        }

        categoriaModel.postCategoria(req.body, (err, result) => {
            if (err) return manejarErrorBD(err, res);
            res.status(201).json({ ok: true, message: 'Categoría creada correctamente', data: { id_categoria: result.insertId } });
        });
    },

    putCategoria: (req, res) => {
        const { id } = req.params;
        if (!idValido(id)) {
            return res.status(400).json({ ok: false, error: 'El id debe ser un número entero positivo' });
        }

        const errores = validarDatos(req.body, reglas);
        if (errores.length > 0) {
            return res.status(400).json({ ok: false, error: 'Datos inválidos', detalles: errores });
        }

        categoriaModel.putCategoria(id, req.body, (err, result) => {
            if (err) return manejarErrorBD(err, res);
            responderActualizacion(
                res,
                result,
                id,
                categoriaModel.getCategoriaById.bind(categoriaModel),
                'Categoría no encontrada',
                'Categoría actualizada correctamente'
            );
        });
    },

    deleteCategoria: (req, res) => {
        const { id } = req.params;
        if (!idValido(id)) {
            return res.status(400).json({ ok: false, error: 'El id debe ser un número entero positivo' });
        }

        categoriaModel.deleteCategoria(id, (err, result) => {
            if (err) return manejarErrorBD(err, res);
            if (result.affectedRows === 0) {
                return res.status(404).json({ ok: false, error: 'Categoría no encontrada' });
            }
            res.status(200).json({ ok: true, message: 'Categoría eliminada correctamente' });
        });
    }
};
