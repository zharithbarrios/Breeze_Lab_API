const db = require('../config/dbConfig');
const { construirFiltros } = require('../utils/consultas');
const { valorONulo, boolONulo } = require('../utils/validator');
// se llama a la configuracion de la bd

// Parámetros de consulta permitidos en el GET de la lista (?param=valor)
const filtros = [
    { param: 'buscar', columna: 'nombre', operador: 'LIKE' },
    { param: 'pais', columna: 'pais_origen', operador: '=' }
];

class Marca {

    getMarcas(query, callback) {
        const { where, params } = construirFiltros(query, filtros);
        const sql = "SELECT id_marca, nombre, pais_origen, descripcion, estado FROM marcas" + where + " ORDER BY id_marca";
        db.query(sql, params, callback);
    }

    getMarcaById(id, callback) {
        const sql = "SELECT id_marca, nombre, pais_origen, descripcion, estado FROM marcas WHERE id_marca = ?";
        db.query(sql, [id], callback);
    }

    postMarca(data, callback) {
        const sql = "INSERT INTO marcas (nombre, pais_origen, descripcion, estado) VALUES (?, ?, ?, COALESCE(?, 1))";
        const params = [data.nombre, valorONulo(data.pais_origen), valorONulo(data.descripcion), boolONulo(data.estado)];
        db.query(sql, params, callback);
    }

    putMarca(id, data, callback) {
        const sql = "UPDATE marcas SET nombre = ?, pais_origen = ?, descripcion = ?, estado = COALESCE(?, estado) WHERE id_marca = ?";
        const params = [data.nombre, valorONulo(data.pais_origen), valorONulo(data.descripcion), boolONulo(data.estado), id];
        db.query(sql, params, callback);
    }

    deleteMarca(id, callback) {
        const sql = "DELETE FROM marcas WHERE id_marca = ?";
        db.query(sql, [id], callback);
    }
}

module.exports = new Marca();
