import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StoreProfileForm } from "@/components/admin/settings/store-profile-form"
import { AccountSettingsForm } from "@/components/admin/settings/account-settings-form"
import type { Database } from "@/lib/database.types" // Asumiendo que tienes tus tipos de Supabase generados
import { AppearanceSettings } from "@/components/admin/settings/appearance-settings"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type StoreSettings = Database["public"]["Tables"]["store_settings"]["Row"]


async function getStoreSettings(userId: string): Promise<StoreSettings | null> {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)
  const { data, error } = await supabase.from("store_settings").select("*").eq("user_id", userId).single()

  if (error && error.code !== "PGRST116") {
    // PGRST116: no rows found
    console.error("Error fetching store settings:", error)
    return null
  }
  return data
}

export default async function SettingsPage() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    // Esto no debería pasar si AdminLayout funciona bien, pero es una salvaguarda.
    return <p>Usuario no autenticado.</p>
  }

  const storeSettings = await getStoreSettings(user.id)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Configuraciones</h1>
        <p className="text-muted-foreground">Administra la configuración de tu tienda y cuenta.</p>
      </div>

      <Tabs defaultValue="store-profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:max-w-md">
          <TabsTrigger value="store-profile">Perfil de Tienda</TabsTrigger>
          <TabsTrigger value="appearance">Apariencia</TabsTrigger>
          <TabsTrigger value="account">Cuenta</TabsTrigger>
          <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
          <TabsTrigger value="integrations">Integraciones</TabsTrigger>
        </TabsList>

        <TabsContent value="store-profile">
          <StoreProfileForm
            defaultValues={{
              store_name: storeSettings?.store_name ?? "",
              description: storeSettings?.address_street ?? "", 
            }}
            userId={user.id}
          />

        </TabsContent>

        <TabsContent value="appearance">
          <AppearanceSettings />
        </TabsContent>

        <TabsContent value="account">
          <AccountSettingsForm userEmail={user.email || ""} />
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notificaciones</CardTitle>
              <CardDescription>
                Configura tus preferencias de notificación (Próximamente).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Esta sección está en desarrollo.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations">
          <Card>
            <CardHeader>
              <CardTitle>Integraciones</CardTitle>
              <CardDescription>
                Conecta con otras herramientas y servicios (Próximamente).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Esta sección está en desarrollo.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
