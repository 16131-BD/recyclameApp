CREATE TABLE public.types (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  category character varying DEFAULT '250'::character varying,
  abbr character varying DEFAULT '50'::character varying,
  name character varying DEFAULT '500'::character varying,
  description text,
  additional_fields jsonb,
  order_col bigint,
  CONSTRAINT types_pkey PRIMARY KEY (id)
);

CREATE TABLE public.companies (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  name text,
  address text,
  email text,
  phone text,
  code character varying DEFAULT '25'::character varying,
  company_type bigint,
  CONSTRAINT companies_pkey PRIMARY KEY (id),
  CONSTRAINT companies_company_type_fkey FOREIGN KEY (company_type) REFERENCES public.types(id)
);

CREATE TABLE public.users (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  code character varying DEFAULT '8'::character varying,
  password text,
  names text,
  last_names text,
  birth_date date,
  gender boolean,
  email text,
  phone text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  company_id bigint,
  user_type bigint,
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id),
  CONSTRAINT users_user_type_fkey FOREIGN KEY (user_type) REFERENCES public.types(id)
);

CREATE TABLE public.plants (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  company_id bigint,
  code character varying DEFAULT '50'::character varying,
  name text,
  address text,
  latitude numeric,
  longitude numeric,
  status bigint,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT plants_pkey PRIMARY KEY (id),
  CONSTRAINT plants_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id),
  CONSTRAINT plants_status_fkey FOREIGN KEY (status) REFERENCES public.types(id)
);

CREATE TABLE public.residues (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  company_id bigint,
  name character varying DEFAULT '500'::character varying,
  residue_type bigint,
  quantity numeric,
  status bigint,
  plant_id bigint,
  user_operator bigint,
  CONSTRAINT residues_pkey PRIMARY KEY (id),
  CONSTRAINT residues_residue_type_fkey FOREIGN KEY (residue_type) REFERENCES public.types(id),
  CONSTRAINT residues_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id),
  CONSTRAINT residues_status_fkey FOREIGN KEY (status) REFERENCES public.types(id),
  CONSTRAINT residues_plant_id_fkey FOREIGN KEY (plant_id) REFERENCES public.plants(id),
  CONSTRAINT residues_user_operator_fkey FOREIGN KEY (user_operator) REFERENCES public.users(id)
);

CREATE TABLE public.operations_detail (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  residue_id bigint,
  previous_status bigint,
  current_status bigint,
  obs text,
  company_id bigint,
  plant_id bigint,
  CONSTRAINT operations_detail_pkey PRIMARY KEY (id),
  CONSTRAINT operations_detail_previous_status_fkey FOREIGN KEY (previous_status) REFERENCES public.types(id),
  CONSTRAINT operations_detail_current_status_fkey FOREIGN KEY (current_status) REFERENCES public.types(id),
  CONSTRAINT operations_detail_residue_id_fkey FOREIGN KEY (residue_id) REFERENCES public.residues(id),
  CONSTRAINT operations_detail_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id),
  CONSTRAINT operations_detail_plant_id_fkey FOREIGN KEY (plant_id) REFERENCES public.plants(id)
);



