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
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const body = await req.formData()
    const nroOperacion = body.get('nro_operacion')?.toString()
    const estado = body.get('estado')?.toString()
    const hashRecibido = body.get('hash')?.toString()

    if (!nroOperacion || !estado || !hashRecibido) {
      return new Response(
        JSON.stringify({ error: 'Datos incompletos' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const idOrganismo = Deno.env.get('EPAGOS_ID_ORGANISMO')
    const hashSecret = Deno.env.get('EPAGOS_HASH')
    
    const hashInput = `${idOrganismo}${nroOperacion}${hashSecret}`
    const encoder = new TextEncoder()
    const data = encoder.encode(hashInput)
    const hashBuffer = await crypto.subtle.digest('MD5', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashCalculado = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

    if (hashCalculado !== hashRecibido) {
      return new Response(
        JSON.stringify({ error: 'Hash inválido' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    const { data: pedido } = await supabaseClient
      .from('pedidos')
      .select('*')
      .eq('nro_operacion', nroOperacion)
      .single()

    if (pedido) {
      const nuevoEstado = estado === 'A' ? 'pagado' : estado === 'R' ? 'rechazado' : 'pendiente'
      
      const { error } = await supabaseClient
        .from('pedidos')
        .update({ 
          estado: nuevoEstado,
          actualizado_en: new Date().toISOString(),
        })
        .eq('nro_operacion', nroOperacion)

      if (error) throw error

      return new Response(
        JSON.stringify({ success: true, tipo: 'pedido', estado: nuevoEstado }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    const { data: suscripcion } = await supabaseClient
      .from('suscripciones')
      .select('*')
      .eq('nro_operacion', nroOperacion)
      .single()

    if (suscripcion) {
      const nuevoEstado = estado === 'A' ? 'activa' : estado === 'R' ? 'cancelada' : 'pendiente'
      
      const { error } = await supabaseClient
        .from('suscripciones')
        .update({ 
          estado: nuevoEstado,
          actualizado_en: new Date().toISOString(),
        })
        .eq('nro_operacion', nroOperacion)

      if (error) throw error

      return new Response(
        JSON.stringify({ success: true, tipo: 'suscripcion', estado: nuevoEstado }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Operación no encontrada' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})