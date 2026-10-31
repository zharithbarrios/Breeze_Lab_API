require('dotenv').config({ quiet: true });
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const categoriaRoutes = require('./src/routes/categoriaRoutes');
const marcaRoutes = require('./src/routes/marcaRoutes');
const productoRoutes = require('./src/routes/productoRoutes');
const clienteRoutes = require('./src/routes/clienteRoutes');
const metodoPagoRoutes = require('./src/routes/metodoPagoRoutes');
const pedidoRoutes = require('./src/routes/pedidoRoutes');
const detallePedidoRoutes = require('./src/routes/detallePedidoRoutes');
const envioRoutes = require('./src/routes/envioRoutes');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Ruta de bienvenida
app.get('/', (req, res) => {
    res.status(200).json({ ok: true, message: 'API Breeze Lab funcionando', documentacion: 'Ver README.md' });
});

//Rutas
app.use('/api/categorias', categoriaRoutes);
app.use('/api/marcas', marcaRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/metodos-pago', metodoPagoRoutes);
app.use('/api/pedidos', pedidoRoutes);
app.use('/api/detalle-pedido', detallePedidoRoutes);
app.use('/api/envios', envioRoutes);

const db = require('./src/config/dbConfig');

app.get('/api/diagnostico-db', (req, res) => {
    db.query(
        'SELECT DATABASE() AS base_datos, @@hostname AS servidor',
        (err, results) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    error: err.message
                });
            }

            res.status(200).json({
                ok: true,
                conexion: results[0]
            });
        }
    );
});

// Ruta no encontrada
app.use((req, res) => {
    res.status(404).json({ ok: false, error: 'Ruta no encontrada' });
});

// JSON mal formado y errores no controlados
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({
            ok: false,
            error: 'El JSON enviado está mal formado'
        });
    }

    console.error(err);

    res.status(500).json({
        ok: false,
        error: 'Error interno del servidor'
    });
});

if (require.main === module) {
    app.listen(port, () => {
        console.log("Servidor iniciado en http://localhost:" + port);
    });
}

module.exports = app;
