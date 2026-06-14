// supabase/functions/webhook-epagos/index.ts
// Recibe la notificación (webhook) de E-pagos cuando se acredita un pago.
// La URL de este webhook se configura en el panel de E-pagos → Desarrolladores.
//
// Campos que envía E-pagos (form-data):
//   id_resp           -> "02001" cuando es un pago acreditado
//   id_transaccion    -> id de la transacción
//   id_organismo      -> nuestro organismo
//   convenio          -> convenio usado
//   numero_operacion  -> el nro_operacion que mandamos en crear-pago
//   monto_pagado      -> monto acreditado
//   tipo              -> "P" pago | "D" devolución/reembolso
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok')
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const body = await req.formData()
    const idResp = body.get('id_resp')?.toString()
    const numeroOperacion = body.get('numero_operacion')?.toString()
    const idOrganismo = body.get('id_organismo')?.toString()
    const tipo = body.get('tipo')?.toString() // P = pago, D = devolución

    if (!numeroOperacion) {
      return new Response(
        JSON.stringify({ error: 'Falta numero_operacion' }),
        { headers: { 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Verificación básica: el organismo debe coincidir con el nuestro
    const organismoEsperado = Deno.env.get('EPAGOS_ID_ORGANISMO')
    if (organismoEsperado && idOrganismo && idOrganismo !== organismoEsperado) {
      return new Response(
        JSON.stringify({ error: 'Organismo no coincide' }),
        { headers: { 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    // Determinar el nuevo estado
    // id_resp 02001 = pago acreditado; tipo D = reembolso.
    // Si llega otra cosa, NO degradamos el pedido (solo confirmamos recepción).
    let nuevoEstado: string | null
    if (tipo === 'D') {
      nuevoEstado = 'reembolsado'
    } else if (idResp === '02001') {
      nuevoEstado = 'pagado'
    } else {
      nuevoEstado = null
    }

    // 1. Buscar como pedido
    const { data: pedido } = await supabaseClient
      .from('pedidos')
      .select('id, estado')
      .eq('nro_operacion', numeroOperacion)
      .single()

    if (pedido) {
      // Idempotencia: no tocar si ya está en ese estado o si no hay cambio que aplicar
      if (nuevoEstado && pedido.estado !== nuevoEstado) {
        const { error } = await supabaseClient
          .from('pedidos')
          .update({ estado: nuevoEstado, actualizado_en: new Date().toISOString() })
          .eq('nro_operacion', numeroOperacion)

        if (error) throw error
      }

      return new Response(
        JSON.stringify({ success: true, tipo: 'pedido', estado: nuevoEstado ?? pedido.estado }),
        { headers: { 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    // 2. Buscar como suscripción
    const { data: suscripcion } = await supabaseClient
      .from('suscripciones')
      .select('id')
      .eq('nro_operacion', numeroOperacion)
      .single()

    if (suscripcion) {
      const estadoSusc = idResp === '02001' ? 'activa' : 'pendiente'
      const { error } = await supabaseClient
        .from('suscripciones')
        .update({ estado: estadoSusc, actualizado_en: new Date().toISOString() })
        .eq('nro_operacion', numeroOperacion)

      if (error) throw error

      return new Response(
        JSON.stringify({ success: true, tipo: 'suscripcion', estado: estadoSusc }),
        { headers: { 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Operación no encontrada' }),
      { headers: { 'Content-Type': 'application/json' }, status: 404 }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
