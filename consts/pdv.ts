export type PdvTipo = 'dietética' | 'gimnasio' | 'distribuidora' | 'tienda' | 'suplementos'

export interface PuntoDeVenta {
  nombre: string
  direccion: string
  ciudad: string
  provincia: string
  tipo: PdvTipo
  activo: boolean
  /** Coordenadas aproximadas (nivel calle/ciudad) para ubicar el pin en el mapa */
  lat: number
  lng: number
}

// Etiquetas legibles + color de pin por tipo de comercio
export const PDV_TIPO_LABEL: Record<PdvTipo, string> = {
  'dietética': 'Dietética',
  'gimnasio': 'Gimnasio',
  'distribuidora': 'Distribuidora',
  'tienda': 'Tienda',
  'suplementos': 'Suplementos',
}

export const PDV_TIPO_COLOR: Record<PdvTipo, string> = {
  'dietética': '#3f7d3f',
  'gimnasio': '#2b6cb0',
  'distribuidora': '#C0171E',
  'tienda': '#9b6a17',
  'suplementos': '#6b46c1',
}

// Solo PDVs confirmados (activo: true). Los pendientes de confirmación NO se incluyen.
export const PUNTOS_DE_VENTA: PuntoDeVenta[] = [
  { nombre: 'SuplementSport', direccion: 'Eva Perón 20', ciudad: 'Lanús Oeste', provincia: 'Buenos Aires', tipo: 'suplementos', activo: true, lat: -34.7075, lng: -58.3920 },
  { nombre: 'SuplementSport', direccion: '9 de Julio 2064', ciudad: 'Lanús Este', provincia: 'Buenos Aires', tipo: 'suplementos', activo: true, lat: -34.7010, lng: -58.3850 },
  { nombre: 'SuplementSport', direccion: 'H. Yrigoyen 8655', ciudad: 'Lomas de Zamora', provincia: 'Buenos Aires', tipo: 'suplementos', activo: true, lat: -34.7600, lng: -58.4010 },
  { nombre: 'Quincas', direccion: 'José Bianco 640', ciudad: 'El Palomar', provincia: 'Buenos Aires', tipo: 'tienda', activo: true, lat: -34.6090, lng: -58.5890 },
  { nombre: 'MaxNic — Canastero de La Costa', direccion: 'Av. Vernet 1440', ciudad: 'Mar del Plata', provincia: 'Buenos Aires', tipo: 'tienda', activo: true, lat: -37.9920, lng: -57.5760 },
  { nombre: 'MaxNic', direccion: 'Av. Jorge Newbery 3871', ciudad: 'CABA — Chacarita', provincia: 'CABA', tipo: 'tienda', activo: true, lat: -34.5870, lng: -58.4530 },
  { nombre: 'MaxNic', direccion: 'Av. Constitución 4191', ciudad: 'Mar del Plata', provincia: 'Buenos Aires', tipo: 'tienda', activo: true, lat: -37.9580, lng: -57.5650 },
  { nombre: 'MaxNic', direccion: 'Av. Independencia 1063', ciudad: 'Mar del Plata', provincia: 'Buenos Aires', tipo: 'tienda', activo: true, lat: -38.0030, lng: -57.5500 },
  { nombre: 'MaxNic', direccion: 'Av. Pedro Luro 6411', ciudad: 'Mar del Plata', provincia: 'Buenos Aires', tipo: 'tienda', activo: true, lat: -38.0250, lng: -57.5610 },
  { nombre: 'MaxNic', direccion: 'Cerrito 199', ciudad: 'Mar del Plata', provincia: 'Buenos Aires', tipo: 'tienda', activo: true, lat: -38.0010, lng: -57.5440 },
  { nombre: 'Dietética El Almacén', direccion: 'Perito Moreno 1055', ciudad: 'Río Grande', provincia: 'Tierra del Fuego', tipo: 'dietética', activo: true, lat: -53.7850, lng: -67.7090 },
  { nombre: 'H Urquiza', direccion: 'Triunvirato 4807', ciudad: 'CABA — Villa Urquiza', provincia: 'CABA', tipo: 'tienda', activo: true, lat: -34.5730, lng: -58.4900 },
  { nombre: 'Del Huerto Tienda Natural', direccion: 'Honduras 3717', ciudad: 'CABA — Palermo', provincia: 'CABA', tipo: 'tienda', activo: true, lat: -34.5950, lng: -58.4250 },
  { nombre: 'WODEN Fitness Club', direccion: 'Calle 142 N°818', ciudad: 'Berazategui', provincia: 'Buenos Aires', tipo: 'gimnasio', activo: true, lat: -34.7650, lng: -58.2130 },
  { nombre: 'Sapiens Training', direccion: 'Carlos Francisco Melo 2056', ciudad: 'Florida, Vicente López', provincia: 'Buenos Aires', tipo: 'gimnasio', activo: true, lat: -34.5300, lng: -58.4950 },
  { nombre: 'Entreno.com.ar', direccion: 'Av. Bartolomé Mitre 3476', ciudad: 'Munro', provincia: 'Buenos Aires', tipo: 'suplementos', activo: true, lat: -34.5270, lng: -58.5200 },
  { nombre: 'El Antonio (Distribuidora)', direccion: 'Magallanes 1182', ciudad: 'Ushuaia', provincia: 'Tierra del Fuego', tipo: 'distribuidora', activo: true, lat: -54.8010, lng: -68.3030 },
  { nombre: 'Dietética Media Nuez', direccion: 'Guido 489', ciudad: 'Viedma', provincia: 'Río Negro', tipo: 'dietética', activo: true, lat: -40.8130, lng: -62.9960 },
  { nombre: 'Recargate', direccion: 'Martiniano Rodríguez 90', ciudad: 'Bahía Blanca', provincia: 'Buenos Aires', tipo: 'tienda', activo: true, lat: -38.7160, lng: -62.2660 },
  { nombre: 'Sabor y Aroma (Distribuidora)', direccion: 'Av. 28 de Junio 85', ciudad: 'Formosa', provincia: 'Formosa', tipo: 'distribuidora', activo: true, lat: -26.1850, lng: -58.1750 },
  { nombre: 'Distribuidora J&L', direccion: 'Los Ceibos 1228', ciudad: 'Villa Adelina', provincia: 'Buenos Aires', tipo: 'distribuidora', activo: true, lat: -34.5150, lng: -58.5470 },
  { nombre: 'Zafiro (Distribuidora)', direccion: 'Honduras 4342', ciudad: 'CABA — Palermo', provincia: 'CABA', tipo: 'distribuidora', activo: true, lat: -34.5890, lng: -58.4270 },
  { nombre: 'SupléSport (Distribuidora)', direccion: 'Santa Fe 1820', ciudad: 'Mar del Plata', provincia: 'Buenos Aires', tipo: 'distribuidora', activo: true, lat: -38.0000, lng: -57.5490 },
  { nombre: 'SupléSport', direccion: 'Bernardo de Irigoyen 3710', ciudad: 'Mar del Plata', provincia: 'Buenos Aires', tipo: 'suplementos', activo: true, lat: -38.0120, lng: -57.5570 },
  { nombre: 'Chamá Almacén', direccion: 'Pellegrini 389', ciudad: 'Resistencia', provincia: 'Chaco', tipo: 'tienda', activo: true, lat: -27.4510, lng: -58.9860 },
  { nombre: 'Chamá Almacén — Sarmiento Shopping', direccion: 'Av. Sarmiento 2610, planta alta', ciudad: 'Resistencia', provincia: 'Chaco', tipo: 'tienda', activo: true, lat: -27.4400, lng: -58.9830 },
  { nombre: 'Fitness Shop', direccion: 'Av. Edison 465, local 13, Mercado del Puerto', ciudad: 'Mar del Plata', provincia: 'Buenos Aires', tipo: 'suplementos', activo: true, lat: -38.0330, lng: -57.5340 },
  { nombre: 'Fitness Shop', direccion: 'San Juan 2109', ciudad: 'Mar del Plata', provincia: 'Buenos Aires', tipo: 'suplementos', activo: true, lat: -38.0080, lng: -57.5510 },
  { nombre: 'Dietética Rojas', direccion: 'Rojas 12', ciudad: 'CABA — Caballito', provincia: 'CABA', tipo: 'dietética', activo: true, lat: -34.6190, lng: -58.4400 },
  { nombre: 'La Casa del Sol', direccion: 'Olazabal 4432', ciudad: 'CABA — Villa Urquiza', provincia: 'CABA', tipo: 'tienda', activo: true, lat: -34.5750, lng: -58.4880 },
  { nombre: 'Healthy Mix', direccion: 'Av. Suipacha 1228', ciudad: 'Balcarce', provincia: 'Buenos Aires', tipo: 'tienda', activo: true, lat: -37.8460, lng: -58.2550 },
  { nombre: 'Healthy Mix', direccion: 'Av. Kelly 789', ciudad: 'Balcarce', provincia: 'Buenos Aires', tipo: 'tienda', activo: true, lat: -37.8490, lng: -58.2510 },
  { nombre: 'Healthy Mix', direccion: 'Av. Favaloro 1036', ciudad: 'Balcarce', provincia: 'Buenos Aires', tipo: 'tienda', activo: true, lat: -37.8430, lng: -58.2590 },
  { nombre: 'Rada Suplementos Fitness', direccion: 'Colonos Galeses 2258', ciudad: 'Comodoro Rivadavia', provincia: 'Chubut', tipo: 'suplementos', activo: true, lat: -45.8640, lng: -67.4960 },
  { nombre: 'Rada Suplementos Fitness', direccion: 'Pueyrredón 180 km3', ciudad: 'Comodoro Rivadavia', provincia: 'Chubut', tipo: 'suplementos', activo: true, lat: -45.8500, lng: -67.4800 },
  { nombre: 'Rada Suplementos Fitness', direccion: 'Av. Constituyente 63', ciudad: 'Comodoro Rivadavia', provincia: 'Chubut', tipo: 'suplementos', activo: true, lat: -45.8700, lng: -67.5000 },
  { nombre: 'Rada Suplementos Fitness', direccion: 'Av. Seguí 1454', ciudad: 'Rada Tilly', provincia: 'Chubut', tipo: 'suplementos', activo: true, lat: -45.9270, lng: -67.5540 },
]
