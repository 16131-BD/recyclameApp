-- ======================================================
-- RECYCLAME DATABASE - DATOS INICIALES
-- Archivo: 03_DATA_RECYCLAMEDB.sql
-- Descripción: Datos maestros y seed de prueba
-- ======================================================

-- ======================================================
-- 1. TIPOS DE USUARIO (user_type)
-- ======================================================
INSERT INTO public.types (category, abbr, name, description, order_col)
VALUES
    ('user_type', 'ADM', 'Administrador', 'Administrador del sistema con acceso total', 1),
    ('user_type', 'PRI', 'Principal', 'Usuario principal de una empresa (1 por empresa)', 2),
    ('user_type', 'SEC', 'Secundario', 'Usuario secundario de una empresa con permisos limitados', 3)
ON CONFLICT (category, abbr) DO UPDATE 
SET name = EXCLUDED.name, description = EXCLUDED.description, order_col = EXCLUDED.order_col;

-- ======================================================
-- 2. TIPOS DE EMPRESA (company_type)
-- ======================================================
INSERT INTO public.types (category, abbr, name, description, additional_fields, order_col)
VALUES
    ('company_type', 'GEN', 'Generador', 
     'Empresa generadora de residuos sólidos que debe declararlos en el sistema.',
     '{"requires_plan": true}', 1),
    ('company_type', 'OPE', 'Operador', 
     'Empresa operadora de residuos sólidos que realiza operaciones de manejo.',
     '{"needs_infra": true}', 2)
ON CONFLICT (category, abbr) DO UPDATE 
SET name = EXCLUDED.name, description = EXCLUDED.description, order_col = EXCLUDED.order_col;

-- ======================================================
-- 3. TIPOS DE RESIDUO (residue_type)
-- ======================================================
INSERT INTO public.types (category, abbr, name, description, order_col)
VALUES
    ('residue_type', 'PLA', 'Plástico', 'Residuos de tipo plástico', 1),
    ('residue_type', 'PAP', 'Papel', 'Residuos de tipo papel', 2),
    ('residue_type', 'MET', 'Metal', 'Residuos metálicos', 3),
    ('residue_type', 'ORG', 'Orgánico', 'Residuos biodegradables', 4),
    ('residue_type', 'VID', 'Vidrio', 'Residuos de vidrio', 5),
    ('residue_type', 'ELE', 'Electrónico', 'Residuos de aparatos electrónicos', 6),
    ('residue_type', 'PEL', 'Peligroso', 'Residuos peligrosos', 7),
    ('residue_type', 'OTR', 'Otros', 'Otros tipos de residuos', 8)
ON CONFLICT (category, abbr) DO UPDATE 
SET name = EXCLUDED.name, description = EXCLUDED.description, order_col = EXCLUDED.order_col;

-- ======================================================
-- 4. ESTADOS DE RESIDUO (residue_status_type)
-- ======================================================
INSERT INTO public.types (category, abbr, name, description, order_col)
VALUES
    ('residue_status_type', 'S', 'Sólido', 'Estado del Residuo - Sólido', 1),
    ('residue_status_type', 'SS', 'Semi Sólido', 'Estado del Residuo - Semi Sólido', 2),
    ('residue_status_type', 'L', 'Líquido', 'Estado del Residuo - Líquido', 3),
    ('residue_status_type', 'G', 'Gaseoso', 'Estado del Residuo - Gaseoso', 4)
ON CONFLICT (category, abbr) DO UPDATE 
SET name = EXCLUDED.name, description = EXCLUDED.description, order_col = EXCLUDED.order_col;

-- ======================================================
-- 5. ESTADOS PRINCIPALES (main_status)
-- ======================================================
INSERT INTO public.types (category, abbr, name, description, order_col)
VALUES
    ('main_status', 'ACT', 'Activo', 'Elemento en funcionamiento', 1),
    ('main_status', 'INA', 'Inactivo', 'Elemento fuera de servicio', 2)
ON CONFLICT (category, abbr) DO UPDATE 
SET name = EXCLUDED.name, description = EXCLUDED.description, order_col = EXCLUDED.order_col;

-- ======================================================
-- 6. ESTADOS DE RESIDUO EN PROCESO (residue_status)
-- ======================================================
INSERT INTO public.types (category, abbr, name, description, order_col)
VALUES
    ('residue_status', 'PEN', 'Pendiente', 'A la espera de procesamiento', 1),
    ('residue_status', 'PRO', 'Procesado', 'Residuo procesado correctamente', 2),
    ('residue_status', 'TRA', 'En tránsito', 'Residuo en traslado', 3),
    ('residue_status', 'DES', 'Desechado', 'Residuo eliminado', 4)
ON CONFLICT (category, abbr) DO UPDATE 
SET name = EXCLUDED.name, description = EXCLUDED.description, order_col = EXCLUDED.order_col;

-- ======================================================
-- 7. ESTADOS DE PLANTA (plant_status)
-- ======================================================
INSERT INTO public.types (category, abbr, name, description, order_col)
VALUES
    ('plant_status', 'OPE', 'Operativa', 'Planta activa', 1),
    ('plant_status', 'MNT', 'Mantenimiento', 'Planta en mantenimiento', 2),
    ('plant_status', 'CER', 'Cerrada', 'Planta fuera de servicio', 3)
ON CONFLICT (category, abbr) DO UPDATE 
SET name = EXCLUDED.name, description = EXCLUDED.description, order_col = EXCLUDED.order_col;

-- ======================================================
-- 8. UNIDADES DE MEDIDA (unit_measurement)
-- ======================================================
INSERT INTO public.types (category, abbr, name, description, order_col)
VALUES
    ('unit_measurement', 'KG', 'Kilogramos', 'Unidad de peso en kilogramos', 1),
    ('unit_measurement', 'TN', 'Toneladas', 'Unidad de peso en toneladas', 2),
    ('unit_measurement', 'LT', 'Litros', 'Unidad de volumen en litros', 3),
    ('unit_measurement', 'M3', 'Metros cúbicos', 'Unidad de volumen en metros cúbicos', 4),
    ('unit_measurement', 'UN', 'Unidades', 'Cantidad en unidades', 5)
ON CONFLICT (category, abbr) DO UPDATE 
SET name = EXCLUDED.name, description = EXCLUDED.description, order_col = EXCLUDED.order_col;

-- ======================================================
-- 9. EMPRESAS DE PRUEBA (companies)
-- ======================================================
-- Obtener IDs de tipos de empresa
DO $$
DECLARE
    v_gen_id BIGINT;
    v_ope_id BIGINT;
BEGIN
    SELECT id INTO v_gen_id FROM types WHERE category = 'company_type' AND abbr = 'GEN' LIMIT 1;
    SELECT id INTO v_ope_id FROM types WHERE category = 'company_type' AND abbr = 'OPE' LIMIT 1;
    
    -- Insertar empresas generadoras
    INSERT INTO companies (code, name, address, email, phone, company_type) VALUES
    ('CG001', 'EcoGestión SAC', 'Av. Los Olivos 345, Lima', 'contacto@ecogestion.pe', '013456789', v_gen_id),
    ('CG002', 'Residuos Perú SRL', 'Jr. Libertad 221, Arequipa', 'info@residuosperu.com', '054234567', v_gen_id),
    ('CG003', 'BioRecolectores EIRL', 'Mz B Lt 14, Trujillo', 'ventas@biorecolectores.com', '044123456', v_gen_id),
    ('CG004', 'ReciAndes SAC', 'Calle Los Laureles 909, Huancayo', 'contacto@reciandes.pe', '064552211', v_gen_id),
    ('CG005', 'EcoIndustria SAC', 'Av. Los Álamos 345, Lima', 'contacto@ecoindustria.pe', '987654321', v_gen_id),
    ('CG006', 'Metales del Sur', 'Av. Pachacútec 999, Tacna', 'contacto@metalesur.pe', '945678901', v_gen_id),
    ('CG007', 'EcoAndes SAC', 'Av. Arequipa 1234, Lima', 'contacto@ecoandes.pe', '987111333', v_gen_id),
    ('CG008', 'Metales Perú SAC', 'Av. República 300, Lima', 'info@metalesperu.pe', '986555666', v_gen_id)
    ON CONFLICT (code) DO NOTHING;
    
    -- Insertar empresas operadoras
    INSERT INTO companies (code, name, address, email, phone, company_type) VALUES
    ('OP001', 'GreenCycle Operadores SAC', 'Av. Industrial 890, Callao', 'operaciones@greencycle.pe', '015678234', v_ope_id),
    ('OP002', 'Soluciones Ambientales del Sur', 'Av. Circunvalación 543, Cusco', 'ambiental@sasur.pe', '084893223', v_ope_id),
    ('OP003', 'Operadora EcoGlobal SAC', 'Av. Elmer Faucett 800, Callao', 'info@ecoglobal.pe', '015667889', v_ope_id),
    ('TR001', 'LimpioTrans SAC', 'Carretera Central Km 12.5, Lima', 'soporte@limpiotrans.pe', '016789234', v_ope_id),
    ('TR002', 'EcoTransportes Andinos SAC', 'Av. Túpac Amaru 2340, Lima Norte', 'admin@ecotransandinos.pe', '017456321', v_ope_id),
    ('PT001', 'Planta Verde SAC', 'Zona Industrial 4, Chiclayo', 'planta@plantaverde.pe', '074223344', v_ope_id)
    ON CONFLICT (code) DO NOTHING;
END $$;

-- ======================================================
-- 10. USUARIOS DE PRUEBA (users)
-- ======================================================
DO $$
DECLARE
    v_pri_id BIGINT;
    v_sec_id BIGINT;
    v_adm_id BIGINT;
    v_company_id BIGINT;
BEGIN
    SELECT id INTO v_adm_id FROM types WHERE category = 'user_type' AND abbr = 'ADM' LIMIT 1;
    SELECT id INTO v_pri_id FROM types WHERE category = 'user_type' AND abbr = 'PRI' LIMIT 1;
    SELECT id INTO v_sec_id FROM types WHERE category = 'user_type' AND abbr = 'SEC' LIMIT 1;
    
    -- Usuario administrador del sistema (sin empresa)
    INSERT INTO users (code, password, names, last_names, email, phone, company_id, user_type, is_primary, is_active)
    VALUES ('U001', '1234', 'Admin', 'Sistema', 'admin@recyclame.pe', '999000001', NULL, v_adm_id, FALSE, TRUE)
    ON CONFLICT (code) DO NOTHING;
    
    -- Crear usuarios principales para cada empresa
    FOR v_company_id IN SELECT id FROM companies ORDER BY id LIMIT 14 LOOP
        INSERT INTO users (code, password, names, last_names, email, phone, company_id, user_type, is_primary, is_active)
        SELECT 
            'U' || LPAD((v_company_id + 1)::TEXT, 3, '0'),
            '1234',
            CASE (v_company_id % 5)
                WHEN 0 THEN 'Carlos'
                WHEN 1 THEN 'María'
                WHEN 2 THEN 'Jorge'
                WHEN 3 THEN 'Ana'
                ELSE 'Luis'
            END,
            CASE (v_company_id % 4)
                WHEN 0 THEN 'García'
                WHEN 1 THEN 'López'
                WHEN 2 THEN 'Martínez'
                ELSE 'Rodríguez'
            END,
            'usuario' || v_company_id || '@empresa.pe',
            '99900' || LPAD(v_company_id::TEXT, 4, '0'),
            v_company_id,
            v_pri_id,
            TRUE,
            TRUE
        ON CONFLICT (code) DO NOTHING;
    END LOOP;
    
    -- Crear algunos usuarios secundarios
    INSERT INTO users (code, password, names, last_names, email, phone, company_id, user_type, is_primary, is_active)
    VALUES 
        ('U020', '1234', 'Pedro', 'Sánchez', 'pedro@empresa1.pe', '999020020', 1, v_sec_id, FALSE, TRUE),
        ('U021', '1234', 'Laura', 'Torres', 'laura@empresa1.pe', '999021021', 1, v_sec_id, FALSE, TRUE),
        ('U022', '1234', 'Diego', 'Ramírez', 'diego@empresa2.pe', '999022022', 2, v_sec_id, FALSE, TRUE),
        ('U023', '1234', 'Sofía', 'Mendoza', 'sofia@empresa3.pe', '999023023', 3, v_sec_id, FALSE, TRUE)
    ON CONFLICT (code) DO NOTHING;
END $$;

-- ======================================================
-- 11. PLANTAS DE PRUEBA (plants)
-- ======================================================
DO $$
DECLARE
    v_plant_status BIGINT;
BEGIN
    SELECT id INTO v_plant_status FROM types WHERE category = 'plant_status' AND abbr = 'OPE' LIMIT 1;
    
    INSERT INTO plants (company_id, code, name, address, latitude, longitude, status)
    SELECT 
        c.id,
        'P' || LPAD(c.id::TEXT, 3, '0'),
        'Planta ' || c.name,
        c.address,
        -12.0464 + (RANDOM() * 5),
        -77.0428 + (RANDOM() * 5),
        v_plant_status
    FROM companies c
    WHERE c.company_type = (SELECT id FROM types WHERE category = 'company_type' AND abbr = 'OPE' LIMIT 1)
    ON CONFLICT DO NOTHING;
END $$;

-- ======================================================
-- 12. VERIFICACIÓN FINAL
-- ======================================================
DO $$
DECLARE
    v_types INT;
    v_companies INT;
    v_users INT;
    v_plants INT;
BEGIN
    SELECT COUNT(*) INTO v_types FROM types;
    SELECT COUNT(*) INTO v_companies FROM companies;
    SELECT COUNT(*) INTO v_users FROM users;
    SELECT COUNT(*) INTO v_plants FROM plants;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'DATOS INICIALES CARGADOS:';
    RAISE NOTICE '- Tipos (types): %', v_types;
    RAISE NOTICE '- Empresas (companies): %', v_companies;
    RAISE NOTICE '- Usuarios (users): %', v_users;
    RAISE NOTICE '- Plantas (plants): %', v_plants;
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Usuario Admin: U001 / 1234';
    RAISE NOTICE 'Usuarios Principales: U002-U015 / 1234';
    RAISE NOTICE 'Usuarios Secundarios: U020-U023 / 1234';
    RAISE NOTICE '========================================';
END $$;
