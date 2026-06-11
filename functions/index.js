const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const crypto = require("crypto");

admin.initializeApp();
const db = admin.firestore();

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

setInterval(() => {
  const now = Date.now();
  for (const [k, v] of rateLimitMap) {
    if (now - v.start > 120000) rateLimitMap.delete(k);
  }
}, 60000);

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

const CONFIG = {
  epagos: {
    idUsuario: process.env.EPAGOS_ID_USUARIO || functions.config().epagos?.id_usuario,
    idOrganismo: process.env.EPAGOS_ID_ORGANISMO || functions.config().epagos?.id_organismo,
    password: process.env.EPAGOS_PASSWORD || functions.config().epagos?.password,
    convenio: process.env.EPAGOS_CONVENIO || functions.config().epagos?.convenio,
    hash: process.env.EPAGOS_HASH || functions.config().epagos?.hash,
  modo: process.env.EPAGOS_MODO || functions.config().epagos?.modo || "sandbox",
},
frontend: process.env.FRONTEND_URL || functions.config().app?.frontend_url || "http://localhost:3000",
baseUrl: process.env.EPAGOS_BASE_URL || functions.config().epagos?.base_url
  || `https://us-central1-${process.env.GCLOUD_PROJECT || "tu_proyecto"}.cloudfunctions.net/api`,
};

const EPAGOS_WEBHOOK_IPS = getModo() === "produccion" ? EPAGOS_IPS_PROD : EPAGOS_IPS_SANDBOX;

function getClienteIP(req) {
  const fwd = req.headers["x-forwarded-for"];
  if (fwd) return fwd.split(",")[0].trim();
  return req.connection?.remoteAddress || req.ip || "0.0.0.0";
}

function verificarIpWebhook(req) {
  const ip = getClienteIP(req);
  if (EPAGOS_WEBHOOK_IPS.length === 0) return true;
  return EPAGOS_WEBHOOK_IPS.includes(ip);
}

const EPAGOS_TOKEN_URL = {
  sandbox: "https://sandbox.epagos.com/post.php",
  produccion: "https://api.epagos.com/post.php",
};

const EPAGOS_CHECKOUT_URL = {
  sandbox: "https://postsandbox.epagos.com",
  produccion: "https://post.epagos.com",
};

const app = express();

app.use(cors({
  origin: [CONFIG.frontend, "http://localhost:3000"],
  methods: ["GET", "POST", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use((req, res, next) => {
  if (req.path === "/webhook") {
    express.raw({ type: "*/*" })(req, res, next);
  } else {
    express.json()(req, res, next);
  }
});

app.use((req, res, next) => {
  if (req.path === "/crear-pago" && req.method === "POST") {
    const ip = getClienteIP(req);
    if (rateLimit(`crear-pago:${ip}`, 10, 60000)) {
      return res.status(429).json({ error: "Demasiadas solicitudes. Intentá de nuevo en un minuto." });
    }
  }
  if (req.path === "/webhook") {
    const ip = getClienteIP(req);
    if (rateLimit(`webhook:${ip}`, 100, 60000)) {
      return res.status(429).send("Rate limit exceeded");
    }
  }
  next();
});

async function verificarAdmin(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No autorizado" });
  }
  try {
    const token = auth.split("Bearer ")[1];
    const decoded = await admin.auth().verifyIdToken(token);
    const adminDoc = await db.collection("admins").doc(decoded.uid).get();
    if (!adminDoc.exists) return res.status(403).json({ error: "Acceso denegado" });
    req.adminUid = decoded.uid;
    next();
  } catch {
    return res.status(401).json({ error: "Token inválido" });
  }
}

function getModo() {
  return CONFIG.epagos.modo === "produccion" ? "produccion" : "sandbox";
}

async function obtenerToken() {
  const modo = getModo();
  const url = EPAGOS_TOKEN_URL[modo];

  const payload = {
    id_usuario: CONFIG.epagos.idUsuario,
    id_organismo: CONFIG.epagos.idOrganismo,
    password: CONFIG.epagos.password,
    hash: CONFIG.epagos.hash,
  };

  const response = await axios.post(url, new URLSearchParams(payload), {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  const data = response.data;

  if (data.id_resp === "01001" && data.Token) {
    return data.Token;
  }

  throw new Error(`ePagos token error: ${data.id_resp} - ${data.respuesta}`);
}

function verificarHashWebhook(body) {
  const { empresa, nro_operacion, importe, hash } = body;
  if (!empresa || !nro_operacion || !importe || !hash) {
    console.warn("Webhook con campos obligatorios faltantes:", { empresa: !!empresa, nro_operacion: !!nro_operacion, importe: !!importe, hash: !!hash });
    return false;
  }
  const esperado = crypto
    .createHash("md5")
    .update(`${empresa}${nro_operacion}${importe}${CONFIG.epagos.hash}`)
    .digest("hex");
  return esperado === hash;
}

app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.post("/crear-pago", async (req, res) => {
  try {
    const { items, comprador, total } = req.body;

    if (!items?.length) return res.status(400).json({ error: "El carrito está vacío" });
    if (!comprador?.email) return res.status(400).json({ error: "Datos del comprador incompletos" });
    if (!total || total <= 0) return res.status(400).json({ error: "Importe inválido" });
    if (total > 10000000) return res.status(400).json({ error: "Importe excede el máximo permitido" });
    if (!Array.isArray(items) || items.length > 50) return res.status(400).json({ error: "Cantidad de items inválida" });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(comprador.email)) return res.status(400).json({ error: "Email inválido" });

    for (const item of items) {
      if (!item.nombre || typeof item.precio !== "number" || item.precio < 0) {
        return res.status(400).json({ error: "Item inválido en el carrito" });
      }
      if (!item.cantidad || item.cantidad < 1 || item.cantidad > 100) {
        return res.status(400).json({ error: "Cantidad inválida en item del carrito" });
      }
    }

    const totalCalculado = items.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
    if (Math.abs(totalCalculado - total) > 1) {
      return res.status(400).json({ error: "El total no coincide con la suma de los items" });
    }

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

    const token = await obtenerToken();

    const pedidoRef = await db.collection("pedidos").add({
      items: sanitizado.items,
      comprador: sanitizado.comprador,
      total: sanitizado.total,
      estado: "pendiente",
      creadoEn: admin.firestore.FieldValue.serverTimestamp(),
      actualizadoEn: admin.firestore.FieldValue.serverTimestamp(),
    });

    const modo = getModo();
    const checkoutUrl = EPAGOS_CHECKOUT_URL[modo];
    const baseUrl = CONFIG.baseUrl || `https://us-central1-${process.env.GCLOUD_PROJECT || "tu_proyecto"}.cloudfunctions.net/api`;

    const detalleOperacion = sanitizado.items.map((item, idx) => ({
      id_item: String(idx),
      desc_item: item.nombre,
      monto_item: item.precio,
      cantidad_item: item.cantidad,
    }));

    const formData = {
      version: "2.0",
      operacion: "op_pago",
      id_organismo: CONFIG.epagos.idOrganismo,
      convenio: CONFIG.epagos.convenio || "",
      token,
      numero_operacion: pedidoRef.id,
      id_moneda_operacion: "1",
      monto_operacion: sanitizado.total,
      detalle_operacion: encodeURIComponent(JSON.stringify(detalleOperacion)),
      detalle_operacion_visible: "1",
      ok_url: `${baseUrl}/retorno-ok`,
      error_url: `${baseUrl}/retorno-error`,
      nombre_pagador: sanitizado.comprador.nombre,
      apellido_pagador: sanitizado.comprador.apellido,
      email_pagador: sanitizado.comprador.email,
      tipo_doc_pagador: "1",
      numero_doc_pagador: sanitizado.comprador.dni,
      numero_telef_pagador: sanitizado.comprador.telefono,
      calle_dom_pagador: sanitizado.comprador.direccion,
      opc_devolver_qr: "true",
      opc_devolver_codbarras: "false",
      opc_pdf: "false",
    };

    return res.json({
      checkoutUrl,
      formData,
      pedidoId: pedidoRef.id,
    });
  } catch (err) {
    console.error("Error en /crear-pago:", err);
    return res.status(500).json({ error: "Error al crear el pago", detalle: err.message });
  }
});

app.all("/retorno-ok", async (req, res) => {
  try {
    const { id_transaccion, id_resp, numero_operacion, monto_pagado, fp } =
      req.method === "POST" ? req.body : req.query;

    if (numero_operacion) {
      await db.collection("pedidos").doc(numero_operacion).update({
        estado: id_resp === "02001" ? "pagado" : "pendiente_acreditacion",
        idTransaccionEpago: id_transaccion || null,
        formaPago: fp || null,
        montoPagado: monto_pagado || null,
        fechaRespuesta: admin.firestore.FieldValue.serverTimestamp(),
        actualizadoEn: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    return res.redirect(301, `${CONFIG.frontend}/pago-exitoso?id=${numero_operacion || ""}`);
  } catch (err) {
    console.error("Error en /retorno-ok:", err);
    return res.redirect(301, `${CONFIG.frontend}/pago-error`);
  }
});

app.all("/retorno-error", async (req, res) => {
  try {
    const { numero_operacion, id_resp, respuesta } =
      req.method === "POST" ? req.body : req.query;

    if (numero_operacion) {
      await db.collection("pedidos").doc(numero_operacion).update({
        estado: "rechazado",
        codigoRespuesta: id_resp || null,
        respuestaEpago: respuesta || null,
        fechaRespuesta: admin.firestore.FieldValue.serverTimestamp(),
        actualizadoEn: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    return res.redirect(301, `${CONFIG.frontend}/pago-error?id=${numero_operacion || ""}`);
  } catch (err) {
    console.error("Error en /retorno-error:", err);
    return res.redirect(301, `${CONFIG.frontend}/pago-error`);
  }
});

app.post("/webhook", async (req, res) => {
  try {
    if (!verificarIpWebhook(req)) {
      console.warn("Webhook desde IP no autorizada:", getClienteIP(req));
      return res.status(403).send("IP no autorizada");
    }

    let body = req.body;
    if (Buffer.isBuffer(body)) {
      const qs = require("querystring");
      body = qs.parse(body.toString());
    }

    if (!verificarHashWebhook(body)) {
      console.warn("Webhook con hash inválido:", body);
      return res.status(400).json({ error: "Hash inválido" });
    }

    const {
      id_transaccion,
      id_organismo,
      numero_operacion,
      monto_pagado,
      fecha_pago,
      tipo,
      fp,
    } = body;

    if (!numero_operacion) {
      return res.status(400).send("numero_operacion requerido");
    }

    const pedidoRef = db.collection("pedidos").doc(numero_operacion);
    const pedidoSnap = await pedidoRef.get();

    if (!pedidoSnap.exists) {
      return res.status(404).send("Pedido no encontrado");
    }

    const pedidoData = pedidoSnap.data();
    if (monto_pagado && Math.abs(parseFloat(monto_pagado) - pedidoData.total) > 1) {
      console.warn(`Webhook monto mismatch: esperado=${pedidoData.total} recibido=${monto_pagado} pedido=${numero_operacion}`);
    }

    const esDevolucion = tipo === "D";

    await pedidoRef.update({
      estado: esDevolucion ? "devuelto" : "acreditado",
      idTransaccionEpago: id_transaccion || null,
      idOrganismoEpago: id_organismo || null,
      montoPagado: monto_pagado ? parseFloat(monto_pagado) : null,
      fechaPago: fecha_pago || null,
      formaPago: fp || null,
      fechaWebhook: admin.firestore.FieldValue.serverTimestamp(),
      actualizadoEn: admin.firestore.FieldValue.serverTimestamp(),
    });

    return res.status(200).send("OK");
  } catch (err) {
    console.error("Error en /webhook:", err);
    return res.status(500).send("Error interno");
  }
});

app.get("/pedido/:id", async (req, res) => {
  try {
    const doc = await db.collection("pedidos").doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ error: "Pedido no encontrado" });

    const data = doc.data();
    res.json({
      id: doc.id,
      estado: data.estado,
      total: data.total,
      creadoEn: data.creadoEn,
    });
  } catch (err) {
    console.error("Error en /pedido/:id:", err);
    res.status(500).json({ error: "Error interno" });
  }
});

app.get("/admin/pedidos", verificarAdmin, async (req, res) => {
  try {
    const { estado, limit = 50 } = req.query;

    let q = db.collection("pedidos").orderBy("creadoEn", "desc").limit(Number(limit));
    if (estado) q = q.where("estado", "==", estado);

    const snapshot = await q.get();
    const pedidos = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    res.json({ pedidos });
  } catch (err) {
    console.error("Error en /admin/pedidos:", err);
    res.status(500).json({ error: "Error interno" });
  }
});

app.patch("/admin/pedidos/:id", verificarAdmin, async (req, res) => {
  try {
    const { estado } = req.body;
    const estadosValidos = ["pendiente", "pagado", "acreditado", "enviado", "entregado", "rechazado", "devuelto"];

    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({ error: "Estado inválido" });
    }

    await db.collection("pedidos").doc(req.params.id).update({
      estado,
      actualizadoEn: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({ ok: true, estado });
  } catch (err) {
    console.error("Error en PATCH /admin/pedidos:", err);
    res.status(500).json({ error: "Error interno" });
  }
});

app.get("/productos", async (req, res) => {
  try {
    const { categoria, destacado, limit = 100 } = req.query;

    let q = db.collection("productos").limit(Number(limit));
    if (categoria) q = q.where("categoria", "==", categoria);
    if (destacado === "true") q = q.where("destacado", "==", true);

    const snapshot = await q.get();
    const productos = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    res.json({ productos });
  } catch (err) {
    console.error("Error en /productos:", err);
    res.status(500).json({ error: "Error interno" });
  }
});

app.post("/admin/productos", verificarAdmin, async (req, res) => {
  try {
    const { nombre, precio, precioOriginal, categoria, stock, destacado, imagen, descripcion, especificaciones } = req.body;

    if (!nombre || !precio || !categoria) {
      return res.status(400).json({ error: "Campos obligatorios: nombre, precio, categoria" });
    }

    const ref = await db.collection("productos").add({
      nombre,
      precio: Number(precio),
      precioOriginal: precioOriginal ? Number(precioOriginal) : null,
      categoria,
      stock: Number(stock) || 0,
      destacado: Boolean(destacado),
      imagen: imagen || null,
      descripcion: descripcion || "",
      especificaciones: especificaciones || [],
      creadoEn: admin.firestore.FieldValue.serverTimestamp(),
      actualizadoEn: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({ id: ref.id });
  } catch (err) {
    console.error("Error en POST /admin/productos:", err);
    res.status(500).json({ error: "Error interno" });
  }
});

app.patch("/admin/productos/:id", verificarAdmin, async (req, res) => {
  try {
    const updates = { ...req.body, actualizadoEn: admin.firestore.FieldValue.serverTimestamp() };
    if (updates.precio) updates.precio = Number(updates.precio);
    if (updates.precioOriginal) updates.precioOriginal = Number(updates.precioOriginal);
    if (updates.stock !== undefined) updates.stock = Number(updates.stock);

    await db.collection("productos").doc(req.params.id).update(updates);
    res.json({ ok: true });
  } catch (err) {
    console.error("Error en PATCH /admin/productos:", err);
    res.status(500).json({ error: "Error interno" });
  }
});

app.delete("/admin/productos/:id", verificarAdmin, async (req, res) => {
  try {
    await db.collection("productos").doc(req.params.id).delete();
    res.json({ ok: true });
  } catch (err) {
    console.error("Error en DELETE /admin/productos:", err);
    res.status(500).json({ error: "Error interno" });
  }
});

exports.api = functions
  .region("us-central1")
  .runWith({ memory: "256MB", timeoutSeconds: 30 })
  .https.onRequest(app);
