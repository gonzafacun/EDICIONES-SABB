// src/services/epagos.js
// Inicia un pago con E-pagos: llama a la edge function crear-pago y,
// con la respuesta, arma y envía el formulario POST a la pasarela.

export async function iniciarPago({ items, comprador, total, extra = {} }) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Faltan las variables de entorno de Supabase");
  }

  const res = await fetch(`${supabaseUrl}/functions/v1/crear-pago`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${supabaseAnonKey}`,
      apikey: supabaseAnonKey,
    },
    body: JSON.stringify({ items, comprador, total, ...extra }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData.error || `Error del servidor: ${res.status} ${res.statusText}`
    );
  }

  const data = await res.json();

  if (!data.postUrl || !data.campos) {
    throw new Error(data.error || "No se recibió la información de pago");
  }

  // E-pagos requiere un POST de formulario para abrir el checkout
  const form = document.createElement("form");
  form.method = "POST";
  form.action = data.postUrl;

  Object.entries(data.campos).forEach(([name, value]) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
}
