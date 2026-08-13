// MOCK SUPABASE con persistencia en localStorage
// Para conectar a Supabase real, reemplaza este archivo con el cliente real.

const TODAY = new Date().toISOString().split('T')[0];
const VENDOR_ID = '55fff170-b0f4-46ea-ab74-006f8de80a9d';
const ADMIN_ID = '28097abc-16ff-495b-afd7-4285060883f8';

// ── Datos base ────────────────────────────────────────────────────────────────

const BASE_LOCATIONS = [
  { id: 'loc-1', name: 'Local', description: 'Tienda principal', is_active: true },
  { id: 'loc-2', name: 'Almacén externo', description: 'Almacén secundario en Av. Grau', is_active: true },
];

const BASE_CATEGORIES = [
  { id: 'cat-1', name: 'Oxford', is_active: true },
  { id: 'cat-2', name: 'Mocasín', is_active: true },
  { id: 'cat-3', name: 'Ejecutivo', is_active: true },
  { id: 'cat-4', name: 'Casual', is_active: true },
];

const BASE_SUPPLIERS = [
  { id: 'sup-1', name: 'Distribuidora Lima Calzado SAC', document: '20123456789', phone: '01 234 5678', is_active: true, created_at: '2026-01-10T00:00:00Z' },
  { id: 'sup-2', name: 'Fábrica El Buen Paso', document: '20987654321', phone: '999 111 222', is_active: true, created_at: '2026-01-10T00:00:00Z' },
  { id: 'sup-3', name: 'Importaciones Andinas EIRL', document: '20456789123', phone: '998 333 444', is_active: true, created_at: '2026-01-10T00:00:00Z' },
];

const BASE_PROFILES = [
  { id: 'prof-1', user_id: ADMIN_ID, full_name: 'Carlos Administrador', role: 'admin', is_active: true, created_at: '2026-01-01T00:00:00Z' },
  { id: 'prof-2', user_id: VENDOR_ID, full_name: 'María García', role: 'vendor', is_active: true, created_at: '2026-01-01T00:00:00Z' },
];

const BASE_INVENTORY = [
  { id: 'inv-1',  product_id: 'prod-1',  location_id: 'loc-1', quantity: 3, updated_at: TODAY },
  { id: 'inv-2',  product_id: 'prod-2',  location_id: 'loc-1', quantity: 2, updated_at: TODAY },
  { id: 'inv-3',  product_id: 'prod-3',  location_id: 'loc-1', quantity: 1, updated_at: TODAY },
  { id: 'inv-4',  product_id: 'prod-4',  location_id: 'loc-1', quantity: 4, updated_at: TODAY },
  { id: 'inv-5',  product_id: 'prod-5',  location_id: 'loc-1', quantity: 0, updated_at: TODAY },
  { id: 'inv-6',  product_id: 'prod-6',  location_id: 'loc-1', quantity: 2, updated_at: TODAY },
  { id: 'inv-7',  product_id: 'prod-7',  location_id: 'loc-1', quantity: 5, updated_at: TODAY },
  { id: 'inv-8',  product_id: 'prod-8',  location_id: 'loc-1', quantity: 3, updated_at: TODAY },
  { id: 'inv-9',  product_id: 'prod-9',  location_id: 'loc-1', quantity: 2, updated_at: TODAY },
  { id: 'inv-10', product_id: 'prod-10', location_id: 'loc-1', quantity: 1, updated_at: TODAY },
  { id: 'inv-11', product_id: 'prod-1',  location_id: 'loc-2', quantity: 5, updated_at: TODAY },
  { id: 'inv-12', product_id: 'prod-2',  location_id: 'loc-2', quantity: 4, updated_at: TODAY },
  { id: 'inv-13', product_id: 'prod-3',  location_id: 'loc-2', quantity: 3, updated_at: TODAY },
  { id: 'inv-14', product_id: 'prod-4',  location_id: 'loc-2', quantity: 2, updated_at: TODAY },
  { id: 'inv-15', product_id: 'prod-5',  location_id: 'loc-2', quantity: 3, updated_at: TODAY },
  { id: 'inv-16', product_id: 'prod-6',  location_id: 'loc-2', quantity: 6, updated_at: TODAY },
  { id: 'inv-17', product_id: 'prod-7',  location_id: 'loc-2', quantity: 4, updated_at: TODAY },
  { id: 'inv-18', product_id: 'prod-8',  location_id: 'loc-2', quantity: 2, updated_at: TODAY },
  { id: 'inv-19', product_id: 'prod-9',  location_id: 'loc-2', quantity: 5, updated_at: TODAY },
  { id: 'inv-20', product_id: 'prod-10', location_id: 'loc-2', quantity: 3, updated_at: TODAY },
];

function buildInv(productId: string, inv: any[]) {
  return inv
    .filter(i => i.product_id === productId)
    .map(i => ({ ...i, location: BASE_LOCATIONS.find(l => l.id === i.location_id) }));
}

function buildProducts(inv: any[]) {
  const base = [
    { id: 'prod-1',  code: 'OXF-NEG-40',   name: 'Oxford Negro T40',       model: 'Oxford Clásico',   category_id: 'cat-1', size: '40', color: 'Negro',  gender: 'caballero', sale_price: 120.00, min_price: 95.00,  cost: 65.00, is_active: true, created_at: '2026-01-15T00:00:00Z' },
    { id: 'prod-2',  code: 'OXF-NEG-41',   name: 'Oxford Negro T41',       model: 'Oxford Clásico',   category_id: 'cat-1', size: '41', color: 'Negro',  gender: 'caballero', sale_price: 120.00, min_price: 95.00,  cost: 65.00, is_active: true, created_at: '2026-01-15T00:00:00Z' },
    { id: 'prod-3',  code: 'OXF-MAR-40',   name: 'Oxford Marrón T40',      model: 'Oxford Clásico',   category_id: 'cat-1', size: '40', color: 'Marrón', gender: 'caballero', sale_price: 125.00, min_price: 100.00, cost: 68.00, is_active: true, created_at: '2026-01-15T00:00:00Z' },
    { id: 'prod-4',  code: 'MOC-NEG-39',   name: 'Mocasín Negro T39',      model: 'Mocasín Ejecutivo',category_id: 'cat-2', size: '39', color: 'Negro',  gender: 'caballero', sale_price: 110.00, min_price: 85.00,  cost: 58.00, is_active: true, created_at: '2026-01-15T00:00:00Z' },
    { id: 'prod-5',  code: 'MOC-MAR-40',   name: 'Mocasín Marrón T40',     model: 'Mocasín Ejecutivo',category_id: 'cat-2', size: '40', color: 'Marrón', gender: 'caballero', sale_price: 110.00, min_price: 85.00,  cost: 58.00, is_active: true, created_at: '2026-01-15T00:00:00Z' },
    { id: 'prod-6',  code: 'EJE-NEG-42',   name: 'Ejecutivo Negro T42',    model: 'Ejecutivo Premium',category_id: 'cat-3', size: '42', color: 'Negro',  gender: 'caballero', sale_price: 150.00, min_price: 120.00, cost: 85.00, is_active: true, created_at: '2026-01-15T00:00:00Z' },
    { id: 'prod-7',  code: 'OXF-NEG-36-D', name: 'Oxford Negro T36 Dama',  model: 'Oxford Dama',      category_id: 'cat-1', size: '36', color: 'Negro',  gender: 'dama',      sale_price: 105.00, min_price: 80.00,  cost: 52.00, is_active: true, created_at: '2026-01-15T00:00:00Z' },
    { id: 'prod-8',  code: 'OXF-BCO-37-D', name: 'Oxford Blanco T37 Dama', model: 'Oxford Dama',      category_id: 'cat-1', size: '37', color: 'Blanco', gender: 'dama',      sale_price: 105.00, min_price: 80.00,  cost: 52.00, is_active: true, created_at: '2026-01-15T00:00:00Z' },
    { id: 'prod-9',  code: 'MOC-NEG-38-D', name: 'Mocasín Negro T38 Dama', model: 'Mocasín Fino',     category_id: 'cat-2', size: '38', color: 'Negro',  gender: 'dama',      sale_price: 98.00,  min_price: 75.00,  cost: 48.00, is_active: true, created_at: '2026-01-15T00:00:00Z' },
    { id: 'prod-10', code: 'EJE-GRI-41',   name: 'Ejecutivo Gris T41',     model: 'Ejecutivo Slim',   category_id: 'cat-3', size: '41', color: 'Gris',   gender: 'caballero', sale_price: 140.00, min_price: 110.00, cost: 78.00, is_active: true, created_at: '2026-01-15T00:00:00Z' },
  ];
  return base.map(p => ({
    ...p,
    category: BASE_CATEGORIES.find(c => c.id === p.category_id),
    inventory: buildInv(p.id, inv),
    total_stock: buildInv(p.id, inv).reduce((s, i) => s + i.quantity, 0),
    image_url: null,
  }));
}

const BASE_SALE_DETAILS = [
  { id: 'sd-1',  sale_id: 'sale-1', product_id: 'prod-1', location_id: 'loc-1', quantity: 2, unit_price: 120.00, subtotal: 240.00 },
  { id: 'sd-2',  sale_id: 'sale-1', product_id: 'prod-7', location_id: 'loc-1', quantity: 1, unit_price: 105.00, subtotal: 105.00 },
  { id: 'sd-3',  sale_id: 'sale-2', product_id: 'prod-6', location_id: 'loc-2', quantity: 1, unit_price: 150.00, subtotal: 150.00 },
  { id: 'sd-4',  sale_id: 'sale-3', product_id: 'prod-4', location_id: 'loc-1', quantity: 1, unit_price: 110.00, subtotal: 110.00 },
  { id: 'sd-5',  sale_id: 'sale-3', product_id: 'prod-9', location_id: 'loc-1', quantity: 1, unit_price: 98.00,  subtotal: 98.00  },
  { id: 'sd-6',  sale_id: 'sale-4', product_id: 'prod-2', location_id: 'loc-1', quantity: 1, unit_price: 120.00, subtotal: 120.00 },
  { id: 'sd-7',  sale_id: 'sale-5', product_id: 'prod-8', location_id: 'loc-2', quantity: 2, unit_price: 100.00, subtotal: 200.00 },
  { id: 'sd-8',  sale_id: 'sale-6', product_id: 'prod-10',location_id: 'loc-1', quantity: 1, unit_price: 140.00, subtotal: 140.00 },
  { id: 'sd-9',  sale_id: 'sale-7', product_id: 'prod-3', location_id: 'loc-2', quantity: 1, unit_price: 125.00, subtotal: 125.00 },
  { id: 'sd-10', sale_id: 'sale-8', product_id: 'prod-5', location_id: 'loc-1', quantity: 2, unit_price: 110.00, subtotal: 220.00 },
];

const BASE_SALES = [
  { id: 'sale-1', vendor_id: VENDOR_ID, sale_date: TODAY,          total: 345.00, payment_method: 'efectivo', notes: null, created_at: `${TODAY}T09:15:00Z` },
  { id: 'sale-2', vendor_id: VENDOR_ID, sale_date: TODAY,          total: 150.00, payment_method: 'yape',     notes: null, created_at: `${TODAY}T10:30:00Z` },
  { id: 'sale-3', vendor_id: VENDOR_ID, sale_date: TODAY,          total: 208.00, payment_method: 'plin',     notes: null, created_at: `${TODAY}T11:00:00Z` },
  { id: 'sale-4', vendor_id: ADMIN_ID,  sale_date: TODAY,          total: 120.00, payment_method: 'efectivo', notes: null, created_at: `${TODAY}T11:45:00Z` },
  { id: 'sale-5', vendor_id: VENDOR_ID, sale_date: '2026-08-11',   total: 200.00, payment_method: 'yape',     notes: null, created_at: '2026-08-11T14:00:00Z' },
  { id: 'sale-6', vendor_id: VENDOR_ID, sale_date: '2026-08-11',   total: 140.00, payment_method: 'efectivo', notes: null, created_at: '2026-08-11T16:00:00Z' },
  { id: 'sale-7', vendor_id: ADMIN_ID,  sale_date: '2026-08-10',   total: 125.00, payment_method: 'plin',     notes: null, created_at: '2026-08-10T10:00:00Z' },
  { id: 'sale-8', vendor_id: VENDOR_ID, sale_date: '2026-08-09',   total: 220.00, payment_method: 'efectivo', notes: null, created_at: '2026-08-09T09:00:00Z' },
];

// ── Persistencia en localStorage ──────────────────────────────────────────────

function loadTable(key: string, defaults: any[]): any[] {
  try {
    const saved = localStorage.getItem(`velza_${key}`);
    if (saved) return JSON.parse(saved);
  } catch {}
  return defaults.map(r => ({ ...r }));
}

function saveTable(key: string, data: any[]) {
  try {
    localStorage.setItem(`velza_${key}`, JSON.stringify(data));
  } catch {}
}

// ── Base de datos en memoria (cargada desde localStorage) ─────────────────────

const DB: Record<string, any[]> = {
  locations:        BASE_LOCATIONS,
  categories:       BASE_CATEGORIES,
  suppliers:        loadTable('suppliers', BASE_SUPPLIERS),
  profiles:         BASE_PROFILES,
  inventory:        loadTable('inventory', BASE_INVENTORY),
  sales:            loadTable('sales', BASE_SALES),
  sale_details:     loadTable('sale_details', BASE_SALE_DETAILS),
  purchases:        loadTable('purchases', []),
  purchase_details: loadTable('purchase_details', []),
};

// products se reconstruyen siempre con el inventario actual
function getProducts() {
  return buildProducts(DB.inventory);
}

// Enriquecer ventas con relaciones para queries con joins
function enrichSale(sale: any): any {
  const vendor = BASE_PROFILES.find(p => p.user_id === sale.vendor_id);
  const details = DB.sale_details
    .filter(d => d.sale_id === sale.id)
    .map(d => {
      const products = getProducts();
      const product = products.find(p => p.id === d.product_id);
      const location = BASE_LOCATIONS.find(l => l.id === d.location_id);
      return { ...d, product, location };
    });
  return { ...sale, vendor, details };
}

// ── Query Builder ─────────────────────────────────────────────────────────────

class MockQueryBuilder {
  private _table: string;
  private _data: any[];

  constructor(table: string) {
    this._table = table;
    const raw = table === 'products' ? getProducts() : (DB[table] ?? []);
    // Enriquecer ventas automáticamente
    this._data = table === 'sales'
      ? raw.map(enrichSale)
      : table === 'sale_details'
        ? raw.map(d => {
            const products = getProducts();
            return {
              ...d,
              product: products.find(p => p.id === d.product_id),
              location: BASE_LOCATIONS.find(l => l.id === d.location_id),
            };
          })
        : table === 'inventory'
          ? raw.map(i => ({ ...i, location: BASE_LOCATIONS.find(l => l.id === i.location_id) }))
          : raw.map(r => ({ ...r }));
  }

  select(_cols?: string) { return this; }

  eq(col: string, val: any) {
    if (val !== undefined && val !== null) {
      this._data = this._data.filter(r => r[col] === val);
    }
    return this;
  }

  neq(col: string, val: any) {
    this._data = this._data.filter(r => r[col] !== val);
    return this;
  }

  gte(col: string, val: any) {
    this._data = this._data.filter(r => r[col] >= val);
    return this;
  }

  lte(col: string, val: any) {
    this._data = this._data.filter(r => r[col] <= val);
    return this;
  }

  or(query: string) {
    const match = query.match(/%([^%]+)%/);
    if (match) {
      const q = match[1].toLowerCase();
      this._data = this._data.filter(r =>
        String(r.name  ?? '').toLowerCase().includes(q) ||
        String(r.code  ?? '').toLowerCase().includes(q) ||
        String(r.model ?? '').toLowerCase().includes(q) ||
        String(r.color ?? '').toLowerCase().includes(q) ||
        String(r.size  ?? '').toLowerCase().includes(q)
      );
    }
    return this;
  }

  order(col: string, opts?: { ascending?: boolean }) {
    const asc = opts?.ascending !== false;
    this._data = [...this._data].sort((a, b) => {
      const av = a[col] ?? '';
      const bv = b[col] ?? '';
      if (av < bv) return asc ? -1 : 1;
      if (av > bv) return asc ? 1 : -1;
      return 0;
    });
    return this;
  }

  limit(n: number) {
    this._data = this._data.slice(0, n);
    return this;
  }

  single() {
    const item = this._data[0] ?? null;
    return Promise.resolve({ data: item, error: item ? null : { message: 'Not found' } });
  }

  insert(data: any) {
    const items: any[] = Array.isArray(data) ? data : [data];
    const inserted = items.map(item => ({
      ...item,
      id: item.id ?? `mock-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      created_at: item.created_at ?? new Date().toISOString(),
    }));

    if (DB[this._table]) {
      inserted.forEach(item => DB[this._table].push(item));
      saveTable(this._table, DB[this._table]);
    }

    const first = inserted[0];
    return {
      select: () => ({
        single: () => Promise.resolve({ data: first, error: null }),
      }),
      then: (resolve: any) =>
        Promise.resolve({ data: inserted, error: null }).then(resolve),
    };
  }

  update(data: any) {
    const table = this._table;
    return {
      eq: (col: string, val: any) => {
        if (DB[table]) {
          DB[table] = DB[table].map(r =>
            r[col] === val ? { ...r, ...data, updated_at: new Date().toISOString() } : r
          );
          saveTable(table, DB[table]);
        }
        return Promise.resolve({ data, error: null });
      },
    };
  }

  delete() {
    const table = this._table;
    return {
      eq: (col: string, val: any) => {
        if (DB[table]) {
          DB[table] = DB[table].filter(r => r[col] !== val);
          saveTable(table, DB[table]);
        }
        return Promise.resolve({ data: null, error: null });
      },
    };
  }

  then(resolve: (value: { data: any[]; error: null }) => any) {
    return Promise.resolve({ data: this._data, error: null }).then(resolve);
  }
}

// ── Cliente exportado ─────────────────────────────────────────────────────────

export const supabase = {
  from: (table: string) => new MockQueryBuilder(table),
  auth: {
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    onAuthStateChange: (_e: any, _cb: any) => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signInWithPassword: () => Promise.resolve({ error: { message: 'Use mock auth' } }),
    signOut: () => Promise.resolve({ error: null }),
  },
} as any;
