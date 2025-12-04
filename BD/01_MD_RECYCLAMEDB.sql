-- ======================================================
-- RECYCLAME DATABASE - MODELO DE DATOS
-- Archivo: 01_MD_RECYCLAMEDB.sql
-- Descripción: Creación de tablas y estructura
-- ======================================================

-- Eliminar tablas en orden de dependencias
DROP TABLE IF EXISTS operations_detail CASCADE;
DROP TABLE IF EXISTS residues CASCADE;
DROP TABLE IF EXISTS plants CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS companies CASCADE;
DROP TABLE IF EXISTS types CASCADE;

-- ======================================================
-- TABLA: types (Catálogo maestro de tipos)
-- ======================================================
CREATE TABLE public.types (
  id BIGINT GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE,
  category VARCHAR(250),
  abbr VARCHAR(50),
  name VARCHAR(500),
  description TEXT,
  additional_fields JSONB,
  order_col BIGINT,
  CONSTRAINT types_pkey PRIMARY KEY (id),
  CONSTRAINT types_category_abbr_unique UNIQUE (category, abbr)
);

COMMENT ON TABLE public.types IS 'Catálogo maestro de tipos para: user_type, company_type, residue_type, etc.';

-- ======================================================
-- TABLA: companies (Empresas)
-- ======================================================
CREATE TABLE public.companies (
  id BIGINT GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE,
  code VARCHAR(25),
  name TEXT,
  address TEXT,
  email TEXT,
  phone TEXT,
  company_type BIGINT,
  is_active BOOLEAN DEFAULT TRUE,
  CONSTRAINT companies_pkey PRIMARY KEY (id),
  CONSTRAINT companies_code_unique UNIQUE (code),
  CONSTRAINT companies_company_type_fkey FOREIGN KEY (company_type) REFERENCES public.types(id)
);

COMMENT ON TABLE public.companies IS 'Empresas registradas en el sistema (Generadores y Operadores)';

-- ======================================================
-- TABLA: users (Usuarios)
-- ======================================================
CREATE TABLE public.users (
  id BIGINT GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE,
  code VARCHAR(8),
  password TEXT,
  names TEXT,
  last_names TEXT,
  birth_date DATE,
  gender BOOLEAN,
  email TEXT,
  phone TEXT,
  company_id BIGINT,
  user_type BIGINT,
  is_primary BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  status BIGINT DEFAULT 1,
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_code_unique UNIQUE (code),
  CONSTRAINT users_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id),
  CONSTRAINT users_user_type_fkey FOREIGN KEY (user_type) REFERENCES public.types(id)
);

COMMENT ON TABLE public.users IS 'Usuarios del sistema: ADM (Admin), PRI (Principal de empresa), SEC (Secundario)';
COMMENT ON COLUMN public.users.is_primary IS 'TRUE si es el usuario principal/representante de la empresa';

-- ======================================================
-- TABLA: plants (Plantas de procesamiento)
-- ======================================================
CREATE TABLE public.plants (
  id BIGINT GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE,
  company_id BIGINT,
  code VARCHAR(50),
  name TEXT,
  address TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  status BIGINT,
  created_by BIGINT,
  CONSTRAINT plants_pkey PRIMARY KEY (id),
  CONSTRAINT plants_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id),
  CONSTRAINT plants_status_fkey FOREIGN KEY (status) REFERENCES public.types(id)
);

COMMENT ON TABLE public.plants IS 'Plantas de procesamiento de residuos';

-- ======================================================
-- TABLA: residues (Residuos)
-- ======================================================
CREATE TABLE public.residues (
  id BIGINT GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE,
  company_id BIGINT,
  name VARCHAR(500),
  residue_type BIGINT,
  status_type BIGINT,
  unit_measurement BIGINT,
  waste_generation_date DATE,
  quantity NUMERIC,
  status BIGINT,
  plant_id BIGINT,
  user_operator BIGINT,
  created_by BIGINT,
  CONSTRAINT residues_pkey PRIMARY KEY (id),
  CONSTRAINT residues_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id),
  CONSTRAINT residues_residue_type_fkey FOREIGN KEY (residue_type) REFERENCES public.types(id),
  CONSTRAINT residues_status_type_fkey FOREIGN KEY (status_type) REFERENCES public.types(id),
  CONSTRAINT residues_unit_measurement_fkey FOREIGN KEY (unit_measurement) REFERENCES public.types(id),
  CONSTRAINT residues_status_fkey FOREIGN KEY (status) REFERENCES public.types(id),
  CONSTRAINT residues_plant_id_fkey FOREIGN KEY (plant_id) REFERENCES public.plants(id),
  CONSTRAINT residues_user_operator_fkey FOREIGN KEY (user_operator) REFERENCES public.users(id)
);

COMMENT ON TABLE public.residues IS 'Registro de residuos generados';

-- ======================================================
-- TABLA: operations_detail (Detalle de operaciones)
-- ======================================================
CREATE TABLE public.operations_detail (
  id BIGINT GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE,
  residue_id BIGINT,
  previous_status BIGINT,
  current_status BIGINT,
  obs TEXT,
  company_id BIGINT,
  plant_id BIGINT,
  created_by BIGINT,
  CONSTRAINT operations_detail_pkey PRIMARY KEY (id),
  CONSTRAINT operations_detail_residue_id_fkey FOREIGN KEY (residue_id) REFERENCES public.residues(id),
  CONSTRAINT operations_detail_previous_status_fkey FOREIGN KEY (previous_status) REFERENCES public.types(id),
  CONSTRAINT operations_detail_current_status_fkey FOREIGN KEY (current_status) REFERENCES public.types(id),
  CONSTRAINT operations_detail_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id),
  CONSTRAINT operations_detail_plant_id_fkey FOREIGN KEY (plant_id) REFERENCES public.plants(id)
);

COMMENT ON TABLE public.operations_detail IS 'Historial de operaciones sobre residuos';

-- ======================================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- ======================================================
CREATE INDEX idx_types_category ON public.types(category);
CREATE INDEX idx_companies_company_type ON public.companies(company_type);
CREATE INDEX idx_users_company_id ON public.users(company_id);
CREATE INDEX idx_users_user_type ON public.users(user_type);
CREATE INDEX idx_users_is_primary ON public.users(is_primary);
CREATE INDEX idx_plants_company_id ON public.plants(company_id);
CREATE INDEX idx_residues_company_id ON public.residues(company_id);
CREATE INDEX idx_operations_detail_company_id ON public.operations_detail(company_id);

