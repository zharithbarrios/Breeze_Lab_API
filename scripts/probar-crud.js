const { randomBytes } = require('node:crypto');
const app = require('../index');
const db = require('../src/config/dbConfig');

const recursos = [
    { key: 'categorias', tabla: 'categorias', ruta: '/api/categorias', pk: 'id_categoria', dependencias: [], referencias: [] },
    { key: 'marcas', tabla: 'marcas', ruta: '/api/marcas', pk: 'id_marca', dependencias: [], referencias: [] },
    { key: 'clientes', tabla: 'clientes', ruta: '/api/clientes', pk: 'id_cliente', dependencias: [], referencias: [] },
    { key: 'metodos-pago', tabla: 'metodos_pago', ruta: '/api/metodos-pago', pk: 'id_metodo_pago', dependencias: [], referencias: [] },
    {
        key: 'productos',
        tabla: 'productos',
        ruta: '/api/productos',
        pk: 'id_producto',
        dependencias: ['categorias', 'marcas'],
        referencias: [{ sql: 'SELECT COUNT(*) AS total FROM detalle_pedido WHERE id_producto = ?' }]
    },
    {
        key: 'pedidos',
        tabla: 'pedidos',
        ruta: '/api/pedidos',
        pk: 'id_pedido',
        dependencias: ['clientes', 'metodos-pago'],
        referencias: [
            { sql: 'SELECT COUNT(*) AS total FROM detalle_pedido WHERE id_pedido = ?' },
            { sql: 'SELECT COUNT(*) AS total FROM envios WHERE id_pedido = ?' }
        ]
    },
    { key: 'detalle-pedido', tabla: 'detalle_pedido', ruta: '/api/detalle-pedido', pk: 'id_detalle', dependencias: ['pedidos', 'productos'], referencias: [] },
    { key: 'envios', tabla: 'envios', ruta: '/api/envios', pk: 'id_envio', dependencias: ['pedidos'], referencias: [] }
];

const operaciones = [
    'GET lista',
    'GET ID existente',
    'POST temporal',
    'GET ID creado',
    'PUT actualizar',
    'GET ID actualizado',
    'PUT sin cambios',
    'DELETE temporal',
    'GET ID eliminado'
];

const informe = [];
const lecturas = new Map();
const registros = new Map();
const ids = new Map();
const token = randomBytes(12).toString('hex');
let urlBase;
let servidor;
let motivoInterrupcion;
let interrupcionSolicitada = false;

function registrar(tabla, operacion, resultado, detalle) {
    informe.push({ tabla, operacion, resultado, detalle });
}

function registrarSiFalta(tabla, operacion, resultado, detalle) {
    if (!informe.some((fila) => fila.tabla === tabla && fila.operacion === operacion)) {
        registrar(tabla, operacion, resultado, detalle);
    }
}

function mensajeSeguro(error) {
    if (error && error.code) return `Error de base de datos (${error.code})`;
    if (error && (error.name === 'AbortError' || error.name === 'TimeoutError')) {
        return 'La solicitud excedió el tiempo de espera';
    }
    return error && error.message ? error.message.slice(0, 180) : 'Error no especificado';
}

async function ejecutar(tabla, operacion, accion) {
    try {
        const detalle = await accion();
        registrar(tabla, operacion, 'PASÓ', detalle || 'Correcto');
        return { ok: true, valor: detalle };
    } catch (error) {
        registrar(tabla, operacion, 'FALLÓ', mensajeSeguro(error));
        return { ok: false };
    }
}

async function solicitar(metodo, ruta, cuerpo) {
    const respuesta = await fetch(`${urlBase}${ruta}`, {
        method: metodo,
        headers: cuerpo === undefined ? undefined : { 'Content-Type': 'application/json' },
        body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
        signal: AbortSignal.timeout(15000)
    });
    const texto = await respuesta.text();
    let json;

    try {
        json = texto ? JSON.parse(texto) : null;
    } catch {
        json = null;
    }

    return { status: respuesta.status, json };
}

function errorRespuesta(respuesta) {
    const error = respuesta.json && typeof respuesta.json.error === 'string'
        ? `: ${respuesta.json.error}`
        : '';
    return `HTTP ${respuesta.status}${error}`;
}

function exigirRespuesta(respuesta, estado) {
    if (respuesta.status !== estado) throw new Error(errorRespuesta(respuesta));
    if (!respuesta.json || respuesta.json.ok !== true) {
        throw new Error(`Respuesta JSON inesperada (HTTP ${respuesta.status})`);
    }
    return respuesta.json;
}

function crearFixture(recurso, idsTemporales) {
    const tag = `${recurso.key}-${token}`;
    const categoriaId = idsTemporales.get('categorias');
    const marcaId = idsTemporales.get('marcas');
    const clienteId = idsTemporales.get('clientes');
    const metodoId = idsTemporales.get('metodos-pago');
    const productoId = idsTemporales.get('productos');
    const pedidoId = idsTemporales.get('pedidos');

    switch (recurso.key) {
        case 'categorias': {
            const nombre = `QA ${tag}`;
            return {
                body: { nombre, descripcion: `Registro temporal ${tag}`, estado: true },
                actualizacion: { nombre, descripcion: `Registro temporal actualizado ${tag}`, estado: true },
                campoActualizado: 'descripcion',
                valorActualizado: `Registro temporal actualizado ${tag}`,
                buscar: { sql: 'SELECT id_categoria AS id FROM categorias WHERE nombre = ?', valores: [nombre] },
                borrar: { sql: 'DELETE FROM categorias WHERE id_categoria = ? AND nombre = ?', valores: (id) => [id, nombre] }
            };
        }
        case 'marcas': {
            const nombre = `QA ${tag}`;
            return {
                body: { nombre, pais_origen: 'Colombia', descripcion: `Registro temporal ${tag}`, estado: true },
                actualizacion: { nombre, pais_origen: 'Colombia', descripcion: `Registro temporal actualizado ${tag}`, estado: true },
                campoActualizado: 'descripcion',
                valorActualizado: `Registro temporal actualizado ${tag}`,
                buscar: { sql: 'SELECT id_marca AS id FROM marcas WHERE nombre = ?', valores: [nombre] },
                borrar: { sql: 'DELETE FROM marcas WHERE id_marca = ? AND nombre = ?', valores: (id) => [id, nombre] }
            };
        }
        case 'clientes': {
            const correo = `crud-${tag}@example.test`;
            return {
                body: {
                    nombres: 'Prueba',
                    apellidos: tag,
                    correo,
                    contrasena: `Tmp-${randomBytes(12).toString('hex')}-!`,
                    ciudad: 'Barranquilla',
                    departamento: 'Atlántico',
                    direccion: 'Dirección temporal',
                    telefono: '3000000000',
                    estado: true
                },
                actualizacion: {
                    nombres: 'Prueba',
                    apellidos: tag,
                    correo,
                    ciudad: 'Cartagena',
                    departamento: 'Atlántico',
                    direccion: 'Dirección temporal',
                    telefono: '3000000000',
                    estado: true
                },
                campoActualizado: 'ciudad',
                valorActualizado: 'Cartagena',
                buscar: { sql: 'SELECT id_cliente AS id FROM clientes WHERE correo = ?', valores: [correo] },
                borrar: { sql: 'DELETE FROM clientes WHERE id_cliente = ? AND correo = ?', valores: (id) => [id, correo] }
            };
        }
        case 'metodos-pago': {
            const nombre = `QA ${tag}`;
            return {
                body: { nombre, descripcion: `Registro temporal ${tag}`, estado: true },
                actualizacion: { nombre, descripcion: `Registro temporal actualizado ${tag}`, estado: true },
                campoActualizado: 'descripcion',
                valorActualizado: `Registro temporal actualizado ${tag}`,
                buscar: { sql: 'SELECT id_metodo_pago AS id FROM metodos_pago WHERE nombre = ?', valores: [nombre] },
                borrar: { sql: 'DELETE FROM metodos_pago WHERE id_metodo_pago = ? AND nombre = ?', valores: (id) => [id, nombre] }
            };
        }
        case 'productos': {
            const codigo = `QA-${token}`;
            return {
                body: {
                    id_categoria: categoriaId,
                    id_marca: marcaId,
                    codigo_producto: codigo,
                    nombre: `QA Producto ${tag}`,
                    descripcion: `Registro temporal ${tag}`,
                    modelo: `QA-${tag}`,
                    precio: 100,
                    stock: 1,
                    estado: true
                },
                actualizacion: {
                    id_categoria: categoriaId,
                    id_marca: marcaId,
                    codigo_producto: codigo,
                    nombre: `QA Producto ${tag}`,
                    descripcion: `Registro temporal ${tag}`,
                    modelo: `Editado-${tag}`,
                    precio: 100,
                    stock: 1,
                    estado: true
                },
                campoActualizado: 'modelo',
                valorActualizado: `Editado-${tag}`,
                buscar: { sql: 'SELECT id_producto AS id FROM productos WHERE codigo_producto = ?', valores: [codigo] },
                borrar: { sql: 'DELETE FROM productos WHERE id_producto = ? AND codigo_producto = ?', valores: (id) => [id, codigo] }
            };
        }
        case 'pedidos': {
            const numero = `QA-${token}`;
            return {
                body: {
                    id_cliente: clienteId,
                    id_metodo_pago: metodoId,
                    numero_pedido: numero,
                    subtotal: 100,
                    total: 100,
                    direccion_entrega: 'Dirección temporal',
                    ciudad_entrega: 'Barranquilla',
                    departamento_entrega: 'Atlántico',
                    estado: 'Pendiente'
                },
                actualizacion: {
                    id_cliente: clienteId,
                    id_metodo_pago: metodoId,
                    numero_pedido: numero,
                    subtotal: 100,
                    total: 100,
                    direccion_entrega: 'Dirección temporal actualizada',
                    ciudad_entrega: 'Barranquilla',
                    departamento_entrega: 'Atlántico',
                    estado: 'Pendiente'
                },
                campoActualizado: 'direccion_entrega',
                valorActualizado: 'Dirección temporal actualizada',
                buscar: { sql: 'SELECT id_pedido AS id FROM pedidos WHERE numero_pedido = ?', valores: [numero] },
                borrar: { sql: 'DELETE FROM pedidos WHERE id_pedido = ? AND numero_pedido = ?', valores: (id) => [id, numero] }
            };
        }
        case 'detalle-pedido':
            return {
                body: { id_pedido: pedidoId, id_producto: productoId, cantidad: 2, precio_unitario: 100 },
                actualizacion: { id_pedido: pedidoId, id_producto: productoId, cantidad: 3, precio_unitario: 100 },
                campoActualizado: 'cantidad',
                valorActualizado: 3,
                buscar: {
                    sql: 'SELECT id_detalle AS id FROM detalle_pedido WHERE id_pedido = ? AND id_producto = ?',
                    valores: [pedidoId, productoId]
                },
                borrar: {
                    sql: 'DELETE FROM detalle_pedido WHERE id_detalle = ? AND id_pedido = ? AND id_producto = ?',
                    valores: (id) => [id, pedidoId, productoId]
                }
            };
        case 'envios': {
            const guia = `QA-${tag}`;
            return {
                body: {
                    id_pedido: pedidoId,
                    transportadora: `QA ${tag}`,
                    numero_guia: guia,
                    costo_envio: 10,
                    estado_envio: 'Pendiente'
                },
                actualizacion: {
                    id_pedido: pedidoId,
                    transportadora: `Editado ${tag}`,
                    numero_guia: guia,
                    costo_envio: 10,
                    estado_envio: 'Pendiente'
                },
                campoActualizado: 'transportadora',
                valorActualizado: `Editado ${tag}`,
                buscar: {
                    sql: 'SELECT id_envio AS id FROM envios WHERE id_pedido = ? AND numero_guia = ?',
                    valores: [pedidoId, guia]
                },
                borrar: {
                    sql: 'DELETE FROM envios WHERE id_envio = ? AND id_pedido = ? AND numero_guia = ?',
                    valores: (id) => [id, pedidoId, guia]
                }
            };
        }
        default:
            throw new Error('Recurso de prueba no reconocido');
    }
}

function consulta(sql, valores = []) {
    return new Promise((resolve, reject) => {
        db.query(sql, valores, (error, filas) => {
            if (error) return reject(error);
            resolve(filas);
        });
    });
}

async function referenciasActivas(recurso, id) {
    let total = 0;

    for (const referencia of recurso.referencias) {
        const filas = await consulta(referencia.sql, [id]);
        total += Number(filas[0] && filas[0].total) || 0;
    }

    return total;
}

async function limpiarPorMarcador(recurso, registro) {
    if (!registro || !registro.fixture) return { eliminado: false, noEncontrado: true };

    const coincidencias = await consulta(
        registro.fixture.buscar.sql,
        registro.fixture.buscar.valores
    );
    const candidatas = registro.id === undefined
        ? coincidencias
        : coincidencias.filter((fila) => Number(fila.id) === registro.id);

    if (candidatas.length === 0) return { eliminado: false, noEncontrado: true };
    if (candidatas.length !== 1) {
        throw new Error('La marca temporal coincide con más de un registro; no se borró nada');
    }

    const id = Number(candidatas[0].id);
    if (!Number.isSafeInteger(id) || id < 1) {
        throw new Error('No se pudo identificar con seguridad el registro temporal');
    }

    if (await referenciasActivas(recurso, id) > 0) {
        throw new Error('Hay registros relacionados activos; se omitió el borrado por seguridad');
    }

    const resultado = await consulta(
        registro.fixture.borrar.sql,
        registro.fixture.borrar.valores(id)
    );

    if (resultado.affectedRows !== 1) {
        throw new Error('La limpieza no confirmó la eliminación del registro temporal');
    }

    return { eliminado: true, noEncontrado: false };
}

async function iniciarServidor() {
    return new Promise((resolve, reject) => {
        const instancia = app.listen(0, '127.0.0.1');
        instancia.once('error', reject);
        instancia.once('listening', () => {
            const direccion = instancia.address();
            urlBase = `http://127.0.0.1:${direccion.port}`;
            resolve(instancia);
        });
    });
}

function registrarOmitidas(recurso, motivo, omitirOperacion) {
    for (const operacion of operaciones) {
        if (omitirOperacion && !omitirOperacion(operacion)) continue;
        registrarSiFalta(recurso.key, operacion, 'OMITIDA', motivo);
    }
}

async function probarListasYLecturas() {
    for (const recurso of recursos) {
        if (interrupcionSolicitada) break;
        const lista = await ejecutar(recurso.key, 'GET lista', async () => {
            const respuesta = await solicitar('GET', recurso.ruta);
            const json = exigirRespuesta(respuesta, 200);
            if (!Array.isArray(json.data) || json.total !== json.data.length) {
                throw new Error('La respuesta de lista no tiene el formato esperado');
            }
            lecturas.set(recurso.key, json.data);
            return `${json.total} registro(s)`;
        });

        if (!lista.ok) continue;

        const filas = lecturas.get(recurso.key);
        const existente = filas.length ? Number(filas[0][recurso.pk]) : NaN;
        if (!Number.isSafeInteger(existente) || existente < 1) {
            registrar(
                recurso.key,
                'GET ID existente',
                filas.length ? 'FALLÓ' : 'OMITIDA',
                filas.length ? 'El primer registro no contiene una clave primaria válida' : 'La tabla no tiene registros preexistentes'
            );
            continue;
        }

        await ejecutar(recurso.key, 'GET ID existente', async () => {
            const respuesta = await solicitar('GET', `${recurso.ruta}/${existente}`);
            const json = exigirRespuesta(respuesta, 200);
            if (!json.data || Number(json.data[recurso.pk]) !== existente) {
                throw new Error('La API no devolvió el registro solicitado');
            }
            return 'Registro preexistente consultado';
        });
    }
}

async function probarCreacionesYActualizaciones() {
    for (const recurso of recursos) {
        if (interrupcionSolicitada) break;
        const dependenciasFaltantes = recurso.dependencias.filter((clave) => !ids.has(clave));
        const fixture = crearFixture(recurso, ids);
        const registro = { fixture, id: undefined, actualizacionConfirmada: false };
        registros.set(recurso.key, registro);

        if (dependenciasFaltantes.length) {
            const motivo = `Faltan registros temporales relacionados: ${dependenciasFaltantes.join(', ')}`;
            registrar(recurso.key, 'POST temporal', 'OMITIDA', motivo);
            registrarOmitidas(recurso, motivo, (operacion) => [
                'GET ID creado',
                'PUT actualizar',
                'GET ID actualizado',
                'PUT sin cambios',
                'DELETE temporal',
                'GET ID eliminado'
            ].includes(operacion));
            continue;
        }

        await ejecutar(recurso.key, 'POST temporal', async () => {
            const respuesta = await solicitar('POST', recurso.ruta, fixture.body);
            const json = respuesta.json;
            const id = Number(json && json.data && json.data[recurso.pk]);
            if (Number.isSafeInteger(id) && id > 0) {
                registro.id = id;
                ids.set(recurso.key, id);
            }
            if (respuesta.status !== 201 || !json || json.ok !== true) {
                throw new Error(errorRespuesta(respuesta));
            }
            if (registro.id === undefined) {
                throw new Error('La respuesta de creación no contiene una clave primaria válida');
            }
            return 'Registro temporal creado';
        });

        if (registro.id === undefined) {
            registrarOmitidas(recurso, 'No se obtuvo una clave primaria temporal segura', (operacion) => [
                'GET ID creado',
                'PUT actualizar',
                'GET ID actualizado',
                'PUT sin cambios',
                'DELETE temporal',
                'GET ID eliminado'
            ].includes(operacion));
            continue;
        }

        await ejecutar(recurso.key, 'GET ID creado', async () => {
            const respuesta = await solicitar('GET', `${recurso.ruta}/${registro.id}`);
            const json = exigirRespuesta(respuesta, 200);
            if (!json.data || Number(json.data[recurso.pk]) !== registro.id) {
                throw new Error('No se encontró el registro temporal recién creado');
            }
            return 'Registro creado consultado';
        });

        await ejecutar(recurso.key, 'PUT actualizar', async () => {
            const respuesta = await solicitar('PUT', `${recurso.ruta}/${registro.id}`, fixture.actualizacion);
            exigirRespuesta(respuesta, 200);
            return 'Actualización aceptada';
        });

        const lecturaActualizada = await ejecutar(recurso.key, 'GET ID actualizado', async () => {
            const respuesta = await solicitar('GET', `${recurso.ruta}/${registro.id}`);
            const json = exigirRespuesta(respuesta, 200);
            if (!json.data || Number(json.data[recurso.pk]) !== registro.id) {
                throw new Error('No se encontró el registro temporal actualizado');
            }
            if (json.data[fixture.campoActualizado] !== fixture.valorActualizado) {
                throw new Error(`El campo ${fixture.campoActualizado} no conserva el valor actualizado`);
            }
            registro.actualizacionConfirmada = true;
            return 'El valor actualizado fue verificado';
        });

        if (!lecturaActualizada.ok) {
            registrar(recurso.key, 'PUT sin cambios', 'OMITIDA', 'No se confirmó la actualización anterior');
            continue;
        }

        await ejecutar(recurso.key, 'PUT sin cambios', async () => {
            const respuesta = await solicitar('PUT', `${recurso.ruta}/${registro.id}`, fixture.actualizacion);
            exigirRespuesta(respuesta, 200);
            return 'Una actualización sin cambios respondió correctamente';
        });
    }
}

async function probarEliminaciones() {
    for (const recurso of [...recursos].reverse()) {
        const registro = registros.get(recurso.key);
        if (!registro) {
            registrarOmitidas(recurso, 'No se preparó un registro temporal', (operacion) => [
                'DELETE temporal',
                'GET ID eliminado'
            ].includes(operacion));
            continue;
        }

        if (registro.id === undefined) {
            registrarSiFalta(
                recurso.key,
                'DELETE temporal',
                'OMITIDA',
                'No se obtuvo un id; se usará solo la marca temporal para limpiar'
            );
            continue;
        }

        const seguridad = await ejecutar(recurso.key, 'DELETE temporal', async () => {
            const referencias = await referenciasActivas(recurso, registro.id);
            if (referencias > 0) {
                throw new Error('Hay registros relacionados; se omitió DELETE para evitar afectar datos dependientes');
            }
            const respuesta = await solicitar('DELETE', `${recurso.ruta}/${registro.id}`);
            exigirRespuesta(respuesta, 200);
            return 'Registro temporal eliminado por la API';
        });

        if (!seguridad.ok) {
            const limpieza = await ejecutar(recurso.key, 'Limpieza de seguridad', async () => {
                const resultado = await limpiarPorMarcador(recurso, registro);
                if (resultado.noEncontrado) return 'El registro ya no existe';
                if (resultado.eliminado) return 'Registro temporal eliminado por su marca exacta';
                throw new Error('No se pudo confirmar la limpieza');
            });
            if (!limpieza.ok) continue;
        }
    }

    for (const recurso of recursos) {
        const registro = registros.get(recurso.key);
        if (!registro || registro.id === undefined) {
            registrarSiFalta(
                recurso.key,
                'GET ID eliminado',
                'OMITIDA',
                'No se obtuvo un id temporal para verificar'
            );
            continue;
        }

        await ejecutar(recurso.key, 'GET ID eliminado', async () => {
            const respuesta = await solicitar('GET', `${recurso.ruta}/${registro.id}`);
            if (respuesta.status !== 404 || !respuesta.json || respuesta.json.ok !== false) {
                throw new Error(`Se esperaba HTTP 404 después de limpiar; se recibió HTTP ${respuesta.status}`);
            }
            return 'El registro temporal ya no existe';
        });
    }
}

async function limpiezaFinal() {
    for (const recurso of [...recursos].reverse()) {
        const registro = registros.get(recurso.key);
        if (!registro) continue;

        try {
            const resultado = await limpiarPorMarcador(recurso, registro);
            if (resultado.eliminado) {
                registrar(recurso.key, 'Limpieza final', 'PASÓ', 'Se eliminó un registro temporal pendiente');
            }
        } catch (error) {
            registrar(recurso.key, 'Limpieza final', 'FALLÓ', mensajeSeguro(error));
        }
    }
}

async function cerrarServidor() {
    if (!servidor) return;
    await new Promise((resolve) => servidor.close(resolve));
}

async function cerrarBaseDatos() {
    await new Promise((resolve, reject) => {
        db.end((error) => {
            if (error) return reject(error);
            resolve();
        });
    });
}

function completarInforme(motivo) {
    for (const recurso of recursos) {
        registrarOmitidas(recurso, motivo || 'La ejecución se interrumpió antes de esta operación');
    }
}

async function main() {
    try {
        servidor = await iniciarServidor();
        await probarListasYLecturas();

        try {
            await consulta('SELECT 1 AS disponible');
            await probarCreacionesYActualizaciones();
            await probarEliminaciones();
        } catch (error) {
            motivoInterrupcion = `Base de datos no disponible o prueba interrumpida (${mensajeSeguro(error)})`;
        } finally {
            await limpiezaFinal();
        }
    } catch (error) {
        motivoInterrupcion = `No se pudo iniciar el runner (${mensajeSeguro(error)})`;
    } finally {
        completarInforme(motivoInterrupcion);
        try {
            await cerrarServidor();
        } catch {
            registrar('runner', 'Cerrar servidor temporal', 'FALLÓ', 'No se pudo cerrar el servidor HTTP');
        }
        try {
            await cerrarBaseDatos();
        } catch (error) {
            registrar('runner', 'Cerrar conexión MySQL', 'FALLÓ', mensajeSeguro(error));
        }
    }

    console.log('\nInforme de pruebas CRUD');
    console.table(informe);
    const fallas = informe.filter((fila) => fila.resultado === 'FALLÓ').length;
    const omitidas = informe.filter((fila) => fila.resultado === 'OMITIDA').length;
    console.log(`\nResultado: ${fallas} fallida(s), ${omitidas} omitida(s), ${informe.length - fallas - omitidas} correcta(s).`);
    if (fallas > 0 || motivoInterrupcion) process.exitCode = 1;
}

function solicitarInterrupcion() {
    interrupcionSolicitada = true;
    motivoInterrupcion = 'Interrupción solicitada; se detendrán las pruebas y se intentará limpiar los registros temporales';
}

process.once('SIGINT', solicitarInterrupcion);
process.once('SIGTERM', solicitarInterrupcion);

main().catch((error) => {
    console.error(`Error inesperado en el runner: ${mensajeSeguro(error)}`);
    process.exitCode = 1;
});
