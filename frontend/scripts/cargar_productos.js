const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  "https://wmtvbbczyjdaciuzquqx.supabase.co",
  "sb_publishable__Er4awY8vKiiSBX709kBNA_cJlxUrgm"
);

const productos = [
  // Smart TV
  { nombre: 'Smart Tv ENOVA 43" Hd Android', precio: 0, categoria: "Smart TV", marca: "ENOVA" },
  { nombre: 'SMART TV Philips FHD 43" ANDROID', precio: 0, categoria: "Smart TV", marca: "Philips" },
  { nombre: 'Smart Tv Tcl Full Hd43 Android Tv Google Assistant', precio: 420000, categoria: "Smart TV", marca: "TCL" },
  { nombre: 'Smart TV LED FHD 43" TELEFUNKEN', precio: 340000, categoria: "Smart TV", marca: "TELEFUNKEN" },
  { nombre: 'Smart TV UHD 4K 50" BGH GOOGLE TV', precio: 550000, categoria: "Smart TV", marca: "BGH" },
  { nombre: 'Smart TV HITACHI 50" HD CDH-0 (Android TV)', precio: 0, categoria: "Smart TV", marca: "HITACHI" },
  { nombre: 'SMART TV 50" JVC 4K FULL HD con android', precio: 550000, categoria: "Smart TV", marca: "JVC" },
  { nombre: 'Smart TV Noblex 50 con android', precio: 550000, categoria: "Smart TV", marca: "NOBLEX" },
  { nombre: 'Smart TV 50" HD CDH-0 (Android TV)', precio: 520000, categoria: "Smart TV", marca: "Enova" },
  { nombre: 'SMART TV 32" MOTOROLA', precio: 280000, categoria: "Smart TV", marca: "Motorola" },
  { nombre: 'SMART TV C/ ANDROID 32" (A)', precio: 280000, categoria: "Smart TV", marca: "" },
  { nombre: 'SMART TV C/ ANDROID 32" (B)', precio: 260000, categoria: "Smart TV", marca: "" },
  { nombre: 'SMART TV C/ ANDROID 32" (C)', precio: 300000, categoria: "Smart TV", marca: "" },
  { nombre: 'TV MONITOR LED (A)', precio: 190000, categoria: "Smart TV", marca: "" },
  { nombre: 'TV MONITOR LED (B)', precio: 190000, categoria: "Smart TV", marca: "" },
  { nombre: 'TV MONITOR LED (C)', precio: 190000, categoria: "Smart TV", marca: "" },
  { nombre: 'SMART TV SAMSUNG 98"', precio: 6999999, categoria: "Smart TV", marca: "Samsung" },
  { nombre: 'Smart Tv 55 Pulgadas 4K Ultra Hd - BGH', precio: 720000, categoria: "Smart TV", marca: "BGH" },
  { nombre: 'Smart TV LED 58" Noblex 4K Ultra HD', precio: 750000, categoria: "Smart TV", marca: "Noblex" },
  { nombre: 'Smart Tv 55" 4K TCL con GOOGLE TV', precio: 700000, categoria: "Smart TV", marca: "TCL" },
  { nombre: 'Smart Tv 75" TCL 4K Android', precio: 1600000, categoria: "Smart TV", marca: "TCL" },

  // Celulares
  { nombre: 'Samsung Galaxy A06 128 Gb 4 Gb Ram', precio: 260000, categoria: "Celulares", marca: "Samsung" },
  { nombre: 'Samsung Galaxy A07 128 Gb 4 Gb Ram', precio: 280000, categoria: "Celulares", marca: "Samsung" },
  { nombre: 'Samsung Galaxy A16 4/128 GB', precio: 320000, categoria: "Celulares", marca: "Samsung" },
  { nombre: 'Samsung Galaxy A36 8/256 GB 5G', precio: 600000, categoria: "Celulares", marca: "Samsung" },
  { nombre: 'Samsung Galaxy A56 12/256 GB', precio: 800000, categoria: "Celulares", marca: "Samsung" },
  { nombre: 'Samsung Galaxy A57 8/256 GB 5G', precio: 1000000, categoria: "Celulares", marca: "Samsung" },
  { nombre: 'Samsung Galaxy S23 FE 8/256 Gb', precio: 1300000, categoria: "Celulares", marca: "Samsung" },
  { nombre: 'Samsung Galaxy S25 FE 8/256 GB', precio: 1400000, categoria: "Celulares", marca: "Samsung" },
  { nombre: 'Samsung Galaxy A06 64 Gb 4 Gb Ram', precio: 0, categoria: "Celulares", marca: "Samsung" },
  { nombre: 'Motorola Moto G15 4/128 GB', precio: 0, categoria: "Celulares", marca: "Motorola" },
  { nombre: 'Motorola Moto G04S 4/64 GB', precio: 0, categoria: "Celulares", marca: "Motorola" },
  { nombre: 'Motorola Moto G35 8/256 GB', precio: 0, categoria: "Celulares", marca: "Motorola" },
  { nombre: 'Noblex N62 4/64 GB', precio: 0, categoria: "Celulares", marca: "NOBLEX" },
  { nombre: 'Xiaomi Redmi A5 4/128 GB', precio: 0, categoria: "Celulares", marca: "Xiaomi" },
  { nombre: 'TCL 40SE 6/256 GB', precio: 0, categoria: "Celulares", marca: "TCL" },
  { nombre: 'TCL 505 4/128 GB', precio: 0, categoria: "Celulares", marca: "TCL" },
  { nombre: 'Xiaomi Redmi 15C 8 RAM 256GB', precio: 320000, categoria: "Celulares", marca: "Xiaomi" },
  { nombre: 'Xiaomi Redmi A5 3GB 64GB', precio: 200000, categoria: "Celulares", marca: "Xiaomi" },
  { nombre: 'Xiaomi Redmi Note 8GB 256GB', precio: 450000, categoria: "Celulares", marca: "Xiaomi" },
  { nombre: 'Xiaomi Redmi Note 15 Pro 8Ram 256gb', precio: 200000, categoria: "Celulares", marca: "Xiaomi" },

  // Ventiladores
  { nombre: 'Ventilador de techo 3 paletas PHILCO', precio: 60000, categoria: "Ventiladores", marca: "PHILCO" },
  { nombre: 'Ventilador de techo 4 paletas Liliana', precio: 100000, categoria: "Ventiladores", marca: "Liliana" },
  { nombre: 'Ventilador de techo 4 paletas con luz Liliana (A)', precio: 120000, categoria: "Ventiladores", marca: "Liliana" },
  { nombre: 'Ventilador de techo TURBO DE 10" con luz AXEL', precio: 120000, categoria: "Ventiladores", marca: "AXEL" },
  { nombre: 'Ventilador de techo 4 paletas con luz Liliana (B)', precio: 45000, categoria: "Ventiladores", marca: "Liliana" },
  { nombre: 'Ventilador de techo 4 paletas con luz Liliana (C)', precio: 60000, categoria: "Ventiladores", marca: "Liliana" },
  { nombre: 'Ventilador de techo 4 paletas con luz Liliana (D)', precio: 110000, categoria: "Ventiladores", marca: "Liliana" },
  { nombre: 'Ventilador de techo 4 paletas con luz Liliana (E)', precio: 60000, categoria: "Ventiladores", marca: "Liliana" },
  { nombre: 'Ventilador de techo 4 paletas con luz PHILCO', precio: 65000, categoria: "Ventiladores", marca: "PHILCO" },
  { nombre: 'Ventilador de techo 4 paletas Alpaca', precio: 0, categoria: "Ventiladores", marca: "Alpaca" },

  // Pavas eléctricas
  { nombre: 'PAVA ELÉCTRICA C/ REGULADOR DE CORTE ATMA', precio: 40000, categoria: "Pavas eléctricas", marca: "ATMA" },
  { nombre: 'PAVA ELÉCTRICA C/ REGULADOR DE CORTE PHILCO', precio: 80000, categoria: "Pavas eléctricas", marca: "PHILCO" },
  { nombre: 'PAVA ELÉCTRICA SIN REGULADOR DE CORTE YELMO', precio: 42000, categoria: "Pavas eléctricas", marca: "YELMO" },
  { nombre: 'PAVA ELÉCTRICA C/ REGULADOR DE CORTE 3905 PHILIPS', precio: 90000, categoria: "Pavas eléctricas", marca: "PHILIPS" },
  { nombre: 'PAVA ELÉCTRICA PEABODY 1.7 Litros Acero Inoxidable', precio: 80000, categoria: "Pavas eléctricas", marca: "ATMA" },

  // Cocinas
  { nombre: 'Cocina Escorial CANDOR COLOR BLANCO O NEGRO', precio: 350000, categoria: "Cocinas", marca: "Escorial" },
  { nombre: 'Cocina Escorial PALACE COLOR BLANCO O NEGRO', precio: 450000, categoria: "Cocinas", marca: "Escorial" },
  { nombre: 'Cocina Escorial MASTER COLOR BLANCO O NEGRO', precio: 450000, categoria: "Cocinas", marca: "Escorial" },
  { nombre: 'Cocina Escorial STYLE BLACK', precio: 710000, categoria: "Cocinas", marca: "Escorial" },
  { nombre: 'Cocina FLORENCIA', precio: 480000, categoria: "Cocinas", marca: "Florencia" },
  { nombre: 'Cocina FLORENCIA CON ENCENDIDO', precio: 590000, categoria: "Cocinas", marca: "Florencia" },
  { nombre: 'Cocina FLORENCIA CON ENCENDIDO Inoxidable', precio: 670000, categoria: "Cocinas", marca: "Florencia" },
  { nombre: 'Cocina Electrolux 76DXQ Inox Doble horno ELÉCT./GAS', precio: 1650000, categoria: "Cocinas", marca: "Electrolux" },

  // Notebooks
  { nombre: 'NOTEBOOK ACER Ryzen 5 8 RAM 512 SSD', precio: 1370000, categoria: "Notebooks", marca: "Acer" },
  { nombre: 'Notebook Acer Aspire 15,6 Intel I9 16gb 1tb Ssd Windows 11', precio: 2500000, categoria: "Notebooks", marca: "Acer" },
  { nombre: 'Notebook Asus 15" Full HD Ryzen 5 8gb Ram 512gb SSD Windows 11', precio: 1300000, categoria: "Notebooks", marca: "Asus" },
  { nombre: 'NOTEBOOK HP Ryzen 5 8 RAM 512 GB 15.6" W11', precio: 1390000, categoria: "Notebooks", marca: "HP" },
  { nombre: 'NOTEBOOK HP Ryzen 3 8 RAM 256 GB 15.6" W11', precio: 1190000, categoria: "Notebooks", marca: "HP" },
  { nombre: 'NOTEBOOK HP Intel Celeron 4 RAM 1 TB 14" W10', precio: 720000, categoria: "Notebooks", marca: "HP" },
  { nombre: 'NOTEBOOK HP Ryzen 3 8 RAM 512 GB 15.6" W11', precio: 1250000, categoria: "Notebooks", marca: "HP" },
  { nombre: 'NOTEBOOK EXO Ryzen 5 8 RAM 512 GB 15.6" W11', precio: 850000, categoria: "Notebooks", marca: "EXO" },

  // Impresoras
  { nombre: 'Impresora Epson Ecotank L3210 Multifuncional 3x1', precio: 500000, categoria: "Impresoras", marca: "Epson" },
  { nombre: 'Impresora Epson Ecotank L3250 Wifi Multifuncional 3x1', precio: 590000, categoria: "Impresoras", marca: "Epson" },
  { nombre: 'Impresora Laser Pantum P2509w Monocromatica Wifi', precio: 160000, categoria: "Impresoras", marca: "Pantum" },
  { nombre: 'IMPRESORA HP LASER 107W', precio: 240000, categoria: "Impresoras", marca: "HP" },

  // Colchones
  { nombre: 'Colchón ESP. TAURUS 080X17 T/A', precio: 86000, categoria: "Colchones", marca: "TAURUS" },
  { nombre: 'Colchón ESP. TAURUS 100X17 T/A', precio: 117000, categoria: "Colchones", marca: "TAURUS" },
  { nombre: 'Colchón ESP. TAURUS 140X17 T/A', precio: 171000, categoria: "Colchones", marca: "TAURUS" },
  { nombre: 'Colchón ESP. TAURUS 080X20 REAL Densidad 24kg/m3', precio: 148500, categoria: "Colchones", marca: "TAURUS" },
  { nombre: 'Colchón ESP. TAURUS 100X20 REAL Densidad 24kg/m3', precio: 189000, categoria: "Colchones", marca: "TAURUS" },
  { nombre: 'Colchón ESP. TAURUS 140X20 REAL Densidad 24kg/m3', precio: 270000, categoria: "Colchones", marca: "TAURUS" },
  { nombre: 'Colchón ESP. GANI 0.80X25 REAL Densidad 30kg/m3', precio: 234000, categoria: "Colchones", marca: "GANI" },
  { nombre: 'Colchón ESP. GANI 100X25 REAL Densidad 30kg/m3', precio: 288000, categoria: "Colchones", marca: "GANI" },
  { nombre: 'Colchón ESP. GANI 140X25 Densidad 30kg/m3', precio: 405000, categoria: "Colchones", marca: "GANI" },
  { nombre: 'Colchón ESP. SUPER LUJO 0.80X22 Densidad 25kg/m3', precio: 216000, categoria: "Colchones", marca: "SUPER LUJO" },
  { nombre: 'Colchón ESP. SUPER LUJO 100X22 Densidad 25kg/m3', precio: 261000, categoria: "Colchones", marca: "SUPER LUJO" },
  { nombre: 'Colchón ESP. SUPER LUJO 140X22 Densidad 25kg/m3', precio: 333000, categoria: "Colchones", marca: "SUPER LUJO" },
  { nombre: 'Colchón ESP. GOLD JACKARD 140X26 ALTA Densidad 33kg/m3', precio: 567000, categoria: "Colchones", marca: "GOLD JACKARD" },
  { nombre: 'Colchón RESORTE EQUIS 140X26 ALTA Densidad 33kg/m3', precio: 396000, categoria: "Colchones", marca: "RESORTE EQUIS" },

  // Termotanques
  { nombre: 'Termotanque de 28lts. c/inferior PHILCO', precio: 250000, categoria: "Termotanques", marca: "PHILCO" },
  { nombre: 'Termotanque de 55lts. c/inferior Escorial', precio: 280000, categoria: "Termotanques", marca: "Escorial" },
  { nombre: 'Termotanque de 125lts. c/inferior Rheem', precio: 700000, categoria: "Termotanques", marca: "Rheem" },
  { nombre: 'Termotanque de 125lts. c/superior Rheem', precio: 590000, categoria: "Termotanques", marca: "Rheem" },
  { nombre: 'Termotanque de 85lts. c/inferior Rheem', precio: 560000, categoria: "Termotanques", marca: "Rheem" },
  { nombre: 'Termotanque de 85lts. c/superior Rheem', precio: 530000, categoria: "Termotanques", marca: "Rheem" },
  { nombre: 'Termotanque de 85lts. c/superior SAIAR', precio: 510000, categoria: "Termotanques", marca: "SAIAR" },
  { nombre: 'Termotanque de 85lts. c/inferior SAIAR', precio: 520000, categoria: "Termotanques", marca: "SAIAR" },
  { nombre: 'Termotanque de 55lts. c/inferior Salar', precio: 470000, categoria: "Termotanques", marca: "Salar" },
  { nombre: 'Termotanque de 55lts. c/superior Salar', precio: 430000, categoria: "Termotanques", marca: "Salar" },
  { nombre: 'Termotanque de 55lts. c/inferior SHERMAN', precio: 380000, categoria: "Termotanques", marca: "SHERMAN" },
  { nombre: 'Termotanque de 55lts. c/superior SHERMAN', precio: 370000, categoria: "Termotanques", marca: "SHERMAN" },
  { nombre: 'Calefón a gas señorial 14 litros Escorial', precio: 420000, categoria: "Termotanques", marca: "Escorial" },
  { nombre: 'Calefón a gas señorial 14 litros pie SEÑORIAL', precio: 480000, categoria: "Termotanques", marca: "SEÑORIAL" },
  { nombre: 'Termotanque de 90lts. c/inferior Escorial', precio: 320000, categoria: "Termotanques", marca: "Escorial" },
  { nombre: 'Termotanque de 85lts. c/superior SHERMAN', precio: 420000, categoria: "Termotanques", marca: "SHERMAN" },

  // Lavarropas
  { nombre: 'Lavarropas Carga Superior 6,5 Kg Gris Drean CONCEPT NEO FUZZY', precio: 570000, categoria: "Lavarropas", marca: "Drean" },
  { nombre: 'Lavarropas Whirlpool Carga Superior 11KG Gris Oscuro', precio: 930000, categoria: "Lavarropas", marca: "Whirlpool" },
  { nombre: 'Lavarropas Enova Carga Frontal 6 Kg 1000 RPM', precio: 515000, categoria: "Lavarropas", marca: "Enova" },
  { nombre: 'Lavarropas Hisense 8 Kg 1400 RPM Inverter Gris', precio: 720000, categoria: "Lavarropas", marca: "Hisense" },
  { nombre: 'Lavarropas Semiautomático 5KG (A)', precio: 210000, categoria: "Lavarropas", marca: "" },
  { nombre: 'Lavarropas Semiautomático 5KG (B)', precio: 200000, categoria: "Lavarropas", marca: "" },
  { nombre: 'Lavarropas Semiautomático 10KG', precio: 230000, categoria: "Lavarropas", marca: "" },
  { nombre: 'Lavarropas Semi Aut Family 7KG', precio: 330000, categoria: "Lavarropas", marca: "Family" },
  { nombre: 'Lavarropas Semi Automático Columbia 10K 7P Con Bomba', precio: 250000, categoria: "Lavarropas", marca: "Columbia" },
  { nombre: 'Lavarropas Automático 6.08 NEX ECO', precio: 650000, categoria: "Lavarropas", marca: "NEX ECO" },
  { nombre: 'Lavarropas Automático 8.14 NEX ECO', precio: 870000, categoria: "Lavarropas", marca: "NEX ECO" },
  { nombre: 'Lavarropas Automático 10.12 NEX ECO', precio: 1000000, categoria: "Lavarropas", marca: "NEX ECO" },

  // Secarropas
  { nombre: 'SECARROPAS COLUMBIA DE 5.5KG', precio: 209999, categoria: "Secarropas", marca: "Columbia" },

  // Freezer
  { nombre: 'FREEZER 2600', precio: 590000, categoria: "Freezer", marca: "" },
  { nombre: 'FREEZER 330', precio: 640000, categoria: "Freezer", marca: "" },
  { nombre: 'FREEZER 410', precio: 740000, categoria: "Freezer", marca: "" },
  { nombre: 'FREEZER 450 2 tapas', precio: 800000, categoria: "Freezer", marca: "" },
  { nombre: 'FREEZER 400 lts 1 tapa', precio: 0, categoria: "Freezer", marca: "" },
  { nombre: 'FREEZER "S"', precio: 620000, categoria: "Freezer", marca: "" },
  { nombre: 'FREEZER "M"', precio: 670000, categoria: "Freezer", marca: "" },
  { nombre: 'FREEZER "L"', precio: 710000, categoria: "Freezer", marca: "" },
  { nombre: 'FREEZER A GAS F140 (140 litros)', precio: 2999999, categoria: "Freezer", marca: "" },
  { nombre: 'Freezer Horizontal Inelro FIH-550 470 Lts 2 Puertas Blanco', precio: 1099999, categoria: "Freezer", marca: "Inelro" },

  // Hornos eléctricos
  { nombre: 'HORNO ELÉCTRICO 40 LITROS BGH', precio: 155000, categoria: "Hornos eléctricos", marca: "BGH" },
  { nombre: 'HORNO ELÉCTRICO 40 LITROS YELMO', precio: 155000, categoria: "Hornos eléctricos", marca: "YELMO" },
  { nombre: 'HORNO ELÉCTRICO 45 LITROS EVERES', precio: 185000, categoria: "Hornos eléctricos", marca: "EVERES" },
  { nombre: 'HORNO ELÉCTRICO 50 LITROS ULTRACOMB', precio: 175000, categoria: "Hornos eléctricos", marca: "Ultracomb" },
  { nombre: 'HORNO ELÉCTRICO 63 LITROS SANSEI', precio: 165000, categoria: "Hornos eléctricos", marca: "SANSEI" },
  { nombre: 'HORNO ELÉCTRICO 65 LITROS RCA', precio: 200000, categoria: "Hornos eléctricos", marca: "RCA" },
  { nombre: 'HORNO ELÉCTRICO 70 LITROS ATMA', precio: 230000, categoria: "Hornos eléctricos", marca: "ATMA" },
  { nombre: 'HORNO ELÉCTRICO 80 LITROS ULTRACOMB', precio: 250000, categoria: "Hornos eléctricos", marca: "Ultracomb" },

  // Anafes
  { nombre: 'ANAFE ELÉCTRICO 1 HORNALLA', precio: 36000, categoria: "Anafes", marca: "" },
  { nombre: 'ANAFE ELÉCTRICO 2 HORNALLAS', precio: 42000, categoria: "Anafes", marca: "" },
  { nombre: 'ANAFE A GAS 2 HORNALLAS', precio: 54000, categoria: "Anafes", marca: "" },
  { nombre: 'ANAFE A GAS 2 HORNALLAS CON HORNO', precio: 310000, categoria: "Anafes", marca: "" },
  { nombre: 'ANAFE A GAS 4 HORNALLAS CON HORNO', precio: 360000, categoria: "Anafes", marca: "" },
  { nombre: 'ANAFE A GAS INOX. 4 HORNALLAS P/ EMPOTRAR (A)', precio: 620000, categoria: "Anafes", marca: "" },
  { nombre: 'ANAFE A GAS INOX. 4 HORNALLAS P/ EMPOTRAR (B)', precio: 330000, categoria: "Anafes", marca: "" },
  { nombre: 'ANAFE A GAS INOX. 4 HORNALLAS P/ EMPOTRAR (C)', precio: 750000, categoria: "Anafes", marca: "" },

  // Otros (Planchas, Freidoras)
  { nombre: 'PLANCHA SECA CRIVEL', precio: 24000, categoria: "Otros", marca: "CRIVEL" },
  { nombre: 'Plancha Seca Philco 1200w Suela Antiadherente', precio: 30000, categoria: "Otros", marca: "Philco" },
  { nombre: 'Plancha A Vapor Atma Suela Cerámica 2000w', precio: 50000, categoria: "Otros", marca: "Atma" },
  { nombre: 'Plancha SECA Philips', precio: 70000, categoria: "Otros", marca: "Philips" },
  { nombre: 'FREIDORA DE AIRE SIN ACEITE 3 LITROS DAEWOO', precio: 80000, categoria: "Otros", marca: "DAEWOO" },
  { nombre: 'Freidora De Aire Philco 2000w 9L 12 Programas De Cocción', precio: 110000, categoria: "Otros", marca: "PHILCO" },
  { nombre: 'FREIDORA DE AIRE SIN ACEITE 3 LITROS ULTRACOMB', precio: 80000, categoria: "Otros", marca: "Ultracomb" },
  { nombre: 'FREIDORA DE AIRE SIN ACEITE 8.5 LITROS YELMO', precio: 130000, categoria: "Otros", marca: "YELMO" },
  { nombre: 'FREIDORA DE AIRE CON ACEITE 1.5 LITROS YELMO', precio: 50000, categoria: "Otros", marca: "YELMO" },
  { nombre: 'Freidora Sin Aceite XL Philips Airfryer Essential 2000W 6.2L', precio: 160000, categoria: "Otros", marca: "PHILIPS" },
  { nombre: 'Freidora De Aire Digital Sin Aceite Atma Pro 8L', precio: 120000, categoria: "Otros", marca: "ATMA" },
];

async function main() {
  // Primero borrar todos los productos existentes para evitar duplicados
  console.log("Eliminando productos existentes...");
  const { error: deleteError } = await supabase.from("productos").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  if (deleteError) {
    console.error("Error eliminando:", deleteError.message);
    // Continuar de todos modos
  }

  console.log(`Insertando ${productos.length} productos...`);
  
  // Insertar en lotes de 20
  const BATCH_SIZE = 20;
  let insertados = 0;
  let errores = 0;

  for (let i = 0; i < productos.length; i += BATCH_SIZE) {
    const lote = productos.slice(i, i + BATCH_SIZE).map((p) => ({
      nombre: p.nombre,
      precio: p.precio,
      precio_original: null,
      categoria: p.categoria,
      stock: p.precio > 0 ? 10 : 0,
      destacado: false,
      imagen: null,
      creado_en: new Date().toISOString(),
      actualizado_en: new Date().toISOString(),
    }));

    const { data, error } = await supabase.from("productos").insert(lote).select();

    if (error) {
      console.error(`Error en lote ${i / BATCH_SIZE + 1}:`, error.message);
      errores += lote.length;
    } else {
      insertados += data.length;
      console.log(`  Lote ${Math.floor(i / BATCH_SIZE) + 1}: ${data.length} productos insertados`);
    }
  }

  console.log(`\n✅ RESUMEN:`);
  console.log(`   Insertados: ${insertados}`);
  console.log(`   Errores: ${errores}`);
  console.log(`   Total intentados: ${productos.length}`);
}

main().catch(console.error);
