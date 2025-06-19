// Update the import path if the file exists elsewhere, for example:
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
// Or create the file '../../components/ui/card.tsx' and export the required components from there.
import { DollarSign, Package, Users, CreditCard } from "lucide-react"

export default function AdminDashboardPage() {
  // Aquí iría la lógica para obtener datos reales del dashboard
  const summaryData = {
    totalRevenue: 12530.5,
    totalSales: 350,
    activeProducts: 78,
    newCustomers: 15,
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${summaryData.totalRevenue.toLocaleString("es-MX")}</div>
            <p className="text-xs text-muted-foreground">+20.1% desde el mes pasado</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventas</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{summaryData.totalSales}</div>
            <p className="text-xs text-muted-foreground">+180.1% desde el mes pasado</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productos Activos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryData.activeProducts}</div>
            <p className="text-xs text-muted-foreground">Total en inventario</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nuevos Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{summaryData.newCustomers}</div>
            <p className="text-xs text-muted-foreground">Este mes</p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Ventas Recientes</CardTitle>
            <CardDescription>Últimas 10 ventas realizadas.</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Aquí iría una tabla o lista de ventas recientes */}
            <p className="text-muted-foreground">Tabla de ventas recientes...</p>
          </CardContent>
        </Card>
        <Card className="col-span-4 lg:col-span-3">
          <CardHeader>
            <CardTitle>Productos Bajos en Stock</CardTitle>
            <CardDescription>Productos que necesitan reabastecimiento.</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Aquí iría una lista de productos bajos en stock */}
            <p className="text-muted-foreground">Lista de productos bajos en stock...</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
