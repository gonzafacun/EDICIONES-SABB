const crypto = require("crypto");

const EPAGOS_IPS_SANDBOX = [
  "200.0.241.114",
  "200.0.241.115",
  "200.0.241.116",
  "200.0.241.117",
  "200.0.241.118",
  "190.105.228.98",
  "190.105.228.99",
  "190.105.228.100",
  "190.105.228.101",
  "190.105.228.102",
];

const EPAGOS_IPS_PROD = [
  "200.0.241.114",
  "200.0.241.115",
  "200.0.241.116",
  "200.0.241.117",
  "200.0.241.118",
];

const rateLimitMap = new Map();

function rateLimit(key, maxRequests = 10, windowMs = 60000) {
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  if (!entry || now - entry.start > windowMs) {
    rateLimitMap.set(key, { start: now, count: 1 });
    return false;
  }
  entry.count++;
  if (entry.count > maxRequests) return true;
  return false;
}

function cleanupRateLimit() {
  const now = Date.now();
  for (const [k, v] of rateLimitMap) {
    if (now - v.start > 120000) rateLimitMap.delete(k);
  }
}

setInterval(cleanupRateLimit, 60000);

function getClienteIP(req) {
  const fwd = req.headers["x-forwarded-for"];
  if (fwd) return fwd.split(",")[0].trim();
  return req.connection?.remoteAddress || req.ip || "0.0.0.0";
}

function verificarIpWebhook(req, ips) {
  if (!ips || ips.length === 0) return true;
  const ip = getClienteIP(req);
  return ips.includes(ip);
}

function verificarHashWebhook(body, hashSecreto) {
  const { empresa, nro_operacion, importe, hash } = body;
  if (!empresa || !nro_operacion || !importe || !hash) return false;
  const esperado = crypto
    .createHash("md5")
    .update(`${empresa}${nro_operacion}${importe}${hashSecreto}`)
    .digest("hex");
  return esperado === hash;
}

function sanitizarCrearPago({ items, comprador, total }) {
  const sanitizado = {
    items: items.map((item) => ({
      nombre: String(item.nombre).slice(0, 200),
      precio: Number(item.precio),
      cantidad: Number(item.cantidad),
    })),
    comprador: {
      nombre: String(comprador.nombre || "").slice(0, 100),
      apellido: String(comprador.apellido || "").slice(0, 100),
      email: comprador.email,
      dni: String(comprador.dni || "").replace(/[^0-9]/g, "").slice(0, 20),
      telefono: String(comprador.telefono || "").replace(/[^0-9+\-() ]/g, "").slice(0, 30),
      direccion: String(comprador.direccion || "").slice(0, 300),
    },
    total: Number(total),
  };
  return sanitizado;
}

function validarCrearPago({ items, comprador, total }) {
  if (!items?.length) return "El carrito está vacío";
  if (!comprador?.email) return "Datos del comprador incompletos";
  if (!total || total <= 0) return "Importe inválido";
  if (total > 10000000) return "Importe excede el máximo permitido";
  if (!Array.isArray(items) || items.length > 50) return "Cantidad de items inválida";

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(comprador.email)) return "Email inválido";

  for (const item of items) {
    if (!item.nombre || typeof item.precio !== "number" || item.precio < 0) {
      return "Item inválido en el carrito";
    }
    if (!item.cantidad || item.cantidad < 1 || item.cantidad > 100) {
      return "Cantidad inválida en item del carrito";
    }
  }

  const totalCalculado = items.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
  if (Math.abs(totalCalculado - total) > 1) {
    return "El total no coincide con la suma de los items";
  }

  return null;
}

module.exports = {
  rateLimit,
  rateLimitMap,
  cleanupRateLimit,
  getClienteIP,
  verificarIpWebhook,
  verificarHashWebhook,
  sanitizarCrearPago,
  validarCrearPago,
  EPAGOS_IPS_SANDBOX,
  EPAGOS_IPS_PROD,
};
