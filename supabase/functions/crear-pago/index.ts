// supabase/functions/crear-pago/index.ts
// Integración E-Checkout de E-pagos:
//  1) crea el pedido en Supabase
//  2) obtiene un token (con credenciales secretas, server-side)
//  3) devuelve los campos para que el front haga el POST a E-pagos
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const FRONTEND_URL = Deno.env.get('FRONTEND_URL') ?? 'https://sab-ediciones-8a2c7.web.app'
const origin = FRONTEND_URL.replace(/\/$/, '')

const allowedOrigins = [origin, 'http://localhost:3000', 'http://localhost:5173']

function getCorsHeaders(req: Request) {
  const reqOrigin = req.headers.get('origin') ?? ''
  const allow = allowedOrigins.includes(reqOrigin) ? reqOrigin : origin
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req)

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      authHeader ? { global: { headers: { Authorization: authHeader } } } : {}
    )

    const { items, comprador, total } = await req.json()

    // 1. Crear el pedido en Supabase
    const { data: pedido, error: errorPedido } = await supabaseClient
      .from('pedidos')
      .insert([{
        comprador,
        items,
        total,
        estado: 'pendiente',
        nro_operacion: `EP-${Date.now()}`,
        creado_en: new Date().toISOString(),
      }])
      .select()
      .single()

    if (errorPedido) throw errorPedido

    // 2. Credenciales E-pagos (en Supabase Secrets)
    const idOrganismo = Deno.env.get('EPAGOS_ID_ORGANISMO') ?? ''
    const idUsuario = Deno.env.get('EPAGOS_ID_USUARIO') ?? ''
    const password = Deno.env.get('EPAGOS_PASSWORD') ?? ''
    const hash = Deno.env.get('EPAGOS_HASH') ?? ''
    const convenio = Deno.env.get('EPAGOS_CONVENIO') || 'null' // null => E-pagos lo infiere
    const modo = Deno.env.get('EPAGOS_MODO') || 'sandbox'

    const tokenUrl = modo === 'produccion'
      ? 'https://api.epagos.com/post.php'
      : 'https://sandbox.epagos.com/post.php'
    const postUrl = modo === 'produccion'
      ? 'https://post.epagos.com'
      : 'https://postsandbox.epagos.com'

    // 3. Obtener token de E-pagos
    const tokenBody = new URLSearchParams({
      id_usuario: idUsuario,
      id_organismo: idOrganismo,
      password,
      hash,
    })

    const tokenRes = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: tokenBody,
    })

    const tokenData = await tokenRes.json()

    if (tokenData.id_resp !== '01001' || !tokenData.token) {
      throw new Error(`E-pagos no generó el token: ${tokenData.respuesta || 'error desconocido'}`)
    }

    // 4. Devolver los campos para el POST del formulario al checkout de E-pagos
    return new Response(
      JSON.stringify({
        success: true,
        pedidoId: pedido.id,
        postUrl,
        campos: {
          version: '2.0',
          operacion: 'op_pago',
          id_organismo: idOrganismo,
          convenio,
          token: tokenData.token,
          numero_operacion: pedido.nro_operacion,
          id_moneda_operacion: '1',
          monto_operacion: Number(total).toFixed(2),
          ok_url: `${origin}/pago-exitoso?id=${pedido.id}`,
          error_url: `${origin}/pago-error?id=${pedido.id}`,
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
