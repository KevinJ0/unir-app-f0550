const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const { connectDB, getRecords, createRecord, getStatus } = require('./database/db');
const { getAWSMetadata } = require('./services/awsMetadata');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Iniciar intento de conexión a base de datos en segundo plano
connectDB();

// ==========================================
// 1. ENDPOINT DE HEALTH CHECK (Tarea 14 / ALB Target Group)
// ==========================================
app.get('/health', (req, res) => {
  const dbStatus = getStatus();
  // El Load Balancer necesita HTTP 200 para marcar el target como "Healthy"
  res.status(200).json({
    status: "ok",
    service: "unir-aws-ha-app",
    timestamp: new Date().toISOString(),
    database: dbStatus.mode
  });
});

// Endpoint duplicado por si el ALB consulta /api/health
app.get('/api/health', (req, res) => {
  res.redirect('/health');
});

// ==========================================
// 2. ENDPOINT DE METADATOS DE INSTANCIA Y ESTADO
// ==========================================
app.get('/api/info', async (req, res) => {
  try {
    const metadata = await getAWSMetadata();
    const db = getStatus();
    res.json({
      success: true,
      metadata,
      database: db,
      serverTime: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 3. OPERACIONES CRUD DE PRUEBA (Criterio 3 / Check Q08)
// ==========================================
app.get('/api/records', async (req, res) => {
  try {
    const rows = await getRecords();
    res.json({ success: true, count: rows.length, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/records', async (req, res) => {
  try {
    const { autor, mensaje, accion } = req.body;
    if (!mensaje || mensaje.trim() === '') {
      return res.status(400).json({ success: false, error: "El mensaje es obligatorio" });
    }

    const metadata = await getAWSMetadata();
    const record = await createRecord({
      autor: autor || "Estudiante",
      mensaje: mensaje.trim(),
      accion: accion || "REGISTRO_WEB",
      instancia_id: metadata.instanceId,
      az: metadata.availabilityZone
    });

    res.status(201).json({ success: true, data: record });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 4. SERVIR FRONTEND ESTÁTICO COMPILADO (REACT)
// ==========================================
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send(`
      <div style="font-family: sans-serif; text-align: center; padding: 50px;">
        <h2>Panel de Gestión y Auditoría Cloud</h2>
        <p>Servicio activo en el puerto ${PORT}.</p>
        <p><a href="/health">Health Check</a> | <a href="/api/info">Estado del Nodo</a></p>
      </div>
    `);
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(`🌐 Servidor UNIR Cloud HA escuchando en el puerto ${PORT}`);
  console.log(`🩺 Health check disponible en: http://localhost:${PORT}/health`);
  console.log(`📡 API Info disponible en:     http://localhost:${PORT}/api/info`);
  console.log(`=======================================================`);
});
