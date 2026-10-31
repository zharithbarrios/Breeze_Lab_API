const db = require('../config/dbConfig');
const { construirFiltros } = require('../utils/consultas');
const { valorONulo, boolONulo } = require('../utils/validator');
// se llama a la configuracion de la bd

// Parámetros de consulta permitidos en el GET de la lista (?param=valor)
const filtros = [
    { param: 'buscar', columna: 'nombres', operador: 'LIKE' },
    { param: 'ciudad', columna: 'ciudad', operador: '=' },
    { param: 'estado', columna: 'estado', operador: '=' }
];

class Cliente {

    getClientes(query, callback) {
        const { where, params } = construirFiltros(query, filtros);
        const sql = "SELECT id_cliente, nombres, apellidos, correo, telefono, direccion, ciudad, departamento, fecha_registro, estado FROM clientes" + where + " ORDER BY id_cliente";
        db.query(sql, params, callback);
    }

    getClienteById(id, callback) {
        const sql = "SELECT id_cliente, nombres, apellidos, correo, telefono, direccion, ciudad, departamento, fecha_registro, estado FROM clientes WHERE id_cliente = ?";
        db.query(sql, [id], callback);
    }

    // La contraseña llega ya cifrada (hash) desde el controlador
    postCliente(data, hash, callback) {
        const sql = "INSERT INTO clientes (nombres, apellidos, correo, contrasena_hash, telefono, direccion, ciudad, departamento, estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?, COALESCE(?, 1))";
        const params = [data.nombres, data.apellidos, data.correo, hash, valorONulo(data.telefono), valorONulo(data.direccion), valorONulo(data.ciudad), valorONulo(data.departamento), boolONulo(data.estado)];
        db.query(sql, params, callback);
    }

    // Si llega un hash nuevo se cambia la contraseña; si no, se conserva la actual
    putCliente(id, data, hash, callback) {
        const sets = "nombres = ?, apellidos = ?, correo = ?, telefono = ?, direccion = ?, ciudad = ?, departamento = ?, estado = COALESCE(?, estado)";
        const params = [data.nombres, data.apellidos, data.correo, valorONulo(data.telefono), valorONulo(data.direccion), valorONulo(data.ciudad), valorONulo(data.departamento), boolONulo(data.estado)];
        let sql = "UPDATE clientes SET " + sets;
        if (hash) {
            sql += ", contrasena_hash = ?";
            params.push(hash);
        }
        sql += " WHERE id_cliente = ?";
        params.push(id);
        db.query(sql, params, callback);
    }

    deleteCliente(id, callback) {
        const sql = "DELETE FROM clientes WHERE id_cliente = ?";
        db.query(sql, [id], callback);
    }
}

module.exports = new Cliente();
