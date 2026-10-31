-- =====================================================================
-- BREEZE LAB - Tienda de electrónicos
-- Script final: estructura + datos de ejemplo (MySQL 8.x)
-- Taller integrador - Fase 1: Base de datos MySQL en la nube
--
-- EN LA NUBE (Clever Cloud / Aiven / Railway): la base de datos ya viene
-- creada por el proveedor con otro nombre, por eso este script NO usa
-- CREATE DATABASE ni USE. Conéctate a la base que te asignó el proveedor
-- y ejecuta el script completo.
--
-- EN LOCAL: descomenta las dos líneas siguientes.
-- CREATE DATABASE IF NOT EXISTS breeze_lab DEFAULT CHARACTER SET utf8mb4;
-- USE breeze_lab;
-- =====================================================================

-- ------------------- LIMPIEZA PARA RE-EJECUTAR EL SCRIPT -------------
-- Elimina las tablas si ya existen (primero las hijas, luego las padres)
-- para evitar errores de "table already exists" al volver a ejecutar.
-- ATENCIÓN: también borra los datos de esas tablas.
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS envios, detalle_pedido, pedidos, metodos_pago, clientes, productos, marcas, categorias;
SET FOREIGN_KEY_CHECKS = 1;

-- ------------------------- ESTRUCTURA --------------------------------

CREATE TABLE `categorias` (
  `id_categoria` int PRIMARY KEY AUTO_INCREMENT,
  `nombre` varchar(80) UNIQUE NOT NULL,
  `descripcion` varchar(255),
  `estado` boolean NOT NULL DEFAULT true
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `marcas` (
  `id_marca` int PRIMARY KEY AUTO_INCREMENT,
  `nombre` varchar(80) UNIQUE NOT NULL,
  `pais_origen` varchar(80),
  `descripcion` varchar(255),
  `estado` boolean NOT NULL DEFAULT true
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `productos` (
  `id_producto` int PRIMARY KEY AUTO_INCREMENT,
  `id_categoria` int NOT NULL,
  `id_marca` int NOT NULL,
  `codigo_producto` varchar(30) UNIQUE NOT NULL,
  `nombre` varchar(120) NOT NULL,
  `descripcion` text,
  `modelo` varchar(80),
  `precio` decimal(12,2) NOT NULL,
  `stock` int NOT NULL DEFAULT 0,
  `imagen_url` varchar(500),
  `estado` boolean NOT NULL DEFAULT true,
  `fecha_creacion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `chk_producto_precio` CHECK (precio >= 0),
  CONSTRAINT `chk_producto_stock` CHECK (stock >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `clientes` (
  `id_cliente` int PRIMARY KEY AUTO_INCREMENT,
  `nombres` varchar(80) NOT NULL,
  `apellidos` varchar(80) NOT NULL,
  `correo` varchar(120) UNIQUE NOT NULL,
  `contrasena_hash` varchar(255) NOT NULL,
  `telefono` varchar(20),
  `direccion` varchar(180),
  `ciudad` varchar(80),
  `departamento` varchar(80),
  `fecha_registro` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `estado` boolean NOT NULL DEFAULT true
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `metodos_pago` (
  `id_metodo_pago` int PRIMARY KEY AUTO_INCREMENT,
  `nombre` varchar(60) UNIQUE NOT NULL,
  `descripcion` varchar(255),
  `estado` boolean NOT NULL DEFAULT true,
  `fecha_registro` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `pedidos` (
  `id_pedido` int PRIMARY KEY AUTO_INCREMENT,
  `id_cliente` int NOT NULL,
  `id_metodo_pago` int NOT NULL,
  `numero_pedido` varchar(30) UNIQUE NOT NULL,
  `fecha_pedido` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `estado` varchar(30) NOT NULL DEFAULT 'Pendiente',
  `subtotal` decimal(12,2) NOT NULL,
  `total` decimal(12,2) NOT NULL,
  `direccion_entrega` varchar(180) NOT NULL,
  `ciudad_entrega` varchar(80) NOT NULL,
  `departamento_entrega` varchar(80) NOT NULL,
  CONSTRAINT `chk_pedido_subtotal` CHECK (subtotal >= 0),
  CONSTRAINT `chk_pedido_total` CHECK (total >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `detalle_pedido` (
  `id_detalle` int PRIMARY KEY AUTO_INCREMENT,
  `id_pedido` int NOT NULL,
  `id_producto` int NOT NULL,
  `cantidad` int NOT NULL,
  `precio_unitario` decimal(12,2) NOT NULL,
  CONSTRAINT `chk_detalle_cantidad` CHECK (cantidad > 0),
  CONSTRAINT `chk_detalle_precio` CHECK (precio_unitario >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `envios` (
  `id_envio` int PRIMARY KEY AUTO_INCREMENT,
  `id_pedido` int UNIQUE NOT NULL,
  `transportadora` varchar(100),
  `numero_guia` varchar(60) UNIQUE,
  `costo_envio` decimal(12,2) NOT NULL,
  `fecha_envio` datetime,
  `fecha_entrega` datetime,
  `estado_envio` varchar(30) NOT NULL DEFAULT 'Pendiente',
  CONSTRAINT `chk_envio_costo` CHECK (costo_envio >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE UNIQUE INDEX `detalle_pedido_index_0` ON `detalle_pedido` (`id_pedido`, `id_producto`);

ALTER TABLE `productos` ADD FOREIGN KEY (`id_categoria`) REFERENCES `categorias` (`id_categoria`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `productos` ADD FOREIGN KEY (`id_marca`) REFERENCES `marcas` (`id_marca`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `pedidos` ADD FOREIGN KEY (`id_cliente`) REFERENCES `clientes` (`id_cliente`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `pedidos` ADD FOREIGN KEY (`id_metodo_pago`) REFERENCES `metodos_pago` (`id_metodo_pago`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `detalle_pedido` ADD FOREIGN KEY (`id_pedido`) REFERENCES `pedidos` (`id_pedido`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `detalle_pedido` ADD FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id_producto`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `envios` ADD FOREIGN KEY (`id_pedido`) REFERENCES `pedidos` (`id_pedido`) ON DELETE CASCADE ON UPDATE CASCADE;

-- ------------------------- DATOS DE EJEMPLO --------------------------
-- Orden respetando dependencias: tablas padre primero, hijas después.

INSERT INTO categorias (nombre, descripcion) VALUES
('Smartphones',        'Teléfonos inteligentes de todas las gamas'),
('Portátiles',         'Computadores portátiles para estudio y trabajo'),
('Audio',              'Audífonos, parlantes y barras de sonido'),
('Accesorios',         'Mouse, teclados, cargadores y cables'),
('Televisores',        'Pantallas Smart TV 4K y OLED'),
('Gaming',             'Consolas, controles y periféricos para juegos'),
('Cámaras',            'Cámaras fotográficas y de acción'),
('Wearables',          'Relojes inteligentes y bandas de actividad'),
('Hogar inteligente',  'Bombillos, enchufes y asistentes de voz'),
('Almacenamiento',     'Discos SSD, memorias USB y tarjetas SD');

INSERT INTO marcas (nombre, pais_origen, descripcion) VALUES
('Samsung',  'Corea del Sur', 'Electrónica de consumo y telefonía móvil'),
('Apple',    'Estados Unidos','Dispositivos móviles, relojes y computadores'),
('Xiaomi',   'China',         'Smartphones y dispositivos de hogar inteligente'),
('Sony',     'Japón',         'Audio, televisores y videojuegos'),
('Lenovo',   'China',         'Computadores portátiles y de escritorio'),
('HP',       'Estados Unidos','Portátiles, impresoras y accesorios'),
('JBL',      'Estados Unidos','Parlantes y audífonos portátiles'),
('Logitech', 'Suiza',         'Periféricos de computador'),
('LG',       'Corea del Sur', 'Televisores y electrodomésticos'),
('Kingston', 'Estados Unidos','Memorias y unidades de almacenamiento');

INSERT INTO productos (id_categoria, id_marca, codigo_producto, nombre, descripcion, modelo, precio, stock, imagen_url) VALUES
(1, 1,  'SMA-001', 'Samsung Galaxy S24',       'Smartphone 6.2 pulgadas, 256 GB, cámara de 50 MP',          'SM-S921B',     3899000.00, 15, 'https://example.com/img/galaxy-s24.jpg'),
(1, 3,  'SMA-002', 'Xiaomi Redmi Note 13',     'Smartphone 6.67 pulgadas AMOLED, 128 GB',                    'Note 13',       899000.00, 40, 'https://example.com/img/redmi-note-13.jpg'),
(2, 5,  'POR-001', 'Lenovo IdeaPad Slim 3',    'Portátil 15.6 pulgadas, Core i5, 16 GB RAM, SSD 512 GB',     '15IAH8',       2299000.00, 12, 'https://example.com/img/ideapad-slim-3.jpg'),
(2, 6,  'POR-002', 'HP Pavilion 15',           'Portátil 15.6 pulgadas, Ryzen 7, 16 GB RAM, SSD 512 GB',     'eg2000',       2699000.00,  8, 'https://example.com/img/hp-pavilion-15.jpg'),
(3, 7,  'AUD-001', 'JBL Flip 6',               'Parlante Bluetooth portátil resistente al agua IP67',        'Flip 6',        549000.00, 30, 'https://example.com/img/jbl-flip-6.jpg'),
(3, 4,  'AUD-002', 'Sony WH-1000XM5',          'Audífonos inalámbricos con cancelación de ruido',            'WH-1000XM5',   1399000.00, 18, 'https://example.com/img/sony-xm5.jpg'),
(4, 8,  'ACC-001', 'Logitech MX Master 3S',    'Mouse inalámbrico ergonómico para productividad',            'MX Master 3S',  429000.00, 25, 'https://example.com/img/mx-master-3s.jpg'),
(5, 9,  'TV-001',  'LG OLED 55 pulgadas',      'Smart TV OLED 4K con webOS',                                 'OLED55C3',     4999000.00,  5, 'https://example.com/img/lg-oled-55.jpg'),
(8, 2,  'WEA-001', 'Apple Watch SE',           'Reloj inteligente con monitor de actividad y GPS',           'SE 2da gen',   1199000.00, 20, 'https://example.com/img/apple-watch-se.jpg'),
(10,10, 'ALM-001', 'Kingston NV2 SSD 1TB',     'Unidad de estado sólido NVMe M.2 de 1 TB',                   'NV2',           289000.00, 50, 'https://example.com/img/kingston-nv2.jpg');

-- Las contraseñas de ejemplo se guardan como hash (SHA2). En la API real usa bcrypt.
INSERT INTO clientes (nombres, apellidos, correo, contrasena_hash, telefono, direccion, ciudad, departamento) VALUES
('Ana María',  'Ariza Pérez',     'ana.ariza@correo.com',     SHA2('Clave#2026a',256), '3101234567', 'Calle 72 # 45-20',        'Barranquilla', 'Atlántico'),
('José Luis',  'Jiménez Torres',  'jose.jimenez@correo.com',  SHA2('Clave#2026b',256), '3117558214', 'Carrera 15 # 93-10',      'Bogotá',       'Cundinamarca'),
('María Fernanda','Morales Ruiz', 'maria.morales@correo.com', SHA2('Clave#2026c',256), '3011234567', 'Avenida 80 # 33-45',     'Medellín',     'Antioquia'),
('Carlos Andrés','Gómez Díaz',    'carlos.gomez@correo.com',  SHA2('Clave#2026d',256), '3209876543', 'Calle 5 # 38-12',         'Cali',         'Valle del Cauca'),
('Laura Camila','Herrera Silva',  'laura.herrera@correo.com', SHA2('Clave#2026e',256), '3154567890', 'Barrio Bocagrande Cra 2 # 10-30', 'Cartagena', 'Bolívar'),
('Juan David', 'Castro Mejía',    'juan.castro@correo.com',   SHA2('Clave#2026f',256), '3182345678', 'Calle 14 # 3-25',         'Santa Marta',  'Magdalena'),
('Valentina',  'Ospina Rojas',    'valentina.ospina@correo.com', SHA2('Clave#2026g',256), '3126789012', 'Carrera 27 # 48-15',   'Bucaramanga',  'Santander'),
('Andrés Felipe','Navarro León',  'andres.navarro@correo.com',SHA2('Clave#2026h',256), '3045678901', 'Calle 30 # 21-08',        'Soledad',      'Atlántico'),
('Daniela',    'Vargas Peña',     'daniela.vargas@correo.com',SHA2('Clave#2026i',256), '3167890123', 'Avenida 30 de Agosto # 12-40','Pereira',   'Risaralda'),
('Santiago',   'Rincón Mora',     'santiago.rincon@correo.com',SHA2('Clave#2026j',256),'3198901234', 'Avenida Libertadores # 9-55','Cúcuta',    'Norte de Santander');

INSERT INTO metodos_pago (nombre, descripcion) VALUES
('Tarjeta de crédito',        'Pago con tarjeta Visa, Mastercard o American Express'),
('Tarjeta débito',            'Pago con tarjeta débito de cualquier banco'),
('PSE',                       'Débito desde cuenta bancaria a través de PSE'),
('Nequi',                     'Pago desde la billetera digital Nequi'),
('Daviplata',                 'Pago desde la billetera digital Daviplata'),
('Contra entrega',            'Pago en efectivo al recibir el pedido'),
('Transferencia bancaria',    'Consignación o transferencia a la cuenta de la tienda'),
('Botón Bancolombia',         'Pago con el botón de transferencia Bancolombia'),
('PayPal',                    'Pago internacional con cuenta PayPal'),
('Addi',                      'Compra ahora y paga en cuotas');

-- total = subtotal + costo del envío correspondiente (ver tabla envios)
INSERT INTO pedidos (id_cliente, id_metodo_pago, numero_pedido, fecha_pedido, estado, subtotal, total, direccion_entrega, ciudad_entrega, departamento_entrega) VALUES
(1,  1, 'PED-2026-0001', '2026-10-01 10:15:00', 'Entregado', 3899000.00, 3919000.00, 'Calle 72 # 45-20',        'Barranquilla', 'Atlántico'),
(2,  3, 'PED-2026-0002', '2026-10-03 14:30:00', 'Entregado', 2347000.00, 2367000.00, 'Carrera 15 # 93-10',      'Bogotá',       'Cundinamarca'),
(3,  4, 'PED-2026-0003', '2026-10-06 09:05:00', 'Enviado',   2299000.00, 2321000.00, 'Avenida 80 # 33-45',      'Medellín',     'Antioquia'),
(4,  2, 'PED-2026-0004', '2026-10-09 16:45:00', 'Enviado',   1828000.00, 1848000.00, 'Calle 5 # 38-12',         'Cali',         'Valle del Cauca'),
(5,  8, 'PED-2026-0005', '2026-10-12 11:20:00', 'Pagado',    4999000.00, 5024000.00, 'Barrio Bocagrande Cra 2 # 10-30', 'Cartagena', 'Bolívar'),
(6,  5, 'PED-2026-0006', '2026-10-15 13:10:00', 'Pagado',    1199000.00, 1219000.00, 'Calle 14 # 3-25',         'Santa Marta',  'Magdalena'),
(7, 10, 'PED-2026-0007', '2026-10-18 08:40:00', 'Pendiente', 1007000.00, 1025000.00, 'Carrera 27 # 48-15',     'Bucaramanga',  'Santander'),
(8,  6, 'PED-2026-0008', '2026-10-20 17:25:00', 'Entregado', 2699000.00, 2714000.00, 'Calle 30 # 21-08',        'Soledad',      'Atlántico'),
(9,  9, 'PED-2026-0009', '2026-10-22 12:00:00', 'Cancelado', 1098000.00, 1121000.00, 'Avenida 30 de Agosto # 12-40', 'Pereira',  'Risaralda'),
(10, 7, 'PED-2026-0010', '2026-10-25 15:50:00', 'Pendiente', 1188000.00, 1211000.00, 'Avenida Libertadores # 9-55', 'Cúcuta',  'Norte de Santander');

INSERT INTO detalle_pedido (id_pedido, id_producto, cantidad, precio_unitario) VALUES
(1,  1, 1, 3899000.00),
(2,  2, 2,  899000.00),
(2,  5, 1,  549000.00),
(3,  3, 1, 2299000.00),
(4,  6, 1, 1399000.00),
(4,  7, 1,  429000.00),
(5,  8, 1, 4999000.00),
(6,  9, 1, 1199000.00),
(7, 10, 2,  289000.00),
(7,  7, 1,  429000.00),
(8,  4, 1, 2699000.00),
(9,  5, 2,  549000.00),
(10, 2, 1,  899000.00),
(10,10, 1,  289000.00);

INSERT INTO envios (id_pedido, transportadora, numero_guia, costo_envio, fecha_envio, fecha_entrega, estado_envio) VALUES
(1,  'Servientrega',  'SRV-100200301', 20000.00, '2026-10-02 08:00:00', '2026-10-04 15:30:00', 'Entregado'),
(2,  'Coordinadora',  'COO-100200302', 20000.00, '2026-10-04 09:00:00', '2026-10-07 11:10:00', 'Entregado'),
(3,  'Interrapidísimo','INT-100200303',22000.00, '2026-10-07 10:30:00', NULL,                  'En tránsito'),
(4,  'Servientrega',  'SRV-100200304', 20000.00, '2026-10-10 08:45:00', NULL,                  'En tránsito'),
(5,  'Envía',         NULL,            25000.00, NULL,                  NULL,                  'Pendiente'),
(6,  'Coordinadora',  NULL,            20000.00, NULL,                  NULL,                  'Pendiente'),
(7,  'Servientrega',  NULL,            18000.00, NULL,                  NULL,                  'Pendiente'),
(8,  'Interrapidísimo','INT-100200308',15000.00, '2026-10-21 09:15:00', '2026-10-23 14:00:00', 'Entregado'),
(9,  'Envía',         NULL,            23000.00, NULL,                  NULL,                  'Cancelado'),
(10, 'Coordinadora',  NULL,            23000.00, NULL,                  NULL,                  'Pendiente');
