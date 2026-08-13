export type UserRole = 'admin' | 'vendor';

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  is_active: boolean;
}

export interface Location {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
}

export interface Product {
  id: string;
  code: string;
  name: string;
  model: string;
  category_id: string;
  category?: Category;
  size: string;
  color: string;
  gender: 'dama' | 'caballero' | 'unisex';
  sale_price: number;
  min_price: number;
  cost: number;
  image_url?: string;
  is_active: boolean;
  created_at: string;
  inventory?: Inventory[];
  total_stock?: number;
}

export interface Inventory {
  id: string;
  product_id: string;
  location_id: string;
  location?: Location;
  quantity: number;
  updated_at: string;
}

export interface Supplier {
  id: string;
  name: string;
  document?: string;
  phone?: string;
  is_active: boolean;
  created_at: string;
}

export interface Sale {
  id: string;
  vendor_id: string;
  vendor?: Profile;
  sale_date: string;
  total: number;
  payment_method: 'efectivo' | 'yape' | 'plin';
  notes?: string;
  created_at: string;
  details?: SaleDetail[];
}

export interface SaleDetail {
  id: string;
  sale_id: string;
  product_id: string;
  product?: Product;
  location_id: string;
  location?: Location;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface Purchase {
  id: string;
  supplier_id: string;
  supplier?: Supplier;
  purchase_date: string;
  total: number;
  notes?: string;
  created_at: string;
  details?: PurchaseDetail[];
}

export interface PurchaseDetail {
  id: string;
  purchase_id: string;
  product_id: string;
  product?: Product;
  location_id: string;
  location?: Location;
  quantity: number;
  unit_cost: number;
  subtotal: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  location_id: string;
  location_name: string;
  unit_price: number;
}
