const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
require('dotenv').config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Faltan SUPABASE_URL o SUPABASE_SERVICE_KEY en el .env')
  process.exit(1)
}
const supabase = createClient(supabaseUrl, supabaseKey)

// Lista de productos (179 items)
const productos = [
  // TERMOTANQUES
  { nombre: "Termotanque 55 lts. c/inferior", descripcion: "Termotanque eléctrico 55 litros con conexión inferior. Ideal para hogares de 2 a 3 personas.", categoria: "Termotanques", marca: "Saiar", precio: 0, stock: 0, destacado: false },
  { nombre: "Termotanque 55 lts. c/superior", descripcion: "Termotanque eléctrico 55 litros con conexión superior. Alta eficiencia energética.", categoria: "Termotanques", marca: "Saiar", precio: 0, stock: 0, destacado: false },
  { nombre: "Termotanque 55 lts. c/inferior", descripcion: "Termotanque eléctrico 55 litros con conexión inferior. Marca nacional de confianza.", categoria: "Termotanques", marca: "Sherman", precio: 0, stock: 0, destacado: false },
  { nombre: "Termotanque 55 lts. c/superior", descripcion: "Termotanque eléctrico 55 litros con conexión superior. Excelente relación calidad-precio.", categoria: "Termotanques", marca: "Sherman", precio: 0, stock: 0, destacado: false },
  { nombre: "Calefón a gas 14 litros", descripcion: "Calefón a gas Señorial 14 litros. Agua caliente instantánea para el hogar.", categoria: "Termotanques", marca: "Escorial", precio: 0, stock: 0, destacado: false },
  { nombre: "Calefón a gas 14 litros pie", descripcion: "Calefón a gas Señorial 14 litros con base pie. Mayor estabilidad y comodidad de instalación.", categoria: "Termotanques", marca: "Señorial", precio: 0, stock: 0, destacado: false },
  { nombre: "Termotanque 90 lts. c/inferior", descripcion: "Termotanque eléctrico 90 litros con conexión inferior. Para familias numerosas.", categoria: "Termotanques", marca: "Escorial", precio: 0, stock: 0, destacado: false },
  { nombre: "Termotanque 85 lts. c/superior", descripcion: "Termotanque eléctrico 85 litros con conexión superior. Gran capacidad para uso familiar.", categoria: "Termotanques", marca: "Sherman", precio: 0, stock: 0, destacado: false },
  { nombre: "Termotanque 28 lts. c/inferior", descripcion: "Termotanque eléctrico 28 litros con conexión inferior. Compacto, ideal para baño pequeño.", categoria: "Termotanques", marca: "Philco", precio: 0, stock: 0, destacado: false },
  { nombre: "Termotanque 55 lts. c/inferior", descripcion: "Termotanque eléctrico 55 litros con conexión inferior. Tecnología de punta.", categoria: "Termotanques", marca: "Escorial", precio: 0, stock: 0, destacado: false },
  { nombre: "Termotanque 125 lts. c/inferior", descripcion: "Termotanque eléctrico 125 litros con conexión inferior. Para uso intensivo.", categoria: "Termotanques", marca: "Rheem", precio: 0, stock: 0, destacado: false },
  { nombre: "Termotanque 125 lts. c/superior", descripcion: "Termotanque eléctrico 125 litros con conexión superior. Máxima capacidad.", categoria: "Termotanques", marca: "Rheem", precio: 0, stock: 0, destacado: false },
  { nombre: "Termotanque 85 lts. c/inferior", descripcion: "Termotanque eléctrico 85 litros con conexión inferior. Rendimiento premium.", categoria: "Termotanques", marca: "Rheem", precio: 0, stock: 0, destacado: false },
  { nombre: "Termotanque 85 lts. c/superior", descripcion: "Termotanque eléctrico 85 litros con conexión superior. Calidad garantizada.", categoria: "Termotanques", marca: "Rheem", precio: 0, stock: 0, destacado: false },
  { nombre: "Termotanque 85 lts. c/superior", descripcion: "Termotanque eléctrico 85 litros con conexión superior.", categoria: "Termotanques", marca: "Saiar", precio: 0, stock: 0, destacado: false },
  { nombre: "Termotanque 85 lts. c/inferior", descripcion: "Termotanque eléctrico 85 litros con conexión inferior.", categoria: "Termotanques", marca: "Saiar", precio: 0, stock: 0, destacado: false },

  // SMART TV
  { nombre: "TV Monitor LED 24\"", descripcion: "Monitor LED 24 pulgadas. Perfecto para escritorio o dormitorio.", categoria: "Smart TV", marca: "Philips", precio: 0, stock: 0, destacado: false },
  { nombre: "TV Monitor LED 24\"", descripcion: "Monitor LED 24 pulgadas. Imagen nítida y colores vivos.", categoria: "Smart TV", marca: "Noblex", precio: 0, stock: 0, destacado: false },
  { nombre: "TV Monitor LED 24\"", descripcion: "Monitor LED 24 pulgadas. Calidad de imagen superior.", categoria: "Smart TV", marca: "LG", precio: 0, stock: 0, destacado: false },
  { nombre: "Smart TV 32\" Android", descripcion: "Smart TV 32 pulgadas con Android TV. Acceso a todas las apps de streaming.", categoria: "Smart TV", marca: "Motorola", precio: 0, stock: 0, destacado: false },
  { nombre: "Smart TV 32\" Android", descripcion: "Smart TV 32 pulgadas con Android y VIDAA. HD.", categoria: "Smart TV", marca: "Noblex", precio: 0, stock: 0, destacado: false },
  { nombre: "Smart TV 32\" Android", descripcion: "Smart TV 32 pulgadas con Android. HD.", categoria: "Smart TV", marca: "BGH", precio: 0, stock: 0, destacado: false },
  { nombre: "Smart TV 32\" Android", descripcion: "Smart TV 32 pulgadas con Android. HD.", categoria: "Smart TV", marca: "Hitachi", precio: 0, stock: 0, destacado: false },
  { nombre: "Smart TV 32\" Android", descripcion: "Smart TV 32 pulgadas con Android. LED.", categoria: "Smart TV", marca: "Philips", precio: 0, stock: 0, destacado: false },
  { nombre: "Smart TV 43\" HD Android", descripcion: "Smart TV 43 pulgadas HD con Android TV. Gran pantalla para el hogar.", categoria: "Smart TV", marca: "Enova", precio: 0, stock: 0, destacado: false },
  { nombre: "Smart TV 43\" FHD Android", descripcion: "Smart TV Philips 43 pulgadas Full HD con Android. Calidad de imagen excepcional.", categoria: "Smart TV", marca: "Philips", precio: 0, stock: 0, destacado: false },
  { nombre: "Smart TV 43\" FHD Android Google Assistant", descripcion: "Smart TV TCL 43 pulgadas Full HD con Android TV y Google Assistant.", categoria: "Smart TV", marca: "TCL", precio: 0, stock: 0, destacado: false },
  { nombre: "Smart TV 43\" FHD", descripcion: "Smart TV LED Full HD 43 pulgadas. Excelente relación calidad-precio.", categoria: "Smart TV", marca: "Telefunken", precio: 0, stock: 0, destacado: false },
  { nombre: "Smart TV 50\" UHD 4K Google TV", descripcion: "Smart TV 50 pulgadas UHD 4K con Google TV. Experiencia de imagen premium.", categoria: "Smart TV", marca: "BGH", precio: 0, stock: 0, destacado: false },
  { nombre: "Smart TV 50\" HD Android", descripcion: "Smart TV Hitachi 50 pulgadas con Android TV.", categoria: "Smart TV", marca: "Hitachi", precio: 0, stock: 0, destacado: false },
  { nombre: "Smart TV 50\" 4K Full HD Android", descripcion: "Smart TV JVC 50 pulgadas 4K Full HD con Android.", categoria: "Smart TV", marca: "JVC", precio: 0, stock: 0, destacado: false },
  { nombre: "Smart TV 50\" Android", descripcion: "Smart TV Noblex 50 pulgadas con Android.", categoria: "Smart TV", marca: "Noblex", precio: 0, stock: 0, destacado: false },
  { nombre: "Smart TV 55\" 4K Ultra HD", descripcion: "Smart TV BGH 55 pulgadas 4K Ultra HD. Imagen impresionante.", categoria: "Smart TV", marca: "BGH", precio: 0, stock: 0, destacado: false },
  { nombre: "Smart TV 58\" 4K Ultra HD Android", descripcion: "Smart TV LED 58 pulgadas 4K Ultra HD con Android.", categoria: "Smart TV", marca: "Noblex", precio: 0, stock: 0, destacado: false },
  { nombre: "Smart TV 55\" 4K Google TV", descripcion: "Smart TV TCL 55 pulgadas 4K con Google TV.", categoria: "Smart TV", marca: "TCL", precio: 0, stock: 0, destacado: false },
  { nombre: "Smart TV 75\" 4K Android", descripcion: "Smart TV 75 pulgadas 4K con Android. La pantalla más grande para tu hogar.", categoria: "Smart TV", marca: "Motorola", precio: 0, stock: 0, destacado: false },
  { nombre: "Smart TV Samsung 98\" Crystal UHD", descripcion: "Smart TV Samsung 98 pulgadas Crystal UHD. Motion Xcelerator 120Hz, Q-Symphony. El televisor definitivo. Ancho 218.1 cm.", categoria: "Smart TV", marca: "Samsung", precio: 0, stock: 0, destacado: false },

  // CELULARES
  { nombre: "Samsung Galaxy A06 128GB 4GB RAM", descripcion: "Smartphone Samsung Galaxy A06, 128GB de almacenamiento, 4GB de RAM. Nuevo.", categoria: "Celulares", marca: "Samsung", precio: 0, stock: 0, destacado: false },
  { nombre: "Samsung Galaxy A07 128GB 4GB RAM", descripcion: "Smartphone Samsung Galaxy A07, 128GB de almacenamiento, 4GB de RAM. Nuevo.", categoria: "Celulares", marca: "Samsung", precio: 0, stock: 0, destacado: false },
  { nombre: "Samsung Galaxy A16 4/128GB", descripcion: "Smartphone Samsung Galaxy A16, 4GB RAM y 128GB de almacenamiento.", categoria: "Celulares", marca: "Samsung", precio: 0, stock: 0, destacado: false },
  { nombre: "Samsung Galaxy A36 8/256GB 5G", descripcion: "Smartphone Samsung Galaxy A36, 8GB RAM, 256GB, conectividad 5G. Nuevo.", categoria: "Celulares", marca: "Samsung", precio: 0, stock: 0, destacado: false },
  { nombre: "Samsung Galaxy A56 12/256GB", descripcion: "Smartphone Samsung Galaxy A56, 12GB RAM y 256GB de almacenamiento.", categoria: "Celulares", marca: "Samsung", precio: 0, stock: 0, destacado: false },
  { nombre: "Samsung Galaxy A57 8/256GB 5G", descripcion: "Smartphone Samsung Galaxy A57, 8GB RAM, 256GB, conectividad 5G.", categoria: "Celulares", marca: "Samsung", precio: 0, stock: 0, destacado: false },
  { nombre: "Samsung Galaxy S23 FE 8/256GB", descripcion: "Smartphone Samsung Galaxy S23 FE, 8GB RAM y 256GB de almacenamiento.", categoria: "Celulares", marca: "Samsung", precio: 0, stock: 0, destacado: false },
  { nombre: "Samsung Galaxy S25 FE 8/256GB", descripcion: "Smartphone Samsung Galaxy S25 FE, 8GB RAM y 256GB de almacenamiento.", categoria: "Celulares", marca: "Samsung", precio: 0, stock: 0, destacado: false },
  { nombre: "Samsung Galaxy A06 64GB 4GB RAM", descripcion: "Smartphone Samsung Galaxy A06, 64GB de almacenamiento, 4GB de RAM.", categoria: "Celulares", marca: "Samsung", precio: 0, stock: 0, destacado: false },
  { nombre: "Motorola Moto G15 4/128GB", descripcion: "Smartphone Motorola Moto G15, 4GB RAM y 128GB de almacenamiento.", categoria: "Celulares", marca: "Motorola", precio: 0, stock: 0, destacado: false },
  { nombre: "Motorola Moto G04S 4/64GB", descripcion: "Smartphone Motorola Moto G04S, 4GB RAM y 64GB de almacenamiento.", categoria: "Celulares", marca: "Motorola", precio: 0, stock: 0, destacado: false },
  { nombre: "Motorola Moto G35 8/256GB", descripcion: "Smartphone Motorola Moto G35, 8GB RAM y 256GB de almacenamiento.", categoria: "Celulares", marca: "Motorola", precio: 0, stock: 0, destacado: false },
  { nombre: "Noblex N62 4/64GB", descripcion: "Smartphone Noblex N62, 4GB RAM y 64GB de almacenamiento.", categoria: "Celulares", marca: "Noblex", precio: 0, stock: 0, destacado: false },
  { nombre: "Xiaomi Redmi A5 4/128GB", descripcion: "Smartphone Xiaomi Redmi A5, 4GB RAM y 128GB de almacenamiento.", categoria: "Celulares", marca: "Xiaomi", precio: 0, stock: 0, destacado: false },
  { nombre: "TCL 40SE 6/256GB", descripcion: "Smartphone TCL 40SE, 6GB RAM y 256GB de almacenamiento.", categoria: "Celulares", marca: "TCL", precio: 0, stock: 0, destacado: false },
  { nombre: "TCL 505 4/128GB", descripcion: "Smartphone TCL 505, 4GB RAM y 128GB de almacenamiento.", categoria: "Celulares", marca: "TCL", precio: 0, stock: 0, destacado: false },
  { nombre: "Xiaomi Redmi 15C 8/256GB", descripcion: "Smartphone Xiaomi Redmi 15C, 8GB RAM y 256GB de almacenamiento.", categoria: "Celulares", marca: "Xiaomi", precio: 0, stock: 0, destacado: false },
  { nombre: "Xiaomi Redmi A5 3/64GB", descripcion: "Smartphone Xiaomi Redmi A5, 3GB RAM y 64GB de almacenamiento.", categoria: "Celulares", marca: "Xiaomi", precio: 0, stock: 0, destacado: false },
  { nombre: "Xiaomi Redmi Note 14S 8/256GB", descripcion: "Smartphone Xiaomi Redmi Note 14S, 8GB RAM y 256GB de almacenamiento.", categoria: "Celulares", marca: "Xiaomi", precio: 0, stock: 0, destacado: false },
  { nombre: "Xiaomi Redmi Note 15 Pro 8/256GB", descripcion: "Smartphone Xiaomi Redmi Note 15 Pro, 8GB RAM y 256GB de almacenamiento.", categoria: "Celulares", marca: "Xiaomi", precio: 0, stock: 0, destacado: false },

  // NOTEBOOKS
  { nombre: "Notebook HP 8RAM 256GB Ryzen 3 15.6\" W11", descripcion: "Notebook HP con 8GB RAM, 256GB de almacenamiento SSD, procesador Ryzen 3, pantalla 15.6 pulgadas, Windows 11.", categoria: "Notebooks", marca: "HP", precio: 0, stock: 0, destacado: false },
  { nombre: "Notebook HP 4RAM 1TB Celeron 14\" W10", descripcion: "Notebook HP con 4GB RAM, 1TB de almacenamiento, procesador Intel Celeron, pantalla 14 pulgadas, Windows 10.", categoria: "Notebooks", marca: "HP", precio: 0, stock: 0, destacado: false },
  { nombre: "Notebook HP 8RAM 512GB Ryzen 3 15.6\" W11", descripcion: "Notebook HP con 8GB RAM, 512GB SSD, procesador Ryzen 3, pantalla 15.6 pulgadas, Windows 11.", categoria: "Notebooks", marca: "HP", precio: 0, stock: 0, destacado: false },
  { nombre: "Notebook EXO 8RAM 512GB Ryzen 5 15.6\" W11", descripcion: "Notebook EXO con 8GB RAM, 512GB SSD, procesador Ryzen 5, pantalla 15.6 pulgadas, Windows 11.", categoria: "Notebooks", marca: "EXO", precio: 0, stock: 0, destacado: false },
  { nombre: "Notebook Acer Ryzen 5 8RAM 512GB SSD", descripcion: "Notebook Acer con procesador Ryzen 5, 8GB RAM y 512GB SSD.", categoria: "Notebooks", marca: "Acer", precio: 0, stock: 0, destacado: false },
  { nombre: "Notebook Acer Aspire 15.6\" Intel I9 16GB 1TB SSD W11", descripcion: "Notebook Acer Aspire 15.6 pulgadas con Intel I9, 16GB RAM, 1TB SSD, Windows 11. Alto rendimiento.", categoria: "Notebooks", marca: "Acer", precio: 0, stock: 0, destacado: false },
  { nombre: "Notebook Asus 15\" FHD Ryzen 5 8GB 512GB SSD W11", descripcion: "Notebook Asus 15 pulgadas Full HD, procesador Ryzen 5, 8GB RAM, 512GB SSD, Windows 11 Home.", categoria: "Notebooks", marca: "Asus", precio: 0, stock: 0, destacado: false },
  { nombre: "Notebook HP 8RAM 512GB Ryzen 5 15.6\" W11", descripcion: "Notebook HP con 8GB RAM, 512GB SSD, procesador Ryzen 5, pantalla 15.6 pulgadas, Windows 11.", categoria: "Notebooks", marca: "HP", precio: 0, stock: 0, destacado: false },

  // IMPRESORAS
  { nombre: "Epson Ecotank L3210 Multifuncional 3x1", descripcion: "Impresora multifuncional 3 en 1 (imprime, copia, escanea). Sistema de tanque de tinta, bivolt.", categoria: "Impresoras", marca: "Epson", precio: 0, stock: 0, destacado: false },
  { nombre: "Epson Ecotank L3250 WiFi Multifuncional 3x1", descripcion: "Impresora multifuncional 3 en 1 con WiFi. Sistema de tanque de tinta, bivolt. Imprime desde el celular.", categoria: "Impresoras", marca: "Epson", precio: 0, stock: 0, destacado: false },
  { nombre: "Impresora Laser Pantum P2509W Monocromática WiFi", descripcion: "Impresora láser monocromática con WiFi. Ideal para oficina o estudio.", categoria: "Impresoras", marca: "Pantum", precio: 0, stock: 0, destacado: false },
  { nombre: "Impresora HP Laser 107W", descripcion: "Impresora láser HP con WiFi. Impresión rápida y económica.", categoria: "Impresoras", marca: "HP", precio: 0, stock: 0, destacado: false },

  // VENTILADORES
  { nombre: "Ventilador de techo 3 paletas", descripcion: "Ventilador de techo 3 paletas. Silencioso y eficiente para ambientes medianos.", categoria: "Ventiladores", marca: "Philco", precio: 0, stock: 0, destacado: false },
  { nombre: "Ventilador de techo 4 paletas", descripcion: "Ventilador de techo 4 paletas. Mayor cobertura de ventilación.", categoria: "Ventiladores", marca: "Liliana", precio: 0, stock: 0, destacado: false },
  { nombre: "Ventilador de techo 4 paletas con luz", descripcion: "Ventilador de techo 4 paletas con luz incorporada. 2 en 1 para tu hogar.", categoria: "Ventiladores", marca: "Liliana", precio: 0, stock: 0, destacado: false },
  { nombre: "Ventilador de techo 4 paletas con luz", descripcion: "Ventilador de techo 4 paletas con luz incorporada.", categoria: "Ventiladores", marca: "Axel", precio: 0, stock: 0, destacado: false },
  { nombre: "Ventilador turbo 10\"", descripcion: "Ventilador turbo de 10 pulgadas. Potente y compacto.", categoria: "Ventiladores", marca: "Liliana", precio: 0, stock: 0, destacado: false },
  { nombre: "Ventilador turbo 18\" cromado", descripcion: "Ventilador turbo de 18 pulgadas cromado. Alta potencia.", categoria: "Ventiladores", marca: "Liliana", precio: 0, stock: 0, destacado: false },
  { nombre: "Ventilador turbo 18\" PVC", descripcion: "Ventilador turbo de 18 pulgadas PVC.", categoria: "Ventiladores", marca: "Liliana", precio: 0, stock: 0, destacado: false },
  { nombre: "Ventilador turbo 20\" PVC", descripcion: "Ventilador turbo de 20 pulgadas PVC.", categoria: "Ventiladores", marca: "Philco", precio: 0, stock: 0, destacado: false },
  { nombre: "Ventilador pared 20\"", descripcion: "Ventilador de pared 20 pulgadas. Ideal para talleres o locales.", categoria: "Ventiladores", marca: "Polar", precio: 0, stock: 0, destacado: false },
  { nombre: "Ventilador pared 26\"", descripcion: "Ventilador de pared 26 pulgadas.", categoria: "Ventiladores", marca: "Philco", precio: 0, stock: 0, destacado: false },
  { nombre: "Ventilador pared 30\"", descripcion: "Ventilador de pared 30 pulgadas. Semi-industrial.", categoria: "Ventiladores", marca: "Everest", precio: 0, stock: 0, destacado: false },
  { nombre: "Ventilador 32\" industrial", descripcion: "Ventilador industrial 32 pulgadas. Para grandes espacios.", categoria: "Ventiladores", marca: "Liliana", precio: 0, stock: 0, destacado: false },
  { nombre: "Ventilador de techo 3 paletas", descripcion: "Ventilador de techo 3 paletas.", categoria: "Ventiladores", marca: "Everest", precio: 0, stock: 0, destacado: false },
  { nombre: "Ventilador de techo 4 paletas", descripcion: "Ventilador de techo 4 paletas.", categoria: "Ventiladores", marca: "Alpaca", precio: 0, stock: 0, destacado: false },

  // COCINAS
  { nombre: "Cocina Escorial Candor blanco/negro", descripcion: "Cocina Escorial modelo Candor. Disponible en color blanco o negro. 4 hornallas a gas.", categoria: "Cocinas", marca: "Escorial", precio: 0, stock: 0, destacado: false },
  { nombre: "Cocina Escorial Palace blanco/negro", descripcion: "Cocina Escorial modelo Palace. Disponible en blanco o negro. Mayor capacidad de horno.", categoria: "Cocinas", marca: "Escorial", precio: 0, stock: 0, destacado: false },
  { nombre: "Cocina Escorial Master blanco/negro", descripcion: "Cocina Escorial modelo Master. Disponible en blanco o negro.", categoria: "Cocinas", marca: "Escorial", precio: 0, stock: 0, destacado: false },
  { nombre: "Cocina Escorial Style Black", descripcion: "Cocina Escorial modelo Style Black. Diseño premium en color negro.", categoria: "Cocinas", marca: "Escorial", precio: 0, stock: 0, destacado: false },
  { nombre: "Cocina Florencia", descripcion: "Cocina Florencia a gas. Clásica y confiable.", categoria: "Cocinas", marca: "Florencia", precio: 0, stock: 0, destacado: false },
  { nombre: "Cocina Florencia con encendido", descripcion: "Cocina Florencia a gas con encendido automático. Mayor comodidad.", categoria: "Cocinas", marca: "Florencia", precio: 0, stock: 0, destacado: false },
  { nombre: "Cocina Florencia con encendido inoxidable", descripcion: "Cocina Florencia a gas con encendido automático, terminación inoxidable.", categoria: "Cocinas", marca: "Florencia", precio: 0, stock: 0, destacado: false },
  { nombre: "Cocina Electrolux 76DXQ Doble horno eléct./gas", descripcion: "Cocina Electrolux 76DXQ Inox doble horno eléctrico/gas. La más completa del mercado.", categoria: "Cocinas", marca: "Electrolux", precio: 0, stock: 0, destacado: false },

  // ANAFES
  { nombre: "Anafe eléctrico 1 hornalla", descripcion: "Anafe eléctrico de 1 hornalla. Compacto e ideal para espacios reducidos.", categoria: "Anafes", marca: "Sansei", precio: 0, stock: 0, destacado: false },
  { nombre: "Anafe eléctrico 2 hornallas", descripcion: "Anafe eléctrico de 2 hornallas. Práctico para cocina pequeña.", categoria: "Anafes", marca: "Sansei", precio: 0, stock: 0, destacado: false },
  { nombre: "Anafe a gas 2 hornallas", descripcion: "Anafe a gas de 2 hornallas. Económico y resistente.", categoria: "Anafes", marca: "Conometal", precio: 0, stock: 0, destacado: false },
  { nombre: "Anafe a gas 2 hornallas con horno", descripcion: "Anafe a gas de 2 hornallas con horno incorporado.", categoria: "Anafes", marca: "Conometal", precio: 0, stock: 0, destacado: false },
  { nombre: "Anafe a gas 4 hornallas con horno", descripcion: "Anafe a gas de 4 hornallas con horno incorporado.", categoria: "Anafes", marca: "Conometal", precio: 0, stock: 0, destacado: false },
  { nombre: "Anafe a gas inox. 4 hornallas p/empotrar", descripcion: "Anafe a gas inoxidable de 4 hornallas para empotrar. Diseño moderno.", categoria: "Anafes", marca: "Longvie", precio: 0, stock: 0, destacado: false },
  { nombre: "Anafe a gas inox. 4 hornallas p/empotrar", descripcion: "Anafe a gas inoxidable de 4 hornallas para empotrar.", categoria: "Anafes", marca: "Florencia", precio: 0, stock: 0, destacado: false },
  { nombre: "Anafe a gas inox. 4 hornallas p/empotrar", descripcion: "Anafe a gas inoxidable de 4 hornallas para empotrar. Marca premium.", categoria: "Anafes", marca: "Whirlpool", precio: 0, stock: 0, destacado: false },

  // PAVAS ELÉCTRICAS
  { nombre: "Pava eléctrica c/regulador de corte", descripcion: "Pava eléctrica con regulador de corte automático. Segura y práctica.", categoria: "Pavas eléctricas", marca: "Atma", precio: 0, stock: 0, destacado: false },
  { nombre: "Pava eléctrica c/regulador de corte", descripcion: "Pava eléctrica Philco con regulador de corte automático.", categoria: "Pavas eléctricas", marca: "Philco", precio: 0, stock: 0, destacado: false },
  { nombre: "Pava eléctrica sin regulador de corte", descripcion: "Pava eléctrica Daewoo sin regulador de corte. Acero inoxidable.", categoria: "Pavas eléctricas", marca: "Daewoo", precio: 0, stock: 0, destacado: false },
  { nombre: "Pava eléctrica c/regulador de corte 3905", descripcion: "Pava eléctrica Yelmo modelo 3905 con regulador de corte automático.", categoria: "Pavas eléctricas", marca: "Yelmo", precio: 0, stock: 0, destacado: false },
  { nombre: "Pava eléctrica c/regulador de corte", descripcion: "Pava eléctrica Philips con regulador de corte automático. Calidad premium.", categoria: "Pavas eléctricas", marca: "Philips", precio: 0, stock: 0, destacado: false },
  { nombre: "Pava eléctrica 1.7L Acero Inoxidable PE-DKA1850", descripcion: "Pava eléctrica Peabody 1.7 litros de acero inoxidable, modelo PE-DKA1850.", categoria: "Pavas eléctricas", marca: "Peabody", precio: 0, stock: 0, destacado: false },

  // COLCHONES
  { nombre: "Colchón Esp. Taurus 080x17 T/A", descripcion: "Colchón de espuma Taurus 80x17 cm. Una plaza. Liviano y confortable.", categoria: "Colchones", marca: "Taurus", precio: 0, stock: 0, destacado: false },
  { nombre: "Colchón Esp. Taurus 100x17 T/A", descripcion: "Colchón de espuma Taurus 100x17 cm. Plaza y media.", categoria: "Colchones", marca: "Taurus", precio: 0, stock: 0, destacado: false },
  { nombre: "Colchón Esp. Taurus 140x17 T/A", descripcion: "Colchón de espuma Taurus 140x17 cm. Dos plazas.", categoria: "Colchones", marca: "Taurus", precio: 0, stock: 0, destacado: false },
  { nombre: "Colchón Esp. Taurus 080x20 Real Densidad 24kg/m3", descripcion: "Colchón de espuma Taurus 80x20 cm. Alta densidad 24kg/m3 para mayor durabilidad.", categoria: "Colchones", marca: "Taurus", precio: 0, stock: 0, destacado: false },
  { nombre: "Colchón Esp. Taurus 100x20 Real Densidad 24kg/m3", descripcion: "Colchón de espuma Taurus 100x20 cm. Alta densidad 24kg/m3.", categoria: "Colchones", marca: "Taurus", precio: 0, stock: 0, destacado: false },
  { nombre: "Colchón Esp. Taurus 140x20 Real Densidad 24kg/m3", descripcion: "Colchón de espuma Taurus 140x20 cm. Alta densidad 24kg/m3. Dos plazas.", categoria: "Colchones", marca: "Taurus", precio: 0, stock: 0, destacado: false },
  { nombre: "Colchón Esp. Gani 0.80x25 Real Densidad 30kg/m3", descripcion: "Colchón de espuma Gani 80x25 cm. Alta densidad 30kg/m3. Mayor confort y durabilidad.", categoria: "Colchones", marca: "Gani", precio: 0, stock: 0, destacado: false },
  { nombre: "Colchón Esp. Gani 100x25 Real Densidad 30kg/m3", descripcion: "Colchón de espuma Gani 100x25 cm. Alta densidad 30kg/m3.", categoria: "Colchones", marca: "Gani", precio: 0, stock: 0, destacado: false },
  { nombre: "Colchón Esp. Gani 140x25 Densidad 30kg/m3", descripcion: "Colchón de espuma Gani 140x25 cm. Alta densidad 30kg/m3. Dos plazas.", categoria: "Colchones", marca: "Gani", precio: 0, stock: 0, destacado: false },
  { nombre: "Colchón Esp. Super Lujo 0.80x22 Densidad 25kg/m3", descripcion: "Colchón de espuma Super Lujo 80x22 cm. Densidad 25kg/m3.", categoria: "Colchones", marca: "Super Lujo", precio: 0, stock: 0, destacado: false },
  { nombre: "Colchón Esp. Super Lujo 100x22 Densidad 25kg/m3", descripcion: "Colchón de espuma Super Lujo 100x22 cm. Densidad 25kg/m3.", categoria: "Colchones", marca: "Super Lujo", precio: 0, stock: 0, destacado: false },
  { nombre: "Colchón Esp. Super Lujo 140x22 Densidad 25kg/m3", descripcion: "Colchón de espuma Super Lujo 140x22 cm. Densidad 25kg/m3.", categoria: "Colchones", marca: "Super Lujo", precio: 0, stock: 0, destacado: false },
  { nombre: "Colchón Esp. Gold Jackard 140x26 Alta Densidad 33kg/m3", descripcion: "Colchón de espuma Gold Jackard 140x26 cm. Alta densidad 33kg/m3. El más premium.", categoria: "Colchones", marca: "Gold Jackard", precio: 0, stock: 0, destacado: false },
  { nombre: "Colchón Resorte Equis 140x26 Alta Densidad 33kg/m3", descripcion: "Colchón de resorte Equis 140x26 cm. Alta densidad 33kg/m3.", categoria: "Colchones", marca: "Resorte Equis", precio: 0, stock: 0, destacado: false },

  // LAVARROPAS
  { nombre: "Lavarropas carga superior 6.5kg Gris", descripcion: "Lavarropas carga superior 6.5 kg color gris. Modelo Concept Neo Fuzzy.", categoria: "Lavarropas", marca: "Drean", precio: 0, stock: 0, destacado: false },
  { nombre: "Lavarropas carga superior 11kg Gris Oscuro", descripcion: "Lavarropas Whirlpool carga superior 11kg color gris oscuro. Gran capacidad.", categoria: "Lavarropas", marca: "Whirlpool", precio: 0, stock: 0, destacado: false },
  { nombre: "Lavarropas carga frontal 6kg 1000rpm", descripcion: "Lavarropas Enova carga frontal 6 kg, 1000 RPM.", categoria: "Lavarropas", marca: "Enova", precio: 0, stock: 0, destacado: false },
  { nombre: "Lavarropas 8kg 1400rpm Inverter gris", descripcion: "Lavarropas Hisense 8 kg, 1400 RPM, tecnología Inverter, color gris.", categoria: "Lavarropas", marca: "Hisense", precio: 0, stock: 0, destacado: false },
  { nombre: "Lavarropas semiaut. 57SB 5kg", descripcion: "Lavarropas semiautomático Drean 57SB, 5 kg.", categoria: "Lavarropas", marca: "Drean", precio: 0, stock: 0, destacado: false },
  { nombre: "Lavarropas semiaut. 56SB 5kg", descripcion: "Lavarropas semiautomático Patrick 56SB, 5 kg.", categoria: "Lavarropas", marca: "Patrick", precio: 0, stock: 0, destacado: false },
  { nombre: "Lavarropas semiaut. 10kg", descripcion: "Lavarropas semiautomático 10 kg.", categoria: "Lavarropas", marca: "Wafy", precio: 0, stock: 0, destacado: false },
  { nombre: "Lavarropas semi aut. Family Ltpk79sb 7kg", descripcion: "Lavarropas semiautomático Drean Family Ltpk79sb, 7 kg.", categoria: "Lavarropas", marca: "Drean", precio: 0, stock: 0, destacado: false },
  { nombre: "Lavarropas semi aut. Columbia 10kg 7p c/bomba", descripcion: "Lavarropas semiautomático Columbia 10 kg, 7 programas, con bomba. Varios colores.", categoria: "Lavarropas", marca: "Columbia", precio: 0, stock: 0, destacado: false },
  { nombre: "Lavarropas automático 6.08 Nex Eco", descripcion: "Lavarropas automático Drean 6.08 Nex Eco. Eficiente y económico.", categoria: "Lavarropas", marca: "Drean", precio: 0, stock: 0, destacado: false },
  { nombre: "Lavarropas automático 8.14 Nex Eco", descripcion: "Lavarropas automático Drean 8.14 Nex Eco. Mayor capacidad.", categoria: "Lavarropas", marca: "Drean", precio: 0, stock: 0, destacado: false },
  { nombre: "Lavarropas automático 10.12 Nex Eco", descripcion: "Lavarropas automático Drean 10.12 Nex Eco. Gran capacidad familiar.", categoria: "Lavarropas", marca: "Drean", precio: 0, stock: 0, destacado: false },

  // SECARROPAS
  { nombre: "Secarropas 5.5kg PVC", descripcion: "Secarropas 5.5 kg en PVC.", categoria: "Secarropas", marca: "Patrick", precio: 0, stock: 0, destacado: false },
  { nombre: "Secarropas 6.5kg PVC", descripcion: "Secarropas 6.5 kg en PVC.", categoria: "Secarropas", marca: "Patrick", precio: 0, stock: 0, destacado: false },
  { nombre: "Secarropas 6.5kg PVC", descripcion: "Secarropas Codini 6.5 kg en PVC.", categoria: "Secarropas", marca: "Codini", precio: 0, stock: 0, destacado: false },
  { nombre: "Secarropas 6.5kg Inox", descripcion: "Secarropas Everest 6.5 kg en acero inoxidable.", categoria: "Secarropas", marca: "Everest", precio: 0, stock: 0, destacado: false },
  { nombre: "Secarropas 5.5kg Inox", descripcion: "Secarropas Koh-i-Noor 5.5 kg en acero inoxidable.", categoria: "Secarropas", marca: "Koh-i-Noor", precio: 0, stock: 0, destacado: false },
  { nombre: "Secarropas 6.5kg Inox", descripcion: "Secarropas Koh-i-Noor 6.5 kg en acero inoxidable.", categoria: "Secarropas", marca: "Koh-i-Noor", precio: 0, stock: 0, destacado: false },
  { nombre: "Secarropas 6.5kg PVC", descripcion: "Secarropas Koh-i-Noor 6.5 kg en PVC.", categoria: "Secarropas", marca: "Koh-i-Noor", precio: 0, stock: 0, destacado: false },
  { nombre: "Secarropas Columbia 5.5kg Tambor Acero 2800RPM", descripcion: "Secarropas Columbia 5.5 kg, tambor de acero, 2800 RPM, seguridad total.", categoria: "Secarropas", marca: "Columbia", precio: 0, stock: 0, destacado: false },

  // FREEZER
  { nombre: "Freezer 2600 223 lts", descripcion: "Freezer horizontal Bambi 223 litros. Ideal para almacenamiento de alimentos.", categoria: "Freezer", marca: "Bambi", precio: 0, stock: 0, destacado: false },
  { nombre: "Freezer 330 290 lts", descripcion: "Freezer horizontal Bambi 290 litros. Mayor capacidad.", categoria: "Freezer", marca: "Bambi", precio: 0, stock: 0, destacado: false },
  { nombre: "Freezer 410 360 lts", descripcion: "Freezer horizontal Bambi 360 litros. Gran capacidad.", categoria: "Freezer", marca: "Bambi", precio: 0, stock: 0, destacado: false },
  { nombre: "Freezer 450 2 tapas 400 lts", descripcion: "Freezer horizontal Briket 400 litros con 2 tapas.", categoria: "Freezer", marca: "Briket", precio: 0, stock: 0, destacado: false },
  { nombre: "Freezer 400 lts 1 tapa", descripcion: "Freezer horizontal Gafa 400 litros con 1 tapa.", categoria: "Freezer", marca: "Gafa", precio: 0, stock: 0, destacado: false },
  { nombre: "Freezer S 120 lts", descripcion: "Freezer Gafa tamaño S, 120 litros. Compacto.", categoria: "Freezer", marca: "Gafa", precio: 0, stock: 0, destacado: false },
  { nombre: "Freezer M 210 lts", descripcion: "Freezer Gafa tamaño M, 210 litros.", categoria: "Freezer", marca: "Gafa", precio: 0, stock: 0, destacado: false },
  { nombre: "Freezer L 277 lts", descripcion: "Freezer Gafa tamaño L, 277 litros.", categoria: "Freezer", marca: "Gafa", precio: 0, stock: 0, destacado: false },
  { nombre: "Freezer Horizontal FIH-550 470 lts 2 puertas", descripcion: "Freezer horizontal Inelro FIH-550, 470 litros, 2 puertas. Producto industrial argentino.", categoria: "Freezer", marca: "Inelro", precio: 0, stock: 0, destacado: false },
  { nombre: "Freezer a gas F140 140 lts", descripcion: "Freezer a gas MTH F140, 140 litros, 10cm de aislación, adaptable a gas natural.", categoria: "Freezer", marca: "MTH", precio: 0, stock: 0, destacado: false },

  // HORNOS ELÉCTRICOS
  { nombre: "Horno eléctrico 40 litros", descripcion: "Horno eléctrico BGH 40 litros. Ideal para uso doméstico.", categoria: "Hornos eléctricos", marca: "BGH", precio: 0, stock: 0, destacado: false },
  { nombre: "Horno eléctrico 40 litros", descripcion: "Horno eléctrico Yelmo 40 litros.", categoria: "Hornos eléctricos", marca: "Yelmo", precio: 0, stock: 0, destacado: false },
  { nombre: "Horno eléctrico 45 litros", descripcion: "Horno eléctrico Everest 45 litros.", categoria: "Hornos eléctricos", marca: "Everest", precio: 0, stock: 0, destacado: false },
  { nombre: "Horno eléctrico 50 litros", descripcion: "Horno eléctrico Ultracomb 50 litros.", categoria: "Hornos eléctricos", marca: "Ultracomb", precio: 0, stock: 0, destacado: false },
  { nombre: "Horno eléctrico 63 litros", descripcion: "Horno eléctrico Sansei 63 litros.", categoria: "Hornos eléctricos", marca: "Sansei", precio: 0, stock: 0, destacado: false },
  { nombre: "Horno eléctrico 65 litros", descripcion: "Horno eléctrico RCA 65 litros.", categoria: "Hornos eléctricos", marca: "RCA", precio: 0, stock: 0, destacado: false },
  { nombre: "Horno eléctrico 70 litros", descripcion: "Horno eléctrico Atma 70 litros.", categoria: "Hornos eléctricos", marca: "Atma", precio: 0, stock: 0, destacado: false },
  { nombre: "Horno eléctrico 80 litros", descripcion: "Horno eléctrico Ultracomb 80 litros.", categoria: "Hornos eléctricos", marca: "Ultracomb", precio: 0, stock: 0, destacado: false },
  { nombre: "Horno eléctrico 80 litros Inox", descripcion: "Horno eléctrico Ultracomb 80 litros en acero inoxidable.", categoria: "Hornos eléctricos", marca: "Ultracomb", precio: 0, stock: 0, destacado: false },
  { nombre: "Horno eléctrico 95 litros", descripcion: "Horno eléctrico RCA 95 litros.", categoria: "Hornos eléctricos", marca: "RCA", precio: 0, stock: 0, destacado: false },
  { nombre: "Horno eléctrico 110 litros", descripcion: "Horno eléctrico Ultracomb 110 litros.", categoria: "Hornos eléctricos", marca: "Ultracomb", precio: 0, stock: 0, destacado: false },
  { nombre: "Horno eléctrico 140 litros", descripcion: "Horno eléctrico Yelmo 140 litros.", categoria: "Hornos eléctricos", marca: "Yelmo", precio: 0, stock: 0, destacado: false },
  { nombre: "Horno eléctrico empotrar 7857", descripcion: "Horno eléctrico Florencia para empotrar, modelo 7857.", categoria: "Hornos eléctricos", marca: "Florencia", precio: 0, stock: 0, destacado: false },
  { nombre: "Horno eléctrico empotrar espejado", descripcion: "Horno eléctrico Florencia para empotrar con puerta espejada.", categoria: "Hornos eléctricos", marca: "Florencia", precio: 0, stock: 0, destacado: false },
  { nombre: "Horno gas Pizzer 12H", descripcion: "Horno a gas pizzero Morelli 12 hornillas. Para uso profesional o emprendimientos.", categoria: "Hornos eléctricos", marca: "Morelli", precio: 0, stock: 0, destacado: false },

  // FREIDORAS DE AIRE
  { nombre: "Freidora de aire sin aceite 3 litros", descripcion: "Freidora de aire sin aceite Daewoo 3 litros. Cocina saludable y rápida.", categoria: "Freidoras de aire", marca: "Daewoo", precio: 0, stock: 0, destacado: false },
  { nombre: "Freidora de aire 2000W 9L 12 programas", descripcion: "Freidora de aire Philco 2000W, 9 litros, 12 programas de cocción.", categoria: "Freidoras de aire", marca: "Philco", precio: 0, stock: 0, destacado: false },
  { nombre: "Freidora de aire sin aceite 3 litros", descripcion: "Freidora de aire sin aceite Ultracomb 3 litros.", categoria: "Freidoras de aire", marca: "Ultracomb", precio: 0, stock: 0, destacado: false },
  { nombre: "Freidora de aire sin aceite 8.5 litros", descripcion: "Freidora de aire sin aceite Yelmo 8.5 litros. Gran capacidad.", categoria: "Freidoras de aire", marca: "Yelmo", precio: 0, stock: 0, destacado: false },
  { nombre: "Freidora de aire con aceite 1.5 litros", descripcion: "Freidora de aire con aceite Yelmo 1.5 litros.", categoria: "Freidoras de aire", marca: "Yelmo", precio: 0, stock: 0, destacado: false },
  { nombre: "Freidora Airfryer Essential Rapid Air 2000W 6.2L", descripcion: "Freidora de aire Philips Airfryer Essential XL Rapid Air, 2000W, 6.2 litros. Nuevo ingreso.", categoria: "Freidoras de aire", marca: "Philips", precio: 0, stock: 0, destacado: false },
  { nombre: "Freidora de aire digital sin aceite Pro Fr60arbp 8L", descripcion: "Freidora de aire digital Atma Pro Fr60arbp, 8 litros, color negro.", categoria: "Freidoras de aire", marca: "Atma", precio: 0, stock: 0, destacado: false },

  // PLANCHAS
  { nombre: "Plancha seca Crivel", descripcion: "Plancha seca Crivel. Liviana y práctica.", categoria: "Planchas", marca: "Crivel", precio: 0, stock: 0, destacado: false },
  { nombre: "Plancha seca 1200W suela antiadherente", descripcion: "Plancha seca Philco 1200W con suela antiadherente.", categoria: "Planchas", marca: "Philco", precio: 0, stock: 0, destacado: false },
  { nombre: "Plancha a vapor Pav2453 suela cerámica 2000W", descripcion: "Plancha a vapor Atma Pav2453, suela cerámica, 2000W.", categoria: "Planchas", marca: "Atma", precio: 0, stock: 0, destacado: false },
  { nombre: "Plancha seca 1200W", descripcion: "Plancha seca Philips 1200W. Calidad premium.", categoria: "Planchas", marca: "Philips", precio: 0, stock: 0, destacado: false },

  // ASPIRADORAS
  { nombre: "Aspiradora Ultra Power 2 litros 2000W", descripcion: "Aspiradora Atma Ultra Power, 2 litros, 2000W. Potente y eficiente.", categoria: "Aspiradoras", marca: "Atma", precio: 0, stock: 0, destacado: false },
  { nombre: "Aspiradora sin bolsa 2000W", descripcion: "Aspiradora Samsung sin bolsa, 2000W. Fácil vaciado y mantenimiento.", categoria: "Aspiradoras", marca: "Samsung", precio: 0, stock: 0, destacado: false },
  { nombre: "Aspiradora plástica 24 lts 1400W", descripcion: "Aspiradora Ultracomb plástica Pioneer, 24 litros, 1400W.", categoria: "Aspiradoras", marca: "Ultracomb", precio: 0, stock: 0, destacado: false },
  { nombre: "Aspiradora AS-4314 34 lts agua y polvo filtro H.E.P.A", descripcion: "Aspiradora Ultracomb AS-4314, 34 litros, aspira agua y polvo, filtro H.E.P.A.", categoria: "Aspiradoras", marca: "Ultracomb", precio: 0, stock: 0, destacado: false },
]

async function cargarProductos() {
  console.log(`Cargando ${productos.length} productos...`)

  let cargados = 0
  let errores = 0

  for (const producto of productos) {
    const { data, error } = await supabase
      .from('productos')
      .insert([{
        ...producto,
        creado_en: new Date().toISOString(),
        actualizado_en: new Date().toISOString(),
      }])

    if (error) {
      console.error(`Error cargando "${producto.nombre}":`, error.message)
      errores++
    } else {
      cargados++
      if (cargados % 10 === 0) {
        console.log(`Cargados ${cargados}/${productos.length} productos...`)
      }
    }
  }

  console.log(`\n✅ Terminado!`)
  console.log(`   - Productos cargados: ${cargados}`)
  console.log(`   - Errores: ${errores}`)
}

cargarProductos().catch(console.error)