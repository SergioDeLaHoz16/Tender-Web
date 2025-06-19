import { cookies } from "next/headers"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, PlusCircle, File } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import type { Product } from "@/lib/types"
import Image from "next/image"

async function getProducts(): Promise<Product[]> {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)
  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      categories ( name )
    `)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching products:", error)
    return []
  }

  // Mapear para incluir category_name directamente
  return data.map((p) => ({
    ...p,
    category_name: (p.categories as { name: string } | null)?.name || "Sin categoría",
  })) as Product[]
}

export default async function AdminProductsPage() {
  const products = await getProducts()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Productos</h1>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="h-7 gap-1 text-sm bg-background text-foreground hover:bg-accent"
          >
            <File className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only">Exportar</span>
          </Button>
          <Link href="/admin/products/new">
            <Button size="sm" className="h-7 gap-1 text-sm">
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only">Añadir Producto</span>
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Productos</CardTitle>
          <CardDescription>Gestiona tus productos. Puedes añadir, editar o eliminar productos.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="hidden w-[100px] sm:table-cell">
                  <span className="sr-only">Imagen</span>
                </TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead className="hidden md:table-cell">Stock</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead className="hidden md:table-cell">Estado</TableHead>
                <TableHead>
                  <span className="sr-only">Acciones</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center h-24">
                    No hay productos registrados.
                  </TableCell>
                </TableRow>
              )}
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="hidden sm:table-cell">
                    <Image
                      alt={product.name}
                      className="aspect-square rounded-md object-cover"
                      height="64"
                      src={product.image_url || "/placeholder.svg?width=64&height=64"}
                      width="64"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.category_name}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {product.stock_quantity}
                    {product.low_stock_threshold && product.stock_quantity <= product.low_stock_threshold && (
                      <Badge variant="destructive" className="ml-2">
                        Bajo Stock
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>${product.price.toLocaleString("es-MX")}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge
                      variant={product.is_active ? "default" : "outline"}
                      className={product.is_active ? "bg-green-500 text-white" : "bg-muted text-muted-foreground"}
                    >
                      {product.is_active ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <Link href={`/admin/products/edit/${product.id}`}>
                          <DropdownMenuItem>Editar</DropdownMenuItem>
                        </Link>
                        <DropdownMenuItem className="text-red-600">Eliminar</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter>
          <div className="text-xs text-muted-foreground">
            Mostrando <strong>1-{products.length > 10 ? 10 : products.length}</strong> de{" "}
            <strong>{products.length}</strong> productos
          </div>
          {/* Aquí iría la paginación si hay muchos productos */}
        </CardFooter>
      </Card>
    </div>
  )
}
