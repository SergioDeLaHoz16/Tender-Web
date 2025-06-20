import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Package, Users, CreditCard, TrendingUp, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

// Simulación de datos (reemplazar con datos reales de Supabase)
const summaryData = {
  totalRevenue: 12530.5,
  totalRevenueChange: 20.1,
  totalSales: 350,
  totalSalesChange: 18.1, // Ajustado para que no sea tan exagerado
  activeProducts: 78,
  newCustomers: 15,
  newCustomersChange: 5.2,
}

const recentSales = [
  { id: "ORD001", customer: "Ana Pérez", amount: 150.0, date: "Hace 2 horas", status: "Pagado" },
  { id: "ORD002", customer: "Luis García", amount: 75.5, date: "Hace 5 horas", status: "Pendiente" },
  { id: "ORD003", customer: "Sofía López", amount: 220.0, date: "Ayer", status: "Pagado" },
  { id: "ORD004", customer: "Carlos Ruiz", amount: 99.9, date: "Ayer", status: "Enviado" },
]

const lowStockProducts = [
  { id: "PROD012", name: "Refresco Naranja 600ml", stock: 3, threshold: 5 },
  { id: "PROD045", name: "Galletas Chocolate Pack", stock: 2, threshold: 5 },
  { id: "PROD007", name: "Jabón de Tocador", stock: 5, threshold: 10 },
]

export default function AdminDashboardPage() {
  return (
    // Se elimina el padding de aquí y se deja que el layout lo controle
    <div className="space-y-6 bg">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 px-4 md:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard General</h1>
        <div className="flex items-center space-x-2">
          <Button variant="outline" className="bg-background text-foreground hover:bg-accent">
            <TrendingUp className="mr-2 h-4 w-4" />
            Generar Reporte
          </Button>
        </div>
      </div>

      {/* Sección de Métricas Principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 px-4 md:px-6 lg:px-8">
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ingresos Totales</CardTitle>
            <DollarSign className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              $
              {summaryData.totalRevenue.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className={`text-xs ${summaryData.totalRevenueChange >= 0 ? "text-green-600" : "text-red-600"}`}>
              {summaryData.totalRevenueChange >= 0 ? "+" : ""}
              {summaryData.totalRevenueChange.toFixed(1)}% desde el mes pasado
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ventas Realizadas</CardTitle>
            <CreditCard className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">+{summaryData.totalSales}</div>
            <p className={`text-xs ${summaryData.totalSalesChange >= 0 ? "text-green-600" : "text-red-600"}`}>
              {summaryData.totalSalesChange >= 0 ? "+" : ""}
              {summaryData.totalSalesChange.toFixed(1)}% desde el mes pasado
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Productos Activos</CardTitle>
            <Package className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{summaryData.activeProducts}</div>
            <p className="text-xs text-muted-foreground">Total en inventario</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Nuevos Clientes</CardTitle>
            <Users className="h-5 w-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">+{summaryData.newCustomers}</div>
            <p className={`text-xs ${summaryData.newCustomersChange >= 0 ? "text-green-600" : "text-red-600"}`}>
              {summaryData.newCustomersChange >= 0 ? "+" : ""}
              {summaryData.newCustomersChange.toFixed(1)}% este mes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sección de Ventas Recientes y Productos Bajos en Stock */}
      <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-5 px-4 md:px-6 lg:px-8">
        <Card className="md:col-span-2 lg:col-span-3 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-foreground">Ventas Recientes</CardTitle>
            <CardDescription>Un vistazo a las últimas transacciones.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentSales.length > 0 ? (
              recentSales.map((sale) => (
                <div key={sale.id} className="flex items-center justify-between hover:bg-muted/50 p-2 rounded-md">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none text-foreground">{sale.customer}</p>
                    <p className="text-xs text-muted-foreground">
                      {sale.id} - {sale.date}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-foreground">
                      ${sale.amount.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <p
                      className={`text-xs ${sale.status === "Pagado" ? "text-green-500" : sale.status === "Pendiente" ? "text-orange-500" : "text-blue-500"}`}
                    >
                      {sale.status}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-center">
                <ShoppingBag className="h-12 w-12 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No hay ventas recientes para mostrar.</p>
              </div>
            )}
            {recentSales.length > 0 && (
              <Button variant="outline" size="sm" className="w-full mt-4 bg-background text-foreground hover:bg-accent">
                <Link href="/admin/orders">Ver Todas las Ventas</Link>
              </Button>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-1 lg:col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-foreground">Productos Bajos en Stock</CardTitle>
            <CardDescription>Artículos que necesitan reabastecimiento pronto.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {lowStockProducts.length > 0 ? (
              lowStockProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between hover:bg-muted/50 p-2 rounded-md">
                  <div>
                    <p className="text-sm font-medium text-foreground">{product.name}</p>
                    <p className="text-xs text-muted-foreground">
                      En stock: <span className="font-semibold text-red-500">{product.stock}</span> (Umbral:{" "}
                      {product.threshold})
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/admin/products/edit/${product.id}`}>
                      <Package className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-center">
                <Package className="h-12 w-12 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">¡Todo en orden! No hay productos bajos en stock.</p>
              </div>
            )}
            {lowStockProducts.length > 0 && (
              <Button variant="outline" size="sm" className="w-full mt-4 bg-background text-foreground hover:bg-accent">
                <Link href="/admin/inventory">Gestionar Inventario</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Placeholder para futuras gráficas o más secciones */}
      <div className="grid gap-6 md:grid-cols-1 px-4 md:px-6 lg:px-8">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-foreground">
              Rendimiento de Ventas (Próximamente)
            </CardTitle>
            <CardDescription>Visualización gráfica de las tendencias de ventas.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-muted/30 rounded-md">
              <p className="text-muted-foreground">Gráfica de ventas aquí...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
