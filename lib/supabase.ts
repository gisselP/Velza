// MOCK SUPABASE — datos de demo para presentación
// Para conectar a Supabase real, reemplaza este archivo con el cliente real.

const TODAY = '2026-08-12';
const VENDOR_ID = '55fff170-b0f4-46ea-ab74-006f8de80a9d';
const ADMIN_ID = '28097abc-16ff-495b-afd7-4285060883f8';

const mockLocations = [
  { id: 'loc-1', name: 'Local', description: 'Tienda principal', is_active: true },
  { id: 'loc-2', name: 'Almacén externo', description: 'Almacén secundario en Av. Grau', is_active: true },
];

const mockCategories = [
  { id: 'cat-1', name: 'Oxford', is_active: true },
  { id: 'cat-2', name: 'Mocasín', is_active: true },
  { id: 'cat-3', name: 'Ejecutivo', is_active: true },
  { id: 'cat-4', name: 'Casual', is_active: true },
];

const mockSuppliers = [
  { id: 'sup-1', name: 'Distribuidora Lima Calzado SAC', document: '20123456789', phone: '01 234 5678', is_active: true, created_at: '2026-01-10T00:00:00Z' },
  { id: 'sup-2', name: 'Fábrica El Buen Paso', document: '20987654321', phone: '999 111 222', is_active: true, created_at: '2026-01-10T00:00:00Z' },
  { id: 'sup-3', name: 'Importaciones Andinas EIRL', document: '20456789123', phone: '998 333 444', is_active: true, created_at: '2026-01-10T00:00:00Z' },
];

const mockInventoryRaw = [
  { id: 'inv-1', product_id: 'prod-1', location_id: 'loc-1', quantity: 3, updated_at: TODAY },
  { id: 'inv-2', product_id: 'prod-2', location_id: 'loc-1', quantity: 2, updated_at: TODAY },
  { id: 'inv-3', product_id: 'prod-3', location_id: 'loc-1', quantity: 1, updated_at: TODAY },
  { id: 'inv-4', product_id: 'prod-4', location_id: 'loc-1', quantity: 4, updated_at: TODAY },
  { id: 'inv-5', product_id: 'prod-5', location_id: 'loc-1', quantity: 0, updated_at: TODAY },
  { id: 'inv-6', product_id: 'prod-6', location_id: 'loc-1', quantity: 2, updated_at: TODAY },
  { id: 'inv-7', product_id: 'prod-7', location_id: 'loc-1', quantity: 5, updated_at: TODAY },
  { id: 'inv-8', product_id: 'prod-8', location_id: 'loc-1', quantity: 3, updated_at: TODAY },
  { id: 'inv-9', product_id: 'prod-9', location_id: 'loc-1', quantity: 2, updated_at: TODAY },
  { id: 'inv-10', product_id: 'prod-10', location_id: 'loc-1', quantity: 1, updated_at: TODAY },
  { id: 'inv-11', product_id: 'prod-1', location_id: 'loc-2', quantity: 5, updated_at: TODAY },
  { id: 'inv-12', product_id: 'prod-2', location_id: 'loc-2', quantity: 4, updated_at: TODAY },
  { id: 'inv-13', product_id: 'prod-3', location_id: 'loc-2', quantity: 3, updated_at: TODAY },
  { id: 'inv-14', product_id: 'prod-4', location_id: 'loc-2', quantity: 2, updated_at: TODAY },
  { id: 'inv-15', product_id: 'prod-5', location_id: 'loc-2', quantity: 3, updated_at: TODAY },
  { id: 'inv-16', product_id: 'prod-6', location_id: 'loc-2', quantity: 6, updated_at: TODAY },
  { id: 'inv-17', product_id: 'prod-7', location_id: 'loc-2', quantity: 4, updated_at: TODAY },
  { id: 'inv-18', product_id: 'prod-8', location_id: 'loc-2', quantity: 2, updated_at: TODAY },
  { id: 'inv-19', product_id: 'prod-9', location_id: 'loc-2', quantity: 5, updated_at: TODAY },
  { id: 'inv-20', product_id: 'prod-10', location_id: 'loc-2', quantity: 3, updated_at: TODAY },
];

function buildInventoryForProduct(productId: string) {
  return mockInventoryRaw
    .filter(i => i.product_id === productId)
    .map(i => ({
      ...i,
      location: mockLocations.find(l => l.id === i.location_id),
      location_id: i.location_id,
    }));
}

const mockProducts = [
  { id: 'prod-1', code: 'OXF-NEG-40', name: 'Oxford Negro T40', model: 'Oxford Clásico', category_id: 'cat-1', category: mockCategories[0], size: '40', color: 'Negro', gender: 'caballero', sale_price: 120.00, min_price: 95.00, cost: 65.00, image_url: null, is_active: true, created_at: '2026-01-15T00:00:00Z' },
  { id: 'prod-2', code: 'OXF-NEG-41', name: 'Oxford Negro T41', model: 'Oxford Clásico', category_id: 'cat-1', category: mockCategories[0], size: '41', color: 'Negro', gender: 'caballero', sale_price: 120.00, min_price: 95.00, cost: 65.00, image_url: null, is_active: true, created_at: '2026-01-15T00:00:00Z' },
  { id: 'prod-3', code: 'OXF-MAR-40', name: 'Oxford Marrón T40', model: 'Oxford Clásico', category_id: 'cat-1', category: mockCategories[0], size: '40', color: 'Marrón', gender: 'caballero', sale_price: 125.00, min_price: 100.00, cost: 68.00, image_url: null, is_active: true, created_at: '2026-01-15T00:00:00Z' },
  { id: 'prod-4', code: 'MOC-NEG-39', name: 'Mocasín Negro T39', model: 'Mocasín Ejecutivo', category_id: 'cat-2', category: mockCategories[1], size: '39', color: 'Negro', gender: 'caballero', sale_price: 110.00, min_price: 85.00, cost: 58.00, image_url: null, is_active: true, created_at: '2026-01-15T00:00:00Z' },
  { id: 'prod-5', code: 'MOC-MAR-40', name: 'Mocasín Marrón T40', model: 'Mocasín Ejecutivo', category_id: 'cat-2', category: mockCategories[1], size: '40', color: 'Marrón', gender: 'caballero', sale_price: 110.00, min_price: 85.00, cost: 58.00, image_url: null, is_active: true, created_at: '2026-01-15T00:00:00Z' },
  { id: 'prod-6', code: 'EJE-NEG-42', name: 'Ejecutivo Negro T42', model: 'Ejecutivo Premium', category_id: 'cat-3', category: mockCategories[2], size: '42', color: 'Negro', gender: 'caballero', sale_price: 150.00, min_price: 120.00, cost: 85.00, image_url: null, is_active: true, created_at: '2026-01-15T00:00:00Z' },
  { id: 'prod-7', code: 'OXF-NEG-36-D', name: 'Oxford Negro T36 Dama', model: 'Oxford Dama', category_id: 'cat-1', category: mockCategories[0], size: '36', color: 'Negro', gender: 'dama', sale_price: 105.00, min_price: 80.00, cost: 52.00, image_url: null, is_active: true, created_at: '2026-01-15T00:00:00Z' },
  { id: 'prod-8', code: 'OXF-BCO-37-D', name: 'Oxford Blanco T37 Dama', model: 'Oxford Dama', category_id: 'cat-1', category: mockCategories[0], size: '37', color: 'Blanco', gender: 'dama', sale_price: 105.00, min_price: 80.00, cost: 52.00, image_url: null, is_active: true, created_at: '2026-01-15T00:00:00Z' },
  { id: 'prod-9', code: 'MOC-NEG-38-D', name: 'Mocasín Negro T38 Dama', model: 'Mocasín Fino', category_id: 'cat-2', category: mockCategories[1], size: '38', color: 'Negro', gender: 'dama', sale_price: 98.00, min_price: 75.00, cost: 48.00, image_url: null, is_active: true, created_at: '2026-01-15T00:00:00Z' },
  { id: 'prod-10', code: 'EJE-GRI-41', name: 'Ejecutivo Gris T41', model: 'Ejecutivo Slim', category_id: 'cat-3', category: mockCategories[2], size: '41', color: 'Gris', gender: 'caballero', sale_price: 140.00, min_price: 110.00, cost: 78.00, image_url: null, is_active: true, created_at: '2026-01-15T00:00:00Z' },
].map(p => ({
  ...p,
  inventory: buildInventoryForProduct(p.id),
  total_stock: buildInventoryForProduct(p.id).reduce((s, i) => s + i.quantity, 0),
}));

const mockProfiles = [
  { id: 'prof-1', user_id: ADMIN_ID, full_name: 'Carlos Administrador', role: 'admin', is_active: true, created_at: '2026-01-01T00:00:00Z' },
  { id: 'prof-2', user_id: VENDOR_ID, full_name: 'María García', role: 'vendor', is_active: true, created_at: '2026-01-01T00:00:00Z' },
];

const mockSaleDetails = [
  { id: 'sd-1', sale_id: 'sale-1', product_id: 'prod-1', location_id: 'loc-1', quantity: 2, unit_price: 120.00, subtotal: 240.00, product: mockProducts[0], location: mockLocations[0] },
  { id: 'sd-2', sale_id: 'sale-1', product_id: 'prod-7', location_id: 'loc-1', quantity: 1, unit_price: 105.00, subtotal: 105.00, product: mockProducts[6], location: mockLocations[0] },
  { id: 'sd-3', sale_id: 'sale-2', product_id: 'prod-6', location_id: 'loc-2', quantity: 1, unit_price: 150.00, subtotal: 150.00, product: mockProducts[5], location: mockLocations[1] },
  { id: 'sd-4', sale_id: 'sale-3', product_id: 'prod-4', location_id: 'loc-1', quantity: 1, unit_price: 110.00, subtotal: 110.00, product: mockProducts[3], location: mockLocations[0] },
  { id: 'sd-5', sale_id: 'sale-3', product_id: 'prod-9', location_id: 'loc-1', quantity: 1, unit_price: 98.00, subtotal: 98.00, product: mockProducts[8], location: mockLocations[0] },
  { id: 'sd-6', sale_id: 'sale-4', product_id: 'prod-2', location_id: 'loc-1', quantity: 1, unit_price: 120.00, subtotal: 120.00, product: mockProducts[1], location: mockLocations[0] },
  { id: 'sd-7', sale_id: 'sale-5', product_id: 'prod-8', location_id: 'loc-2', quantity: 2, unit_price: 100.00, subtotal: 200.00, product: mockProducts[7], location: mockLocations[1] },
  { id: 'sd-8', sale_id: 'sale-6', product_id: 'prod-10', location_id: 'loc-1', quantity: 1, unit_price: 140.00, subtotal: 140.00, product: mockProducts[9], location: mockLocations[0] },
  { id: 'sd-9', sale_id: 'sale-7', product_id: 'prod-3', location_id: 'loc-2', quantity: 1, unit_price: 125.00, subtotal: 125.00, product: mockProducts[2], location: mockLocations[1] },
  { id: 'sd-10', sale_id: 'sale-8', product_id: 'prod-5', location_id: 'loc-1', quantity: 2, unit_price: 110.00, subtotal: 220.00, product: mockProducts[4], location: mockLocations[0] },
];

const mockSales = [
  { id: 'sale-1', vendor_id: VENDOR_ID, sale_date: TODAY, total: 345.00, payment_method: 'efectivo', notes: null, created_at: `${TODAY}T09:15:00Z`, vendor: mockProfiles[1], details: mockSaleDetails.filter(d => d.sale_id === 'sale-1') },
  { id: 'sale-2', vendor_id: VENDOR_ID, sale_date: TODAY, total: 150.00, payment_method: 'yape', notes: null, created_at: `${TODAY}T10:30:00Z`, vendor: mockProfiles[1], details: mockSaleDetails.filter(d => d.sale_id === 'sale-2') },
  { id: 'sale-3', vendor_id: VENDOR_ID, sale_date: TODAY, total: 208.00, payment_method: 'plin', notes: null, created_at: `${TODAY}T11:00:00Z`, vendor: mockProfiles[1], details: mockSaleDetails.filter(d => d.sale_id === 'sale-3') },
  { id: 'sale-4', vendor_id: ADMIN_ID, sale_date: TODAY, total: 120.00, payment_method: 'efectivo', notes: null, created_at: `${TODAY}T11:45:00Z`, vendor: mockProfiles[0], details: mockSaleDetails.filter(d => d.sale_id === 'sale-4') },
  { id: 'sale-5', vendor_id: VENDOR_ID, sale_date: '2026-08-11', total: 200.00, payment_method: 'yape', notes: null, created_at: '2026-08-11T14:00:00Z', vendor: mockProfiles[1], details: mockSaleDetails.filter(d => d.sale_id === 'sale-5') },
  { id: 'sale-6', vendor_id: VENDOR_ID, sale_date: '2026-08-11', total: 140.00, payment_method: 'efectivo', notes: null, created_at: '2026-08-11T16:00:00Z', vendor: mockProfiles[1], details: mockSaleDetails.filter(d => d.sale_id === 'sale-6') },
  { id: 'sale-7', vendor_id: ADMIN_ID, sale_date: '2026-08-10', total: 125.00, payment_method: 'plin', notes: null, created_at: '2026-08-10T10:00:00Z', vendor: mockProfiles[0], details: mockSaleDetails.filter(d => d.sale_id === 'sale-7') },
  { id: 'sale-8', vendor_id: VENDOR_ID, sale_date: '2026-08-09', total: 220.00, payment_method: 'efectivo', notes: null, created_at: '2026-08-09T09:00:00Z', vendor: mockProfiles[1], details: mockSaleDetails.filter(d => d.sale_id === 'sale-8') },
];

const mockPurchases: any[] = [];
const mockPurchaseDetails: any[] = [];

const MOCK_DB: Record<string, any[]> = {
  profiles: mockProfiles,
  locations: mockLocations,
  categories: mockCategories,
  products: mockProducts,
  inventory: mockInventoryRaw,
  sales: mockSales,
  sale_details: mockSaleDetails,
  purchases: mockPurchases,
  purchase_details: mockPurchaseDetails,
  suppliers: mockSuppliers,
};

class MockQueryBuilder {
  private _table: string;
  private _data: any[];
  private _insertData: any = null;

  constructor(table: string) {
    this._table = table;
    this._data = [...(MOCK_DB[table] ?? [])];
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
    // Extract search term from ilike patterns
    const match = query.match(/%([^%]+)%/);
    if (match) {
      const q = match[1].toLowerCase();
      this._data = this._data.filter(r =>
        String(r.name ?? '').toLowerCase().includes(q) ||
        String(r.code ?? '').toLowerCase().includes(q) ||
        String(r.model ?? '').toLowerCase().includes(q) ||
        String(r.color ?? '').toLowerCase().includes(q) ||
        String(r.size ?? '').toLowerCase().includes(q)
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
    const item = this._data[0] ?? this._insertData ?? null;
    return Promise.resolve({ data: item, error: null });
  }

  insert(data: any) {
    const item = Array.isArray(data) ? data[0] : data;
    const newItem = { ...item, id: `mock-${Date.now()}`, created_at: new Date().toISOString() };
    this._insertData = newItem;
    const self = this;
    return {
      select: () => ({
        single: () => Promise.resolve({ data: newItem, error: null }),
      }),
      then: (resolve: any) => Promise.resolve({ data: [newItem], error: null }).then(resolve),
    };
  }

  update(data: any) {
    return {
      eq: (_col: string, _val: any) => Promise.resolve({ data, error: null }),
    };
  }

  delete() {
    return {
      eq: (_col: string, _val: any) => Promise.resolve({ data: null, error: null }),
    };
  }

  then(resolve: (value: { data: any[]; error: null }) => any) {
    return Promise.resolve({ data: this._data, error: null }).then(resolve);
  }
}

export const supabase = {
  from: (table: string) => new MockQueryBuilder(table),
  auth: {
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    onAuthStateChange: (_event: any, _cb: any) => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signInWithPassword: () => Promise.resolve({ error: { message: 'Use mock auth' } }),
    signOut: () => Promise.resolve({ error: null }),
  },
} as any;
