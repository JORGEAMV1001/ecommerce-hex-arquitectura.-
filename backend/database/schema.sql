-- Esquema PostgreSQL: sistema de comercio electrónico
-- Entidades: usuarios, productos, pedidos (+ pedido_items como tabla de vínculo)

CREATE TABLE IF NOT EXISTS usuarios (
    id              SERIAL PRIMARY KEY,
    nombre          VARCHAR(100)        NOT NULL,
    email           VARCHAR(150) UNIQUE NOT NULL,
    password_hash   VARCHAR(255)        NOT NULL,   -- nunca texto plano (bcrypt)
    rol             VARCHAR(20)         NOT NULL DEFAULT 'cliente'
                        CHECK (rol IN ('cliente', 'administrador')),
    creado_en       TIMESTAMP           NOT NULL DEFAULT NOW()
        estado          VARCHAR(20)         NOT NULL DEFAULT 'pendiente'
                        CHECK (estado IN ('pendiente', 'aprobado', 'rechazado')),
    permisos        JSONB               NOT NULL DEFAULT '[]'::jsonb,
);

CREATE TABLE IF NOT EXISTS productos (
    id              SERIAL PRIMARY KEY,
    nombre          VARCHAR(150)    NOT NULL,
    descripcion     TEXT            DEFAULT '',
    precio          NUMERIC(10,2)   NOT NULL CHECK (precio > 0),
    stock           INTEGER         NOT NULL CHECK (stock >= 0),
    creado_en       TIMESTAMP       NOT NULL DEFAULT NOW()
);

-- Registro transaccional: vincula un usuario con uno o más productos
CREATE TABLE IF NOT EXISTS pedidos (
    id              SERIAL PRIMARY KEY,
    usuario_id      INTEGER         NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
    estado          VARCHAR(20)     NOT NULL DEFAULT 'pendiente'
                        CHECK (estado IN ('pendiente', 'confirmado', 'cancelado')),
    total           NUMERIC(10,2)   NOT NULL CHECK (total >= 0),
    creado_en       TIMESTAMP       NOT NULL DEFAULT NOW()
);

-- Líneas de pedido: relación muchos-a-muchos entre pedidos y productos,
-- con snapshot del precio/nombre al momento de la compra
CREATE TABLE IF NOT EXISTS pedido_items (
    id                  SERIAL PRIMARY KEY,
    pedido_id           INTEGER         NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
    producto_id         INTEGER         NOT NULL REFERENCES productos(id) ON DELETE RESTRICT,
    nombre_producto     VARCHAR(150)    NOT NULL,
    precio_unitario     NUMERIC(10,2)   NOT NULL CHECK (precio_unitario > 0),
    cantidad            INTEGER         NOT NULL CHECK (cantidad > 0)

);

CREATE INDEX IF NOT EXISTS idx_pedidos_usuario_id ON pedidos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_pedido_items_pedido_id ON pedido_items(pedido_id);
CREATE INDEX IF NOT EXISTS idx_pedido_items_producto_id ON pedido_items(producto_id);

-- Datos de ejemplo (opcional)
-- INSERT INTO productos (nombre, descripcion, precio, stock) VALUES
--   ('Teclado mecánico', 'Switches rojos, retroiluminado', 899.00, 25),
--   ('Mouse inalámbrico', 'Sensor óptico 1600 DPI', 349.50, 40);

