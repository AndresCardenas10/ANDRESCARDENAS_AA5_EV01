-- =====================================================================
-- Script: crear-bd.sql
-- Evidencia: GA7-220501096-AA5-EV01 - Diseno y desarrollo de servicios web (caso)
-- Proposito: crear la base de datos y la tabla de usuarios que usa el
--            servicio web de registro e inicio de sesion.
-- Motor: MySQL / MariaDB (XAMPP)
-- Uso: importar este archivo desde phpMyAdmin (pestana "Importar").
-- =====================================================================

-- 1. Base de datos (independiente de la base del proyecto SGB)
CREATE DATABASE IF NOT EXISTS aa5_ev01_auth
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE aa5_ev01_auth;

-- 2. Tabla de usuarios
--    - usuario: nombre unico (UNIQUE evita registros duplicados)
--    - contrasena: NUNCA se guarda en texto plano, se guarda el hash bcrypt
CREATE TABLE IF NOT EXISTS usuarios (
  id_usuario     INT          NOT NULL AUTO_INCREMENT,
  usuario        VARCHAR(50)  NOT NULL,
  contrasena     VARCHAR(255) NOT NULL,
  fecha_registro DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_usuario),
  UNIQUE KEY uq_usuarios_usuario (usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
