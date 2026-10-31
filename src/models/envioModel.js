const db = require('../config/dbConfig');
const { construirFiltros } = require('../utils/consultas');
const { valorONulo, boolONulo } = require('../utils/validator');
// se llama a la configuracion de la bd

// Parámetros de consulta permitidos en el GET de la lista (?param=valor)
const filtros = [
    { param: 'estado', columna: 'estado_envio', operador: '=' },
    { param: 'transportadora', columna: 'transportadora', operador: '=' },
    { param: 'pedido', columna: 'id_pedido', operador: '=' }
];

class Envio {

    getEnvios(query, callback) {
        const { where, params } = construirFiltros(query, filtros);
        const sql = "SELECT id_envio, id_pedido, transportadora, numero_guia, costo_envio, fecha_envio, fecha_entrega, estado_envio FROM envios" + where + " ORDER BY id_envio";
        db.query(sql, params, callback);
    }

    getEnvioById(id, callback) {
        const sql = "SELECT id_envio, id_pedido, transportadora, numero_guia, costo_envio, fecha_envio, fecha_entrega, estado_envio FROM envios WHERE id_envio = ?";
        db.query(sql, [id], callback);
    }

    postEnvio(data, callback) {
        const sql = "INSERT INTO envios (id_pedido, transportadora, numero_guia, costo_envio, fecha_envio, fecha_entrega, estado_envio) VALUES (?, ?, ?, ?, ?, ?, COALESCE(?, 'Pendiente'))";
        const params = [data.id_pedido, valorONulo(data.transportadora), valorONulo(data.numero_guia), data.costo_envio, valorONulo(data.fecha_envio), valorONulo(data.fecha_entrega), valorONulo(data.estado_envio)];
        db.query(sql, params, callback);
    }

    putEnvio(id, data, callback) {
        const sql = "UPDATE envios SET id_pedido = ?, transportadora = ?, numero_guia = ?, costo_envio = ?, fecha_envio = ?, fecha_entrega = ?, estado_envio = COALESCE(?, estado_envio) WHERE id_envio = ?";
        const params = [data.id_pedido, valorONulo(data.transportadora), valorONulo(data.numero_guia), data.costo_envio, valorONulo(data.fecha_envio), valorONulo(data.fecha_entrega), valorONulo(data.estado_envio), id];
        db.query(sql, params, callback);
    }

    deleteEnvio(id, callback) {
        const sql = "DELETE FROM envios WHERE id_envio = ?";
        db.query(sql, [id], callback);
    }
}

module.exports = new Envio();
