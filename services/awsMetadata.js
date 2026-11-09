const axios = require('axios');
const os = require('os');

// Caché en memoria para evitar saturar el endpoint de metadatos
let cachedMetadata = null;

async function getAWSMetadata() {
  if (cachedMetadata) {
    return cachedMetadata;
  }

  const defaultLocal = {
    isAWS: false,
    instanceId: "i-local-dev-instance",
    availabilityZone: "local-dev-zone (localhost)",
    region: "local",
    privateIp: getLocalIP(),
    instanceType: "t3.micro (simulado)",
    hostname: os.hostname(),
    uptimeSeconds: Math.floor(os.uptime())
  };

  try {
    // Intentar obtener Token IMDSv2 de AWS con timeout corto (1 segundo)
    const tokenRes = await axios.put(
      'http://169.254.169.254/latest/api/token',
      null,
      {
        headers: { 'X-aws-ec2-metadata-token-ttl-seconds': '21600' },
        timeout: 1000
      }
    );
    const token = tokenRes.data;

    const headers = { 'X-aws-ec2-metadata-token': token };
    const getMeta = (path) => axios.get(`http://169.254.169.254/latest/meta-data/${path}`, { headers, timeout: 1000 }).then(r => r.data).catch(() => null);

    const [instanceId, az, privateIp, instanceType] = await Promise.all([
      getMeta('instance-id'),
      getMeta('placement/availability-zone'),
      getMeta('local-ipv4'),
      getMeta('instance-type')
    ]);

    if (instanceId) {
      cachedMetadata = {
        isAWS: true,
        instanceId: instanceId || "i-desconocido",
        availabilityZone: az || "us-east-1a",
        region: az ? az.slice(0, -1) : "us-east-1",
        privateIp: privateIp || getLocalIP(),
        instanceType: instanceType || "t3.micro",
        hostname: os.hostname(),
        uptimeSeconds: Math.floor(os.uptime())
      };
      return cachedMetadata;
    }
  } catch (err) {
    // Si no está en AWS EC2 (ej. en la laptop o PC), usamos metadatos simulados para desarrollo
  }

  cachedMetadata = defaultLocal;
  return cachedMetadata;
}

function getLocalIP() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return '127.0.0.1';
}

module.exports = {
  getAWSMetadata
};
