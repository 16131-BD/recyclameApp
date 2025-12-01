-- ======================================================
-- FUNCIÓN: types (SELECT / INSERT / UPDATE)
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
        t."order",
        t.updated_at
    FROM types t
    LEFT JOIN filtros f ON TRUE
    WHERE
        (f.id IS NULL OR t.id = f.id)
        AND (f.category IS NULL OR t.category ILIKE '%' || f.category || '%')
        AND (f.abbr IS NULL OR t.abbr ILIKE '%' || f.abbr || '%')
        AND (f.name IS NULL OR t.name ILIKE '%' || f.name || '%')
        AND (f.order_col IS NULL OR t."order" = f.order_col)
        AND (f.created_at IS NULL OR DATE(t.created_at) = DATE(f.created_at));
END;
$BODY$
LANGUAGE plpgsql VOLATILE SECURITY DEFINER
COST 1000;

COMMENT ON FUNCTION public.fx_sel_types_full(JSONB) IS '
OBJETIVO: Consultar registros en types con filtros opcionales JSONB.
EJEMPLO: SELECT * FROM public.fx_sel_types_full(NULL);
';

DROP FUNCTION IF EXISTS public.fx_ins_types_full(JSONB);
CREATE FUNCTION public.fx_ins_types_full(JSONB)
    RETURNS TABLE (
        id BIGINT,
        abbr VARCHAR
    )
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
        x."order",
        x.created_at,
        x.created_by,
        x.updated_at
    FROM JSONB_TO_RECORDSET(p_json_data) AS x(
        category          VARCHAR(250),
        abbr              VARCHAR(50),
        name              VARCHAR(500),
        description       TEXT,
        additional_fields JSONB,
        "order"           BIGINT,
        created_at        TIMESTAMP WITH TIME ZONE,
        created_by        BIGINT,
        updated_at        TIMESTAMP WITH TIME ZONE
    );

    RETURN QUERY
    INSERT INTO types (
        category,
        abbr,
        name,
        description,
        additional_fields,
        "order",
        created_at,
        created_by,
        updated_at
    )
    SELECT
        COALESCE(UPPER(TRIM(category)), '250'),
        UPPER(TRIM(abbr)),
        INITCAP(TRIM(name)),
        description,
        additional_fields,
        "order",
        COALESCE(created_at, CURRENT_TIMESTAMP),
        created_by,
        updated_at
    FROM tmp_types
    RETURNING id, abbr;
END;
$BODY$
LANGUAGE plpgsql VOLATILE SECURITY DEFINER
COST 1000;

COMMENT ON FUNCTION public.fx_ins_types_full(JSONB) IS '
OBJETIVO: Insertar registros en types desde JSONB.
EJEMPLO: SELECT * FROM public.fx_ins_types_full(
  ''[{"abbr":"GEN","name":"Genero","category":"250","created_by":1}]''
);
';

DROP FUNCTION IF EXISTS public.fx_upd_types_full(JSONB);
CREATE FUNCTION public.fx_upd_types_full(JSONB)
    RETURNS BOOLEAN
AS $BODY$
DECLARE
    p_json_data ALIAS FOR $1;
BEGIN
    DROP TABLE IF EXISTS tmp_types_upd;
    CREATE TEMPORARY TABLE tmp_types_upd AS
    SELECT
        x.id,
        x.category,
        x.abbr,
        x.name,
        x.description,
        x.additional_fields,
        x."order",
        x.updated_at
    FROM JSONB_TO_RECORDSET(p_json_data) AS x(
        id                BIGINT,
        category          VARCHAR(250),
        abbr              VARCHAR(50),
        name              VARCHAR(500),
        description       TEXT,
        additional_fields JSONB,
        "order"           BIGINT,
        updated_at        TIMESTAMP WITH TIME ZONE
    );

    UPDATE types t
    SET
        category = COALESCE(TRIM(u.category), t.category),
        abbr     = COALESCE(UPPER(TRIM(u.abbr)), t.abbr),
        name     = COALESCE(INITCAP(TRIM(u.name)), t.name),
        description = COALESCE(u.description, t.description),
        additional_fields = COALESCE(u.additional_fields, t.additional_fields),
        "order"  = COALESCE(u."order", t."order"),
        updated_at = COALESCE(u.updated_at, CURRENT_TIMESTAMP)
    FROM tmp_types_upd u
    WHERE t.id = u.id;

    RETURN TRUE;
END;
$BODY$
LANGUAGE plpgsql VOLATILE SECURITY DEFINER
COST 1000;

COMMENT ON FUNCTION public.fx_upd_types_full(JSONB) IS '
OBJETIVO: Actualizar registros en types (parcial desde JSONB).
';

-- ======================================================
-- FUNCIÓN: companies (SELECT / INSERT / UPDATE)
-- ======================================================
DROP FUNCTION IF EXISTS public.fx_sel_companies(JSONB);
CREATE FUNCTION public.fx_sel_companies(JSONB)
    RETURNS TABLE (
        id          BIGINT,
        created_at  TIMESTAMP WITH TIME ZONE,
        name        TEXT,
        address     TEXT,
        email       TEXT,
        phone       TEXT,
        code        VARCHAR,
        company_type BIGINT
    )
AS $BODY$
DECLARE
    p_json_data ALIAS FOR $1;
BEGIN
    RETURN QUERY
    WITH filtros AS (
        SELECT
            x.id,
            x.name,
            x.code,
            x.company_type,
            x.created_at
        FROM JSONB_TO_RECORDSET(COALESCE(p_json_data,'[]'::JSONB)) AS x(
            id           BIGINT,
            name         TEXT,
            code         VARCHAR(25),
            company_type BIGINT,
            created_at   TIMESTAMP WITH TIME ZONE
        )
    )
    SELECT
        c.id,
        c.created_at,
        c.name,
        c.address,
        c.email,
        c.phone,
        c.code,
        c.company_type
    FROM companies c
    LEFT JOIN filtros f ON TRUE
    WHERE
        (f.id IS NULL OR c.id = f.id)
        AND (f.name IS NULL OR c.name ILIKE '%' || f.name || '%')
        AND (f.code IS NULL OR c.code ILIKE '%' || f.code || '%')
        AND (f.company_type IS NULL OR c.company_type = f.company_type)
        AND (f.created_at IS NULL OR DATE(c.created_at) = DATE(f.created_at));
END;
$BODY$
LANGUAGE plpgsql VOLATILE SECURITY DEFINER
COST 1000;

COMMENT ON FUNCTION public.fx_sel_companies(JSONB) IS '
OBJETIVO: Consultar registros en companies con filtros opcionales JSONB.
';

DROP FUNCTION IF EXISTS public.fx_ins_companies(JSONB);
CREATE FUNCTION public.fx_ins_companies(JSONB)
    RETURNS TABLE (
        id BIGINT,
        code VARCHAR
    )
AS $BODY$
DECLARE
    p_json_data ALIAS FOR $1;
BEGIN
    DROP TABLE IF EXISTS tmp_companies;
    CREATE TEMPORARY TABLE tmp_companies AS
    SELECT
        x.name,
        x.address,
        x.email,
        x.phone,
        x.code,
        x.company_type,
        x.created_at
    FROM JSONB_TO_RECORDSET(p_json_data) AS x(
        name         TEXT,
        address      TEXT,
        email        TEXT,
        phone        TEXT,
        code         VARCHAR(25),
        company_type BIGINT,
        created_at   TIMESTAMP WITH TIME ZONE
    );

    RETURN QUERY
    INSERT INTO companies (
        name,
        address,
        email,
        phone,
        code,
        company_type,
        created_at
    )
    SELECT
        INITCAP(TRIM(name)),
        TRIM(address),
        LOWER(TRIM(email)),
        TRIM(phone),
        UPPER(TRIM(code)),
        company_type,
        COALESCE(created_at, CURRENT_TIMESTAMP)
    FROM tmp_companies
    RETURNING id, code;
END;
$BODY$
LANGUAGE plpgsql VOLATILE SECURITY DEFINER
COST 1000;

COMMENT ON FUNCTION public.fx_ins_companies(JSONB) IS '
OBJETIVO: Insertar registros en companies desde JSONB.
';

DROP FUNCTION IF EXISTS public.fx_upd_companies(JSONB);
CREATE FUNCTION public.fx_upd_companies(JSONB)
    RETURNS BOOLEAN
AS $BODY$
DECLARE
    p_json_data ALIAS FOR $1;
BEGIN
    DROP TABLE IF EXISTS tmp_companies_upd;
    CREATE TEMPORARY TABLE tmp_companies_upd AS
    SELECT
        x.id,
        x.name,
        x.address,
        x.email,
        x.phone,
        x.code,
        x.company_type,
        x.updated_at
    FROM JSONB_TO_RECORDSET(p_json_data) AS x(
        id           BIGINT,
        name         TEXT,
        address      TEXT,
        email        TEXT,
        phone        TEXT,
        code         VARCHAR(25),
        company_type BIGINT,
        updated_at   TIMESTAMP WITH TIME ZONE
    );

    UPDATE companies c
    SET
        name = COALESCE(INITCAP(TRIM(u.name)), c.name),
        address = COALESCE(TRIM(u.address), c.address),
        email = COALESCE(LOWER(TRIM(u.email)), c.email),
        phone = COALESCE(TRIM(u.phone), c.phone),
        code = COALESCE(UPPER(TRIM(u.code)), c.code),
        company_type = COALESCE(u.company_type, c.company_type),
        updated_at = COALESCE(u.updated_at, CURRENT_TIMESTAMP)
    FROM tmp_companies_upd u
    WHERE c.id = u.id;

    RETURN TRUE;
END;
$BODY$
LANGUAGE plpgsql VOLATILE SECURITY DEFINER
COST 1000;

COMMENT ON FUNCTION public.fx_upd_companies(JSONB) IS '
OBJETIVO: Actualizar registros en companies (parcial desde JSONB).
';

-- ======================================================
-- FUNCIÓN: users (SELECT / INSERT / UPDATE)
-- ======================================================
DROP FUNCTION IF EXISTS public.fx_sel_users(JSONB);
CREATE FUNCTION public.fx_sel_users(JSONB)
    RETURNS TABLE (
        id          BIGINT,
        code        VARCHAR,
        names       TEXT,
        last_names  TEXT,
        birth_date  DATE,
        gender      BOOLEAN,
        email       TEXT,
        phone       TEXT,
        created_at  TIMESTAMP WITH TIME ZONE,
        company_id  BIGINT,
        user_type   BIGINT
    )
AS $BODY$
DECLARE
    p_json_data ALIAS FOR $1;
BEGIN
    RETURN QUERY
    WITH filtros AS (
        SELECT
            x.id,
            x.code,
            x.email,
            x.company_id,
            x.user_type,
            x.created_at
        FROM JSONB_TO_RECORDSET(COALESCE(p_json_data,'[]'::JSONB)) AS x(
            id         BIGINT,
            code       VARCHAR(8),
            email      TEXT,
            company_id BIGINT,
            user_type  BIGINT,
            created_at TIMESTAMP WITH TIME ZONE
        )
    )
    SELECT
        u.id,
        u.code,
        u.names,
        u.last_names,
        u.birth_date,
        u.gender,
        u.email,
        u.phone,
        u.created_at,
        u.company_id,
        u.user_type
    FROM users u
    LEFT JOIN filtros f ON TRUE
    WHERE
        (f.id IS NULL OR u.id = f.id)
        AND (f.code IS NULL OR u.code ILIKE '%' || f.code || '%')
        AND (f.email IS NULL OR u.email ILIKE '%' || f.email || '%')
        AND (f.company_id IS NULL OR u.company_id = f.company_id)
        AND (f.user_type IS NULL OR u.user_type = f.user_type)
        AND (f.created_at IS NULL OR DATE(u.created_at) = DATE(f.created_at));
END;
$BODY$
LANGUAGE plpgsql VOLATILE SECURITY DEFINER
COST 1000;

COMMENT ON FUNCTION public.fx_sel_users(JSONB) IS '
OBJETIVO: Consultar registros en users con filtros opcionales JSONB.
';

DROP FUNCTION IF EXISTS public.fx_sel_users_with_credentials(JSONB);
CREATE FUNCTION public.fx_sel_users_with_credentials(JSONB)
    RETURNS TABLE (
        id          BIGINT,
        code        VARCHAR,
        names       TEXT,
        last_names  TEXT,
        birth_date  DATE,
        gender      BOOLEAN,
        email       TEXT,
        phone       TEXT,
        created_at  TIMESTAMP WITH TIME ZONE,
        company_id  BIGINT,
        user_type   BIGINT
    )
AS $BODY$
DECLARE
    p_json_data ALIAS FOR $1;
BEGIN
    RETURN QUERY
    WITH filtros AS (
        SELECT
            x.code,
            x.password
        FROM JSONB_TO_RECORDSET(COALESCE(p_json_data,'[]'::JSONB)) AS x(
            code       VARCHAR(8),
            password   TEXT
        )
    )
    SELECT
        u.id,
        u.code,
        u.names,
        u.last_names,
        u.birth_date,
        u.gender,
        u.email,
        u.phone,
        u.created_at,
        u.company_id,
        u.user_type
    FROM users u
    LEFT JOIN filtros f ON TRUE
    WHERE u.code = f.code
        AND u.password = f.password;
END;
$BODY$
LANGUAGE plpgsql VOLATILE SECURITY DEFINER
COST 1000;

COMMENT ON FUNCTION public.fx_sel_users_with_credentials(JSONB) IS '
OBJETIVO: Consultar registros en users con filtros opcionales JSONB.
';

DROP FUNCTION IF EXISTS public.fx_ins_users(JSONB);
CREATE FUNCTION public.fx_ins_users(JSONB)
    RETURNS TABLE (
        id BIGINT,
        code VARCHAR
    )
AS $BODY$
DECLARE
    p_json_data ALIAS FOR $1;
BEGIN
    DROP TABLE IF EXISTS tmp_users;
    CREATE TEMPORARY TABLE tmp_users AS
    SELECT
        x.code,
        x.password,
        x.names,
        x.last_names,
        x.birth_date,
        x.gender,
        x.email,
        x.phone,
        x.created_at,
        x.company_id,
        x.user_type
    FROM JSONB_TO_RECORDSET(p_json_data) AS x(
        code       VARCHAR(8),
        password   TEXT,
        names      TEXT,
        last_names TEXT,
        birth_date DATE,
        gender     BOOLEAN,
        email      TEXT,
        phone      TEXT,
        created_at TIMESTAMP WITH TIME ZONE,
        company_id BIGINT,
        user_type  BIGINT
    );

    RETURN QUERY
    INSERT INTO users (
        code,
        password,
        names,
        last_names,
        birth_date,
        gender,
        email,
        phone,
        created_at,
        company_id,
        user_type
    )
    SELECT
        COALESCE(UPPER(TRIM(code)), gen_random_uuid()::text), -- fallback simple unique
        password,
        INITCAP(TRIM(names)),
        INITCAP(TRIM(last_names)),
        birth_date,
        gender,
        LOWER(TRIM(email)),
        TRIM(phone),
        COALESCE(created_at, CURRENT_TIMESTAMP),
        company_id,
        user_type,
        updated_at
    FROM tmp_users
    RETURNING id, code;
END;
$BODY$
LANGUAGE plpgsql VOLATILE SECURITY DEFINER
COST 1000;

COMMENT ON FUNCTION public.fx_ins_users(JSONB) IS '
OBJETIVO: Insertar registros en users desde JSONB.
';

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
        x.id,
        x.code,
        x.password,
        x.names,
        x.last_names,
        x.birth_date,
        x.gender,
        x.email,
        x.phone,
        x.company_id,
        x.user_type,
        x.updated_at
    FROM JSONB_TO_RECORDSET(p_json_data) AS x(
        id         BIGINT,
        code       VARCHAR(8),
        password   TEXT,
        names      TEXT,
        last_names TEXT,
        birth_date DATE,
        gender     BOOLEAN,
        email      TEXT,
        phone      TEXT,
        company_id BIGINT,
        user_type  BIGINT,
        updated_at TIMESTAMP WITH TIME ZONE
    );

    UPDATE users u
    SET
        code = COALESCE(UPPER(TRIM(t.code)), u.code),
        password = COALESCE(t.password, u.password),
        names = COALESCE(INITCAP(TRIM(t.names)), u.names),
        last_names = COALESCE(INITCAP(TRIM(t.last_names)), u.last_names),
        birth_date = COALESCE(t.birth_date, u.birth_date),
        gender = COALESCE(t.gender, u.gender),
        email = COALESCE(LOWER(TRIM(t.email)), u.email),
        phone = COALESCE(TRIM(t.phone), u.phone),
        company_id = COALESCE(t.company_id, u.company_id),
        user_type = COALESCE(t.user_type, u.user_type),
        updated_at = COALESCE(t.updated_at, CURRENT_TIMESTAMP)
    FROM tmp_users_upd t
    WHERE u.id = t.id;

    RETURN TRUE;
END;
$BODY$
LANGUAGE plpgsql VOLATILE SECURITY DEFINER
COST 1000;

COMMENT ON FUNCTION public.fx_upd_users(JSONB) IS '
OBJETIVO: Actualizar registros en users (parcial desde JSONB).
';

-- ======================================================
-- FUNCIÓN: plants (SELECT / INSERT / UPDATE)
-- ======================================================
DROP FUNCTION IF EXISTS public.fx_sel_plants(JSONB);
CREATE FUNCTION public.fx_sel_plants(JSONB)
    RETURNS TABLE (
        id          BIGINT,
        company_id  BIGINT,
        code        VARCHAR,
        name        TEXT,
        address     TEXT,
        latitude    NUMERIC,
        longitude   NUMERIC,
        status      BIGINT,
        created_at  TIMESTAMP WITH TIME ZONE,
        updated_at  TIMESTAMP WITH TIME ZONE
    )
AS $BODY$
DECLARE
    p_json_data ALIAS FOR $1;
BEGIN
    RETURN QUERY
    WITH filtros AS (
        SELECT
            x.id,
            x.company_id,
            x.code,
            x.status,
            x.created_at
        FROM JSONB_TO_RECORDSET(COALESCE(p_json_data,'[]'::JSONB)) AS x(
            id         BIGINT,
            company_id BIGINT,
            code       VARCHAR(50),
            status     BIGINT,
            created_at TIMESTAMP WITH TIME ZONE
        )
    )
    SELECT
        p.id,
        p.company_id,
        p.code,
        p.name,
        p.address,
        p.latitude,
        p.longitude,
        p.status,
        p.created_at,
        p.updated_at
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
LANGUAGE plpgsql VOLATILE SECURITY DEFINER
COST 1000;

COMMENT ON FUNCTION public.fx_sel_plants(JSONB) IS '
OBJETIVO: Consultar registros en plants con filtros opcionales JSONB.
';

DROP FUNCTION IF EXISTS public.fx_ins_plants(JSONB);
CREATE FUNCTION public.fx_ins_plants(JSONB)
    RETURNS TABLE (
        id BIGINT,
        code VARCHAR
    )
AS $BODY$
DECLARE
    p_json_data ALIAS FOR $1;
BEGIN
    DROP TABLE IF EXISTS tmp_plants;
    CREATE TEMPORARY TABLE tmp_plants AS
    SELECT
        x.company_id,
        x.code,
        x.name,
        x.address,
        x.latitude,
        x.longitude,
        x.status,
        x.created_at,
        x.created_by,
        x.updated_at
    FROM JSONB_TO_RECORDSET(p_json_data) AS x(
        company_id BIGINT,
        code       VARCHAR(50),
        name       TEXT,
        address    TEXT,
        latitude   NUMERIC,
        longitude  NUMERIC,
        status     BIGINT,
        created_at TIMESTAMP WITH TIME ZONE,
        created_by BIGINT,
        updated_at TIMESTAMP WITH TIME ZONE
    );

    RETURN QUERY
    INSERT INTO plants (
        company_id,
        code,
        name,
        address,
        latitude,
        longitude,
        status,
        created_at,
        created_by,
        updated_at
    )
    SELECT
        company_id,
        UPPER(TRIM(code)),
        INITCAP(TRIM(name)),
        TRIM(address),
        latitude,
        longitude,
        status,
        COALESCE(created_at, CURRENT_TIMESTAMP),
        created_by,
        updated_at
    FROM tmp_plants
    RETURNING id, code;
END;
$BODY$
LANGUAGE plpgsql VOLATILE SECURITY DEFINER
COST 1000;

COMMENT ON FUNCTION public.fx_ins_plants(JSONB) IS '
OBJETIVO: Insertar registros en plants desde JSONB.
';

DROP FUNCTION IF EXISTS public.fx_upd_plants(JSONB);
CREATE FUNCTION public.fx_upd_plants(JSONB)
    RETURNS BOOLEAN
AS $BODY$
DECLARE
    p_json_data ALIAS FOR $1;
BEGIN
    DROP TABLE IF EXISTS tmp_plants_upd;
    CREATE TEMPORARY TABLE tmp_plants_upd AS
    SELECT
        x.id,
        x.company_id,
        x.code,
        x.name,
        x.address,
        x.latitude,
        x.longitude,
        x.status,
        x.updated_at
    FROM JSONB_TO_RECORDSET(p_json_data) AS x(
        id         BIGINT,
        company_id BIGINT,
        code       VARCHAR(50),
        name       TEXT,
        address    TEXT,
        latitude   NUMERIC,
        longitude  NUMERIC,
        status     BIGINT,
        updated_at TIMESTAMP WITH TIME ZONE
    );

    UPDATE plants p
    SET
        company_id = COALESCE(u.company_id, p.company_id),
        code = COALESCE(UPPER(TRIM(u.code)), p.code),
        name = COALESCE(INITCAP(TRIM(u.name)), p.name),
        address = COALESCE(TRIM(u.address), p.address),
        latitude = COALESCE(u.latitude, p.latitude),
        longitude = COALESCE(u.longitude, p.longitude),
        status = COALESCE(u.status, p.status),
        updated_at = COALESCE(u.updated_at, CURRENT_TIMESTAMP)
    FROM tmp_plants_upd u
    WHERE p.id = u.id;

    RETURN TRUE;
END;
$BODY$
LANGUAGE plpgsql VOLATILE SECURITY DEFINER
COST 1000;

COMMENT ON FUNCTION public.fx_upd_plants(JSONB) IS '
OBJETIVO: Actualizar registros en plants (parcial desde JSONB).
';

-- ======================================================
-- FUNCIÓN: residues (SELECT / INSERT / UPDATE)
-- ======================================================
DROP FUNCTION IF EXISTS public.fx_sel_residues(JSONB);
CREATE FUNCTION public.fx_sel_residues(JSONB)
    RETURNS TABLE (
        id          BIGINT,
        created_at  TIMESTAMP WITH TIME ZONE,
        company_id  BIGINT,
        name        VARCHAR,
        residue_type BIGINT,
        resudue_type_name VARCHAR,
        status_type 		BIGINT,
        status_type_name VARCHAR,
        unit_measurement BIGINT,
        waste_generation_date DATE,
        quantity    NUMERIC,
        status      BIGINT,
        status_name VARCHAR,
        plant_id    BIGINT,
        user_operator BIGINT
    )
AS $BODY$
DECLARE
    p_json_data ALIAS FOR $1;
BEGIN
    RETURN QUERY
    WITH filtros AS (
        SELECT
            x.id,
            x.company_id,
            x.residue_type,
            x.status_type,
            x.plant_id,
            x.status,
            x.created_at
        FROM JSONB_TO_RECORDSET(COALESCE(p_json_data,'[]'::JSONB)) AS x(
            id           BIGINT,
            company_id   BIGINT,
            residue_type BIGINT,
            status_type  BIGINT,
            unit_measurement BIGINT,
            plant_id     BIGINT,
            status       BIGINT,
            created_at   TIMESTAMP WITH TIME ZONE
        )
    )
    SELECT
        r.id,
        r.created_at,
        r.company_id,
        r.name,
        r.residue_type,
		rt.name::VARCHAR,
        r.status_type,
		rs.name::VARCHAR,
        r.unit_measurement,
        r.waste_generation_date,
        r.quantity,
        r.status,
		s.name::VARCHAR,
        r.plant_id,
        r.user_operator
    FROM residues r
	INNER JOIN types as rs
		ON r.status_type = rs.id
		AND rs.category = 'residue_status_type'
	INNER JOIN types as rt
		ON r.residue_type = rt.id
		AND rt.category = 'residue_type'
	INNER JOIN types as s
		ON r.status = s.id
		AND s.category = 'main_status'
    LEFT JOIN filtros f ON TRUE
    WHERE
        (f.id IS NULL OR r.id = f.id)
        AND (f.company_id IS NULL OR r.company_id = f.company_id)
        AND (f.residue_type IS NULL OR rt.name ilike '%'||f.residue_type||'%')
        AND (f.status_type IS NULL OR rs.name ilike '%'||f.status_type||'%')
        AND (f.unit_measurement IS NULL OR r.unit_measurement = f.unit_measurement)
        AND (f.plant_id IS NULL OR r.plant_id = f.plant_id)
        AND (f.status IS NULL OR r.status = f.status)
        AND (f.created_at IS NULL OR DATE(r.created_at) = DATE(f.created_at));
END;
$BODY$
LANGUAGE plpgsql VOLATILE SECURITY DEFINER
COST 1000;

COMMENT ON FUNCTION public.fx_sel_residues(JSONB) IS '
OBJETIVO: Consultar registros en residues con filtros opcionales JSONB.
';

DROP FUNCTION IF EXISTS public.fx_ins_residues(JSONB);
CREATE FUNCTION public.fx_ins_residues(JSONB)
    RETURNS BOOLEAN
AS $BODY$
DECLARE
    p_json_data ALIAS FOR $1;
BEGIN
    DROP TABLE IF EXISTS tmp_residues;
    CREATE TEMPORARY TABLE tmp_residues AS
    SELECT
        x.company_id,
        x.name,
        x.residue_type,
        x.status_type,
        x.unit_measurement,
        x.waste_generation_date,
        x.quantity,
        x.status,
        x.plant_id,
        x.user_operator,
        x.created_at,
        x.created_by,
        x.updated_at
    FROM JSONB_TO_RECORDSET(p_json_data) AS x(
        company_id   BIGINT,
        name         VARCHAR(500),
        residue_type BIGINT,
        status_type  BIGINT,
        unit_measurement BIGINT,
        waste_generation_date DATE,
        quantity     NUMERIC,
        status       BIGINT,
        plant_id     BIGINT,
        user_operator BIGINT,
        created_at   TIMESTAMP WITH TIME ZONE,
        created_by   BIGINT,
        updated_at   TIMESTAMP WITH TIME ZONE
    );

    INSERT INTO residues (
        company_id,
        name,
        residue_type,
        status_type,
        unit_measurement,
        waste_generation_date,
        quantity,
        status,
        plant_id,
        user_operator,
        created_at,
        created_by,
        updated_at
    )
    SELECT
        company_id,
        INITCAP(TRIM(name)),
        residue_type,
        status_type,
        unit_measurement,
        waste_generation_date,
        quantity,
        COALESCE(status, (SELECT id FROM types WHERE category IS NOT NULL LIMIT 1)), -- fallback
        plant_id,
        user_operator,
        COALESCE(created_at, CURRENT_TIMESTAMP),
        created_by,
        updated_at
    FROM tmp_residues;

    RETURN TRUE;
END;
$BODY$
LANGUAGE plpgsql VOLATILE SECURITY DEFINER
COST 1000;

COMMENT ON FUNCTION public.fx_ins_residues(JSONB) IS '
OBJETIVO: Insertar registros en residues desde JSONB.
';

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
        x.id,
        x.company_id,
        x.name,
        x.residue_type,
        x.status_type,
        x.unit_measurement,
        x.waste_generation_date,
        x.quantity,
        x.status,
        x.plant_id,
        x.user_operator,
        x.updated_at
    FROM JSONB_TO_RECORDSET(p_json_data) AS x(
        id           BIGINT,
        company_id   BIGINT,
        name         VARCHAR(500),
        residue_type BIGINT,
        status_type  BIGINT,
        unit_measurement BIGINT,
        waste_generation_date DATE,
        quantity     NUMERIC,
        status       BIGINT,
        plant_id     BIGINT,
        user_operator BIGINT,
        updated_at   TIMESTAMP WITH TIME ZONE
    );

    UPDATE residues r
    SET
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
        updated_at = COALESCE(u.updated_at, CURRENT_TIMESTAMP)
    FROM tmp_residues_upd u
    WHERE r.id = u.id;

    RETURN TRUE;
END;
$BODY$
LANGUAGE plpgsql VOLATILE SECURITY DEFINER
COST 1000;

COMMENT ON FUNCTION public.fx_upd_residues(JSONB) IS '
OBJETIVO: Actualizar registros en residues (parcial desde JSONB).
';

-- ======================================================
-- FUNCIÓN: operations_detail (SELECT / INSERT / UPDATE)
-- ======================================================
DROP FUNCTION IF EXISTS public.fx_sel_operations_detail(JSONB);
CREATE FUNCTION public.fx_sel_operations_detail(JSONB)
    RETURNS TABLE (
        id          BIGINT,
        created_at  TIMESTAMP WITH TIME ZONE,
        residue_id  BIGINT,
        previous_status BIGINT,
        current_status  BIGINT,
        obs         TEXT,
        company_id  BIGINT,
        plant_id    BIGINT,
        updated_at  TIMESTAMP WITH TIME ZONE
    )
AS $BODY$
DECLARE
    p_json_data ALIAS FOR $1;
BEGIN
    RETURN QUERY
    WITH filtros AS (
        SELECT
            x.id,
            x.residue_id,
            x.previous_status,
            x.current_status,
            x.company_id,
            x.plant_id,
            x.created_at
        FROM JSONB_TO_RECORDSET(COALESCE(p_json_data,'[]'::JSONB)) AS x(
            id              BIGINT,
            residue_id      BIGINT,
            previous_status BIGINT,
            current_status  BIGINT,
            company_id      BIGINT,
            plant_id        BIGINT,
            created_at      TIMESTAMP WITH TIME ZONE
        )
    )
    SELECT
        o.id,
        o.created_at,
        o.residue_id,
        o.previous_status,
        o.current_status,
        o.obs,
        o.company_id,
        o.plant_id,
        o.updated_at
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
LANGUAGE plpgsql VOLATILE SECURITY DEFINER
COST 1000;

COMMENT ON FUNCTION public.fx_sel_operations_detail(JSONB) IS '
OBJETIVO: Consultar registros en operations_detail con filtros opcionales JSONB.
';

DROP FUNCTION IF EXISTS public.fx_ins_operations_detail(JSONB);
CREATE FUNCTION public.fx_ins_operations_detail(JSONB)
    RETURNS BOOLEAN
AS $BODY$
DECLARE
    p_json_data ALIAS FOR $1;
BEGIN
    DROP TABLE IF EXISTS tmp_operations_detail;
    CREATE TEMPORARY TABLE tmp_operations_detail AS
    SELECT
        x.residue_id,
        x.previous_status,
        x.current_status,
        x.obs,
        x.company_id,
        x.plant_id,
        x.created_at,
        x.created_by,
        x.updated_at
    FROM JSONB_TO_RECORDSET(p_json_data) AS x(
        residue_id      BIGINT,
        previous_status BIGINT,
        current_status  BIGINT,
        obs             TEXT,
        company_id      BIGINT,
        plant_id        BIGINT,
        created_at      TIMESTAMP WITH TIME ZONE,
        created_by      BIGINT,
        updated_at      TIMESTAMP WITH TIME ZONE
    );

    INSERT INTO operations_detail (
        residue_id,
        previous_status,
        current_status,
        obs,
        company_id,
        plant_id,
        created_at,
        created_by,
        updated_at
    )
    SELECT
        residue_id,
        previous_status,
        current_status,
        TRIM(obs),
        company_id,
        plant_id,
        COALESCE(created_at, CURRENT_TIMESTAMP),
        created_by,
        updated_at
    FROM tmp_operations_detail;

    RETURN TRUE;
END;
$BODY$
LANGUAGE plpgsql VOLATILE SECURITY DEFINER
COST 1000;

COMMENT ON FUNCTION public.fx_ins_operations_detail(JSONB) IS '
OBJETIVO: Insertar registros en operations_detail desde JSONB.
';

DROP FUNCTION IF EXISTS public.fx_upd_operations_detail(JSONB);
CREATE FUNCTION public.fx_upd_operations_detail(JSONB)
    RETURNS BOOLEAN
AS $BODY$
DECLARE
    p_json_data ALIAS FOR $1;
BEGIN
    DROP TABLE IF EXISTS tmp_operations_detail_upd;
    CREATE TEMPORARY TABLE tmp_operations_detail_upd AS
    SELECT
        x.id,
        x.residue_id,
        x.previous_status,
        x.current_status,
        x.obs,
        x.company_id,
        x.plant_id,
        x.updated_at
    FROM JSONB_TO_RECORDSET(p_json_data) AS x(
        id              BIGINT,
        residue_id      BIGINT,
        previous_status BIGINT,
        current_status  BIGINT,
        obs             TEXT,
        company_id      BIGINT,
        plant_id        BIGINT,
        updated_at      TIMESTAMP WITH TIME ZONE
    );

    UPDATE operations_detail o
    SET
        residue_id = COALESCE(u.residue_id, o.residue_id),
        previous_status = COALESCE(u.previous_status, o.previous_status),
        current_status = COALESCE(u.current_status, o.current_status),
        obs = COALESCE(TRIM(u.obs), o.obs),
        company_id = COALESCE(u.company_id, o.company_id),
        plant_id = COALESCE(u.plant_id, o.plant_id),
        updated_at = COALESCE(u.updated_at, CURRENT_TIMESTAMP)
    FROM tmp_operations_detail_upd u
    WHERE o.id = u.id;

    RETURN TRUE;
END;
$BODY$
LANGUAGE plpgsql VOLATILE SECURITY DEFINER
COST 1000;

COMMENT ON FUNCTION public.fx_upd_operations_detail(JSONB) IS '
OBJETIVO: Actualizar registros en operations_detail (parcial desde JSONB).
';
