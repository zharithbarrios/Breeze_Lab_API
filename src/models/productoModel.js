const db = require('../config/dbConfig');
const { construirFiltros } = require('../utils/consultas');
const { valorONulo, boolONulo } = require('../utils/validator');
// se llama a la configuracion de la bd

// Parámetros de consulta permitidos en el GET de la lista (?param=valor)
const filtros = [
    { param: 'buscar', columna: 'nombre', operador: 'LIKE' },
    { param: 'categoria', columna: 'id_categoria', operador: '=' },
    { param: 'marca', columna: 'id_marca', operador: '=' },
    { param: 'estado', columna: 'estado', operador: '=' }
];

class Producto {

    getProductos(query, callback) {
        const { where, params } = construirFiltros(query, filtros);
        const sql = "SELECT id_producto, id_categoria, id_marca, codigo_producto, nombre, descripcion, modelo, precio, stock, imagen_url, estado, fecha_creacion FROM productos" + where + " ORDER BY id_producto";
        db.query(sql, params, callback);
    }

    getProductoById(id, callback) {
        const sql = "SELECT id_producto, id_categoria, id_marca, codigo_producto, nombre, descripcion, modelo, precio, stock, imagen_url, estado, fecha_creacion FROM productos WHERE id_producto = ?";
        db.query(sql, [id], callback);
    }

    postProducto(data, callback) {
        const sql = "INSERT INTO productos (id_categoria, id_marca, codigo_producto, nombre, descripcion, modelo, precio, stock, imagen_url, estado) VALUES (?, ?, ?, ?, ?, ?, ?, COALESCE(?, 0), ?, COALESCE(?, 1))";
        const params = [data.id_categoria, data.id_marca, data.codigo_producto, data.nombre, valorONulo(data.descripcion), valorONulo(data.modelo), data.precio, valorONulo(data.stock), valorONulo(data.imagen_url), boolONulo(data.estado)];
        db.query(sql, params, callback);
    }

    putProducto(id, data, callback) {
        const sql = "UPDATE productos SET id_categoria = ?, id_marca = ?, codigo_producto = ?, nombre = ?, descripcion = ?, modelo = ?, precio = ?, stock = COALESCE(?, stock), imagen_url = ?, estado = COALESCE(?, estado) WHERE id_producto = ?";
        const params = [data.id_categoria, data.id_marca, data.codigo_producto, data.nombre, valorONulo(data.descripcion), valorONulo(data.modelo), data.precio, valorONulo(data.stock), valorONulo(data.imagen_url), boolONulo(data.estado), id];
        db.query(sql, params, callback);
    }

    deleteProducto(id, callback) {
        const sql = "DELETE FROM productos WHERE id_producto = ?";
        db.query(sql, [id], callback);
    }
}

module.exports = new Producto();
