import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const ALLOWED_ORIGIN = Deno.env.get('FRONTEND_URL') ?? 'https://ediciones-sab.web.app'
const ADMIN_API_KEY = Deno.env.get('ADMIN_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
}

function verifyAdminAuth(req: Request): boolean {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) return false
  const token = authHeader.slice(7)
  return token === ADMIN_API_KEY
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (!verifyAdminAuth(req)) {
    return new Response(
      JSON.stringify({ error: 'No autorizado' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
    )
  }

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  const url = new URL(req.url)
  const path = url.pathname.replace('/functions/v1/admin-api', '')
  const method = req.method

  try {
    // GET /admin/pedidos?estado=X
    if (method === 'GET' && path === '/admin/pedidos') {
      const estado = url.searchParams.get('estado')
      let query = supabaseAdmin.from('pedidos').select('*').order('creado_en', { ascending: false })
      if (estado) query = query.eq('estado', estado)
      const { data, error } = await query
      if (error) throw error
      return new Response(JSON.stringify({ pedidos: data }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // PATCH /admin/pedidos/:id
    if (method === 'PATCH' && path.startsWith('/admin/pedidos/')) {
      const id = path.split('/admin/pedidos/')[1]
      const body = await req.json()
      const { estado } = body
      const validEstados = ['pendiente', 'pagado', 'acreditado', 'enviado', 'entregado', 'rechazado', 'devuelto', 'pendiente_acreditacion']
      if (!validEstados.includes(estado)) {
        return new Response(JSON.stringify({ error: 'Estado inválido' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 })
      }
      const { data, error } = await supabaseAdmin
        .from('pedidos')
        .update({ estado, actualizado_en: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return new Response(JSON.stringify({ pedido: data }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // GET /admin/productos
    if (method === 'GET' && path === '/admin/productos') {
      const { data, error } = await supabaseAdmin.from('productos').select('*').order('creado_en', { ascending: false })
      if (error) throw error
      return new Response(JSON.stringify({ productos: data }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // POST /admin/productos
    if (method === 'POST' && path === '/admin/productos') {
      const body = await req.json()
      const { nombre, descripcion, categoria, marca, precio, precioOriginal, stock, destacado, imagen, imagenes, especificaciones } = body

      if (!nombre || !categoria || precio === undefined || precio === null) {
        return new Response(JSON.stringify({ error: 'Faltan campos requeridos: nombre, categoria, precio' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 })
      }
      if (typeof precio !== 'number' || precio < 0) {
        return new Response(JSON.stringify({ error: 'Precio debe ser un número >= 0' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 })
      }
      if (stock !== undefined && (typeof stock !== 'number' || stock < 0)) {
        return new Response(JSON.stringify({ error: 'Stock debe ser un número >= 0' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 })
      }
      if (precioOriginal !== undefined && precioOriginal !== null && (typeof precioOriginal !== 'number' || precioOriginal < 0)) {
        return new Response(JSON.stringify({ error: 'Precio original debe ser un número >= 0' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 })
      }

      const { data, error } = await supabaseAdmin
        .from('productos')
        .insert([{
          nombre,
          descripcion: descripcion || null,
          categoria,
          marca: marca || null,
          precio: Number(precio),
          precio_original: precioOriginal ? Number(precioOriginal) : null,
          stock: Number(stock) || 0,
          destacado: Boolean(destacado),
          imagen: imagen || null,
          imagenes: imagenes || null,
          especificaciones: especificaciones || null,
          creado_en: new Date().toISOString(),
          actualizado_en: new Date().toISOString(),
        }])
        .select()
        .single()
      if (error) throw error
      return new Response(JSON.stringify({ producto: data }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 201 })
    }

    // PATCH /admin/productos/:id
    if (method === 'PATCH' && path.startsWith('/admin/productos/')) {
      const id = path.split('/admin/productos/')[1]
      const body = await req.json()
      const { nombre, descripcion, categoria, marca, precio, precioOriginal, stock, destacado, imagen, imagenes, especificaciones } = body

      const updates: Record<string, unknown> = { actualizado_en: new Date().toISOString() }
      if (nombre !== undefined) updates.nombre = nombre
      if (descripcion !== undefined) updates.descripcion = descripcion
      if (categoria !== undefined) updates.categoria = categoria
      if (marca !== undefined) updates.marca = marca
      if (precio !== undefined) {
        if (typeof precio !== 'number' || precio < 0) {
          return new Response(JSON.stringify({ error: 'Precio debe ser un número >= 0' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 })
        }
        updates.precio = Number(precio)
      }
      if (precioOriginal !== undefined) {
        if (precioOriginal !== null && (typeof precioOriginal !== 'number' || precioOriginal < 0)) {
          return new Response(JSON.stringify({ error: 'Precio original debe ser un número >= 0' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 })
        }
        updates.precio_original = precioOriginal ? Number(precioOriginal) : null
      }
      if (stock !== undefined) {
        if (typeof stock !== 'number' || stock < 0) {
          return new Response(JSON.stringify({ error: 'Stock debe ser un número >= 0' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 })
        }
        updates.stock = Number(stock)
      }
      if (destacado !== undefined) updates.destacado = Boolean(destacado)
      if (imagen !== undefined) updates.imagen = imagen
      if (imagenes !== undefined) updates.imagenes = imagenes
      if (especificaciones !== undefined) updates.especificaciones = especificaciones

      const { data, error } = await supabaseAdmin
        .from('productos')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return new Response(JSON.stringify({ producto: data }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // DELETE /admin/productos/:id
    if (method === 'DELETE' && path.startsWith('/admin/productos/')) {
      const id = path.split('/admin/productos/')[1]
      const { error } = await supabaseAdmin.from('productos').delete().eq('id', id)
      if (error) throw error
      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    return new Response(JSON.stringify({ error: 'Ruta no encontrada' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 })
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})