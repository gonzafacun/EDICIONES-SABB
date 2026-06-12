import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { usuarioId, monto, convenio, tarjeta, titular, email } = await req.json()

    const { data: admin } = await supabaseClient
      .from('admins')
      .select('*')
      .eq('id', usuarioId)
      .single()

    if (!admin) {
      return new Response(
        JSON.stringify({ error: 'No autorizado' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    const nroOperacion = `SUB-${Date.now()}`

    const { data: suscripcion, error: errorSuscripcion } = await supabaseClient
      .from('suscripciones')
      .insert([{
        usuario_id: usuarioId,
        nro_operacion: nroOperacion,
        monto,
        convenio,
        estado: 'pendiente',
        creado_en: new Date().toISOString(),
      }])
      .select()
      .single()

    if (errorSuscripcion) throw errorSuscripcion

    const idOrganismo = Deno.env.get('EPAGOS_ID_ORGANISMO')
    const idUsuario = Deno.env.get('EPAGOS_ID_USUARIO')
    const password = Deno.env.get('EPAGOS_PASSWORD')
    const modo = Deno.env.get('EPAGOS_MODO') || 'sandbox'

    const baseUrl = modo === 'sandbox' 
      ? 'https://sandbox.e-pagos.com.ar' 
      : 'https://www.e-pagos.com.ar'

    const epagosUrl = `${baseUrl}/suscripcion`
    const params = new URLSearchParams({
      empresa: idOrganismo!,
      usuario: idUsuario,
      password,
      nro_operacion: nroOperacion,
      monto: monto.toFixed(2),
      convenio: convenio,
      email,
      titular,
      url_ok: `${Deno.env.get('FRONTEND_URL')}/suscripcion/confirmada`,
      url_error: `${Deno.env.get('FRONTEND_URL')}/suscripcion/error`,
    })

    return new Response(
      JSON.stringify({
        success: true,
        urlSuscripcion: `${epagosUrl}?${params.toString()}`,
        suscripcionId: suscripcion.id,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})