import React, { useState, useEffect } from 'react';
import { Div, Text, Button, Row, Col, Container, Input, Tag } from 'atomize';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [info, setInfo] = useState({
    metadata: {
      isAWS: false,
      instanceId: "Cargando...",
      availabilityZone: "Cargando...",
      privateIp: "...",
      instanceType: "..."
    },
    database: {
      configured: false,
      connected: false,
      mode: "Cargando...",
      host: "...",
      database: "unir_db"
    }
  });

  const [records, setRecords] = useState([]);
  const [autor, setAutor] = useState('Kevin');
  const [mensaje, setMensaje] = useState('');
  const [accion, setAccion] = useState('TRANSACCION');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const fetchSystemInfo = async () => {
    try {
      const res = await fetch('/api/info');
      const data = await res.json();
      if (data.success) {
        setInfo({
          metadata: data.metadata,
          database: data.database
        });
      }
    } catch (err) {
      console.error("Error al consultar estado:", err);
    }
  };

  const fetchRecords = async () => {
    try {
      const res = await fetch('/api/records');
      const data = await res.json();
      if (data.success) {
        setRecords(data.data);
      }
    } catch (err) {
      console.error("Error al obtener registros:", err);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchSystemInfo(), fetchRecords()]);
      setLoading(false);
    };
    init();
  }, []);

  const handleCreateRecord = async (e) => {
    e.preventDefault();
    if (!mensaje.trim()) {
      setFeedback({ type: 'warning', text: 'Escribe una descripción para el evento.' });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ autor, mensaje, accion })
      });
      const data = await res.json();
      if (data.success) {
        setMensaje('');
        setFeedback({ type: 'success', text: 'Evento registrado correctamente en la base de datos.' });
        await fetchRecords();
        await fetchSystemInfo();
      } else {
        setFeedback({ type: 'danger', text: data.error || 'No se pudo guardar el registro.' });
      }
    } catch (err) {
      setFeedback({ type: 'danger', text: 'Error al conectar con el servidor: ' + err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Div bg="#F8FAFC" minH="100vh" p={{ b: "4rem" }}>
      {/* ================= BARRA SUPERIOR / NAVBAR ================= */}
      <Div bg="#0F172A" p={{ y: "1.25rem" }} shadow="2">
        <Container>
          <Row align="center" justify="space-between">
            <Col size={{ xs: 12, md: 8 }}>
              <Div d="flex" align="center" m={{ b: { xs: "0.5rem", md: "0" } }}>
                <Div
                  bg="#2563EB"
                  textColor="white"
                  p={{ x: "0.75rem", y: "0.3rem" }}
                  rounded="md"
                  textWeight="700"
                  m={{ r: "1rem" }}
                  textSize="body"
                >
                  CloudOps
                </Div>
                <Div>
                  <Text textColor="white" textSize="title" textWeight="700">
                    Panel de Gestión y Auditoría Cloud
                  </Text>
                  <Text textColor="#94A3B8" textSize="caption">
                    Plataforma distribuida con balanceo de carga y persistencia en base de datos
                  </Text>
                </Div>
              </Div>
            </Col>
            <Col size={{ xs: 12, md: 4 }}>
              <Div d="flex" justify={{ xs: "flex-start", md: "flex-end" }} align="center">
                <Button
                  bg="#1E293B"
                  hoverBg="#334155"
                  textColor="#38BDF8"
                  textWeight="600"
                  rounded="md"
                  m={{ r: "0.5rem" }}
                  onClick={() => window.open('/health', '_blank')}
                  p={{ x: "0.85rem", y: "0.5rem" }}
                  textSize="caption"
                >
                  Status / Health
                </Button>
                <Button
                  bg="#2563EB"
                  hoverBg="#1D4ED8"
                  textColor="white"
                  textWeight="600"
                  rounded="md"
                  onClick={() => {
                    fetchSystemInfo();
                    fetchRecords();
                  }}
                  p={{ x: "1rem", y: "0.5rem" }}
                  textSize="caption"
                >
                  Actualizar Nodo (F5)
                </Button>
              </Div>
            </Col>
          </Row>
        </Container>
      </Div>

      {/* ================= CONTENEDOR PRINCIPAL ================= */}
      <Container m={{ t: "2rem" }}>
        
        {/* Notificaciones */}
        {feedback && (
          <Div
            bg={
              feedback.type === 'success' ? '#DCFCE7' :
              feedback.type === 'danger' ? '#FEE2E2' : '#FEF3C7'
            }
            border="1px solid"
            borderColor={
              feedback.type === 'success' ? '#86EFAC' :
              feedback.type === 'danger' ? '#FCA5A5' : '#FCD34D'
            }
            textColor={
              feedback.type === 'success' ? '#166534' :
              feedback.type === 'danger' ? '#991B1B' : '#92400E'
            }
            p="0.9rem"
            rounded="md"
            m={{ b: "1.5rem" }}
            d="flex"
            justify="space-between"
            align="center"
          >
            <Text textWeight="500">{feedback.text}</Text>
            <Button
              bg="transparent"
              textColor="inherit"
              textWeight="700"
              p="0"
              onClick={() => setFeedback(null)}
            >
              ✕
            </Button>
          </Div>
        )}

        {/* ================= INFORMACIÓN DEL NODO ================= */}
        <Div
          bg="white"
          p={{ xs: "1.5rem", md: "1.75rem" }}
          rounded="xl"
          shadow="1"
          border="1px solid"
          borderColor="#E2E8F0"
          m={{ b: "2rem" }}
        >
          <Row align="center" m={{ b: "1.25rem" }}>
            <Col size={8}>
              <Div d="flex" align="center">
                <Div
                  w="0.65rem"
                  h="0.65rem"
                  bg={info.metadata.isAWS ? "#10B981" : "#3B82F6"}
                  rounded="circle"
                  m={{ r: "0.6rem" }}
                />
                <Text textSize="title" textWeight="700" textColor="#0F172A">
                  Información del Nodo en Ejecución
                </Text>
              </Div>
              <Text textSize="caption" textColor="#64748B" m={{ t: "0.2rem" }}>
                Identificación de la instancia y ubicación física que responde a esta solicitud.
              </Text>
            </Col>
            <Col size={4}>
              <Div d="flex" justify="flex-end">
                <Tag
                  bg={info.metadata.isAWS ? "#DCFCE7" : "#EFF6FF"}
                  textColor={info.metadata.isAWS ? "#15803D" : "#1D4ED8"}
                  textWeight="700"
                  rounded="md"
                  p={{ x: "0.75rem", y: "0.3rem" }}
                >
                  {info.metadata.isAWS ? "NODO EN LA NUBE (AWS)" : "NODO LOCAL (DEV)"}
                </Tag>
              </Div>
            </Col>
          </Row>

          <Row>
            {/* AZ */}
            <Col size={{ xs: 12, md: 3 }} m={{ b: { xs: "1rem", md: "0" } }}>
              <Div bg="#F8FAFC" p="1rem" rounded="lg" border="1px solid" borderColor="#E2E8F0">
                <Text textSize="tiny" textColor="#64748B" textWeight="600" transform="uppercase">
                  Zona de Disponibilidad
                </Text>
                <Text textSize="subheader" textColor="#2563EB" textWeight="800" m={{ t: "0.25rem" }}>
                  {info.metadata.availabilityZone}
                </Text>
                <Text textSize="tiny" textColor="#10B981" m={{ t: "0.25rem" }} textWeight="500">
                  Activa en clúster
                </Text>
              </Div>
            </Col>

            {/* ID Instancia */}
            <Col size={{ xs: 12, md: 3 }} m={{ b: { xs: "1rem", md: "0" } }}>
              <Div bg="#F8FAFC" p="1rem" rounded="lg" border="1px solid" borderColor="#E2E8F0">
                <Text textSize="tiny" textColor="#64748B" textWeight="600" transform="uppercase">
                  Identificador de Instancia
                </Text>
                <Text textSize="subheader" textColor="#0F172A" textWeight="800" m={{ t: "0.25rem" }}>
                  {info.metadata.instanceId}
                </Text>
                <Text textSize="tiny" textColor="#64748B" m={{ t: "0.25rem" }}>
                  Tipo: {info.metadata.instanceType}
                </Text>
              </Div>
            </Col>

            {/* IP Privada */}
            <Col size={{ xs: 12, md: 3 }} m={{ b: { xs: "1rem", md: "0" } }}>
              <Div bg="#F8FAFC" p="1rem" rounded="lg" border="1px solid" borderColor="#E2E8F0">
                <Text textSize="tiny" textColor="#64748B" textWeight="600" transform="uppercase">
                  Dirección IP Privada
                </Text>
                <Text textSize="subheader" textColor="#0F172A" textWeight="800" m={{ t: "0.25rem" }}>
                  {info.metadata.privateIp}
                </Text>
                <Text textSize="tiny" textColor="#64748B" m={{ t: "0.25rem" }}>
                  Red interna
                </Text>
              </Div>
            </Col>

            {/* Estado */}
            <Col size={{ xs: 12, md: 3 }}>
              <Div bg="#F8FAFC" p="1rem" rounded="lg" border="1px solid" borderColor="#E2E8F0">
                <Text textSize="tiny" textColor="#64748B" textWeight="600" transform="uppercase">
                  Tipo de Arquitectura
                </Text>
                <Text textSize="subheader" textColor="#047857" textWeight="800" m={{ t: "0.25rem" }}>
                  Stateless
                </Text>
                <Text textSize="tiny" textColor="#64748B" m={{ t: "0.25rem" }}>
                  Sin almacenamiento local
                </Text>
              </Div>
            </Col>
          </Row>
        </Div>

        {/* ================= ESTADO DE BASE DE DATOS ================= */}
        <Div
          bg="white"
          p={{ xs: "1.5rem", md: "1.75rem" }}
          rounded="xl"
          shadow="1"
          border="1px solid"
          borderColor="#E2E8F0"
          m={{ b: "2rem" }}
        >
          <Row align="center" justify="space-between">
            <Col size={{ xs: 12, md: 8 }}>
              <Div d="flex" align="center">
                <Div
                  w="0.65rem"
                  h="0.65rem"
                  bg={info.database.connected ? "#10B981" : "#F59E0B"}
                  rounded="circle"
                  m={{ r: "0.6rem" }}
                />
                <Text textSize="title" textWeight="700" textColor="#0F172A">
                  Estado de la Base de Datos
                </Text>
              </Div>
              <Text textSize="caption" textColor="#64748B" m={{ t: "0.2rem" }}>
                {info.database.connected
                  ? `Conectado a MySQL: ${info.database.host} (Base de datos: ${info.database.database})`
                  : `Servicio de almacenamiento: ${info.database.host}`}
              </Text>
            </Col>
            <Col size={{ xs: 12, md: 4 }}>
              <Div d="flex" justify={{ xs: "flex-start", md: "flex-end" }} m={{ t: { xs: "0.5rem", md: "0" } }}>
                <Tag
                  bg={info.database.connected ? "#DCFCE7" : "#FEF3C7"}
                  textColor={info.database.connected ? "#15803D" : "#B45309"}
                  textWeight="700"
                  rounded="md"
                  p={{ x: "0.85rem", y: "0.4rem" }}
                  textSize="caption"
                >
                  {info.database.connected ? "MYSQL RDS CONECTADO" : "EN ESPERA DE ENLACE"}
                </Tag>
              </Div>
            </Col>
          </Row>
        </Div>

        {/* ================= FORMULARIO Y REGISTROS ================= */}
        <Row>
          {/* Formulario */}
          <Col size={{ xs: 12, lg: 5 }} m={{ b: { xs: "2rem", lg: "0" } }}>
            <Div
              bg="white"
              p={{ xs: "1.5rem", md: "1.75rem" }}
              rounded="xl"
              shadow="1"
              border="1px solid"
              borderColor="#E2E8F0"
              h="100%"
            >
              <Text textSize="title" textWeight="700" textColor="#0F172A" m={{ b: "0.3rem" }}>
                Nuevo Registro de Operación
              </Text>
              <Text textSize="caption" textColor="#64748B" m={{ b: "1.25rem" }}>
                Envía una operación a través del balanceador para registrarla en la base de datos con los datos del nodo que la atendió.
              </Text>

              <form onSubmit={handleCreateRecord}>
                <Div m={{ b: "1rem" }}>
                  <Text textSize="caption" textWeight="600" textColor="#334155" m={{ b: "0.25rem" }}>
                    Usuario / Operador
                  </Text>
                  <Input
                    value={autor}
                    onChange={(e) => setAutor(e.target.value)}
                    placeholder="Nombre del usuario"
                    rounded="md"
                    bg="#F8FAFC"
                  />
                </Div>

                <Div m={{ b: "1rem" }}>
                  <Text textSize="caption" textWeight="600" textColor="#334155" m={{ b: "0.25rem" }}>
                    Tipo de Operación
                  </Text>
                  <Input
                    value={accion}
                    onChange={(e) => setAccion(e.target.value)}
                    placeholder="Ej. TRANSACCION, AUDITORIA, PRUEBA_CARGA"
                    rounded="md"
                    bg="#F8FAFC"
                  />
                </Div>

                <Div m={{ b: "1.5rem" }}>
                  <Text textSize="caption" textWeight="600" textColor="#334155" m={{ b: "0.25rem" }}>
                    Descripción / Observaciones
                  </Text>
                  <Input
                    value={mensaje}
                    onChange={(e) => setMensaje(e.target.value)}
                    placeholder="Detalle de la operación realizada"
                    rounded="md"
                    bg="#F8FAFC"
                  />
                </Div>

                <Button
                  type="submit"
                  bg="#2563EB"
                  hoverBg="#1D4ED8"
                  textColor="white"
                  textWeight="600"
                  rounded="md"
                  w="100%"
                  p={{ y: "0.85rem" }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Registrando..." : "Guardar Registro"}
                </Button>
              </form>
            </Div>
          </Col>

          {/* Tabla de Registros */}
          <Col size={{ xs: 12, lg: 7 }}>
            <Div
              bg="white"
              p={{ xs: "1.5rem", md: "1.75rem" }}
              rounded="xl"
              shadow="1"
              border="1px solid"
              borderColor="#E2E8F0"
              h="100%"
            >
              <Div d="flex" justify="space-between" align="center" m={{ b: "1rem" }}>
                <Div>
                  <Text textSize="title" textWeight="700" textColor="#0F172A">
                    Bitácora de Eventos
                  </Text>
                  <Text textSize="caption" textColor="#64748B">
                    {records.length} eventos almacenados
                  </Text>
                </Div>
                <Button
                  bg="#F1F5F9"
                  hoverBg="#E2E8F0"
                  textColor="#1E293B"
                  textWeight="600"
                  rounded="md"
                  p={{ x: "0.75rem", y: "0.4rem" }}
                  textSize="caption"
                  onClick={fetchRecords}
                >
                  Refrescar
                </Button>
              </Div>

              {records.length === 0 ? (
                <Div p="2rem" textAli="center" bg="#F8FAFC" rounded="lg">
                  <Text textColor="#64748B">Aún no se han guardado registros.</Text>
                </Div>
              ) : (
                <Div maxH="400px" overflow="auto">
                  {records.map((r) => (
                    <Div
                      key={r.id}
                      p="1rem"
                      m={{ b: "0.75rem" }}
                      bg="#F8FAFC"
                      rounded="lg"
                      border="1px solid"
                      borderColor="#E2E8F0"
                    >
                      <Row align="center" justify="space-between">
                        <Col size={8}>
                          <Div d="flex" align="center">
                            <Text textWeight="700" textColor="#0F172A" m={{ r: "0.5rem" }}>
                              {r.autor}
                            </Text>
                            <Tag bg="#E0E7FF" textColor="#4338CA" textWeight="600" rounded="sm" textSize="tiny">
                              {r.accion || "EVENTO"}
                            </Tag>
                          </Div>
                          <Text textSize="body" textColor="#334155" m={{ t: "0.35rem" }}>
                            {r.mensaje}
                          </Text>
                        </Col>
                        <Col size={4}>
                          <Div textAli="right">
                            <Tag bg="#DCFCE7" textColor="#166534" textWeight="700" rounded="sm" textSize="tiny">
                              AZ: {r.az || "N/A"}
                            </Tag>
                            <Text textSize="tiny" textColor="#94A3B8" m={{ t: "0.35rem" }}>
                              {new Date(r.fecha).toLocaleTimeString()}
                            </Text>
                          </Div>
                        </Col>
                      </Row>
                    </Div>
                  ))}
                </Div>
              )}
            </Div>
          </Col>
        </Row>

        {/* Pie de página discreto */}
        <Div m={{ t: "3rem" }} p={{ y: "1rem" }} textAli="center">
          <Text textSize="caption" textColor="#94A3B8">
            CloudOps · Sistema Distribuido de Gestión de Eventos y Cómputo
          </Text>
        </Div>

      </Container>
    </Div>
  );
}
