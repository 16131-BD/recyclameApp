-- ======================================================
-- RECYCLAME DATABASE - FUNCIONES (STORED PROCEDURES)
-- Archivo: 02_FX_RECYCLAMEDB.sql
-- Descripción: Todas las funciones del sistema
-- ======================================================

-- ======================================================
-- FUNCIÓN: fx_sel_types_full (SELECT types)
-- ======================================================
DROP FUNCTION IF EXISTS public.fx_sel_types_full(JSONB);
CREATE FUNCTION public.fx_sel_types_full(JSONB)
    RETURNS TABLE (
        id            BIGINT,
        created_at    TIMESTAMP WITH TIME ZONE,
        category      VARCHAR,
        abbr          VARCHAR,
        name          VARCHAR,
        description   TEXT,
        additional_fields JSONB,
        order_col     BIGINT,
        updated_at    TIMESTAMP WITH TIME ZONE
    )
AS $BODY$
DECLARE
    p_json_data ALIAS FOR $1;
BEGIN
    RETURN QUERY
    WITH filtros AS (
        SELECT
            x.id,
            x.category,
            x.abbr,
            x.name,
            x.order_col,
            x.created_at
        FROM JSONB_TO_RECORDSET(COALESCE(p_json_data, '[]'::JSONB)) AS x(
            id        BIGINT,
            category  VARCHAR(250),
            abbr      VARCHAR(50),
            name      VARCHAR(500),
            order_col BIGINT,
            created_at TIMESTAMP WITH TIME ZONE
        )
    )
    SELECT
        t.id,
        t.created_at,
        t.category,
        t.abbr,
        t.name,
        t.description,
        t.additional_fields,
        t.order_col,
        t.updated_at
    FROM types t
    LEFT JOIN filtros f ON TRUE
    WHERE
        (f.id IS NULL OR t.id = f.id)
        AND (f.category IS NULL OR t.category ILIKE '%' || f.category || '%')
        AND (f.abbr IS NULL OR t.abbr ILIKE '%' || f.abbr || '%')
        AND (f.name IS NULL OR t.name ILIKE '%' || f.name || '%')
        AND (f.order_col IS NULL OR t.order_col = f.order_col)
        AND (f.created_at IS NULL OR DATE(t.created_at) = DATE(f.created_at))
    ORDER BY t.category, t.order_col, t.id;
END;
$BODY$
LANGUAGE plpgsql VOLATILE SECURITY DEFINER COST 1000;

COMMENT ON FUNCTION public.fx_sel_types_full(JSONB) IS 'Consultar tipos con filtros opcionales';

-- ======================================================
-- FUNCIÓN: fx_ins_types_full (INSERT types)
-- ======================================================
DROP FUNCTION IF EXISTS public.fx_ins_types_full(JSONB);
CREATE FUNCTION public.fx_ins_types_full(JSONB)
    RETURNS TABLE (id BIGINT, abbr VARCHAR)
AS $BODY$
DECLARE
    p_json_data ALIAS FOR $1;
BEGIN
    DROP TABLE IF EXISTS tmp_types;
    CREATE TEMPORARY TABLE tmp_types AS
    SELECT
        x.category,
        x.abbr,
        x.name,
        x.description,
        x.additional_fields,
        x.order_col,
        x.created_at
    FROM JSONB_TO_RECORDSET(p_json_data) AS x(
        category          VARCHAR(250),
        abbr              VARCHAR(50),
        name              VARCHAR(500),
        description       TEXT,
        additional_fields JSONB,
        order_col         BIGINT,
        created_at        TIMESTAMP WITH TIME ZONE
    );

    RETURN QUERY
    INSERT INTO types (category, abbr, name, description, additional_fields, order_col, created_at)
    SELECT
        UPPER(TRIM(t.category)),
        UPPER(TRIM(t.abbr)),
        INITCAP(TRIM(t.name)),
        t.description,
        t.additional_fields,
        t.order_col,
        COALESCE(t.created_at, CURRENT_TIMESTAMP)
    FROM tmp_types t
    RETURNING types.id, types.abbr;
END;
$BODY$
LANGUAGE plpgsql VOLATILE SECURITY DEFINER COST 1000;

-- ======================================================
-- FUNCIÓN: fx_upd_types_full (UPDATE types)
-- ======================================================
DROP FUNCTION IF EXISTS public.fx_upd_types_full(JSONB);
CREATE FUNCTION public.fx_upd_types_full(JSONB)
    RETURNS BOOLEAN
AS $BODY$
DECLARE
    p_json_data ALIAS FOR $1;
BEGIN
    DROP TABLE IF EXISTS tmp_types_upd;
    CREATE TEMPORARY TABLE tmp_types_upd AS
    SELECT x.id, x.category, x.abbr, x.name, x.description, x.additional_fields, x.order_col
    FROM JSONB_TO_RECORDSET(p_json_data) AS x(
        id BIGINT, category VARCHAR(250), abbr VARCHAR(50), name VARCHAR(500),
        description TEXT, additional_fields JSONB, order_col BIGINT
    );

    UPDATE types t SET
        category = COALESCE(TRIM(u.category), t.category),
        abbr = COALESCE(UPPER(TRIM(u.abbr)), t.abbr),
        name = COALESCE(INITCAP(TRIM(u.name)), t.name),
        description = COALESCE(u.description, t.description),
        additional_fields = COALESCE(u.additional_fields, t.additional_fields),
        order_col = COALESCE(u.order_col, t.order_col),
        updated_at = CURRENT_TIMESTAMP
    FROM tmp_types_upd u WHERE t.id = u.id;

    RETURN TRUE;
END;
$BODY$
LANGUAGE plpgsql VOLATILE SECURITY DEFINER COST 1000;

-- ======================================================
-- FUNCIÓN: fx_sel_companies (SELECT companies)
-- ======================================================
DROP FUNCTION IF EXISTS public.fx_sel_companies(JSONB);
CREATE FUNCTION public.fx_sel_companies(JSONB)
    RETURNS TABLE (
        id            BIGINT,
        code          VARCHAR,
        name          TEXT,
        address       TEXT,
        email         TEXT,
        phone         TEXT,
        created_at    TIMESTAMP WITH TIME ZONE,
        company_type  BIGINT,
        company_type_abbr VARCHAR,
        company_type_name VARCHAR,
        is_active     BOOLEAN,
        primary_user_id BIGINT,
        primary_user_name TEXT,
        total_users   BIGINT
    )
AS $BODY$
DECLARE
    p_json_data ALIAS FOR $1;
BEGIN
    RETURN QUERY
    WITH filtros AS (
        SELECT
            x.id AS filter_id,
            x.code AS filter_code,
            x.name AS filter_name,
            x.company_type AS filter_company_type,
            x.email AS filter_email,
            x.created_at AS filter_created_at
        FROM JSONB_TO_RECORDSET(COALESCE(p_json_data,'[]'::JSONB)) AS x(
            id BIGINT, code VARCHAR(50), name TEXT, company_type BIGINT,
            email TEXT, created_at TIMESTAMP WITH TIME ZONE
        )
    ),
    user_counts AS (
        SELECT 
            u.company_id, 
            COUNT(*) as cnt,
            MAX(CASE WHEN u.is_primary = TRUE THEN u.id END) as primary_id,
            MAX(CASE WHEN u.is_primary = TRUE THEN CONCAT(u.names, ' ', u.last_names) END) as primary_name
        FROM users u
        GROUP BY u.company_id
    )
    SELECT
        c.id,
        c.code,
        c.name,
        c.address,
        c.email,
        c.phone,
        c.created_at,
        c.company_type,
        t.abbr as company_type_abbr,
        t.name as company_type_name,
        COALESCE(c.is_active, TRUE) as is_active,
        uc.primary_id as primary_user_id,
        uc.primary_name as primary_user_name,
        COALESCE(uc.cnt, 0::BIGINT) as total_users
    FROM companies c
    LEFT JOIN types t ON c.company_type = t.id
    LEFT JOIN user_counts uc ON c.id = uc.company_id
    LEFT JOIN filtros f ON TRUE
    WHERE
        (f.filter_id IS NULL OR c.id = f.filter_id)
        AND (f.filter_code IS NULL OR c.code ILIKE '%' || f.filter_code || '%')
        AND (f.filter_name IS NULL OR c.name ILIKE '%' || f.filter_name || '%')
        AND (f.filter_company_type IS NULL OR c.company_type = f.filter_company_type)
        AND (f.filter_email IS NULL OR c.email ILIKE '%' || f.filter_email || '%')
        AND (f.filter_created_at IS NULL OR DATE(c.created_at) = DATE(f.filter_created_at))
    ORDER BY c.id;
END;
$BODY$
LANGUAGE plpgsql VOLATILE SECURITY DEFINER COST 1000;

-- ======================================================
-- FUNCIÓN: fx_ins_companies (INSERT companies)
-- ======================================================
DROP FUNCTION IF EXISTS public.fx_ins_companies(JSONB);
CREATE FUNCTION public.fx_ins_companies(JSONB)
    RETURNS TABLE (id BIGINT, code VARCHAR)
AS $BODY$
DECLARE
    p_json_data ALIAS FOR $1;
BEGIN
    DROP TABLE IF EXISTS tmp_companies;
    CREATE TEMPORARY TABLE tmp_companies AS
    SELECT x.name, x.address, x.email, x.phone, x.code, x.company_type, x.created_at
    FROM JSONB_TO_RECORDSET(p_json_data) AS x(
        name TEXT, address TEXT, email TEXT, phone TEXT,
        code VARCHAR(25), company_type BIGINT, created_at TIMESTAMP WITH TIME ZONE
    );

    RETURN QUERY
    INSERT INTO companies (name, address, email, phone, code, company_type, created_at)
    SELECT
        INITCAP(TRIM(t.name)),
        TRIM(t.address),
        LOWER(TRIM(t.email)),
        TRIM(t.phone),
        UPPER(TRIM(t.code)),
        t.company_type,
        COALESCE(t.created_at, CURRENT_TIMESTAMP)
    FROM tmp_companies t
    RETURNING companies.id, companies.code;
END;
$BODY$
LANGUAGE plpgsql VOLATILE SECURITY DEFINER COST 1000;

-- ======================================================
-- FUNCIÓN: fx_upd_companies (UPDATE companies)
-- ======================================================
DROP FUNCTION IF EXISTS public.fx_upd_companies(JSONB);
CREATE FUNCTION public.fx_upd_companies(JSONB)
    RETURNS BOOLEAN
AS $BODY$
DECLARE
    p_json_data ALIAS FOR $1;
BEGIN
    DROP TABLE IF EXISTS tmp_companies_upd;
    CREATE TEMPORARY TABLE tmp_companies_upd AS
    SELECT x.id, x.name, x.address, x.email, x.phone, x.code, x.company_type, x.is_active
    FROM JSONB_TO_RECORDSET(p_json_data) AS x(
        id BIGINT, name TEXT, address TEXT, email TEXT, phone TEXT,
        code VARCHAR(25), company_type BIGINT, is_active BOOLEAN
    );

    UPDATE companies c SET
        name = COALESCE(INITCAP(TRIM(u.name)), c.name),
        address = COALESCE(TRIM(u.address), c.address),
        email = COALESCE(LOWER(TRIM(u.email)), c.email),
        phone = COALESCE(TRIM(u.phone), c.phone),
        code = COALESCE(UPPER(TRIM(u.code)), c.code),
        company_type = COALESCE(u.company_type, c.company_type),
        is_active = COALESCE(u.is_active, c.is_active),
        updated_at = CURRENT_TIMESTAMP
    FROM tmp_companies_upd u WHERE c.id = u.id;

    RETURN TRUE;
END;
$BODY$
LANGUAGE plpgsql VOLATILE SECURITY DEFINER COST 1000;

-- ======================================================
-- FUNCIÓN: fx_sel_users (SELECT users)
-- ======================================================
DROP FUNCTION IF EXISTS public.fx_sel_users(JSONB);
CREATE FUNCTION public.fx_sel_users(JSONB)
    RETURNS TABLE (
        id          BIGINT,
        code        VARCHAR,
        names       TEXT,
        last_names  TEXT,
        name        TEXT,
        birth_date  DATE,
        gender      BOOLEAN,
        email       TEXT,
        phone       TEXT,
        created_at  TIMESTAMP WITH TIME ZONE,
        company_id  BIGINT,
        company_name TEXT,
        company_code VARCHAR,
        user_type   BIGINT,
        user_type_abbr VARCHAR,
        user_type_name VARCHAR,
        is_primary  BOOLEAN,
        is_active   BOOLEAN
    )
AS $BODY$
DECLARE
    p_json_data ALIAS FOR $1;
BEGIN
    RETURN QUERY
    WITH filtros AS (
        SELECT
            x.id, x.code, x.email, x.company_id, x.user_type, 
            x.is_primary, x.is_active, x.created_at
        FROM JSONB_TO_RECORDSET(COALESCE(p_json_data,'[]'::JSONB)) AS x(
            id BIGINT, code VARCHAR(8), email TEXT, company_id BIGINT,
            user_type BIGINT, is_primary BOOLEAN, is_active BOOLEAN,
            created_at TIMESTAMP WITH TIME ZONE
        )
    )
    SELECT
        u.id,
        u.code,
        u.names,
        u.last_names,
        CONCAT(u.names, ' ', u.last_names) as name,
        u.birth_date,
        u.gender,
        u.email,
        u.phone,
        u.created_at,
        u.company_id,
        c.name as company_name,
        c.code as company_code,
        u.user_type,
        t.abbr as user_type_abbr,
        t.name as user_type_name,
        COALESCE(u.is_primary, FALSE) as is_primary,
        COALESCE(u.is_active, TRUE) as is_active
    FROM users u
    LEFT JOIN companies c ON u.company_id = c.id
    LEFT JOIN types t ON u.user_type = t.id
    LEFT JOIN filtros f ON TRUE
    WHERE
        (f.id IS NULL OR u.id = f.id)
        AND (f.code IS NULL OR u.code ILIKE '%' || f.code || '%')
        AND (f.email IS NULL OR u.email ILIKE '%' || f.email || '%')
        AND (f.company_id IS NULL OR u.company_id = f.company_id)
        AND (f.user_type IS NULL OR u.user_type = f.user_type)
        AND (f.is_primary IS NULL OR u.is_primary = f.is_primary)
        AND (f.is_active IS NULL OR u.is_active = f.is_active)
        AND (f.created_at IS NULL OR DATE(u.created_at) = DATE(f.created_at))
    ORDER BY u.id;
END;
$BODY$
LANGUAGE plpgsql VOLATILE SECURITY DEFINER COST 1000;

-- ======================================================
-- FUNCIÓN: fx_sel_users_with_credentials (LOGIN)
-- ======================================================
DROP FUNCTION IF EXISTS public.fx_sel_users_with_credentials(JSONB);
CREATE FUNCTION public.fx_sel_users_with_credentials(JSONB)
    RETURNS TABLE (
        id          BIGINT,
        code        VARCHAR,
        names       TEXT,
        last_names  TEXT,
        name        TEXT,
        birth_date  DATE,
        gender      BOOLEAN,
        email       TEXT,
        phone       TEXT,
        created_at  TIMESTAMP WITH TIME ZONE,
        company_id  BIGINT,
        company_name TEXT,
        company_code VARCHAR,
        user_type   BIGINT,
        user_type_abbr VARCHAR,
        user_type_name VARCHAR,
        is_primary  BOOLEAN,
        is_active   BOOLEAN
    )
AS $BODY$
DECLARE
    p_json_data ALIAS FOR $1;
BEGIN
    RETURN QUERY
    WITH filtros AS (
        SELECT x.code, x.password
        FROM JSONB_TO_RECORDSET(COALESCE(p_json_data,'[]'::JSONB)) AS x(
            code VARCHAR(8), password TEXT
        )
    )
    SELECT
        u.id,
        u.code,
        u.names,
        u.last_names,
        CONCAT(u.names, ' ', u.last_names) as name,
        u.birth_date,
        u.gender,
        u.email,
        u.phone,
        u.created_at,
        u.company_id,
        c.name as company_name,
        c.code as company_code,
        u.user_type,
        t.abbr as user_type_abbr,
        t.name as user_type_name,
        COALESCE(u.is_primary, FALSE) as is_primary,
        COALESCE(u.is_active, TRUE) as is_active
    FROM users u
    LEFT JOIN companies c ON u.company_id = c.id
    LEFT JOIN types t ON u.user_type = t.id
    INNER JOIN filtros f ON u.code = f.code AND u.password = f.password
    WHERE COALESCE(u.is_active, TRUE) = TRUE;
END;
$BODY$
LANGUAGE plpgsql VOLATILE SECURITY DEFINER COST 1000;

COMMENT ON FUNCTION public.fx_sel_users_with_credentials(JSONB) IS 'Login de usuarios';

-- ======================================================
-- FUNCIÓN: fx_ins_users (INSERT users)
-- ======================================================
DROP FUNCTION IF EXISTS public.fx_ins_users(JSONB);
CREATE FUNCTION public.fx_ins_users(JSONB)
    RETURNS TABLE (id BIGINT, code VARCHAR)
AS $BODY$
DECLARE
    p_json_data ALIAS FOR $1;
    v_max_num INT;
BEGIN
    -- Obtener el siguiente número de código
    SELECT COALESCE(MAX(CAST(SUBSTRING(u.code FROM 2) AS INT)), 0) + 1 INTO v_max_num
    FROM users u WHERE u.code ~ '^U[0-9]+$';
    
    DROP TABLE IF EXISTS tmp_users_ins;
    CREATE TEMPORARY TABLE tmp_users_ins AS
    SELECT
        x.code AS user_code,
        x.password AS user_password,
        x.names, x.last_names, x.birth_date, x.gender,
        x.email, x.phone, x.company_id, x.user_type, x.is_primary,
        ROW_NUMBER() OVER () as rn
    FROM JSONB_TO_RECORDSET(p_json_data) AS x(
        code VARCHAR(8), password TEXT, names TEXT, last_names TEXT,
        birth_date DATE, gender BOOLEAN, email TEXT, phone TEXT,
        company_id BIGINT, user_type BIGINT, is_primary BOOLEAN
    );

    RETURN QUERY
    INSERT INTO users (
        code, password, names, last_names, birth_date, gender,
        email, phone, company_id, user_type, is_primary, is_active, status, created_at
    )
    SELECT
        COALESCE(NULLIF(TRIM(t.user_code), ''), 'U' || LPAD((v_max_num + t.rn - 1)::TEXT, 3, '0')),
        COALESCE(t.user_password, 'temp' || LPAD((v_max_num + t.rn - 1)::TEXT, 4, '0')),
        INITCAP(TRIM(t.names)),
        INITCAP(TRIM(t.last_names)),
        t.birth_date,
        t.gender,
        LOWER(TRIM(t.email)),
        TRIM(t.phone),
        t.company_id,
        t.user_type,
        COALESCE(t.is_primary, FALSE),
        TRUE,
        1,
        CURRENT_TIMESTAMP
    FROM tmp_users_ins t
    RETURNING users.id, users.code;
END;
$BODY$
LANGUAGE plpgsql VOLATILE SECURITY DEFINER COST 1000;

-- ======================================================
-- FUNCIÓN: fx_upd_users (UPDATE users)
-- ======================================================
DROP FUNCTION IF EXISTS public.fx_upd_users(JSONB);
CREATE FUNCTION public.fx_upd_users(JSONB)
    RETURNS BOOLEAN
AS $BODY$
DECLARE
    p_json_data ALIAS FOR $1;
BEGIN
    DROP TABLE IF EXISTS tmp_users_upd;
    CREATE TEMPORARY TABLE tmp_users_upd AS
    SELECT
        x.id, x.code, x.password, x.names, x.last_names, x.birth_date,
        x.gender, x.email, x.phone, x.company_id, x.user_type,
        x.is_active, x.is_primary
    FROM JSONB_TO_RECORDSET(p_json_data) AS x(
        id BIGINT, code VARCHAR(8), password TEXT, names TEXT, last_names TEXT,
        birth_date DATE, gender BOOLEAN, email TEXT, phone TEXT,
        company_id BIGINT, user_type BIGINT, is_active BOOLEAN, is_primary BOOLEAN
    );

    UPDATE users u SET
        code = COALESCE(t.code, u.code),
        password = COALESCE(t.password, u.password),
        names = COALESCE(INITCAP(TRIM(t.names)), u.names),
        last_names = COALESCE(INITCAP(TRIM(t.last_names)), u.last_names),
        birth_date = COALESCE(t.birth_date, u.birth_date),
        gender = COALESCE(t.gender, u.gender),
        email = COALESCE(LOWER(TRIM(t.email)), u.email),
        phone = COALESCE(t.phone, u.phone),
        company_id = COALESCE(t.company_id, u.company_id),
        user_type = COALESCE(t.user_type, u.user_type),
        is_active = COALESCE(t.is_active, u.is_active),
        is_primary = COALESCE(t.is_primary, u.is_primary),
        updated_at = CURRENT_TIMESTAMP
    FROM tmp_users_upd t WHERE u.id = t.id;

    RETURN TRUE;
END;
$BODY$
LANGUAGE plpgsql VOLATILE SECURITY DEFINER COST 1000;

-- ======================================================
-- FUNCIÓN: fx_create_user_from_affiliation
-- ======================================================
DROP FUNCTION IF EXISTS public.fx_create_user_from_affiliation(JSONB);
CREATE FUNCTION public.fx_create_user_from_affiliation(JSONB)
    RETURNS TABLE (user_id BIGINT, user_code VARCHAR, user_email TEXT)
AS $BODY$
DECLARE
    p_json_data ALIAS FOR $1;
    v_new_code VARCHAR(8);
    v_max_id BIGINT;
    v_sec_type_id BIGINT;
BEGIN
    -- Obtener el tipo SEC
    SELECT t.id INTO v_sec_type_id 
    FROM types t WHERE t.category = 'user_type' AND t.abbr = 'SEC' LIMIT 1;
    
    IF v_sec_type_id IS NULL THEN
        SELECT t.id INTO v_sec_type_id FROM types t WHERE t.category = 'user_type' LIMIT 1;
    END IF;
    
    -- Generar código único
    SELECT MAX(u.id) INTO v_max_id FROM users u;
    v_new_code := 'U' || LPAD((COALESCE(v_max_id, 0) + 1)::TEXT, 3, '0');
    
    RETURN QUERY
    INSERT INTO users (
        code, password, names, last_names, email, phone,
        company_id, user_type, is_primary, is_active, created_at
    )
    SELECT
        v_new_code,
        COALESCE(x.password, 'temp1234'),
        x.names,
        x.last_names,
        x.email,
        x.phone,
        x.company_id,
        v_sec_type_id,
        FALSE,
        TRUE,
        CURRENT_TIMESTAMP
    FROM JSONB_TO_RECORDSET(p_json_data) AS x(
        names TEXT, last_names TEXT, email TEXT, phone TEXT,
        company_id BIGINT, password TEXT
    )
    RETURNING users.id, users.code, users.email;
END;
$BODY$
LANGUAGE plpgsql VOLATILE SECURITY DEFINER COST 1000;

COMMENT ON FUNCTION public.fx_create_user_from_affiliation(JSONB) IS 'Crear usuario desde aprobación de afiliación';

-- ======================================================
-- FUNCIÓN: fx_set_primary_user
-- ======================================================
DROP FUNCTION IF EXISTS public.fx_set_primary_user(BIGINT, BIGINT);
CREATE FUNCTION public.fx_set_primary_user(p_user_id BIGINT, p_company_id BIGINT)
    RETURNS BOOLEAN
AS $BODY$
DECLARE
    v_pri_type_id BIGINT;
    v_sec_type_id BIGINT;
BEGIN
    SELECT t.id INTO v_pri_type_id FROM types t WHERE t.category = 'user_type' AND t.abbr = 'PRI' LIMIT 1;
    SELECT t.id INTO v_sec_type_id FROM types t WHERE t.category = 'user_type' AND t.abbr = 'SEC' LIMIT 1;
    
    -- Quitar el principal anterior
    UPDATE users u SET is_primary = FALSE, user_type = v_sec_type_id
    WHERE u.company_id = p_company_id AND u.is_primary = TRUE;
    
    -- Establecer nuevo principal
    UPDATE users u SET is_primary = TRUE, user_type = v_pri_type_id
    WHERE u.id = p_user_id AND u.company_id = p_company_id;
    
    RETURN FOUND;
END;
$BODY$
LANGUAGE plpgsql VOLATILE SECURITY DEFINER COST 100;

COMMENT ON FUNCTION public.fx_set_primary_user(BIGINT, BIGINT) IS 'Establecer usuario como principal de empresa';

-- ======================================================
-- FUNCIÓN: fx_sel_plants (SELECT plants)
-- ======================================================
DROP FUNCTION IF EXISTS public.fx_sel_plants(JSONB);
CREATE FUNCTION public.fx_sel_plants(JSONB)
    RETURNS TABLE (
        id BIGINT, company_id BIGINT, code VARCHAR, name TEXT,
        address TEXT, latitude NUMERIC, longitude NUMERIC, status BIGINT,
        created_at TIMESTAMP WITH TIME ZONE, updated_at TIMESTAMP WITH TIME ZONE
    )
AS $BODY$
DECLARE
    p_json_data ALIAS FOR $1;
BEGIN
    RETURN QUERY
    WITH filtros AS (
        SELECT x.id, x.company_id, x.code, x.status, x.created_at
        FROM JSONB_TO_RECORDSET(COALESCE(p_json_data,'[]'::JSONB)) AS x(
            id BIGINT, company_id BIGINT, code VARCHAR(50),
            status BIGINT, created_at TIMESTAMP WITH TIME ZONE
        )
    )
    SELECT
        p.id, p.company_id, p.code, p.name, p.address,
        p.latitude, p.longitude, p.status, p.created_at, p.updated_at
    FROM plants p
    LEFT JOIN filtros f ON TRUE
    WHERE
        (f.id IS NULL OR p.id = f.id)
        AND (f.company_id IS NULL OR p.company_id = f.company_id)
        AND (f.code IS NULL OR p.code ILIKE '%' || f.code || '%')
        AND (f.status IS NULL OR p.status = f.status)
        AND (f.created_at IS NULL OR DATE(p.created_at) = DATE(f.created_at));
END;
$BODY$
LANGUAGE plpgsql VOLATILE SECURITY DEFINER COST 1000;

-- ======================================================
-- FUNCIÓN: fx_ins_plants (INSERT plants)
-- ======================================================
DROP FUNCTION IF EXISTS public.fx_ins_plants(JSONB);
CREATE FUNCTION public.fx_ins_plants(JSONB)
    RETURNS TABLE (id BIGINT, code VARCHAR)
AS $BODY$
DECLARE
    p_json_data ALIAS FOR $1;
BEGIN
    DROP TABLE IF EXISTS tmp_plants;
    CREATE TEMPORARY TABLE tmp_plants AS
    SELECT
        x.company_id, x.code, x.name, x.address,
        x.latitude, x.longitude, x.status, x.created_by
    FROM JSONB_TO_RECORDSET(p_json_data) AS x(
        company_id BIGINT, code VARCHAR(50), name TEXT, address TEXT,
        latitude NUMERIC, longitude NUMERIC, status BIGINT, created_by BIGINT
    );

    RETURN QUERY
    INSERT INTO plants (company_id, code, name, address, latitude, longitude, status, created_by, created_at)
    SELECT
        t.company_id,
        UPPER(TRIM(t.code)),
        INITCAP(TRIM(t.name)),
        TRIM(t.address),
        t.latitude,
        t.longitude,
        t.status,
        t.created_by,
        CURRENT_TIMESTAMP
    FROM tmp_plants t
    RETURNING plants.id, plants.code;
END;
$BODY$
LANGUAGE plpgsql VOLATILE SECURITY DEFINER COST 1000;

-- ======================================================
-- FUNCIÓN: fx_upd_plants (UPDATE plants)
-- ======================================================
DROP FUNCTION IF EXISTS public.fx_upd_plants(JSONB);
CREATE FUNCTION public.fx_upd_plants(JSONB)
    RETURNS BOOLEAN
AS $BODY$
DECLARE
    p_json_data ALIAS FOR $1;
BEGIN
    DROP TABLE IF EXISTS tmp_plants_upd;
    CREATE TEMPORARY TABLE tmp_plants_upd AS
    SELECT x.id, x.company_id, x.code, x.name, x.address, x.latitude, x.longitude, x.status
    FROM JSONB_TO_RECORDSET(p_json_data) AS x(
        id BIGINT, company_id BIGINT, code VARCHAR(50), name TEXT,
        address TEXT, latitude NUMERIC, longitude NUMERIC, status BIGINT
    );

    UPDATE plants p SET
        company_id = COALESCE(u.company_id, p.company_id),
        code = COALESCE(UPPER(TRIM(u.code)), p.code),
        name = COALESCE(INITCAP(TRIM(u.name)), p.name),
        address = COALESCE(TRIM(u.address), p.address),
        latitude = COALESCE(u.latitude, p.latitude),
        longitude = COALESCE(u.longitude, p.longitude),
        status = COALESCE(u.status, p.status),
        updated_at = CURRENT_TIMESTAMP
    FROM tmp_plants_upd u WHERE p.id = u.id;

    RETURN TRUE;
END;
$BODY$
LANGUAGE plpgsql VOLATILE SECURITY DEFINER COST 1000;

-- ======================================================
-- FUNCIÓN: fx_sel_residues (SELECT residues)
-- ======================================================
DROP FUNCTION IF EXISTS public.fx_sel_residues(JSONB);
CREATE FUNCTION public.fx_sel_residues(JSONB)
    RETURNS TABLE (
        id BIGINT, created_at TIMESTAMP WITH TIME ZONE, company_id BIGINT,
        name VARCHAR, residue_type BIGINT, residue_type_name VARCHAR,
        status_type BIGINT, status_type_name VARCHAR, unit_measurement BIGINT,
        waste_generation_date DATE, quantity NUMERIC, status BIGINT,
        status_name VARCHAR, plant_id BIGINT, user_operator BIGINT
    )
AS $BODY$
DECLARE
    p_json_data ALIAS FOR $1;
BEGIN
    RETURN QUERY
    WITH filtros AS (
        SELECT x.id, x.company_id, x.residue_type, x.status_type, x.plant_id, x.status, x.created_at
        FROM JSONB_TO_RECORDSET(COALESCE(p_json_data,'[]'::JSONB)) AS x(
            id BIGINT, company_id BIGINT, residue_type BIGINT, status_type BIGINT,
            plant_id BIGINT, status BIGINT, created_at TIMESTAMP WITH TIME ZONE
        )
    )
    SELECT
        r.id, r.created_at, r.company_id, r.name, r.residue_type,
        rt.name::VARCHAR as residue_type_name,
        r.status_type, rs.name::VARCHAR as status_type_name,
        r.unit_measurement, r.waste_generation_date, r.quantity,
        r.status, s.name::VARCHAR as status_name, r.plant_id, r.user_operator
    FROM residues r
    LEFT JOIN types rt ON r.residue_type = rt.id
    LEFT JOIN types rs ON r.status_type = rs.id
    LEFT JOIN types s ON r.status = s.id
    LEFT JOIN filtros f ON TRUE
    WHERE
        (f.id IS NULL OR r.id = f.id)
        AND (f.company_id IS NULL OR r.company_id = f.company_id)
        AND (f.residue_type IS NULL OR r.residue_type = f.residue_type)
        AND (f.status_type IS NULL OR r.status_type = f.status_type)
        AND (f.plant_id IS NULL OR r.plant_id = f.plant_id)
        AND (f.status IS NULL OR r.status = f.status)
        AND (f.created_at IS NULL OR DATE(r.created_at) = DATE(f.created_at));
END;
$BODY$
LANGUAGE plpgsql VOLATILE SECURITY DEFINER COST 1000;

-- ======================================================
-- FUNCIÓN: fx_ins_residues (INSERT residues)
-- ======================================================
DROP FUNCTION IF EXISTS public.fx_ins_residues(JSONB);
CREATE FUNCTION public.fx_ins_residues(JSONB)
    RETURNS BOOLEAN
AS $BODY$
DECLARE
    p_json_data ALIAS FOR $1;
BEGIN
    INSERT INTO residues (
        company_id, name, residue_type, status_type, unit_measurement,
        waste_generation_date, quantity, status, plant_id, user_operator, created_by, created_at
    )
    SELECT
        x.company_id,
        INITCAP(TRIM(x.name)),
        x.residue_type,
        x.status_type,
        x.unit_measurement,
        x.waste_generation_date,
        x.quantity,
        x.status,
        x.plant_id,
        x.user_operator,
        x.created_by,
        CURRENT_TIMESTAMP
    FROM JSONB_TO_RECORDSET(p_json_data) AS x(
        company_id BIGINT, name VARCHAR(500), residue_type BIGINT, status_type BIGINT,
        unit_measurement BIGINT, waste_generation_date DATE, quantity NUMERIC,
        status BIGINT, plant_id BIGINT, user_operator BIGINT, created_by BIGINT
    );

    RETURN TRUE;
END;
$BODY$
LANGUAGE plpgsql VOLATILE SECURITY DEFINER COST 1000;

-- ======================================================
-- FUNCIÓN: fx_upd_residues (UPDATE residues)
-- ======================================================
DROP FUNCTION IF EXISTS public.fx_upd_residues(JSONB);
CREATE FUNCTION public.fx_upd_residues(JSONB)
    RETURNS BOOLEAN
AS $BODY$
DECLARE
    p_json_data ALIAS FOR $1;
BEGIN
    DROP TABLE IF EXISTS tmp_residues_upd;
    CREATE TEMPORARY TABLE tmp_residues_upd AS
    SELECT
        x.id, x.company_id, x.name, x.residue_type, x.status_type,
        x.unit_measurement, x.waste_generation_date, x.quantity,
        x.status, x.plant_id, x.user_operator
    FROM JSONB_TO_RECORDSET(p_json_data) AS x(
        id BIGINT, company_id BIGINT, name VARCHAR(500), residue_type BIGINT,
        status_type BIGINT, unit_measurement BIGINT, waste_generation_date DATE,
        quantity NUMERIC, status BIGINT, plant_id BIGINT, user_operator BIGINT
    );

    UPDATE residues r SET
        company_id = COALESCE(u.company_id, r.company_id),
        name = COALESCE(INITCAP(TRIM(u.name)), r.name),
        residue_type = COALESCE(u.residue_type, r.residue_type),
        status_type = COALESCE(u.status_type, r.status_type),
        unit_measurement = COALESCE(u.unit_measurement, r.unit_measurement),
        waste_generation_date = COALESCE(u.waste_generation_date, r.waste_generation_date),
        quantity = COALESCE(u.quantity, r.quantity),
        status = COALESCE(u.status, r.status),
        plant_id = COALESCE(u.plant_id, r.plant_id),
        user_operator = COALESCE(u.user_operator, r.user_operator),
        updated_at = CURRENT_TIMESTAMP
    FROM tmp_residues_upd u WHERE r.id = u.id;

    RETURN TRUE;
END;
$BODY$
LANGUAGE plpgsql VOLATILE SECURITY DEFINER COST 1000;

-- ======================================================
-- FUNCIÓN: fx_sel_operations_detail (SELECT operations)
-- ======================================================
DROP FUNCTION IF EXISTS public.fx_sel_operations_detail(JSONB);
CREATE FUNCTION public.fx_sel_operations_detail(JSONB)
    RETURNS TABLE (
        id BIGINT, created_at TIMESTAMP WITH TIME ZONE, residue_id BIGINT,
        previous_status BIGINT, current_status BIGINT, obs TEXT,
        company_id BIGINT, plant_id BIGINT, updated_at TIMESTAMP WITH TIME ZONE
    )
AS $BODY$
DECLARE
    p_json_data ALIAS FOR $1;
BEGIN
    RETURN QUERY
    WITH filtros AS (
        SELECT x.id, x.residue_id, x.previous_status, x.current_status, x.company_id, x.plant_id, x.created_at
        FROM JSONB_TO_RECORDSET(COALESCE(p_json_data,'[]'::JSONB)) AS x(
            id BIGINT, residue_id BIGINT, previous_status BIGINT, current_status BIGINT,
            company_id BIGINT, plant_id BIGINT, created_at TIMESTAMP WITH TIME ZONE
        )
    )
    SELECT
        o.id, o.created_at, o.residue_id, o.previous_status, o.current_status,
        o.obs, o.company_id, o.plant_id, o.updated_at
    FROM operations_detail o
    LEFT JOIN filtros f ON TRUE
    WHERE
        (f.id IS NULL OR o.id = f.id)
        AND (f.residue_id IS NULL OR o.residue_id = f.residue_id)
        AND (f.previous_status IS NULL OR o.previous_status = f.previous_status)
        AND (f.current_status IS NULL OR o.current_status = f.current_status)
        AND (f.company_id IS NULL OR o.company_id = f.company_id)
        AND (f.plant_id IS NULL OR o.plant_id = f.plant_id)
        AND (f.created_at IS NULL OR DATE(o.created_at) = DATE(f.created_at));
END;
$BODY$
LANGUAGE plpgsql VOLATILE SECURITY DEFINER COST 1000;

-- ======================================================
-- FUNCIÓN: fx_ins_operations_detail (INSERT operations)
-- ======================================================
DROP FUNCTION IF EXISTS public.fx_ins_operations_detail(JSONB);
CREATE FUNCTION public.fx_ins_operations_detail(JSONB)
    RETURNS BOOLEAN
AS $BODY$
DECLARE
    p_json_data ALIAS FOR $1;
BEGIN
    INSERT INTO operations_detail (
        residue_id, previous_status, current_status, obs,
        company_id, plant_id, created_by, created_at
    )
    SELECT
        x.residue_id,
        x.previous_status,
        x.current_status,
        TRIM(x.obs),
        x.company_id,
        x.plant_id,
        x.created_by,
        CURRENT_TIMESTAMP
    FROM JSONB_TO_RECORDSET(p_json_data) AS x(
        residue_id BIGINT, previous_status BIGINT, current_status BIGINT,
        obs TEXT, company_id BIGINT, plant_id BIGINT, created_by BIGINT
    );

    RETURN TRUE;
END;
$BODY$
LANGUAGE plpgsql VOLATILE SECURITY DEFINER COST 1000;

-- ======================================================
-- FUNCIÓN: fx_upd_operations_detail (UPDATE operations)
-- ======================================================
DROP FUNCTION IF EXISTS public.fx_upd_operations_detail(JSONB);
CREATE FUNCTION public.fx_upd_operations_detail(JSONB)
    RETURNS BOOLEAN
AS $BODY$
DECLARE
    p_json_data ALIAS FOR $1;
BEGIN
    DROP TABLE IF EXISTS tmp_operations_detail_upd;
    CREATE TEMPORARY TABLE tmp_operations_detail_upd AS
    SELECT x.id, x.residue_id, x.previous_status, x.current_status, x.obs, x.company_id, x.plant_id
    FROM JSONB_TO_RECORDSET(p_json_data) AS x(
        id BIGINT, residue_id BIGINT, previous_status BIGINT, current_status BIGINT,
        obs TEXT, company_id BIGINT, plant_id BIGINT
    );

    UPDATE operations_detail o SET
        residue_id = COALESCE(u.residue_id, o.residue_id),
        previous_status = COALESCE(u.previous_status, o.previous_status),
        current_status = COALESCE(u.current_status, o.current_status),
        obs = COALESCE(TRIM(u.obs), o.obs),
        company_id = COALESCE(u.company_id, o.company_id),
        plant_id = COALESCE(u.plant_id, o.plant_id),
        updated_at = CURRENT_TIMESTAMP
    FROM tmp_operations_detail_upd u WHERE o.id = u.id;

    RETURN TRUE;
END;
$BODY$
LANGUAGE plpgsql VOLATILE SECURITY DEFINER COST 1000;

-- ======================================================
-- FIN DEL ARCHIVO DE FUNCIONES
-- ======================================================
