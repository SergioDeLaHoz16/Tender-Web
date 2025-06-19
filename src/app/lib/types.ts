export interface Product {
  id: string
  name: string
  description?: string | null
  price: number
  stock_quantity: number
  low_stock_threshold?: number | null
  sku?: string | null
  barcode?: string | null
  image_url?: string | null
  category_id?: string | null
  category_name?: string | null // Para mostrar el nombre de la categoría
  expiry_date?: string | null // Formato YYYY-MM-DD
  is_active?: boolean
  created_at: string
  updated_at?: string | null
}

export interface Category {
  id: string
  name: string
  description?: string | null
}

// Puedes añadir más tipos para Órdenes, Clientes, etc.
