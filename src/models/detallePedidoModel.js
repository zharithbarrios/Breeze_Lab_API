const db = require('../config/dbConfig');
const { construirFiltros } = require('../utils/consultas');
const { valorONulo, boolONulo } = require('../utils/validator');
// se llama a la configuracion de la bd

// Parámetros de consulta permitidos en el GET de la lista (?param=valor)
const filtros = [
    { param: 'pedido', columna: 'id_pedido', operador: '=' },
    { param: 'producto', columna: 'id_producto', operador: '=' }
];

class DetallePedido {

    getDetallesPedido(query, callback) {
        const { where, params } = construirFiltros(query, filtros);
        const sql = "SELECT id_detalle, id_pedido, id_producto, cantidad, precio_unitario FROM detalle_pedido" + where + " ORDER BY id_detalle";
        db.query(sql, params, callback);
    }

    getDetallePedidoById(id, callback) {
        const sql = "SELECT id_detalle, id_pedido, id_producto, cantidad, precio_unitario FROM detalle_pedido WHERE id_detalle = ?";
        db.query(sql, [id], callback);
    }

    postDetallePedido(data, callback) {
        const sql = "INSERT INTO detalle_pedido (id_pedido, id_producto, cantidad, precio_unitario) VALUES (?, ?, ?, ?)";
        const params = [data.id_pedido, data.id_producto, data.cantidad, data.precio_unitario];
        db.query(sql, params, callback);
    }

    putDetallePedido(id, data, callback) {
        const sql = "UPDATE detalle_pedido SET id_pedido = ?, id_producto = ?, cantidad = ?, precio_unitario = ? WHERE id_detalle = ?";
        const params = [data.id_pedido, data.id_producto, data.cantidad, data.precio_unitario, id];
        db.query(sql, params, callback);
    }

    deleteDetallePedido(id, callback) {
        const sql = "DELETE FROM detalle_pedido WHERE id_detalle = ?";
        db.query(sql, [id], callback);
    }
}

module.exports = new DetallePedido();
