const db = require('../config/dbConfig');
const { construirFiltros } = require('../utils/consultas');
const { valorONulo } = require('../utils/validator');
// se llama a la configuracion de la bd

// Parámetros de consulta permitidos en el GET de la lista (?param=valor)
const filtros = [
    { param: 'cliente', columna: 'id_cliente', operador: '=' },
    { param: 'metodo', columna: 'id_metodo_pago', operador: '=' },
    { param: 'estado', columna: 'estado', operador: '=' },
    { param: 'ciudad', columna: 'ciudad_entrega', operador: '=' }
];

class Pedido {

    getPedidos(query, callback) {
        const { where, params } = construirFiltros(query, filtros);
        const sql = "SELECT id_pedido, id_cliente, id_metodo_pago, numero_pedido, fecha_pedido, estado, subtotal, total, direccion_entrega, ciudad_entrega, departamento_entrega FROM pedidos" + where + " ORDER BY id_pedido";
        db.query(sql, params, callback);
    }

    getPedidoById(id, callback) {
        const sql = "SELECT id_pedido, id_cliente, id_metodo_pago, numero_pedido, fecha_pedido, estado, subtotal, total, direccion_entrega, ciudad_entrega, departamento_entrega FROM pedidos WHERE id_pedido = ?";
        db.query(sql, [id], callback);
    }

    postPedido(data, callback) {
        const sql = "INSERT INTO pedidos (id_cliente, id_metodo_pago, numero_pedido, fecha_pedido, estado, subtotal, total, direccion_entrega, ciudad_entrega, departamento_entrega) VALUES (?, ?, ?, COALESCE(?, CURRENT_TIMESTAMP), COALESCE(?, 'Pendiente'), ?, ?, ?, ?, ?)";
        const params = [data.id_cliente, data.id_metodo_pago, data.numero_pedido, valorONulo(data.fecha_pedido), valorONulo(data.estado), data.subtotal, data.total, data.direccion_entrega, data.ciudad_entrega, data.departamento_entrega];
        db.query(sql, params, callback);
    }

    putPedido(id, data, callback) {
        const sql = "UPDATE pedidos SET id_cliente = ?, id_metodo_pago = ?, numero_pedido = ?, fecha_pedido = COALESCE(?, fecha_pedido), estado = COALESCE(?, estado), subtotal = ?, total = ?, direccion_entrega = ?, ciudad_entrega = ?, departamento_entrega = ? WHERE id_pedido = ?";
        const params = [data.id_cliente, data.id_metodo_pago, data.numero_pedido, valorONulo(data.fecha_pedido), valorONulo(data.estado), data.subtotal, data.total, data.direccion_entrega, data.ciudad_entrega, data.departamento_entrega, id];
        db.query(sql, params, callback);
    }

    deletePedido(id, callback) {
        const sql = "DELETE FROM pedidos WHERE id_pedido = ?";
        db.query(sql, [id], callback);
    }
}

module.exports = new Pedido();
