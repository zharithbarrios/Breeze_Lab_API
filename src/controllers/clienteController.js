const clienteModel = require('../models/clienteModel');
const { validarDatos, idValido } = require('../utils/validator');
const { manejarErrorBD, responderActualizacion } = require('../utils/errores');
const bcrypt = require('bcryptjs');
// se realiza llamado al modelo

const reglas = [
    { campo: 'nombres', tipo: 'texto', requerido: true, max: 80 },
    { campo: 'apellidos', tipo: 'texto', requerido: true, max: 80 },
    { campo: 'correo', tipo: 'correo', requerido: true, max: 120 },
    { campo: 'telefono', tipo: 'texto', requerido: false, max: 20 },
    { campo: 'direccion', tipo: 'texto', requerido: false, max: 180 },
    { campo: 'ciudad', tipo: 'texto', requerido: false, max: 80 },
    { campo: 'departamento', tipo: 'texto', requerido: false, max: 80 },
    { campo: 'estado', tipo: 'booleano', requerido: false }
];

// La contraseña es obligatoria al crear y opcional al actualizar
const reglasContrasenaCrear = { campo: 'contrasena', tipo: 'texto', requerido: true, min: 6, max: 72 };
const reglasContrasenaEditar = { campo: 'contrasena', tipo: 'texto', requerido: false, min: 6, max: 72 };

module.exports = {

    getClientes: (req, res) => {
        clienteModel.getClientes(req.query, (err, result) => {
            if (err) return manejarErrorBD(err, res);
            res.status(200).json({ ok: true, total: result.length, data: result });
        });
    },

    getClienteById: (req, res) => {
        const { id } = req.params;
        if (!idValido(id)) {
            return res.status(400).json({ ok: false, error: 'El id debe ser un número entero positivo' });
        }

        clienteModel.getClienteById(id, (err, result) => {
            if (err) return manejarErrorBD(err, res);
            if (result.length === 0) {
                return res.status(404).json({ ok: false, error: 'Cliente no encontrado' });
            }
            res.status(200).json({ ok: true, data: result[0] });
        });
    },

    postCliente: (req, res) => {
        const errores = validarDatos(req.body, [...reglas, reglasContrasenaCrear]);
        if (errores.length > 0) {
            return res.status(400).json({ ok: false, error: 'Datos inválidos', detalles: errores });
        }

        // La contraseña nunca se guarda en texto plano: se cifra con bcrypt
        bcrypt.hash(req.body.contrasena, 10, (errHash, hash) => {
            if (errHash) return res.status(500).json({ ok: false, error: 'Error interno del servidor' });

            clienteModel.postCliente(req.body, hash, (err, result) => {
                if (err) return manejarErrorBD(err, res);
                res.status(201).json({ ok: true, message: 'Cliente creado correctamente', data: { id_cliente: result.insertId } });
            });
        });
    },

    putCliente: (req, res) => {
        const { id } = req.params;
        if (!idValido(id)) {
            return res.status(400).json({ ok: false, error: 'El id debe ser un número entero positivo' });
        }

        const errores = validarDatos(req.body, [...reglas, reglasContrasenaEditar]);
        if (errores.length > 0) {
            return res.status(400).json({ ok: false, error: 'Datos inválidos', detalles: errores });
        }

        const actualizar = (hash) => {
            clienteModel.putCliente(id, req.body, hash, (err, result) => {
                if (err) return manejarErrorBD(err, res);
                responderActualizacion(
                    res,
                    result,
                    id,
                    clienteModel.getClienteById.bind(clienteModel),
                    'Cliente no encontrado',
                    'Cliente actualizado correctamente'
                );
            });
        };

        // Solo se cambia la contraseña si viene en el body
        if (req.body.contrasena) {
            bcrypt.hash(req.body.contrasena, 10, (errHash, hash) => {
                if (errHash) return res.status(500).json({ ok: false, error: 'Error interno del servidor' });
                actualizar(hash);
            });
        } else {
            actualizar(null);
        }
    },

    deleteCliente: (req, res) => {
        const { id } = req.params;
        if (!idValido(id)) {
            return res.status(400).json({ ok: false, error: 'El id debe ser un número entero positivo' });
        }

        clienteModel.deleteCliente(id, (err, result) => {
            if (err) return manejarErrorBD(err, res);
            if (result.affectedRows === 0) {
                return res.status(404).json({ ok: false, error: 'Cliente no encontrado' });
            }
            res.status(200).json({ ok: true, message: 'Cliente eliminado correctamente' });
        });
    }
};
