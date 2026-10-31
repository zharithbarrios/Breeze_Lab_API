const db = require('../config/dbConfig');
const { construirFiltros } = require('../utils/consultas');
const { valorONulo, boolONulo } = require('../utils/validator');
// se llama a la configuracion de la bd

// Parámetros de consulta permitidos en el GET de la lista (?param=valor)
const filtros = [
    { param: 'buscar', columna: 'nombre', operador: 'LIKE' },
    { param: 'estado', columna: 'estado', operador: '=' }
];

class MetodoPago {

    getMetodosPago(query, callback) {
        const { where, params } = construirFiltros(query, filtros);
        const sql = "SELECT id_metodo_pago, nombre, descripcion, estado, fecha_registro FROM metodos_pago" + where + " ORDER BY id_metodo_pago";
        db.query(sql, params, callback);
    }

    getMetodoPagoById(id, callback) {
        const sql = "SELECT id_metodo_pago, nombre, descripcion, estado, fecha_registro FROM metodos_pago WHERE id_metodo_pago = ?";
        db.query(sql, [id], callback);
    }

    postMetodoPago(data, callback) {
        const sql = "INSERT INTO metodos_pago (nombre, descripcion, estado) VALUES (?, ?, COALESCE(?, 1))";
        const params = [data.nombre, valorONulo(data.descripcion), boolONulo(data.estado)];
        db.query(sql, params, callback);
    }

    putMetodoPago(id, data, callback) {
        const sql = "UPDATE metodos_pago SET nombre = ?, descripcion = ?, estado = COALESCE(?, estado) WHERE id_metodo_pago = ?";
        const params = [data.nombre, valorONulo(data.descripcion), boolONulo(data.estado), id];
        db.query(sql, params, callback);
    }

    deleteMetodoPago(id, callback) {
        const sql = "DELETE FROM metodos_pago WHERE id_metodo_pago = ?";
        db.query(sql, [id], callback);
    }
}

module.exports = new MetodoPago();
