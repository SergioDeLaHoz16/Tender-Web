
import { redirect } from "next/navigation"
import LoginPage from "./auth/login/page"
import { createClient } from "./lib/supabase/server"
import { cookies } from "next/headers"

export default async function Home() {
  const supabase = createClient(cookies())
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Si hay sesión, redirige
  if (session) {
    const { data: userData } = await supabase.auth.getUser()
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userData.user?.id)
      .single()

    if (profile?.role === "admin") {
      redirect("/admin/dashboard")
    }else if (profile?.role === "customer") {
      redirect("/admin/dashboard") // Dueño de tienda
    } 
    else {
      redirect("/auth/login") // Cliente o usuario normal
    }
  }

  // Si no hay sesión, muestra login
  return <LoginPage />
}
