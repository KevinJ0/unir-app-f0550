-- ========================================================
-- ACTIVIDAD GRUPAL UNIR - GRUPO F0550
-- ESQUEMA DE BASE DE DATOS PARA AMAZON RDS MYSQL (MULTI-AZ)
-- Entregable para Integrante 4 (Tania) e Integrante 2 (Kevin)
-- ========================================================

-- 1. Crear base de datos si no existe
CREATE DATABASE IF NOT EXISTS ha_database
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE ha_database;

-- 2. Tabla principal de transacciones y pruebas de alta disponibilidad
CREATE TABLE IF NOT EXISTS registros (
  id INT AUTO_INCREMENT PRIMARY KEY,
  autor VARCHAR(100) NOT NULL COMMENT 'Nombre del integrante o proceso que originó el registro',
  mensaje TEXT NOT NULL COMMENT 'Detalle de la prueba o contenido del registro',
  accion VARCHAR(50) DEFAULT 'REGISTRO_WEB' COMMENT 'Tipo de acción (TEST_ALB, INSERT, FAILOVER, etc.)',
  instancia_id VARCHAR(50) COMMENT 'ID de la instancia EC2 que procesó la solicitud (IMDSv2)',
  az VARCHAR(50) COMMENT 'Zona de Disponibilidad donde corría la instancia (ej. us-east-1a)',
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Estampa de tiempo del servidor'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Datos iniciales de prueba (Seeds) para verificar SELECT inmediatamente
INSERT INTO registros (autor, mensaje, accion, instancia_id, az) VALUES
  ('Kevin', 'Servicio web inicializado en nodo privado.', 'SISTEMA_INIT', 'i-0123456789a', 'us-east-1a'),
  ('Tania', 'Conectividad verificada hacia base de datos MySQL.', 'DB_CHECK', 'i-0123456789b', 'us-east-1b'),
  ('Victor C.', 'Verificación de balanceo a través de ALB.', 'ALB_CHECK', 'i-0123456789a', 'us-east-1a');

-- 4. Consulta de verificación
SELECT * FROM registros ORDER BY fecha DESC;
