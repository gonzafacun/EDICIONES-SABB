// functions/index.js
// Backend serverless — Firebase Functions
// APIs: crear pago E-pagos, webhook de confirmación, gestión de pedidos

const functions = require("firebase-functions");
const admin     = require("firebase-admin");
const express   = require("express");
const cors      = require("cors");
const axios     = require("axios");
const crypto    = require("crypto");

admin.initializeApp();
const db = admin.firestore();

// ─── Configuración ────────────────────────────────────────
const CONFIG = {
  epagos: {
    empresa:  process.env.EPAGOS_EMPRESA  || functions.config().epagos?.empresa,
    hash:     process.env.EPAGOS_HASH     || functions.config().epagos?.hash,
    modo:     process.env.EPAGOS_MODO     || functions.config().epagos?.modo || "sandbox",
  },
  frontend: process.env.FRONTEND_URL || functions.config().app?.frontend_url || "http://localhost:3000",
};

const EPAGOS_BASE = CONFIG.epagos.modo === "produccion"
  ? "https://www.e-pagos.com.ar"
  : "https://sandbox.e-pagos.com.ar";

// ─── App Express ──────────────────────────────────────────
const app = express();

app.use(cors({
  origin: [CONFIG.frontend, "http://localhost:3000"],
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// Para el webhook de E-pagos necesitamos el body raw
app.use((req, res, next) => {
  if (req.path === "/webhook") {
    express.raw({ type: "*/*" })(req, res, next);
  } else {
    express.json()(req, res, next);
  }
});

// ─── Middlewares ──────────────────────────────────────────

// Verifica que el request venga con un Firebase ID Token válido
async function verificarAdmin(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No autorizado" });
  }
  try {
    const token = auth.split("Bearer ")[1];
    const decoded = await admin.auth().verifyIdToken(token);

    // Verificar que el uid esté en la colección /admins
    const adminDoc = await db.collection("admins").doc(decoded.uid).get();
    if (!adminDoc.exists) return res.status(403).json({ error: "Acceso denegado" });

    req.adminUid = decoded.uid;
    next();
  } catch {
    return res.status(401).json({ error: "Token inválido" });
  }
}

// ─── HELPERS E-PAGOS ──────────────────────────────────────

// Genera el hash de seguridad requerido por E-pagos
// hash = MD5(empresa + nro_operacion + importe + hash_secreto)
function generarHashEpagos(nroOperacion, importe) {
  const str = `${CONFIG.epagos.empresa}${nroOperacion}${importe}${CONFIG.epagos.hash}`;
  return crypto.createHash("md5").update(str).digest("hex");
}

// Verifica el hash del webhook de E-pagos
function verificarHashWebhook(body) {
  const { empresa, nro_operacion, importe, hash } = body;
  const esperado = crypto
    .createHash("md5")
    .update(`${empresa}${nro_operacion}${importe}${CONFIG.epagos.hash}`)
    .digest("hex");
  return esperado === hash;
}

// Formatea el importe como string sin decimales (ej: "850000")
function formatearImporte(precio) {
  return Math.round(precio).toString();
}

// ─── RUTAS ────────────────────────────────────────────────

// GET /api/health — chequeo de salud
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ─────────────────────────────────────────────────────────
// POST /api/crear-pago
// Recibe el pedido del frontend, lo guarda en Firestore
// y devuelve la URL del checkout de E-pagos
// ─────────────────────────────────────────────────────────
app.post("/crear-pago", async (req, res) => {
  try {
    const { items, comprador, total } = req.body;

    // Validaciones básicas
    if (!items?.length)   return res.status(400).json({ error: "El carrito está vacío" });
    if (!comprador?.email) return res.status(400).json({ error: "Datos del comprador incompletos" });
    if (!total || total <= 0) return res.status(400).json({ error: "Importe inválido" });

    // Generar número de operación único
    const nroOperacion = `TS-${Date.now()}`;
    const importe      = formatearImporte(total);
    const hash         = generarHashEpagos(nroOperacion, importe);

    // Guardar pedido en Firestore con estado "pendiente"
    const pedidoRef = await db.collection("pedidos").add({
      nroOperacion,
      items,
      comprador,
      total,
      estado:    "pendiente",
      creadoEn:  admin.firestore.FieldValue.serverTimestamp(),
      actualizadoEn: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Construir parámetros para E-pagos (Botón de Pago / E-Checkout)
    const params = new URLSearchParams({
      empresa:        CONFIG.epagos.empresa,
      nro_operacion:  nroOperacion,
      importe,
      hash,
      concepto:       `Pedido TechStore - ${items.length} producto(s)`,
      nombre:         `${comprador.nombre} ${comprador.apellido}`,
      email:          comprador.email,
      url_ok:         `${CONFIG.frontend}/pago/confirmado?pedido=${pedidoRef.id}`,
      url_error:      `${CONFIG.frontend}/pago/error?pedido=${pedidoRef.id}`,
      url_webhook:    `${EPAGOS_BASE.replace("sandbox.", "")}`, // E-pagos llama a este endpoint
    });

    const urlPago = `${EPAGOS_BASE}/pagar?${params.toString()}`;

    res.json({
      url:        urlPago,
      pedidoId:   pedidoRef.id,
      nroOperacion,
    });

  } catch (err) {
    console.error("Error en /crear-pago:", err);
    res.status(500).json({ error: "Error interno al crear el pago" });
  }
});

// ─────────────────────────────────────────────────────────
// POST /api/webhook
// E-pagos llama a este endpoint cuando se confirma un pago
// ─────────────────────────────────────────────────────────
app.post("/webhook", async (req, res) => {
  try {
    // E-pagos puede enviar form-encoded o JSON
    let body = req.body;
    if (Buffer.isBuffer(body)) {
      const qs = require("querystring");
      body = qs.parse(body.toString());
    }

    const { nro_operacion, estado, importe } = body;

    // Verificar hash de seguridad
    if (!verificarHashWebhook(body)) {
      console.warn("Webhook con hash inválido:", body);
      return res.status(400).json({ error: "Hash inválido" });
    }

    // Buscar el pedido en Firestore por nro_operacion
    const snapshot = await db.collection("pedidos")
      .where("nroOperacion", "==", nro_operacion)
      .limit(1)
      .get();

    if (snapshot.empty) {
      console.warn("Pedido no encontrado:", nro_operacion);
      return res.status(404).json({ error: "Pedido no encontrado" });
    }

    const pedidoDoc = snapshot.docs[0];

    // Mapear estado de E-pagos a nuestro sistema
    // E-pagos: "aprobado" | "rechazado" | "pendiente" | "devuelto"
    const estadoMap = {
      aprobado:  "pagado",
      rechazado: "rechazado",
      pendiente: "pendiente",
      devuelto:  "devuelto",
    };

    const nuevoEstado = estadoMap[estado?.toLowerCase()] || "desconocido";

    await pedidoDoc.ref.update({
      estado:        nuevoEstado,
      actualizadoEn: admin.firestore.FieldValue.serverTimestamp(),
      datosPago: { estado, importe, ...body },
    });

    console.log(`Pedido ${nro_operacion} → ${nuevoEstado}`);
    res.json({ ok: true });

  } catch (err) {
    console.error("Error en /webhook:", err);
    res.status(500).json({ error: "Error interno" });
  }
});

// ─────────────────────────────────────────────────────────
// GET /api/pedido/:id
// Consulta el estado de un pedido (llamado desde /pago/confirmado)
// ─────────────────────────────────────────────────────────
app.get("/pedido/:id", async (req, res) => {
  try {
    const doc = await db.collection("pedidos").doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ error: "Pedido no encontrado" });

    const data = doc.data();
    // Solo exponer los campos necesarios al frontend público
    res.json({
      id:           doc.id,
      estado:       data.estado,
      total:        data.total,
      nroOperacion: data.nroOperacion,
      creadoEn:     data.creadoEn,
    });
  } catch (err) {
    console.error("Error en /pedido/:id:", err);
    res.status(500).json({ error: "Error interno" });
  }
});

// ─────────────────────────────────────────────────────────
// GET /api/admin/pedidos  [PROTEGIDO]
// Lista todos los pedidos para el panel admin
// ─────────────────────────────────────────────────────────
app.get("/admin/pedidos", verificarAdmin, async (req, res) => {
  try {
    const { estado, limit = 50 } = req.query;

    let query = db.collection("pedidos").orderBy("creadoEn", "desc").limit(Number(limit));
    if (estado) query = query.where("estado", "==", estado);

    const snapshot = await query.get();
    const pedidos  = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    res.json({ pedidos });
  } catch (err) {
    console.error("Error en /admin/pedidos:", err);
    res.status(500).json({ error: "Error interno" });
  }
});

// ─────────────────────────────────────────────────────────
// PATCH /api/admin/pedidos/:id  [PROTEGIDO]
// Actualiza el estado de un pedido manualmente
// ─────────────────────────────────────────────────────────
app.patch("/admin/pedidos/:id", verificarAdmin, async (req, res) => {
  try {
    const { estado } = req.body;
    const estadosValidos = ["pendiente", "pagado", "enviado", "entregado", "rechazado", "devuelto"];

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

// ─────────────────────────────────────────────────────────
// GET /api/productos  [PÚBLICO]
// Lista productos desde Firestore (para cuando conectemos el frontend)
// ─────────────────────────────────────────────────────────
app.get("/productos", async (req, res) => {
  try {
    const { categoria, destacado, limit = 100 } = req.query;

    let query = db.collection("productos").limit(Number(limit));
    if (categoria) query = query.where("categoria", "==", categoria);
    if (destacado === "true") query = query.where("destacado", "==", true);

    const snapshot  = await query.get();
    const productos = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    res.json({ productos });
  } catch (err) {
    console.error("Error en /productos:", err);
    res.status(500).json({ error: "Error interno" });
  }
});

// ─────────────────────────────────────────────────────────
// POST /api/admin/productos  [PROTEGIDO]
// Crea un nuevo producto en Firestore
// ─────────────────────────────────────────────────────────
app.post("/admin/productos", verificarAdmin, async (req, res) => {
  try {
    const { nombre, precio, precioOriginal, categoria, stock, destacado, imagen, descripcion, especificaciones } = req.body;

    if (!nombre || !precio || !categoria) {
      return res.status(400).json({ error: "Campos obligatorios: nombre, precio, categoria" });
    }

    const ref = await db.collection("productos").add({
      nombre,
      precio:          Number(precio),
      precioOriginal:  precioOriginal ? Number(precioOriginal) : null,
      categoria,
      stock:           Number(stock) || 0,
      destacado:       Boolean(destacado),
      imagen:          imagen || null,
      descripcion:     descripcion || "",
      especificaciones: especificaciones || [],
      creadoEn:        admin.firestore.FieldValue.serverTimestamp(),
      actualizadoEn:   admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({ id: ref.id });
  } catch (err) {
    console.error("Error en POST /admin/productos:", err);
    res.status(500).json({ error: "Error interno" });
  }
});

// ─────────────────────────────────────────────────────────
// PATCH /api/admin/productos/:id  [PROTEGIDO]
// Actualiza un producto existente
// ─────────────────────────────────────────────────────────
app.patch("/admin/productos/:id", verificarAdmin, async (req, res) => {
  try {
    const updates = { ...req.body, actualizadoEn: admin.firestore.FieldValue.serverTimestamp() };
    if (updates.precio)         updates.precio         = Number(updates.precio);
    if (updates.precioOriginal) updates.precioOriginal = Number(updates.precioOriginal);
    if (updates.stock !== undefined) updates.stock     = Number(updates.stock);

    await db.collection("productos").doc(req.params.id).update(updates);
    res.json({ ok: true });
  } catch (err) {
    console.error("Error en PATCH /admin/productos:", err);
    res.status(500).json({ error: "Error interno" });
  }
});

// ─────────────────────────────────────────────────────────
// DELETE /api/admin/productos/:id  [PROTEGIDO]
// Elimina un producto
// ─────────────────────────────────────────────────────────
app.delete("/admin/productos/:id", verificarAdmin, async (req, res) => {
  try {
    await db.collection("productos").doc(req.params.id).delete();
    res.json({ ok: true });
  } catch (err) {
    console.error("Error en DELETE /admin/productos:", err);
    res.status(500).json({ error: "Error interno" });
  }
});

// ─── Exportar como Firebase Function ─────────────────────
exports.api = functions
  .region("us-central1")
  .runWith({ memory: "256MB", timeoutSeconds: 30 })
  .https.onRequest(app);
