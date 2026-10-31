require('dotenv').config({ quiet: true });
const mysql = require('mysql2');

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT) || 3306,
    ssl: process.env.DB_SSL === 'true'
        ? { rejectUnauthorized: false }
        : undefined,
    waitForConnections: true,
    connectionLimit: 3,
    dateStrings: true,
    decimalNumbers: true,
    charset: 'utf8mb4'
});

db.getConnection((err, connection) => {
    if (err) {
        console.error('Error de conexión MYSQL:', err.message);
        return;
    }

    console.log('Conexión MYSQL exitosa');
    connection.release();
});

module.exports = db;