import type { ReactNode } from "react"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar" // Asumiendo que estos se exportan desde el componente sidebar de shadcn/ui
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { createClient } from "@/lib/supabase/server"
import { UserNav } from "@/components/admin/user-nav" // Crearemos este componente

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect("/auth/login?message=Debes iniciar sesión para acceder a esta página.")
  }

  // Opcional: Verificar si el usuario tiene rol de 'admin'
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profileError || !profile || profile.role !== "admin") {
    // Podrías redirigir a una página de no autorizado o a la home
    // Por ahora, si no es admin, no debería poder acceder a /admin rutas (esto se puede reforzar con middleware o en cada page.tsx)
    console.warn("Usuario no admin intentando acceder a /admin:", user.email)
    // return redirect('/?message=No tienes permisos para acceder a esta sección.');
  }

  const defaultOpen = cookieStore.get("sidebar:state")?.value === "true"

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <div className="min-h-screen flex flex-col bg-muted/40">
        <AdminSidebar />
        <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14 group-data-[collapsible=icon]:sm:pl-[calc(var(--sidebar-width-icon)_+_theme(spacing.4))_!important] group-data-[collapsible=offcanvas]:sm:pl-0 md:group-data-[collapsible=icon]:sm:pl-[calc(var(--sidebar-width-icon)_+_1rem)_!important]">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
            <SidebarTrigger className="sm:hidden" />
            {/* Breadcrumbs o título de la página aquí si es necesario */}
            <div className="ml-auto flex items-center gap-2">
              <UserNav user={user} />
            </div>
          </header>
          <main className="flex-1 p-4 sm:px-6 sm:py-0 md:gap-8">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  )
}
