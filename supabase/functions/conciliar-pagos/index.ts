// supabase/functions/conciliar-pagos/index.ts
// Conciliación de pagos con la API SOAP de E-pagos (nivel 3 de Control de operaciones).
//
// Flujo:
//   1) obtener_token (SOAP)  -> credenciales {id_usuario, id_organismo, password, hash}
//   2) obtener_pagos  (SOAP) -> credenciales {id_organismo, token} + criterios (rango de fechas)
//   3) Por cada pago en estado A (Acreditada) marca el pedido como 'pagado'.
//      Por cada pago en estado D (Devuelto) marca el pedido como 'reembolsado'.
//
// Pensada para correr periódicamente (cron diario) o invocarse manualmente con un
// body opcional { fecha_desde, fecha_hasta } en formato AAAA-MM-DD.
//
// NOTA: la API SOAP es RPC/SOAP 1.1. El sobre se arma a mano porque Deno no tiene SoapClient.
// Primero conviene validar `obtener_token` (devuelve id_resp 01001) para confirmar el formato
// del envelope y que las credenciales sirven también para la API (no solo para el checkout).
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const VERSION = '2.0'
// targetNamespace declarado en el WSDL (ojo: es .net aunque el endpoint sea .com)
const TNS = 'https://sandbox.epagos.net/'

function endpoints(modo: string) {
  const base = modo === 'produccion'
    ? 'https://api.epagos.com/wsdl/2.1/index.php'
    : 'https://sandbox.epagos.com/wsdl/2.1/index.php'
  return { wsdlUrl: base, soapAction: (op: string) => `${base}/${op}` }
}

// Escapa caracteres XML en los valores
function xmlEscape(v: string | number): string {
  return String(v)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

// Arma un sobre SOAP 1.1 RPC/encoded (estilo SoapClient de PHP)
function soapEnvelope(operation: string, innerXml: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>` +
    `<SOAP-ENV:Envelope ` +
    `xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" ` +
    `xmlns:ns1="${TNS}" ` +
    `xmlns:xsd="http://www.w3.org/2001/XMLSchema" ` +
    `xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ` +
    `xmlns:SOAP-ENC="http://schemas.xmlsoap.org/soap/encoding/" ` +
    `SOAP-ENV:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">` +
    `<SOAP-ENV:Body><ns1:${operation}>${innerXml}</ns1:${operation}></SOAP-ENV:Body>` +
    `</SOAP-ENV:Envelope>`
}

async function soapCall(modo: string, operation: string, innerXml: string): Promise<string> {
  const { wsdlUrl, soapAction } = endpoints(modo)
  const res = await fetch(wsdlUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/xml; charset=utf-8',
      'SOAPAction': `"${soapAction(operation)}"`,
    },
    body: soapEnvelope(operation, innerXml),
  })
  const text = await res.text()
  if (!res.ok) {
    throw new Error(`SOAP ${operation} HTTP ${res.status}: ${text.slice(0, 500)}`)
  }
  return text
}

// Extrae el primer valor de un tag (ignora namespaces y atributos como xsi:type)
function tag(xml: string, name: string): string | null {
  const m = xml.match(new RegExp(`<(?:[\\w-]+:)?${name}\\b[^>]*>([\\s\\S]*?)</(?:[\\w-]+:)?${name}>`, 'i'))
  return m ? m[1].trim() : null
}

// Devuelve los bloques <item>...</item> (cada elemento del array de pagos)
function items(xml: string): string[] {
  const matches = xml.match(/<(?:[\w-]+:)?item\b[^>]*>[\s\S]*?<\/(?:[\w-]+:)?item>/gi)
  return matches ?? []
}

function fmtFecha(d: Date): string {
  return d.toISOString().slice(0, 10) // AAAA-MM-DD
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok')

  try {
    const idOrganismo = Deno.env.get('EPAGOS_ID_ORGANISMO') ?? ''
    const idUsuario = Deno.env.get('EPAGOS_ID_USUARIO') ?? ''
    const password = Deno.env.get('EPAGOS_PASSWORD') ?? ''
    const hash = Deno.env.get('EPAGOS_HASH') ?? ''
    const modo = Deno.env.get('EPAGOS_MODO') || 'sandbox'

    if (!idOrganismo || !idUsuario || !password || !hash) {
      throw new Error('Faltan credenciales E-pagos en las variables de entorno')
    }

    // Rango de fechas: por defecto ayer -> hoy (se puede sobreescribir por body)
    let fechaDesde = fmtFecha(new Date(Date.now() - 24 * 60 * 60 * 1000))
    let fechaHasta = fmtFecha(new Date())
    if (req.method === 'POST') {
      const body = await req.json().catch(() => ({}))
      if (body.fecha_desde) fechaDesde = String(body.fecha_desde)
      if (body.fecha_hasta) fechaHasta = String(body.fecha_hasta)
    }

    // 1) obtener_token (SOAP)
    const credToken =
      `<credenciales xsi:type="ns1:DatosCredenciales">` +
      `<id_organismo xsi:type="xsd:int">${xmlEscape(idOrganismo)}</id_organismo>` +
      `<id_usuario xsi:type="xsd:string">${xmlEscape(idUsuario)}</id_usuario>` +
      `<password xsi:type="xsd:string">${xmlEscape(password)}</password>` +
      `<hash xsi:type="xsd:string">${xmlEscape(hash)}</hash>` +
      `</credenciales>`
    const tokenXml =
      `<version xsi:type="xsd:string">${VERSION}</version>${credToken}`

    const tokenResp = await soapCall(modo, 'obtener_token', tokenXml)
    const tokenIdResp = tag(tokenResp, 'id_resp')
    const token = tag(tokenResp, 'token')
    if (tokenIdResp !== '01001' || !token) {
      throw new Error(`obtener_token falló (${tokenIdResp}): ${tag(tokenResp, 'respuesta') ?? tokenResp.slice(0, 500)}`)
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // 2) obtener_pagos (SOAP) con paginación (100 por página)
    const resultados: Array<Record<string, string | null>> = []
    let pagina = 1
    let totalPaginas = 1

    do {
      const credPago =
        `<credenciales xsi:type="ns1:DatosCredencialesPago">` +
        `<id_organismo xsi:type="xsd:int">${xmlEscape(idOrganismo)}</id_organismo>` +
        `<token xsi:type="xsd:string">${xmlEscape(token)}</token>` +
        `</credenciales>`
      const criterios =
        `<pago xsi:type="ns1:DatosPago">` +
        `<FechaNovedadAcreditacionDesde xsi:type="xsd:date">${fechaDesde}</FechaNovedadAcreditacionDesde>` +
        `<FechaNovedadAcreditacionHasta xsi:type="xsd:date">${fechaHasta}</FechaNovedadAcreditacionHasta>` +
        `<Pagina xsi:type="xsd:int">${pagina}</Pagina>` +
        `</pago>`
      const pagosXml = `<version xsi:type="xsd:string">${VERSION}</version>${credPago}${criterios}`

      const pagosResp = await soapCall(modo, 'obtener_pagos', pagosXml)
      const idResp = tag(pagosResp, 'id_resp')
      if (idResp !== '04001') {
        throw new Error(`obtener_pagos falló (${idResp}): ${tag(pagosResp, 'respuesta') ?? pagosResp.slice(0, 500)}`)
      }

      const cantidadTotal = Number(tag(pagosResp, 'cantidadTotal') ?? '0')
      totalPaginas = Math.max(1, Math.ceil(cantidadTotal / 100))

      for (const it of items(pagosResp)) {
        resultados.push({
          cut: tag(it, 'CodigoUnicoTransaccion'),
          numero_operacion: tag(it, 'Externa'),
          convenio: tag(it, 'Convenio'),
          importe: tag(it, 'Importe'),
          estado: tag(it, 'Estado'),
          fecha_acreditacion: tag(it, 'FechaNovedadAcreditacion'),
        })
      }
      pagina++
    } while (pagina <= totalPaginas)

    // 2b) obtener_pagos_adicionales (SOAP) — pagos extra sobre operaciones ya acreditadas (prueba 21002).
    //     No cambian el estado del pedido (ya está pagado); se listan para registro/control.
    const adicionales: Array<Record<string, string | null>> = []
    let adicionalesError: string | null = null
    try {
      const credAd =
        `<credenciales xsi:type="ns1:DatosCredencialesPago">` +
        `<id_organismo xsi:type="xsd:int">${xmlEscape(idOrganismo)}</id_organismo>` +
        `<token xsi:type="xsd:string">${xmlEscape(token)}</token>` +
        `</credenciales>`
      const datosAd =
        `<pagos xsi:type="ns1:DatosPagosAdicionales">` +
        `<Fecha_desde xsi:type="xsd:date">${fechaDesde}</Fecha_desde>` +
        `<Fecha_hasta xsi:type="xsd:date">${fechaHasta}</Fecha_hasta>` +
        `</pagos>`
      const adXml = `<version xsi:type="xsd:string">${VERSION}</version>${credAd}${datosAd}`
      const adResp = await soapCall(modo, 'obtener_pagos_adicionales', adXml)
      const adIdResp = tag(adResp, 'id_resp')
      if (adIdResp !== '07001') {
        adicionalesError = `obtener_pagos_adicionales (${adIdResp}): ${tag(adResp, 'respuesta') ?? ''}`
      } else {
        for (const it of items(adResp)) {
          adicionales.push({
            cut: tag(it, 'CodigoUnicoTransaccion'),
            forma_pago: tag(it, 'FormaPago'),
            monto: tag(it, 'Monto'),
            fecha_pago: tag(it, 'FechaPago'),
            fecha_novedad: tag(it, 'FechaNovedad'),
            id_pago: tag(it, 'IdPago'),
          })
        }
      }
    } catch (e) {
      adicionalesError = (e as Error).message
    }

    // 3) Conciliar: marcar pedidos según estado
    let actualizados = 0
    for (const pago of resultados) {
      const nro = pago.numero_operacion
      if (!nro) continue
      let nuevoEstado: string | null = null
      if (pago.estado === 'A') nuevoEstado = 'pagado'
      else if (pago.estado === 'D') nuevoEstado = 'reembolsado'
      if (!nuevoEstado) continue

      const { data: pedido } = await supabase
        .from('pedidos')
        .select('id, estado')
        .eq('nro_operacion', nro)
        .single()

      if (pedido && pedido.estado !== nuevoEstado) {
        const { error } = await supabase
          .from('pedidos')
          .update({ estado: nuevoEstado, actualizado_en: new Date().toISOString() })
          .eq('nro_operacion', nro)
        if (!error) actualizados++
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        rango: { fechaDesde, fechaHasta },
        encontrados: resultados.length,
        actualizados,
        adicionales: adicionales.length,
        adicionalesError,
      }),
      { headers: { 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
