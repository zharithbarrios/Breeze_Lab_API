# API REST Breeze Lab

API REST de una tienda de aparatos electrónicos, construida con **Node.js**, **Express** y **MySQL**. Se conecta a una base de datos MySQL en la nube (Clever Cloud) y expone un CRUD completo para las 8 tablas del modelo: `categorias`, `marcas`, `productos`, `clientes`, `metodos_pago`, `pedidos`, `detalle_pedido` y `envios`.

## Estructura del proyecto

```
Breeze_Lab_API/
├── index.js                 # Servidor Express y registro de rutas
├── package.json
├── .env            # Plantilla de variables de entorno
├── scripts/
│   └── probar-crud.js        # Pruebas CRUD automatizadas de las ocho rutas
└── src/
    ├── config/dbConfig.js   # Conexión a MySQL (lee las variables de entorno)
    ├── database/
    │   └── breeze_lab.sql   # Script de la base de datos
    ├── models/              # Consultas SQL de cada tabla
    ├── controllers/         # Validación, respuestas JSON y códigos HTTP
    ├── routes/              # Rutas de cada tabla
    └── utils/               # Validador, manejo de errores y filtros
```

## Instalación

1. Clonar el repositorio e ingresar a la carpeta del proyecto.
2. Instalar las dependencias:

```
npm install
```

3. Crear el archivo `.env` en la raíz del proyecto y configurar las variables de entorno.
4. Tener creada la base de datos e importar el script `breeze_lab.sql`.

## Variables de entorno

| Variable | Descripción |
|---|---|
| `DB_HOST` | Host del servidor MySQL |
| `DB_PORT` | Puerto (normalmente 3306) |
| `DB_USER` | Usuario de la base de datos |
| `DB_PASSWORD` | Contraseña de la base de datos |
| `DB_NAME` | Nombre de la base de datos |
| `PORT` | Puerto en el que corre la API (por defecto 3000) |
| `DB_SSL` | `true` solo si el proveedor exige SSL |

Las credenciales nunca se suben al repositorio: `.env` está en `.gitignore`.

## Ejecución

```
npm start
```

Al iniciar debe aparecer `Conexion MYSQL exitosa` y `Servidor iniciado en http://localhost:3000`.

## Formato de las respuestas

Todas las respuestas son JSON con esta estructura:

```json
{ "ok": true, "total": 2, "data": [] }
{ "ok": false, "error": "Mensaje del error", "detalles": ["..."] }
```

| Código | Cuándo se usa |
|---|---|
| 200 | Consulta, actualización o eliminación exitosa |
| 201 | Registro creado |
| 400 | Datos inválidos, id inválido, JSON mal formado o llave foránea inexistente |
| 404 | Registro o ruta no encontrada |
| 409 | Valor único repetido o registro que no se puede eliminar porque otros dependen de él |
| 500 | Error interno del servidor |

## Reglas generales

- `PUT` actualiza el registro completo: se deben enviar los campos obligatorios. Los campos opcionales con valor por defecto (por ejemplo `estado` o `stock`) conservan su valor actual si no se envían.
- Las fechas se envían como `AAAA-MM-DD` o `AAAA-MM-DD HH:MM:SS`.
- Las contraseñas de `clientes` se envían en el campo `contrasena` y se almacenan mediante hash con bcrypt. Nunca se devuelven en las respuestas.
- Los filtros se envían como parámetros de consulta, por ejemplo `GET /api/pedidos?estado=Enviado&cliente=3`.

## Endpoints

### Categoría — `/api/categorias`

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/categorias` | Lista todos los registros. Filtros opcionales: `buscar`, `estado` |
| GET | `/api/categorias/:id` | Consulta un registro por `id_categoria` |
| POST | `/api/categorias` | Crea un registro |
| PUT | `/api/categorias/:id` | Actualiza un registro |
| DELETE | `/api/categorias/:id` | Elimina un registro |

- **Campos obligatorios:** `nombre`
- **Campos opcionales:** `descripcion`, `estado`

### Marca — `/api/marcas`

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/marcas` | Lista todos los registros. Filtros opcionales: `buscar`, `pais` |
| GET | `/api/marcas/:id` | Consulta un registro por `id_marca` |
| POST | `/api/marcas` | Crea un registro |
| PUT | `/api/marcas/:id` | Actualiza un registro |
| DELETE | `/api/marcas/:id` | Elimina un registro |

- **Campos obligatorios:** `nombre`
- **Campos opcionales:** `pais_origen`, `descripcion`, `estado`

### Producto — `/api/productos`

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/productos` | Lista todos los registros. Filtros opcionales: `buscar`, `categoria`, `marca`, `estado` |
| GET | `/api/productos/:id` | Consulta un registro por `id_producto` |
| POST | `/api/productos` | Crea un registro |
| PUT | `/api/productos/:id` | Actualiza un registro |
| DELETE | `/api/productos/:id` | Elimina un registro |

- **Campos obligatorios:** `id_categoria`, `id_marca`, `codigo_producto`, `nombre`, `precio`
- **Campos opcionales:** `descripcion`, `modelo`, `stock`, `imagen_url`, `estado`

### Cliente — `/api/clientes`

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/clientes` | Lista todos los registros. Filtros opcionales: `buscar`, `ciudad`, `estado` |
| GET | `/api/clientes/:id` | Consulta un registro por `id_cliente` |
| POST | `/api/clientes` | Crea un registro |
| PUT | `/api/clientes/:id` | Actualiza un registro |
| DELETE | `/api/clientes/:id` | Elimina un registro |

- **Campos obligatorios:** `nombres`, `apellidos`, `correo`, `contrasena`
- **Campos opcionales:** `telefono`, `direccion`, `ciudad`, `departamento`, `estado`

### Método de pago — `/api/metodos-pago`

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/metodos-pago` | Lista todos los registros. Filtros opcionales: `buscar`, `estado` |
| GET | `/api/metodos-pago/:id` | Consulta un registro por `id_metodo_pago` |
| POST | `/api/metodos-pago` | Crea un registro |
| PUT | `/api/metodos-pago/:id` | Actualiza un registro |
| DELETE | `/api/metodos-pago/:id` | Elimina un registro |

- **Campos obligatorios:** `nombre`
- **Campos opcionales:** `descripcion`, `estado`

### Pedido — `/api/pedidos`

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/pedidos` | Lista todos los registros. Filtros opcionales: `cliente`, `metodo`, `estado`, `ciudad` |
| GET | `/api/pedidos/:id` | Consulta un registro por `id_pedido` |
| POST | `/api/pedidos` | Crea un registro |
| PUT | `/api/pedidos/:id` | Actualiza un registro |
| DELETE | `/api/pedidos/:id` | Elimina un registro |

- **Campos obligatorios:** `id_cliente`, `id_metodo_pago`, `numero_pedido`, `subtotal`, `total`, `direccion_entrega`, `ciudad_entrega`, `departamento_entrega`
- **Campos opcionales:** `fecha_pedido`, `estado`

### Detalle de pedido — `/api/detalle-pedido`

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/detalle-pedido` | Lista todos los registros. Filtros opcionales: `pedido`, `producto` |
| GET | `/api/detalle-pedido/:id` | Consulta un registro por `id_detalle` |
| POST | `/api/detalle-pedido` | Crea un registro |
| PUT | `/api/detalle-pedido/:id` | Actualiza un registro |
| DELETE | `/api/detalle-pedido/:id` | Elimina un registro |

- **Campos obligatorios:** `id_pedido`, `id_producto`, `cantidad`, `precio_unitario`
- **Campos opcionales:** ninguno

### Envío — `/api/envios`

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/envios` | Lista todos los registros. Filtros opcionales: `estado`, `transportadora`, `pedido` |
| GET | `/api/envios/:id` | Consulta un registro por `id_envio` |
| POST | `/api/envios` | Crea un registro |
| PUT | `/api/envios/:id` | Actualiza un registro |
| DELETE | `/api/envios/:id` | Elimina un registro |

- **Campos obligatorios:** `id_pedido`, `costo_envio`
- **Campos opcionales:** `transportadora`, `numero_guia`, `fecha_envio`, `fecha_entrega`, `estado_envio`

## Ejemplo: crear un producto

`POST /api/productos`

```json
{
  "id_categoria": 1,
  "id_marca": 1,
  "codigo_producto": "SMA-099",
  "nombre": "Samsung Galaxy A55",
  "precio": 1800000,
  "stock": 10
}
```

Respuesta `201`:

```json
{ "ok": true, "message": "Producto creado correctamente", "data": { "id_producto": 11 } }
```

## Pruebas CRUD automatizadas

Ejecuta todas las comprobaciones CRUD de las ocho rutas en un solo comando:

```
npm run test:crud
```

El script inicia la API en un puerto local temporal y utiliza la conexión MySQL configurada en `.env`. Consulta las listas y registros existentes, y crea registros temporales únicos en orden de dependencias. Al finalizar, elimina únicamente los registros identificados por las marcas únicas generadas por esa ejecución, en orden inverso; si un `DELETE` de la API falla, intenta una limpieza limitada a esas marcas y omite el borrado de padres que aún tengan registros relacionados. No muestra credenciales ni contraseñas. Se recomienda ejecutarlo contra una base de pruebas o desarrollo.

El proceso muestra una tabla con el resultado de cada operación y termina con código distinto de cero si alguna prueba falla. Si una tabla está vacía o falta una dependencia temporal, la operación correspondiente aparece como `OMITIDA`.

## Despliegue

La API está desplegada en Render. Las variables de entorno se configuran en el panel de Render (sección *Environment*), no en el repositorio. Comando de build: `npm install`. Comando de inicio: `npm start`.

URL pública: URL pública: https://breeze-lab-api.onrender.com
