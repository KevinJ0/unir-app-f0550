const mysql = require('mysql2/promise');
require('dotenv').config();

// Almacenamiento en memoria para modo demo / fallback
let memoryRecords = [
  {
    id: 1,
    autor: "Kevin",
    mensaje: "Inicialización del servicio web en el nodo.",
    accion: "SISTEMA_INIT",
    instancia_id: "local-dev-01",
    az: "us-east-1a",
    fecha: new Date().toISOString()
  },
  {
    id: 2,
    autor: "Admin",
    mensaje: "Servicio iniciado. Esperando configuración de conexión a MySQL.",
    accion: "CONFIG_PENDIENTE",
    instancia_id: "local-dev-01",
    az: "us-east-1a",
    fecha: new Date().toISOString()
  }
];

let pool = null;
let dbStatus = {
  configured: false,
  connected: false,
  mode: "IN_MEMORY_DEMO",
  host: "No configurado (Modo Memoria)",
  database: "ha_database",
  error: null,
  lastChecked: new Date().toISOString()
};

function getPoolConfig() {
  const connString = process.env.DATABASE_URL;
  if (connString && connString.trim() !== "") {
    return connString;
  }
  if (process.env.DB_HOST && process.env.DB_HOST.trim() !== "") {
    return {
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || "3306", 10),
      user: process.env.DB_USER || "ha_app_user",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "ha_database",
      waitForConnections: true,
      connectionLimit: 10,
      connectTimeout: 5000,
      queueLimit: 0
    };
  }
  return null;
}

async function connectDB() {
  const config = getPoolConfig();
  if (!config) {
    dbStatus.configured = false;
    dbStatus.connected = false;
    dbStatus.mode = "IN_MEMORY_DEMO";
    dbStatus.host = "Pendiente de Connection String (Modo Demo Activo)";
    dbStatus.lastChecked = new Date().toISOString();
    console.log("[DB] ℹ️ Base de datos en Modo Demostración (esperando Connection String)");
    return false;
  }

  try {
    if (typeof config === 'string') {
      pool = mysql.createPool({
        uri: config,
        waitForConnections: true,
        connectionLimit: 10,
        connectTimeout: 3000,
        queueLimit: 0
      });
      const match = config.match(/@([^:/]+)/);
      dbStatus.host = match ? match[1] : "RDS Endpoint";
    } else {
      pool = mysql.createPool({
        ...config,
        connectTimeout: 3000
      });
      dbStatus.host = config.host;
      dbStatus.database = config.database;
    }

    dbStatus.configured = true;

    // Probar conexión con ping ligero
    const connection = await pool.getConnection();
    await connection.ping();
    
    // Crear tabla automáticamente si no existe
    await connection.query(`
      CREATE TABLE IF NOT EXISTS registros (
        id INT AUTO_INCREMENT PRIMARY KEY,
        autor VARCHAR(100) NOT NULL,
        mensaje TEXT NOT NULL,
        accion VARCHAR(50) DEFAULT 'TEST',
        instancia_id VARCHAR(50),
        az VARCHAR(50),
        fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    
    connection.release();

    dbStatus.connected = true;
    dbStatus.mode = "MYSQL_RDS_ACTIVE";
    dbStatus.error = null;
    dbStatus.lastChecked = new Date().toISOString();
    console.log(`[DB] ✅ Conexión exitosa a MySQL en ${dbStatus.host}`);
    return true;
  } catch (err) {
    dbStatus.connected = false;
    dbStatus.mode = "FALLBACK_DEMO";
    dbStatus.error = err.message;
    dbStatus.lastChecked = new Date().toISOString();
    console.warn(`[DB] ⚠️ No se pudo conectar a MySQL (${err.message}). Operando en modo memoria.`);
    return false;
  }
}

async function getRecords() {
  const isDemo = process.env.DEMO_MODE === 'true';

  if (!dbStatus.connected) {
    await connectDB();
  }

  if (dbStatus.connected && pool) {
    try {
      const [rows] = await pool.query('SELECT * FROM registros ORDER BY fecha DESC LIMIT 50');
      return rows;
    } catch (err) {
      console.error("[DB] Error al consultar registros:", err.message);
      if (!isDemo) {
        throw new Error("Error al consultar MySQL en producción: " + err.message);
      }
      return memoryRecords;
    }
  }

  if (!isDemo) {
    throw new Error("Base de datos MySQL no disponible en modo producción.");
  }
  return memoryRecords;
}

async function createRecord({ autor, mensaje, accion, instancia_id, az }) {
  const isDemo = process.env.DEMO_MODE === 'true';

  if (!dbStatus.connected) {
    await connectDB();
  }

  const nuevo = {
    autor: autor || "Anónimo",
    mensaje: mensaje || "Sin contenido",
    accion: accion || "REGISTRO_WEB",
    instancia_id: instancia_id || "local",
    az: az || "local",
    fecha: new Date().toISOString()
  };

  if (dbStatus.connected && pool) {
    try {
      const [res] = await pool.query(
        'INSERT INTO registros (autor, mensaje, accion, instancia_id, az) VALUES (?, ?, ?, ?, ?)',
        [nuevo.autor, nuevo.mensaje, nuevo.accion, nuevo.instancia_id, nuevo.az]
      );
      nuevo.id = res.insertId;
      return nuevo;
    } catch (err) {
      console.error("[DB] Error al insertar en MySQL:", err.message);
      if (!isDemo) {
        throw new Error("Error al escribir en MySQL en producción: " + err.message);
      }
      nuevo.id = memoryRecords.length + 1;
      memoryRecords.unshift(nuevo);
      return nuevo;
    }
  }

  if (!isDemo) {
    throw new Error("No se puede registrar: la base de datos MySQL no está conectada en modo producción.");
  }

  nuevo.id = memoryRecords.length + 1;
  memoryRecords.unshift(nuevo);
  return nuevo;
}

function getStatus() {
  dbStatus.lastChecked = new Date().toISOString();
  return dbStatus;
}

module.exports = {
  connectDB,
  getRecords,
  createRecord,
  getStatus
};
