--  Poblamiento de la base de datos

\c recyclameDB;

-- Tabla: types
INSERT INTO public.types (category, abbr, name, description, order_col) VALUES
('company_type', 'IND', 'Industria', 'Empresa dedicada a la manufactura industrial', 1),
('company_type', 'COM', 'Comercial', 'Empresa dedicada al comercio de bienes', 2),
('company_type', 'REC', 'Recicladora', 'Empresa especializada en reciclaje', 3),
('user_type', 'ADM', 'Administrador', 'Usuario con privilegios administrativos', 4),
('user_type', 'OPE', 'Operador', 'Usuario encargado de la gestión operativa', 5),
('user_type', 'SUP', 'Supervisor', 'Encargado de supervisar procesos', 6),
('residue_type', 'PLA', 'Plástico', 'Residuos de tipo plástico', 7),
('residue_type', 'PAP', 'Papel', 'Residuos de tipo papel', 8),
('residue_type', 'MET', 'Metal', 'Residuos metálicos', 9),
('residue_type', 'ORG', 'Orgánico', 'Residuos biodegradables', 10),
('status', 'ACT', 'Activo', 'Elemento en funcionamiento', 11),
('status', 'INA', 'Inactivo', 'Elemento fuera de servicio', 12),
('status', 'PEN', 'Pendiente', 'A la espera de procesamiento', 13),
('status', 'PRO', 'Procesado', 'Residuo procesado correctamente', 14),
('status', 'TRA', 'En tránsito', 'Residuo en traslado', 15),
('status', 'DES', 'Desechado', 'Residuo eliminado', 16),
('plant_status', 'OPE', 'Operativa', 'Planta activa', 17),
('plant_status', 'MNT', 'Mantenimiento', 'Planta en mantenimiento', 18),
('plant_status', 'CER', 'Cerrada', 'Planta fuera de servicio', 19),
('misc', 'GEN', 'General', 'Tipo general', 20);

-- Tabla: companies
INSERT INTO public.companies (name, address, email, phone, code, company_type)
VALUES
('EcoIndustria SAC', 'Av. Los Álamos 345, Lima', 'contacto@ecoindustria.pe', '987654321', 'ECO001', 1),
('ReciclaPlus SRL', 'Calle Verde 221, Arequipa', 'info@reciclaplus.pe', '912345678', 'REC002', 3),
('Comercial Andina', 'Jr. Grau 789, Cusco', 'ventas@andina.pe', '923456789', 'COM003', 2),
('BioRecicla Perú', 'Av. Primavera 120, Trujillo', 'biorecicla@peru.pe', '934567890', 'BIO004', 3),
('Metales del Sur', 'Av. Pachacútec 999, Tacna', 'contacto@metalesur.pe', '945678901', 'MET005', 1);

-- Tabla: users
INSERT INTO public.users (code, password, names, last_names, birth_date, gender, email, phone, company_id, user_type)
VALUES
('U001', '1234', 'Juan', 'Perez', '1990-05-12', TRUE, 'juan@ecoindustria.pe', '999111222', 1, 4),
('U002', 'abcd', 'María', 'Gonzales', '1992-03-08', FALSE, 'maria@ecoindustria.pe', '999333444', 1, 5),
('U003', 'xyz1', 'Pedro', 'Rojas', '1985-09-10', TRUE, 'pedro@reciclaplus.pe', '988111000', 2, 4),
('U004', 'opq9', 'Lucía', 'Ramírez', '1995-11-30', FALSE, 'lucia@reciclaplus.pe', '988222111', 2, 6),
('U005', '789a', 'Carlos', 'Huamán', '1988-07-21', TRUE, 'carlos@andina.pe', '987111333', 3, 5),
('U006', '741x', 'Sandra', 'Chavez', '1994-04-18', FALSE, 'sandra@biorecicla.pe', '999444555', 4, 5),
('U007', 'p4ss', 'Miguel', 'Quispe', '1983-10-22', TRUE, 'miguel@metalesur.pe', '988555666', 5, 4),
('U008', 'zxc1', 'Elena', 'Flores', '1990-12-25', FALSE, 'elena@metalesur.pe', '988777999', 5, 5);

-- Tabla: plants
INSERT INTO public.plants (company_id, code, name, address, latitude, longitude, status)
VALUES
(1, 'PLT001', 'Planta Central Lima', 'Av. Industrial 500, Lima', -12.0464, -77.0428, 17),
(1, 'PLT002', 'Planta Sur', 'Panamericana Sur Km 20, Lima', -12.1543, -77.0233, 18),
(2, 'PLT003', 'Planta Arequipa', 'Calle Los Pinos 44, Arequipa', -16.3989, -71.5350, 17),
(3, 'PLT004', 'Planta Cusco', 'Av. Cultura 3200, Cusco', -13.5320, -71.9675, 17),
(4, 'PLT005', 'Planta Trujillo', 'Prol. América Sur 1000, Trujillo', -8.111, -79.028, 17);

-- Tabla: residues
INSERT INTO public.residues (company_id, name, residue_type, quantity, status, plant_id, user_operator)
VALUES
(1, 'Botellas PET', 7, 120.5, 13, 1, 2),
(1, 'Plástico duro', 7, 90.0, 14, 2, 2),
(2, 'Cartón corrugado', 8, 200.0, 13, 3, 4),
(2, 'Papel reciclable', 8, 150.5, 14, 3, 4),
(3, 'Latas de aluminio', 9, 75.0, 15, 4, 5),
(3, 'Chatarra metálica', 9, 300.0, 13, 4, 5),
(4, 'Restos orgánicos', 10, 250.0, 14, 5, 6),
(5, 'Cobre', 9, 80.0, 13, 5, 8),
(5, 'Hierro', 9, 140.0, 15, 5, 7),
(1, 'Plástico film', 7, 100.0, 16, 1, 2);

-- Tabla: operations_detail
INSERT INTO public.operations_detail (residue_id, previous_status, current_status, obs, company_id, plant_id)
VALUES
(1, 13, 14, 'Residuo procesado en planta central', 1, 1),
(2, 14, 15, 'Residuo en transporte a planta sur', 1, 2),
(3, 13, 14, 'Procesamiento completado correctamente', 2, 3),
(4, 14, 16, 'Residuo desechado por mala calidad', 2, 3),
(5, 13, 15, 'Residuo listo para reciclaje', 3, 4),
(6, 13, 14, 'Chatarra fundida en horno principal', 3, 4),
(7, 13, 14, 'Orgánico transformado en compost', 4, 5),
(8, 13, 15, 'Cobre transportado a refinería', 5, 5),
(9, 15, 14, 'Hierro procesado con éxito', 5, 5),
(10, 13, 16, 'Plástico film descartado por impurezas', 1, 1);
