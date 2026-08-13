-- ============================================================
-- VELZA — Datos de demostración
-- IMPORTANTE: Ejecutar DESPUÉS del schema.sql
-- Los usuarios deben crearse primero desde Supabase Auth
-- (Authentication > Users > Add user)
-- ============================================================

-- Ubicaciones
insert into locations (id, name, description) values
  ('11111111-0000-0000-0000-000000000001', 'Local', 'Tienda principal'),
  ('11111111-0000-0000-0000-000000000002', 'Almacén externo', 'Almacén secundario en Av. Grau')
on conflict do nothing;

-- Categorías
insert into categories (id, name) values
  ('22222222-0000-0000-0000-000000000001', 'Oxford'),
  ('22222222-0000-0000-0000-000000000002', 'Mocasín'),
  ('22222222-0000-0000-0000-000000000003', 'Ejecutivo'),
  ('22222222-0000-0000-0000-000000000004', 'Casual')
on conflict do nothing;

-- Proveedores
insert into suppliers (name, document, phone) values
  ('Distribuidora Lima Calzado SAC', '20123456789', '01 234 5678'),
  ('Fábrica El Buen Paso', '20987654321', '999 111 222'),
  ('Importaciones Andinas EIRL', '20456789123', '998 333 444')
on conflict do nothing;

-- Productos de calzado
insert into products (id, code, name, model, category_id, size, color, gender, sale_price, min_price, cost, is_active) values
  ('33333333-0000-0000-0000-000000000001', 'OXF-NEG-40', 'Oxford Negro T40', 'Oxford Clásico', '22222222-0000-0000-0000-000000000001', '40', 'Negro', 'caballero', 120.00, 95.00, 65.00, true),
  ('33333333-0000-0000-0000-000000000002', 'OXF-NEG-41', 'Oxford Negro T41', 'Oxford Clásico', '22222222-0000-0000-0000-000000000001', '41', 'Negro', 'caballero', 120.00, 95.00, 65.00, true),
  ('33333333-0000-0000-0000-000000000003', 'OXF-MAR-40', 'Oxford Marrón T40', 'Oxford Clásico', '22222222-0000-0000-0000-000000000001', '40', 'Marrón', 'caballero', 125.00, 100.00, 68.00, true),
  ('33333333-0000-0000-0000-000000000004', 'MOC-NEG-39', 'Mocasín Negro T39', 'Mocasín Ejecutivo', '22222222-0000-0000-0000-000000000002', '39', 'Negro', 'caballero', 110.00, 85.00, 58.00, true),
  ('33333333-0000-0000-0000-000000000005', 'MOC-MAR-40', 'Mocasín Marrón T40', 'Mocasín Ejecutivo', '22222222-0000-0000-0000-000000000002', '40', 'Marrón', 'caballero', 110.00, 85.00, 58.00, true),
  ('33333333-0000-0000-0000-000000000006', 'EJE-NEG-42', 'Ejecutivo Negro T42', 'Ejecutivo Premium', '22222222-0000-0000-0000-000000000003', '42', 'Negro', 'caballero', 150.00, 120.00, 85.00, true),
  ('33333333-0000-0000-0000-000000000007', 'OXF-NEG-36-D', 'Oxford Negro T36 Dama', 'Oxford Dama', '22222222-0000-0000-0000-000000000001', '36', 'Negro', 'dama', 105.00, 80.00, 52.00, true),
  ('33333333-0000-0000-0000-000000000008', 'OXF-BCO-37-D', 'Oxford Blanco T37 Dama', 'Oxford Dama', '22222222-0000-0000-0000-000000000001', '37', 'Blanco', 'dama', 105.00, 80.00, 52.00, true),
  ('33333333-0000-0000-0000-000000000009', 'MOC-NEG-38-D', 'Mocasín Negro T38 Dama', 'Mocasín Fino', '22222222-0000-0000-0000-000000000002', '38', 'Negro', 'dama', 98.00, 75.00, 48.00, true),
  ('33333333-0000-0000-0000-000000000010', 'EJE-GRI-41', 'Ejecutivo Gris T41', 'Ejecutivo Slim', '22222222-0000-0000-0000-000000000003', '41', 'Gris', 'caballero', 140.00, 110.00, 78.00, true)
on conflict do nothing;

-- Inventario inicial (Local + Almacén)
insert into inventory (product_id, location_id, quantity) values
  -- Local
  ('33333333-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000001', 3),
  ('33333333-0000-0000-0000-000000000002', '11111111-0000-0000-0000-000000000001', 2),
  ('33333333-0000-0000-0000-000000000003', '11111111-0000-0000-0000-000000000001', 1),
  ('33333333-0000-0000-0000-000000000004', '11111111-0000-0000-0000-000000000001', 4),
  ('33333333-0000-0000-0000-000000000005', '11111111-0000-0000-0000-000000000001', 0),
  ('33333333-0000-0000-0000-000000000006', '11111111-0000-0000-0000-000000000001', 2),
  ('33333333-0000-0000-0000-000000000007', '11111111-0000-0000-0000-000000000001', 5),
  ('33333333-0000-0000-0000-000000000008', '11111111-0000-0000-0000-000000000001', 3),
  ('33333333-0000-0000-0000-000000000009', '11111111-0000-0000-0000-000000000001', 2),
  ('33333333-0000-0000-0000-000000000010', '11111111-0000-0000-0000-000000000001', 1),
  -- Almacén externo
  ('33333333-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000002', 5),
  ('33333333-0000-0000-0000-000000000002', '11111111-0000-0000-0000-000000000002', 4),
  ('33333333-0000-0000-0000-000000000003', '11111111-0000-0000-0000-000000000002', 3),
  ('33333333-0000-0000-0000-000000000004', '11111111-0000-0000-0000-000000000002', 2),
  ('33333333-0000-0000-0000-000000000005', '11111111-0000-0000-0000-000000000002', 3),
  ('33333333-0000-0000-0000-000000000006', '11111111-0000-0000-0000-000000000002', 6),
  ('33333333-0000-0000-0000-000000000007', '11111111-0000-0000-0000-000000000002', 4),
  ('33333333-0000-0000-0000-000000000008', '11111111-0000-0000-0000-000000000002', 2),
  ('33333333-0000-0000-0000-000000000009', '11111111-0000-0000-0000-000000000002', 5),
  ('33333333-0000-0000-0000-000000000010', '11111111-0000-0000-0000-000000000002', 3)
on conflict do nothing;

-- ============================================================
-- INSTRUCCIONES PARA CREAR USUARIOS:
--
-- 1. Ve a Supabase Dashboard > Authentication > Users
-- 2. Crea estos usuarios manualmente:
--
--    Administrador:
--    Email: admin@velza.pe
--    Password: Velza2024!
--    Metadata: { "full_name": "Carlos Administrador", "role": "admin" }
--
--    Vendedor 1:
--    Email: vendedor1@velza.pe
--    Password: Velza2024!
--    Metadata: { "full_name": "María García", "role": "vendor" }
--
--    Vendedor 2:
--    Email: vendedor2@velza.pe
--    Password: Velza2024!
--    Metadata: { "full_name": "Pedro Rodríguez", "role": "vendor" }
--
-- El trigger on_auth_user_created creará automáticamente el perfil.
-- ============================================================
