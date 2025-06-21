"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/clients"
import { Eye, EyeOff, Terminal } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"

export default function SignupPage() {
  const router = useRouter()
  const supabase = createClient()
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isStoreOwner, setIsStoreOwner] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccessMessage(null)

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: isStoreOwner ? "admin" : "customer",
        },
      },
    })

    if (signUpError) {
      setError(signUpError.message)
    } else if (data.user && data.user.identities && data.user.identities.length === 0) {
      setError("Este correo electrónico ya está registrado. Intenta iniciar sesión o revisa tu bandeja de entrada para confirmar tu cuenta.")
    } else if (data.session) {
      setSuccessMessage("¡Registro exitoso! Redirigiendo...")
      router.push(isStoreOwner ? "/admin/dashboard" : "/")
      router.refresh()
    } else if (data.user) {
      setSuccessMessage("¡Registro exitoso! Revisa tu correo electrónico para confirmar tu cuenta.")
    } else {
      setError("Ocurrió un error inesperado durante el registro.")
    }
    setLoading(false)
  }

  return (
    <div
      className="relative min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-500 bg-center bg-cover bg-no-repeat"
      style={{ backgroundImage: "url('/background.jpg')" }}>
      <div className="absolute bg-black opacity-60 inset-0 z-0"></div>
      <div className="max-w-md w-full space-y-8 p-10 bg-white dark:bg-card text-foreground dark:text-card-foreground rounded-xl z-10">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">Registrarse en TenderApp</h2>
          <p className="mt-2 text-base text-black dark:text-muted-foreground">Crea tu cuenta para comenzar a gestionar tu tienda</p>
        </div>

        {successMessage && (
          <Alert variant="default" className="mb-4 bg-green-50 border-green-200 text-green-700 dark:bg-green-950 dark:border-green-800 dark:text-green-200">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Éxito</AlertTitle>
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="mb-4">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSignup}>
          <div className="relative">
            <label className="text-base font-bold text-gray-700 dark:text-muted-foreground tracking-wide">Nombre Completo</label>
            <input
              className="w-full text-base py-2 border-b pl-2 border-gray-300 focus:outline-none focus:border-indigo-500 dark:bg-background dark:text-foreground"
              type="text"
              placeholder="Juan Pérez"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="relative">
            <label className="text-base font-bold text-gray-700 dark:text-muted-foreground tracking-wide">Correo Electrónico</label>
            <input
              className="w-full text-base py-2 border-b pl-2 border-gray-300 focus:outline-none focus:border-indigo-500 dark:bg-background dark:text-foreground"
              type="email"
              placeholder="tu@ejemplo.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="relative">
            <label className="text-base font-bold text-gray-700 dark:text-muted-foreground tracking-wide">Contraseña</label>
            <input
              className="w-full text-base py-2 border-b pl-2 pr-10 border-gray-300 focus:outline-none focus:border-indigo-500 dark:bg-background dark:text-foreground"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 bottom-2 text-[#1f2937] hover:text-[#c8a15f] dark:text-muted-foreground"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
            <p className="text-xs mt-1 text-muted-foreground">Mínimo 6 caracteres.</p>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is-store-owner"
              checked={isStoreOwner}
              onCheckedChange={(checked) => setIsStoreOwner(checked as boolean)}
              disabled={loading}
            />
            <label htmlFor="is-store-owner" className="text-sm text-gray-900 dark:text-white">
              Soy dueño de una tienda / Registrarme como administrador
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center bg-[#1f2937] text-white p-4 rounded-sm tracking-wide font-semibold focus:outline-none focus:shadow-outline hover:bg-[#c8a15f] shadow-lg transition ease-in duration-300">
            {loading ? "Registrando..." : "Crear Cuenta"}
          </button>

          <p className="flex flex-col items-center justify-center mt-10 text-center text-md text-gray-500 dark:text-muted-foreground">
            <span>¿Ya tienes una cuenta?</span>
            <Link href="/auth/login" className="text-[#1f2937] hover:text-[#c8a15f] hover:underline transition ease-in duration-300">
              Inicia Sesión
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
