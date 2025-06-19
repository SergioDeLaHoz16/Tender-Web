"use client" // El sidebar de shadcn/ui usa hooks de cliente

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
} from "@/components/ui/sidebar" // Asumiendo estas exportaciones
import { Home, Package, ShoppingCart, Users, LineChart, Settings, Boxes, Store } from "lucide-react"
// import { createClient } from "@/lib/supabase/client"; // Para logout

const menuItems = [
  { title: "Dashboard", href: "/admin/dashboard", icon: Home },
  { title: "Productos", href: "/admin/products", icon: Package },
  { title: "Inventario", href: "/admin/inventory", icon: Boxes },
  { title: "Pedidos", href: "/admin/orders", icon: ShoppingCart },
  { title: "Clientes", href: "/admin/customers", icon: Users },
  { title: "Reportes", href: "/admin/reports", icon: LineChart },
]

const settingsItem = { title: "Configuración", href: "/admin/settings", icon: Settings }

export function AdminSidebar() {
  const pathname = usePathname()
  // const supabase = createClient(); // Para logout

  // const handleLogout = async () => {
  //   await supabase.auth.signOut();
  //   // router.push('/auth/login'); // O usar window.location.reload() si el layout maneja la redirección
  //   window.location.href = '/auth/login'; // Simple reload to trigger redirect
  // };

  return (
    <Sidebar
      collapsible="icon" // o "offcanvas"
      className="border-r"
      side="left"
    >
      <SidebarHeader className="p-2 border-b">
        <Link href="/admin/dashboard" className="flex items-center gap-2 font-semibold text-lg px-2">
          <Store className="h-6 w-6 text-primary" />
          <span className="group-data-[collapsible=icon]:hidden">Mi Tienda</span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="flex-1">
        <SidebarGroup className="p-2">
          {/* <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">Navegación</SidebarGroupLabel> */}
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname.startsWith(item.href)}
                    tooltip={{ children: item.title, side: "right", align: "center" }}
                  >
                    <Link href={item.href}>
                      <item.icon className="h-5 w-5" />
                      <span className="group-data-[collapsible=icon]:hidden">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarSeparator />
      <SidebarFooter className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname.startsWith(settingsItem.href)}
              tooltip={{ children: settingsItem.title, side: "right", align: "center" }}
            >
              <Link href={settingsItem.href}>
                <settingsItem.icon className="h-5 w-5" />
                <span className="group-data-[collapsible=icon]:hidden">{settingsItem.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          {/* <SidebarMenuItem>
              <SidebarMenuButton 
                onClick={handleLogout}
                className="w-full"
                tooltip={{children: "Cerrar Sesión", side: "right", align: "center"}}
              >
                <LogOut className="h-5 w-5" />
                <span className="group-data-[collapsible=icon]:hidden">Cerrar Sesión</span>
              </SidebarMenuButton>
            </SidebarMenuItem> */}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
