/**
 * Seed de clientes de prueba para el CRM del portal Hardy.
 * Inserta perfiles ficticios en public.profiles vinculados a UUIDs de usuarios
 * que NO existen en auth.users (solo para demostrar el CRM visualmente).
 *
 * Para revertir: DELETE FROM public.profiles WHERE display_name LIKE '%(Test)%';
 *
 * Uso: node scripts/seed-clientes.mjs
 */

import postgres from 'postgres'

const DB_URL = 'postgresql://postgres.jveyfjoeavsbfwfrtpnd:HikGJ6SAZWMIrH7y@aws-1-sa-east-1.pooler.supabase.com:6543/postgres'
const sql    = postgres(DB_URL, { ssl: 'require', max: 1, prepare: false })

const CLIENTES = [
  {
    userId:      '00000000-0000-0000-0001-000000000001',
    role:        'mayorista',
    displayName: 'Carlos Fernández (Test)',
    company:     'Dietética Vida Sana',
    phone:       '5491144332211',
    city:        'Buenos Aires',
    province:    'CABA',
    cuit:        '20-12345678-9',
    address:     'Av. Corrientes 2300, CABA',
  },
  {
    userId:      '00000000-0000-0000-0002-000000000002',
    role:        'gastronomico',
    displayName: 'Martina López (Test)',
    company:     'Café Verde Saludable',
    phone:       '5491155443322',
    city:        'Palermo',
    province:    'CABA',
    cuit:        '27-98765432-1',
    address:     'Thames 1800, CABA',
  },
  {
    userId:      '00000000-0000-0000-0003-000000000003',
    role:        'distribuidor',
    displayName: 'Roberto García (Test)',
    company:     'Distribuidora Del Plata S.A.',
    phone:       '5491166554433',
    city:        'Quilmes',
    province:    'Buenos Aires',
    cuit:        '30-55667788-4',
    address:     'Av. Mitre 500, Quilmes',
  },
  {
    userId:      '00000000-0000-0000-0004-000000000004',
    role:        'mayorista',
    displayName: 'Sofía Martínez (Test)',
    company:     'Suplementos FitZone',
    phone:       '5491177665544',
    city:        'San Isidro',
    province:    'Buenos Aires',
    cuit:        '27-33445566-8',
    address:     'Av. del Libertador 3400, San Isidro',
  },
  {
    userId:      '00000000-0000-0000-0005-000000000005',
    role:        'productor',
    displayName: 'Alimentos NutriPro (Test)',
    company:     'NutriPro S.R.L.',
    phone:       '5491188776655',
    city:        'Rosario',
    province:    'Santa Fe',
    cuit:        '30-77889900-3',
    address:     'Av. Pellegrini 1200, Rosario',
  },
]

async function main() {
  console.log('Insertando clientes de prueba...\n')

  for (const c of CLIENTES) {
    // Check if already exists
    const existing = await sql`
      SELECT id FROM public.profiles WHERE user_id = ${c.userId}
    `
    if (existing.length > 0) {
      console.log(`⏭  ${c.company} ya existe, salteando`)
      continue
    }

    await sql`
      INSERT INTO public.profiles (
        user_id, role, display_name, company, phone, city, province, cuit, address,
        is_active, is_deleted
      ) VALUES (
        ${c.userId}, ${c.role}, ${c.displayName}, ${c.company}, ${c.phone},
        ${c.city}, ${c.province}, ${c.cuit}, ${c.address},
        true, false
      )
    `
    console.log(`✓ ${c.company} (${c.role}) — ${c.city}`)
  }

  // Insert some test orders for the first client
  const [profile1] = await sql`SELECT id FROM public.profiles WHERE user_id = '00000000-0000-0000-0001-000000000001'`

  if (profile1) {
    const existingOrders = await sql`SELECT id FROM public.orders WHERE user_id = '00000000-0000-0000-0001-000000000001' LIMIT 1`

    if (existingOrders.length === 0) {
      // Insert 2 historical orders for Carlos (mayorista)
      const [order1] = await sql`
        INSERT INTO public.orders (user_id, status, payment_status, total_ars, shipping_method, payment_method, created_at)
        VALUES (
          '00000000-0000-0000-0001-000000000001',
          'delivered', 'paid',
          '450000.00', 'sin_urgencia_caba', 'transferencia',
          NOW() - INTERVAL '45 days'
        ) RETURNING id
      `
      await sql`
        INSERT INTO public.order_items (order_id, product_id, product_name, variant, size, unit_price_ars, qty, subtotal_ars)
        VALUES
          (${order1.id}, 'crema-natural-380', 'Crema de Maní', 'Natural', '380g', '15000.00', 15, '225000.00'),
          (${order1.id}, 'crema-crunchy-380', 'Crema de Maní', 'Crunchy', '380g', '15000.00', 15, '225000.00')
      `

      const [order2] = await sql`
        INSERT INTO public.orders (user_id, status, payment_status, total_ars, shipping_method, payment_method, created_at)
        VALUES (
          '00000000-0000-0000-0001-000000000001',
          'delivered', 'paid',
          '300000.00', 'retiro_deposito', 'transferencia',
          NOW() - INTERVAL '80 days'
        ) RETURNING id
      `
      await sql`
        INSERT INTO public.order_items (order_id, product_id, product_name, variant, size, unit_price_ars, qty, subtotal_ars)
        VALUES
          (${order2.id}, 'crema-natural-380', 'Crema de Maní', 'Natural', '380g', '15000.00', 10, '150000.00'),
          (${order2.id}, 'miel-liquida-500',  'Miel Líquida',  'Líquida',  '500g', '15000.00', 10, '150000.00')
      `
      console.log('\n✓ Pedidos de prueba cargados para Dietética Vida Sana')
    }
  }

  // Insert test order for Café Verde (gastronomico) - recent
  const [profile2] = await sql`SELECT id FROM public.profiles WHERE user_id = '00000000-0000-0000-0002-000000000002'`
  if (profile2) {
    const existingOrders = await sql`SELECT id FROM public.orders WHERE user_id = '00000000-0000-0000-0002-000000000002' LIMIT 1`
    if (existingOrders.length === 0) {
      const [order3] = await sql`
        INSERT INTO public.orders (user_id, status, payment_status, total_ars, shipping_method, payment_method, created_at)
        VALUES (
          '00000000-0000-0000-0002-000000000002',
          'confirmed', 'unpaid',
          '90000.00', 'urgente_caba', 'transferencia',
          NOW() - INTERVAL '3 days'
        ) RETURNING id
      `
      await sql`
        INSERT INTO public.order_items (order_id, product_id, product_name, variant, size, unit_price_ars, qty, subtotal_ars)
        VALUES
          (${order3.id}, 'crema-natural-380', 'Crema de Maní', 'Natural', '380g', '18000.00', 5, '90000.00')
      `
      console.log('✓ Pedido de prueba cargado para Café Verde Saludable')
    }
  }

  console.log('\n✅ Seed completado')
  await sql.end()
}

main().catch(e => { console.error(e.message); process.exit(1) })
