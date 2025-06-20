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
import { MoreHorizontal, PlusCircle, File, Search } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import type { Product } from "@/lib/types"
import Image from "next/image"
import { Input } from "@/components/ui/input"

async function getProducts(searchTerm?: string): Promise<Product[]> {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)
  let query = supabase
    .from("products")
    .select(`
      *,
      categories ( name )
    `)
    .order("created_at", { ascending: false })

  if (searchTerm) {
    query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,sku.ilike.%${searchTerm}%`)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching products:", error)
    return []
  }

  return data.map((p) => ({
    ...p,
    category_name: (p.categories as { name: string } | null)?.name || "Sin categoría",
  })) as Product[]
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams?: { query?: string }
}) {
  const searchTerm = searchParams?.query || ""
  const products = await getProducts(searchTerm)

  return (
    <div className="space-y-5 p-5">
      {/* Cabecera de la página - Estructura similar al Dashboard */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Gestión de Productos</h1>
        <div className="flex w-full sm:w-auto items-center space-x-2">
          <form className="flex-1 sm:flex-initial">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                name="query"
                defaultValue={searchTerm}
                placeholder="Buscar productos..."
                className="pl-8 sm:w-[200px] md:w-[250px] lg:w-[300px] bg-background h-9"
              />
            </div>
          </form>
          <Button
            size="sm"
            variant="outline"
            className="h-9 gap-1 text-sm bg-background text-foreground hover:bg-accent"
          >
            <File className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only">Exportar</span>
          </Button>
          <Link href="/admin/products/new">
            <Button size="sm" className="h-9 gap-1 text-sm">
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only">Añadir Producto</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Contenido principal de la página (Tabla de productos) */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Lista de Productos</CardTitle>
          <CardDescription>
            Visualiza y administra todos los productos de tu inventario.
            {searchTerm && ` Mostrando resultados para "${searchTerm}".`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="hidden w-[80px] sm:table-cell">
                  <span className="sr-only">Imagen</span>
                </TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead className="hidden md:table-cell">Stock</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead className="hidden md:table-cell">Estado</TableHead>
                <TableHead className="w-[80px]">
                  <span className="sr-only">Acciones</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center h-24">
                    {searchTerm ? `No se encontraron productos para "${searchTerm}".` : "No hay productos registrados."}
                  </TableCell>
                </TableRow>
              )}
              {products.map((product) => (
                <TableRow key={product.id} className="hover:bg-muted/50">
                  <TableCell className="hidden sm:table-cell">
                    <Image
                      alt={product.name}
                      className="aspect-square rounded-md object-cover"
                      height="64"
                      src={product.image_url || "/placeholder.svg?width=64&height=64"}
                      width="64"
                    />
                  </TableCell>
                  <TableCell className="font-medium text-foreground">{product.name}</TableCell>
                  <TableCell className="text-muted-foreground">{product.category_name}</TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">
                    {product.stock_quantity}
                    {product.low_stock_threshold && product.stock_quantity <= product.low_stock_threshold && (
                      <Badge variant="destructive" className="ml-2">
                        Bajo Stock
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-foreground">${product.price.toLocaleString("es-MX")}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge
                      variant={product.is_active ? "default" : "outline"}
                      className={
                        product.is_active
                          ? "bg-green-100 text-green-700 border-green-300 dark:bg-green-900/50 dark:text-green-400 dark:border-green-700"
                          : "bg-red-100 text-red-700 border-red-300 dark:bg-red-900/50 dark:text-red-400 dark:border-red-700"
                      }
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
                        <DropdownMenuItem className="text-red-600 focus:bg-red-100 focus:text-red-700 dark:focus:bg-red-900/50 dark:focus:text-red-400">
                          Eliminar
                        </DropdownMenuItem>
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
