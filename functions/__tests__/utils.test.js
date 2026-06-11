const {
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
} = require("../utils");

beforeEach(() => {
  rateLimitMap.clear();
});

describe("rateLimit", () => {
  test("permite solicitudes dentro del límite", () => {
    expect(rateLimit("test", 5, 60000)).toBe(false);
    expect(rateLimit("test", 5, 60000)).toBe(false);
    expect(rateLimit("test", 5, 60000)).toBe(false);
  });

  test("bloquea al exceder el límite", () => {
    for (let i = 0; i < 5; i++) rateLimit("test", 5, 60000);
    expect(rateLimit("test", 5, 60000)).toBe(true);
  });

  test("claves distintas tienen contadores independientes", () => {
    for (let i = 0; i < 5; i++) rateLimit("key1", 5, 60000);
    expect(rateLimit("key1", 5, 60000)).toBe(true);
    expect(rateLimit("key2", 5, 60000)).toBe(false);
  });

  test("resetea después de la ventana de tiempo", () => {
    rateLimit("test", 2, 1);
    rateLimit("test", 2, 1);
    expect(rateLimit("test", 2, 1)).toBe(true);
    return new Promise((resolve) => {
      setTimeout(() => {
        expect(rateLimit("test", 2, 1)).toBe(false);
        resolve();
      }, 10);
    });
  });
});

describe("cleanupRateLimit", () => {
  test("elimina entradas expiradas", () => {
    rateLimitMap.set("old", { start: Date.now() - 200000, count: 1 });
    rateLimitMap.set("fresh", { start: Date.now(), count: 1 });
    cleanupRateLimit();
    expect(rateLimitMap.has("old")).toBe(false);
    expect(rateLimitMap.has("fresh")).toBe(true);
  });
});

describe("getClienteIP", () => {
  test("extrae IP de x-forwarded-for", () => {
    const req = { headers: { "x-forwarded-for": "1.2.3.4, 5.6.7.8" } };
    expect(getClienteIP(req)).toBe("1.2.3.4");
  });

  test("usa remoteAddress si no hay header", () => {
    const req = { headers: {}, connection: { remoteAddress: "10.0.0.1" } };
    expect(getClienteIP(req)).toBe("10.0.0.1");
  });

  test("retorna 0.0.0.0 si no hay info", () => {
    const req = { headers: {} };
    expect(getClienteIP(req)).toBe("0.0.0.0");
  });
});

describe("verificarIpWebhook", () => {
  test("permite si lista de IPs está vacía", () => {
    const req = { headers: { "x-forwarded-for": "1.1.1.1" } };
    expect(verificarIpWebhook(req, [])).toBe(true);
    expect(verificarIpWebhook(req, null)).toBe(true);
  });

  test("permite IP en la lista", () => {
    const req = { headers: { "x-forwarded-for": "200.0.241.114" } };
    expect(verificarIpWebhook(req, EPAGOS_IPS_SANDBOX)).toBe(true);
  });

  test("rechaza IP no autorizada", () => {
    const req = { headers: { "x-forwarded-for": "1.1.1.1" } };
    expect(verificarIpWebhook(req, EPAGOS_IPS_SANDBOX)).toBe(false);
  });
});

describe("verificarHashWebhook", () => {
  const hashSecreto = "mi_hash_secreto";
  const crypto = require("crypto");

  test("retorna false si faltan campos obligatorios", () => {
    expect(verificarHashWebhook({}, hashSecreto)).toBe(false);
    expect(verificarHashWebhook({ empresa: "1" }, hashSecreto)).toBe(false);
    expect(verificarHashWebhook({ empresa: "1", nro_operacion: "2" }, hashSecreto)).toBe(false);
    expect(verificarHashWebhook({ empresa: "1", nro_operacion: "2", importe: "100" }, hashSecreto)).toBe(false);
  });

  test("valida hash correcto", () => {
    const empresa = "123";
    const nro_operacion = "ABC";
    const importe = "5000";
    const hash = crypto.createHash("md5")
      .update(`${empresa}${nro_operacion}${importe}${hashSecreto}`)
      .digest("hex");
    expect(verificarHashWebhook({ empresa, nro_operacion, importe, hash }, hashSecreto)).toBe(true);
  });

  test("rechaza hash incorrecto", () => {
    expect(verificarHashWebhook({
      empresa: "1", nro_operacion: "2", importe: "3", hash: "invalido",
    }, hashSecreto)).toBe(false);
  });
});

describe("validarCrearPago", () => {
  const basePayload = {
    items: [{ nombre: "Libro", precio: 5000, cantidad: 2 }],
    comprador: { email: "test@test.com", nombre: "Ana", dni: "12345678" },
    total: 10000,
  };

  test("retorna null para payload válido", () => {
    expect(validarCrearPago(basePayload)).toBeNull();
  });

  test("rechaza carrito vacío", () => {
    expect(validarCrearPago({ ...basePayload, items: [] })).toBe("El carrito está vacío");
  });

  test("rechaza sin email", () => {
    expect(validarCrearPago({ ...basePayload, comprador: { email: "" } })).toBe("Datos del comprador incompletos");
  });

  test("rechaza email inválido", () => {
    expect(validarCrearPago({ ...basePayload, comprador: { email: "no-email" } })).toBe("Email inválido");
  });

  test("rechaza total negativo", () => {
    expect(validarCrearPago({ ...basePayload, total: -100 })).toBe("Importe inválido");
  });

  test("rechaza total que excede máximo", () => {
    expect(validarCrearPago({ ...basePayload, total: 20000000 })).toBe("Importe excede el máximo permitido");
  });

  test("rechaza más de 50 items", () => {
    const items = Array(51).fill({ nombre: "X", precio: 100, cantidad: 1 });
    expect(validarCrearPago({ ...basePayload, items, total: 5100 })).toBe("Cantidad de items inválida");
  });

  test("rechaza item con precio negativo", () => {
    const items = [{ nombre: "X", precio: -100, cantidad: 1 }];
    expect(validarCrearPago({ ...basePayload, items, total: -100 })).toBe("Importe inválido");
  });

  test("rechaza item con precio negativo y total positivo", () => {
    const items = [{ nombre: "X", precio: -100, cantidad: 1 }];
    expect(validarCrearPago({ items, comprador: basePayload.comprador, total: 5000 })).toBe("Item inválido en el carrito");
  });

  test("rechaza cantidad inválida", () => {
    const items = [{ nombre: "X", precio: 100, cantidad: 0 }];
    expect(validarCrearPago({ ...basePayload, items, total: 0 })).toBe("Importe inválido");
  });

  test("rechaza cantidad > 100", () => {
    const items = [{ nombre: "X", precio: 100, cantidad: 200 }];
    expect(validarCrearPago({ items, comprador: basePayload.comprador, total: 20000 })).toBe("Cantidad inválida en item del carrito");
  });

  test("rechaza si total no coincide con items", () => {
    expect(validarCrearPago({ ...basePayload, total: 999 })).toBe("El total no coincide con la suma de los items");
  });

  test("acepta diferencia de hasta $1 por redondeo", () => {
    expect(validarCrearPago({ ...basePayload, total: 10001 })).toBeNull();
  });
});

describe("sanitizarCrearPago", () => {
  test("trunca nombre de item a 200 chars", () => {
    const result = sanitizarCrearPago({
      items: [{ nombre: "A".repeat(300), precio: 100, cantidad: 1 }],
      comprador: { nombre: "X", email: "x@x.com" },
      total: 100,
    });
    expect(result.items[0].nombre.length).toBe(200);
  });

  test("limpia DNI dejando solo dígitos", () => {
    const result = sanitizarCrearPago({
      items: [{ nombre: "X", precio: 100, cantidad: 1 }],
      comprador: { dni: "12.345.678", email: "x@x.com" },
      total: 100,
    });
    expect(result.comprador.dni).toBe("12345678");
  });

  test("limpia teléfono dejando solo caracteres válidos", () => {
    const result = sanitizarCrearPago({
      items: [{ nombre: "X", precio: 100, cantidad: 1 }],
      comprador: { telefono: "+54 (011) <script>1234</script>", email: "x@x.com" },
      total: 100,
    });
    expect(result.comprador.telefono).toBe("+54 (011) 1234");
  });

  test("trunca dirección a 300 chars", () => {
    const result = sanitizarCrearPago({
      items: [{ nombre: "X", precio: 100, cantidad: 1 }],
      comprador: { direccion: "C".repeat(500), email: "x@x.com" },
      total: 100,
    });
    expect(result.comprador.direccion.length).toBe(300);
  });

  test("convierte precio y cantidad a Number", () => {
    const result = sanitizarCrearPago({
      items: [{ nombre: "X", precio: "100", cantidad: "3" }],
      comprador: { email: "x@x.com" },
      total: "300",
    });
    expect(result.items[0].precio).toBe(100);
    expect(result.items[0].cantidad).toBe(3);
    expect(result.total).toBe(300);
  });
});
