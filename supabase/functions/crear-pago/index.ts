// supabase/functions/crear-pago/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const ALLOWED_ORIGIN = Deno.env.get('FRONTEND_URL') ?? 'https://ediciones-sab.web.app'

const corsHeaders = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
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

    // 2. Configurar E-pagos
    const idOrganismo = Deno.env.get('EPAGOS_ID_ORGANISMO')
    const hash = Deno.env.get('EPAGOS_HASH')
    const modo = Deno.env.get('EPAGOS_MODO') || 'sandbox'
    
    const baseUrl = modo === 'sandbox' 
      ? 'https://sandbox.e-pagos.com.ar' 
      : 'https://www.e-pagos.com.ar'

    // 3. Generar hash para E-pagos
    const nroOperacion = pedido.nro_operacion
    const importe = total.toFixed(2)
    const hashInput = `${idOrganismo}${nroOperacion}${importe}${hash}`
    
    // MD5 hash (usando Web Crypto API)
    const encoder = new TextEncoder()
    const data = encoder.encode(hashInput)
    const hashBuffer = await crypto.subtle.digest('MD5', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashResult = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

    // 4. Construir URL de E-pagos
    const epagosUrl = `${baseUrl}/sale`
    const params = new URLSearchParams({
      empresa: idOrganismo!,
      nro_operacion: nroOperacion,
      importe: importe,
      hash: hashResult,
      url_ok: `${Deno.env.get('FRONTEND_URL')}/pago/confirmado`,
      url_error: `${Deno.env.get('FRONTEND_URL')}/pago/error`,
      url_confirmacion: `${Deno.env.get('FRONTEND_URL')}/api/webhook-epagos`,
    })

    // 5. Retornar la URL de pago
    return new Response(
      JSON.stringify({
        success: true,
        urlPago: `${epagosUrl}?${params.toString()}`,
        pedidoId: pedido.id,
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