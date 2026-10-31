const marcaModel = require('../models/marcaModel');
const { validarDatos, idValido } = require('../utils/validator');
const { manejarErrorBD, responderActualizacion } = require('../utils/errores');

// se realiza llamado al modelo

const reglas = [
    { campo: 'nombre', tipo: 'texto', requerido: true, max: 80 },
    { campo: 'pais_origen', tipo: 'texto', requerido: false, max: 80 },
    { campo: 'descripcion', tipo: 'texto', requerido: false, max: 255 },
    { campo: 'estado', tipo: 'booleano', requerido: false }
];

module.exports = {

    getMarcas: (req, res) => {
        marcaModel.getMarcas(req.query, (err, result) => {
            if (err) return manejarErrorBD(err, res);
            res.status(200).json({ ok: true, total: result.length, data: result });
        });
    },

    getMarcaById: (req, res) => {
        const { id } = req.params;
        if (!idValido(id)) {
            return res.status(400).json({ ok: false, error: 'El id debe ser un número entero positivo' });
        }

        marcaModel.getMarcaById(id, (err, result) => {
            if (err) return manejarErrorBD(err, res);
            if (result.length === 0) {
                return res.status(404).json({ ok: false, error: 'Marca no encontrada' });
            }
            res.status(200).json({ ok: true, data: result[0] });
        });
    },

    postMarca: (req, res) => {
        const errores = validarDatos(req.body, reglas);
        if (errores.length > 0) {
            return res.status(400).json({ ok: false, error: 'Datos inválidos', detalles: errores });
        }

        marcaModel.postMarca(req.body, (err, result) => {
            if (err) return manejarErrorBD(err, res);
            res.status(201).json({ ok: true, message: 'Marca creada correctamente', data: { id_marca: result.insertId } });
        });
    },

    putMarca: (req, res) => {
        const { id } = req.params;
        if (!idValido(id)) {
            return res.status(400).json({ ok: false, error: 'El id debe ser un número entero positivo' });
        }

        const errores = validarDatos(req.body, reglas);
        if (errores.length > 0) {
            return res.status(400).json({ ok: false, error: 'Datos inválidos', detalles: errores });
        }

        marcaModel.putMarca(id, req.body, (err, result) => {
            if (err) return manejarErrorBD(err, res);
            responderActualizacion(
                res,
                result,
                id,
                marcaModel.getMarcaById.bind(marcaModel),
                'Marca no encontrada',
                'Marca actualizada correctamente'
            );
        });
    },

    deleteMarca: (req, res) => {
        const { id } = req.params;
        if (!idValido(id)) {
            return res.status(400).json({ ok: false, error: 'El id debe ser un número entero positivo' });
        }

        marcaModel.deleteMarca(id, (err, result) => {
            if (err) return manejarErrorBD(err, res);
            if (result.affectedRows === 0) {
                return res.status(404).json({ ok: false, error: 'Marca no encontrada' });
            }
            res.status(200).json({ ok: true, message: 'Marca eliminada correctamente' });
        });
    }
};
