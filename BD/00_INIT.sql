-- ======================================================
-- RECYCLAME DATABASE - INICIALIZACIÓN
-- Archivo: 00_INIT.sql
-- Descripción: Creación de la base de datos
-- ======================================================

-- Crear base de datos (ejecutar como superusuario)
-- DROP DATABASE IF EXISTS recycledb;
CREATE DATABASE recycledb;

-- Nota: Después de crear la base de datos, conectarse a ella 
-- y ejecutar los siguientes scripts en orden:
--   01_MD_RECYCLAMEDB.sql  - Modelo de datos (tablas)
--   02_FX_RECYCLAMEDB.sql  - Funciones (stored procedures)
--   03_DATA_RECYCLAMEDB.sql - Datos iniciales