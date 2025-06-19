-- Habilitar la extensión pgcrypto si no está habilitada (para gen_random_uuid())
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Tabla de Perfiles de Usuario (vinculada a auth.users de Supabase)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'customer', -- 'admin' para tenderos, 'customer' para clientes
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Función para manejar la creación automática de perfiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer')::text -- Asegura que el rol sea 'customer' por defecto si no se especifica
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para ejecutar la función después de que un nuevo usuario se registre
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Tabla de Categorías de Productos
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de Productos
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  low_stock_threshold INTEGER DEFAULT 5 CHECK (low_stock_threshold >= 0),
  sku TEXT UNIQUE, -- Stock Keeping Unit
  barcode TEXT UNIQUE,
  image_url TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  expiry_date DATE, -- Fecha de vencimiento
  is_active BOOLEAN DEFAULT TRUE, -- Para activar/desactivar productos sin borrarlos
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de Órdenes
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Puede ser nulo si es venta en tienda física sin registro
  customer_name TEXT, -- Para ventas sin registro de usuario
  total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
  payment_method TEXT CHECK (payment_method IN ('cash', 'transfer', 'card_online', 'card_physical')),
  payment_details JSONB, -- Para guardar referencia de transferencia, etc.
  shipping_address JSONB,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de Ítems de Órdenes (relación muchos-a-muchos entre órdenes y productos)
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT, -- Evita borrar productos si están en órdenes
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price_at_purchase NUMERIC(10, 2) NOT NULL CHECK (price_at_purchase >= 0), -- Precio al momento de la compra
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de Movimientos de Inventario
CREATE TABLE IF NOT EXISTS inventory_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  change_in_quantity INTEGER NOT NULL, -- Positivo para entradas, negativo para salidas
  reason TEXT CHECK (reason IN ('sale', 'restock', 'return', 'adjustment', 'spoilage', 'initial_stock')),
  notes TEXT,
  order_item_id UUID REFERENCES order_items(id) ON DELETE SET NULL, -- Opcional, para vincular a una venta específica
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar Row Level Security (RLS) para las tablas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_log ENABLE ROW LEVEL SECURITY;

-- Políticas RLS básicas (ejemplos, ajustar según necesidades)
-- Perfiles: Los usuarios pueden ver su propio perfil. Los admins pueden ver todos.
CREATE POLICY "Users can view their own profile." ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles." ON profiles
  FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Users can update their own profile." ON profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins can update any profile." ON profiles
  FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));


-- Productos: Todos pueden ver productos activos. Admins pueden gestionar todos.
CREATE POLICY "Anyone can view active products." ON products
  FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Admins can manage all products." ON products
  FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Categorías: Todos pueden ver. Admins pueden gestionar.
CREATE POLICY "Anyone can view categories." ON categories
  FOR SELECT USING (true);
CREATE POLICY "Admins can manage categories." ON categories
  FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Órdenes: Usuarios pueden ver sus propias órdenes. Admins pueden ver todas.
CREATE POLICY "Users can view their own orders." ON orders
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all orders." ON orders
  FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Users can create orders for themselves." ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage all orders." ON orders
  FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));


-- Ítems de Órdenes: Lógica similar a las órdenes (acceso a través de la orden)
CREATE POLICY "Users can view their own order items." ON order_items
  FOR SELECT USING (EXISTS (SELECT 1 FROM orders WHERE id = order_items.order_id AND auth.uid() = orders.user_id));
CREATE POLICY "Admins can view all order items." ON order_items
  FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Users can create order items for their orders." ON order_items
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM orders WHERE id = order_items.order_id AND auth.uid() = orders.user_id));
CREATE POLICY "Admins can manage all order items." ON order_items
  FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));


-- Logs de Inventario: Solo admins pueden ver y crear.
CREATE POLICY "Admins can manage inventory logs." ON inventory_log
  FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Insertar algunas categorías de ejemplo
INSERT INTO categories (name, description) VALUES
  ('Bebidas', 'Refrescos, jugos, agua, etc.'),
  ('Snacks', 'Papitas, galletas, dulces, etc.'),
  ('Lácteos', 'Leche, queso, yogurt, etc.'),
  ('Abarrotes', 'Arroz, frijol, aceite, conservas, etc.'),
  ('Limpieza', 'Detergentes, jabones, desinfectantes, etc.'),
  ('Cuidado Personal', 'Shampoo, pasta dental, desodorantes, etc.')
ON CONFLICT (name) DO NOTHING;

-- Insertar algunos productos de ejemplo
-- (Asegúrate de que los UUIDs de categoría existan o ajústalos)
-- Para obtener UUIDs de categorías: SELECT id, name FROM categories;
-- Ejemplo: si 'Bebidas' tiene id 'uuid-bebidas', úsalo.
-- Aquí usaré gen_random_uuid() para category_id como placeholder si no quieres buscar los UUIDs exactos ahora.
-- Lo ideal es referenciar los UUIDs correctos de las categorías insertadas.

DO $$
DECLARE
  bebidas_cat_id UUID;
  snacks_cat_id UUID;
  abarrotes_cat_id UUID;
BEGIN
  SELECT id INTO bebidas_cat_id FROM categories WHERE name = 'Bebidas';
  SELECT id INTO snacks_cat_id FROM categories WHERE name = 'Snacks';
  SELECT id INTO abarrotes_cat_id FROM categories WHERE name = 'Abarrotes';

  INSERT INTO products (name, description, price, stock_quantity, sku, category_id, expiry_date, low_stock_threshold) VALUES
    ('Refresco Cola 600ml', 'Bebida carbonatada sabor cola', 15.00, 50, 'REFCOLA600', bebidas_cat_id, '2025-12-31', 10),
    ('Papas Fritas Saladas 50g', 'Hojuelas de papa con sal', 12.50, 30, 'PAPASAL50', snacks_cat_id, '2025-08-15', 5),
    ('Arroz Blanco 1kg', 'Arroz de grano largo', 25.00, 100, 'ARROZBL1KG', abarrotes_cat_id, NULL, 20),
    ('Agua Purificada 1L', 'Agua sin gas', 10.00, 75, 'AGUAPUR1L', bebidas_cat_id, NULL, 15)
  ON CONFLICT (sku) DO NOTHING;
END $$;
