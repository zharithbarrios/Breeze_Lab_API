// Traduce los errores de MySQL a respuestas JSON con el código HTTP adecuado.
function manejarErrorBD(err, res) {
    console.error('Error BD:', err.code, '-', err.message);

    switch (err.code) {
        case 'ER_DUP_ENTRY':
            return res.status(409).json({
                ok: false,
                error: 'Ya existe un registro con ese valor único (por ejemplo, nombre, correo, código o número repetido)'
            });

        case 'ER_NO_REFERENCED_ROW':
        case 'ER_NO_REFERENCED_ROW_2':
            return res.status(400).json({
                ok: false,
                error: 'La llave foránea indicada no existe (revisa los ids de las tablas relacionadas)'
            });

        case 'ER_ROW_IS_REFERENCED':
        case 'ER_ROW_IS_REFERENCED_2':
            return res.status(409).json({
                ok: false,
                error: 'No se puede eliminar o modificar el registro porque otros registros dependen de él'
            });

        case 'ER_CHECK_CONSTRAINT_VIOLATED':
        case 'ER_CONSTRAINT_FAILED':
            return res.status(400).json({
                ok: false,
                error: 'Un valor incumple una restricción de la base de datos (por ejemplo, precio o cantidad inválidos)'
            });

        case 'ER_DATA_TOO_LONG':
        case 'ER_TRUNCATED_WRONG_VALUE':
        case 'ER_BAD_NULL_ERROR':
        case 'ER_WARN_DATA_OUT_OF_RANGE':
        case 'ER_WRONG_VALUE_COUNT_ON_ROW':
            return res.status(400).json({ ok: false, error: 'Alguno de los datos enviados no es válido' });

        default:
            return res.status(500).json({ ok: false, error: 'Error interno del servidor' });
    }
}

function responderActualizacion(res, resultado, id, consultarPorId, noEncontrado, actualizado) {
    const responder = (existe) => {
        if (!existe) {
            return res.status(404).json({ ok: false, error: noEncontrado });
        }

        return res.status(200).json({ ok: true, message: actualizado });
    };

    if (resultado.affectedRows > 0) {
        return responder(true);
    }

    consultarPorId(id, (err, filas) => {
        if (err) return manejarErrorBD(err, res);
        responder(filas.length > 0);
    });
}

module.exports = { manejarErrorBD, responderActualizacion };
