"use client"

import type React from "react"
import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/clients"
import { Eye, EyeOff, Terminal } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(searchParams.get("message"))

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })

    if (signInError) {
      setError(signInError.message)
    } else {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single()

        if (profileError || !profile) {
          console.error("Error al obtener perfil o perfil no encontrado:", {
            userId: user.id,
            profileData: profile,
            errorDetails: profileError,
          })
          setError(`No se pudo verificar el rol del usuario. Detalles: ${profileError?.message || "Perfil no encontrado."}`)
        } else if (profile.role === "admin") {
          router.push("/admin/dashboard")
        } else {
          router.push("/")
        }
      } else {
        setError("No se pudo obtener la información del usuario después del login.")
      }
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div
      className="relative min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-500 bg-center bg-cover bg-no-repeat
"
      style={{ backgroundImage: "url('/background.jpg')" }}>
      <div className="absolute bg-black opacity-60 inset-0 z-0"></div>
      <div className="max-w-md w-full space-y-8 p-10 bg-white dark:bg-card text-foreground dark:text-card-foreground rounded-xl z-10">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">Bienvenido a TenderApp!</h2>
          <p className="mt-2 text-base text-black dark:text-muted-foreground">Por favor inicia sesion con tu cuenta</p>
        </div>

        {message && (
          <Alert variant="default" className="mb-4 bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-200">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Información</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="mb-4">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="relative">
            <label className="text-base font-bold text-gray-700 dark:text-muted-foreground tracking-wide">Correo Electronico</label>
            <input
              className="w-full text-base py-2 border-b pl-2 border-gray-300 focus:outline-none focus:border-indigo-500 dark:bg-background dark:text-foreground"
              type="email"
              placeholder="user@examples.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="mt-8 relative">
            <label className="text-base font-bold text-gray-700 dark:text-muted-foreground tracking-wide">Contraseña</label>
            <input
              className="w-full text-base pl-2 py-2 border-b border-gray-300 focus:outline-none focus:border-indigo-500 dark:bg-background dark:text-foreground pr-10"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 bottom-2 text-[#1f2937] hover:text-[#c8a15f] dark:text-muted-foreground"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input id="remember_me" name="remember_me" type="checkbox" className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
              <label htmlFor="remember_me" className="ml-2 block text-sm text-gray-900 dark:text-white">
                Recordar mi sesion
              </label>
            </div>
            <div className="text-sm">
              <Link href="#" className="font-medium text-[#1f2937] hover:text-[#c8a15f]">
                Olvidaste tu contraseña?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center bg-[#1f2937] text-white p-4  rounded-sm tracking-wide font-semibold focus:outline-none focus:shadow-outline hover:bg-[#c8a15f] shadow-lg transition ease-in duration-300">
              {loading ? "Ingresando..." : "Iniciar Sesión"}
            </button>
          </div>

          <p className="flex flex-col items-center justify-center mt-10 text-center text-md text-gray-500 dark:text-muted-foreground">
            <span>No tienes una cuenta?</span>
            <Link href="/auth/signup" className="text-[#1f2937] hover:text-[#c8a15f] hover:underline transition ease-in duration-300">
              Registrate
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
