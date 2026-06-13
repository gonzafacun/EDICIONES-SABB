const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()
const fs = require('fs')

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Faltan SUPABASE_URL o SUPABASE_SERVICE_KEY en el .env')
  process.exit(1)
}
const supabase = createClient(supabaseUrl, supabaseKey)

// Leer CSV
const csvContent = fs.readFileSync('lista_precios_bienestar_confort.csv', 'utf-8')
const lines = csvContent.trim().split('\n')
const headers = lines[0].split(',')

const csvProductos = lines.slice(1).map(line => {
  const values = line.split(',')
  return {
    categoria: values[0].replace(/^"|"$/g, ''),
    nombre: values[1].replace(/^"|"$/g, ''),
    marca: values[2].replace(/^"|"$/g, ''),
    precio: parseInt(values[3].replace(/^"|"$/g, '')) || 0
  }
})

console.log(`Leídos ${csvProductos.length} productos del CSV`)

// Normalizar strings para matching
function normalize(str) {
  return str.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

// Obtener productos existentes de Supabase
async function getProductosExistentes() {
  const { data, error } = await supabase
    .from('productos')
    .select('id, nombre, marca, categoria')
  
  if (error) throw error
  return data
}

// Matching flexible
function matchProducto(csvProd, existentes) {
  const csvNombre = normalize(csvProd.nombre)
  const csvMarca = normalize(csvProd.marca || '')
  const csvCat = normalize(csvProd.categoria)
  
  // Buscar coincidencia exacta por nombre + marca
  let match = existentes.find(p => 
    normalize(p.nombre) === csvNombre && 
    normalize(p.marca || '') === csvMarca
  )
  if (match) return match
  
  // Buscar por nombre contenido + marca
  match = existentes.find(p => 
    normalize(p.nombre).includes(csvNombre) || csvNombre.includes(normalize(p.nombre))
  ) && existentes.find(p => normalize(p.marca || '') === csvMarca)
  if (match) return match
  
  // Buscar solo por nombre similar
  match = existentes.find(p => 
    normalize(p.nombre).includes(csvNombre) || csvNombre.includes(normalize(p.nombre))
  )
  if (match) return match
  
  return null
}

async function actualizarPrecios() {
  const existentes = await getProductosExistentes()
  console.log(`Productos en BD: ${existentes.length}`)
  
  let actualizados = 0
  let noEncontrados = []
  let yaTenianPrecio = 0
  
  for (const csvProd of csvProductos) {
    const match = matchProducto(csvProd, existentes)
    
    if (match) {
      // Verificar precio actual
      const { data: prodActual } = await supabase
        .from('productos')
        .select('precio')
        .eq('id', match.id)
        .single()
      
      if (prodActual && prodActual.precio > 0) {
        yaTenianPrecio++
        continue
      }
      
      const { error } = await supabase
        .from('productos')
        .update({ 
          precio: csvProd.precio,
          stock: csvProd.precio > 0 ? 10 : 0, // stock básico si tiene precio
          actualizado_en: new Date().toISOString()
        })
        .eq('id', match.id)
      
      if (error) {
        console.error(`Error actualizando ${match.nombre}:`, error.message)
      } else {
        actualizados++
        if (actualizados % 20 === 0) {
          console.log(`Actualizados ${actualizados}...`)
        }
      }
    } else {
      noEncontrados.push(`${csvProd.categoria} | ${csvProd.nombre} | ${csvProd.marca} | $${csvProd.precio}`)
    }
  }
  
  console.log(`\n✅ Resultado:`)
  console.log(`   - Actualizados: ${actualizados}`)
  console.log(`   - Ya tenían precio: ${yaTenianPrecio}`)
  console.log(`   - No encontrados: ${noEncontrados.length}`)
  
  if (noEncontrados.length > 0) {
    console.log('\n❌ Productos no encontrados (requieren matching manual):')
    noEncontrados.forEach(p => console.log(`   - ${p}`))
  }
}

actualizarPrecios().catch(console.error)