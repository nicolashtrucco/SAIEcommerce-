-- =====================================
-- EXTENSIONES
-- =====================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =====================================
-- FUNCIÓN updated_at
-- =====================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================
-- CATEGORIES
-- =====================================

CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_categories_updated_at ON categories;
CREATE TRIGGER trg_categories_updated_at
BEFORE UPDATE ON categories
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- =====================================
-- PRODUCTS
-- =====================================

CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    category_id UUID NOT NULL
        REFERENCES categories(id)
        ON DELETE RESTRICT,

    name VARCHAR(255) NOT NULL,

    code VARCHAR(150) NOT NULL UNIQUE,

    description TEXT NOT NULL,

    image_url TEXT NOT NULL,

    origin VARCHAR(100),

    condition VARCHAR(50)
        NOT NULL
        DEFAULT 'Nuevo'
        CHECK (
            condition IN (
                'Nuevo',
                'Usado',
                'Reacondicionado'
            )
        ),

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_products_updated_at ON products;
CREATE TRIGGER trg_products_updated_at
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- =====================================
-- CLIENTS (Carrusel de logos)
-- =====================================

CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(255) NOT NULL,

    logo_url TEXT NOT NULL,

    sort_order INTEGER NOT NULL DEFAULT 0
        CHECK (sort_order >= 0),

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_clients_updated_at ON clients;
CREATE TRIGGER trg_clients_updated_at
BEFORE UPDATE ON clients
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- =====================================
-- ÍNDICES
-- =====================================

CREATE INDEX IF NOT EXISTS idx_products_category_active
ON products(category_id, is_active);

CREATE INDEX IF NOT EXISTS idx_products_name
ON products(name);

CREATE INDEX IF NOT EXISTS idx_clients_active_sort
ON clients(is_active, sort_order);
