"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Terminal } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { createClient } from "@/lib/supabase/clients"

export default function SignupPage() {
  const router = useRouter()
  const supabase = createClient()
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isStoreOwner, setIsStoreOwner] = useState(false)
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
          role: isStoreOwner ? "admin" : "customer", // Esto se pasará a la función handle_new_user
        },
      },
    })

    if (signUpError) {
      setError(signUpError.message)
    } else if (data.user && data.user.identities && data.user.identities.length === 0) {
      // Esto puede suceder si el usuario ya existe pero no está confirmado
      setError(
        "Este correo electrónico ya está registrado. Intenta iniciar sesión o revisa tu bandeja de entrada para confirmar tu cuenta.",
      )
    } else if (data.session) {
      // Usuario registrado e sesión iniciada automáticamente
      setSuccessMessage("¡Registro exitoso! Redirigiendo...")
      router.push(isStoreOwner ? "/admin/dashboard" : "/")
      router.refresh()
    } else if (data.user) {
      // Usuario registrado, pero necesita confirmación por correo
      setSuccessMessage("¡Registro exitoso! Revisa tu correo electrónico para confirmar tu cuenta.")
    } else {
      setError("Ocurrió un error inesperado durante el registro.")
    }
    setLoading(false)
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Crear Cuenta</CardTitle>
          <CardDescription>Ingresa tus datos para registrarte.</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {successMessage && (
            <Alert variant="default" className="mb-4 bg-green-50 border-green-200 text-green-700">
              <Terminal className="h-4 w-4 !text-green-700" />
              <AlertTitle>Éxito</AlertTitle>
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSignup} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="full-name">Nombre Completo</Label>
              <Input
                id="full-name"
                placeholder="Juan Pérez"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@ejemplo.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                minLength={6}
              />
              <p className="text-xs text-muted-foreground">Mínimo 6 caracteres.</p>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is-store-owner"
                checked={isStoreOwner}
                onCheckedChange={(checked) => setIsStoreOwner(checked as boolean)}
                disabled={loading}
              />
              <Label
                htmlFor="is-store-owner"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Soy dueño de una tienda / Registrarme como administrador
              </Label>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Registrando..." : "Crear Cuenta"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-center text-sm">
          ¿Ya tienes una cuenta?{" "}
          <Link href="/auth/login" className="underline">
            Inicia Sesión
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
