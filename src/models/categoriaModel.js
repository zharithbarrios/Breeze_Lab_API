const db = require('../config/dbConfig');
const { construirFiltros } = require('../utils/consultas');
const { valorONulo, boolONulo } = require('../utils/validator');
// se llama a la configuracion de la bd

// Parámetros de consulta permitidos en el GET de la lista (?param=valor)
const filtros = [
    { param: 'buscar', columna: 'nombre', operador: 'LIKE' },
    { param: 'estado', columna: 'estado', operador: '=' }
];

class Categoria {

    getCategorias(query, callback) {
        const { where, params } = construirFiltros(query, filtros);
        const sql = "SELECT id_categoria, nombre, descripcion, estado FROM categorias" + where + " ORDER BY id_categoria";
        db.query(sql, params, callback);
    }

    getCategoriaById(id, callback) {
        const sql = "SELECT id_categoria, nombre, descripcion, estado FROM categorias WHERE id_categoria = ?";
        db.query(sql, [id], callback);
    }

    postCategoria(data, callback) {
        const sql = "INSERT INTO categorias (nombre, descripcion, estado) VALUES (?, ?, COALESCE(?, 1))";
        const params = [data.nombre, valorONulo(data.descripcion), boolONulo(data.estado)];
        db.query(sql, params, callback);
    }

    putCategoria(id, data, callback) {
        const sql = "UPDATE categorias SET nombre = ?, descripcion = ?, estado = COALESCE(?, estado) WHERE id_categoria = ?";
        const params = [data.nombre, valorONulo(data.descripcion), boolONulo(data.estado), id];
        db.query(sql, params, callback);
    }

    deleteCategoria(id, callback) {
        const sql = "DELETE FROM categorias WHERE id_categoria = ?";
        db.query(sql, [id], callback);
    }
}

module.exports = new Categoria();
