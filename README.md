# Despliegue Cloud en Alta Disponibilidad · UNIR (Grupo F0550)

Aplicación Web *Stateless* desarrollada por **Kevin (Integrante 2)** para la actividad grupal de despliegue en la nube AWS en Alta Disponibilidad (Meta 10/10).

---

## 🛠️ Stack Tecnológico
* **Backend:** Node.js con Express.
* **Frontend:** React 18 con arquitectura de componentes **Atomize React** (Styletron).
* **Base de Datos:** MySQL / Amazon RDS Multi-AZ (soporte para Connection String o parámetros independientes con *fallback* automático en memoria).
* **Telemetría Cloud:** AWS IMDSv2 para detección en tiempo real de la Zona de Disponibilidad (AZ), ID de Instancia EC2 e IP privada.
* **Health Check:** Endpoint `/health` con respuesta HTTP 200 para el *Target Group* del Application Load Balancer (ALB).

---

## 🚀 Cómo ejecutar en local

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Compilar el frontend de React + Atomize:**
   ```bash
   npm run build
   ```

3. **Iniciar el servidor:**
   ```bash
   npm start
   ```
   Abre tu navegador en: [http://localhost:3000](http://localhost:3000)

4. **Modo Desarrollo (con recarga rápida):**
   ```bash
   npm run dev
   ```

---

## 🔌 Configuración de la Base de Datos (Amazon RDS)

La aplicación arranca por defecto en **Modo Demostración / Memoria** para que puedas probar la interfaz y el *Health Check* sin necesidad de tener RDS encendido.

Cuando tu compañera **Tania (Integrante 4)** te proporcione el Connection String o endpoint de RDS, puedes activarlo de dos formas:

### Opción 1: Desde la Interfaz Web (Sin reiniciar)
Haz clic en el botón **"⚙️ Configurar Connection String"** en la página web, pega el connection string y presiona **"Conectar a RDS"**.

### Opción 2: En el archivo `.env`
Edita el archivo `.env` en la raíz del proyecto:
```env
DATABASE_URL=mysql://admin:tu_contraseña@rds-cluster.c123456789.us-east-1.rds.amazonaws.com:3306/unir_db
```
O con las variables individuales:
```env
DB_HOST=rds-cluster.c123456789.us-east-1.rds.amazonaws.com
DB_PORT=3306
DB_USER=admin
DB_PASSWORD=tu_contraseña
DB_NAME=unir_db
```

---

## 📂 Estructura del Proyecto

```
Unir app Tarea 2 Grupo F0550/
├── aws/
│   └── user_data.sh        # Script bootstrap para Launch Template / ASG (Victor Castillo)
├── database/
│   ├── db.js               # Conexión MySQL pool + fallback en memoria
│   └── schema.sql          # Script SQL para crear tabla y semillas (Tania)
├── dist/                   # Frontend React compilado listo para producción
├── services/
│   └── awsMetadata.js      # Consulta AWS IMDSv2 para capturar AZ e Instance ID
├── src/
│   ├── App.jsx             # Interfaz de usuario completa con Atomize
│   └── main.jsx            # Punto de entrada React + Styletron Provider
├── index.html              # Plantilla HTML con fuentes de Atomize
├── package.json            # Scripts y dependencias
├── server.js               # Servidor Express, API REST y /health
├── .env.example            # Plantilla de variables de entorno
└── README.md               # Esta documentación
```

---

## 📋 Verificaciones de Rúbrica Cubiertas
* **Criterio 2 (3 Puntos):** Frontend con balanceador y autoescalado. La web muestra en tiempo real la Zona de Disponibilidad y el ID de la EC2 que atiende la petición, sirviendo de evidencia gráfica irrefutable para el informe de **Miguel (Integrante 5)**.
* **Criterio 3 (3 Puntos / Check Q08):** La página web lee (`SELECT`) y escribe (`INSERT`) datos hacia la base de datos de forma interactiva.
* **Tarea 14:** Endpoint `/health` respondiendo HTTP 200 de forma inmediata para el *Target Group* de AWS.
