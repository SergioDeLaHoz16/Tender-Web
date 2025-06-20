"use client"

import type React from "react"
import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/clients"
import { Terminal } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
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
    <div className="relative min-h-screen bg-transparent sm:flex sm:flex-row justify-center">
      <div className="absolute top-0 left-0 bottom-0 right-0 bg-gradient-to-b from-gray-900 via-gray-900 to-purple-800 z-0"></div>

      <div className="flex-col flex self-center lg:px-14 sm:max-w-4xl xl:max-w-md z-10 text-white">
        <div className="self-start hidden lg:flex flex-col">
          <h1 className="my-3 font-semibold text-4xl">Welcome back</h1>
          <p className="pr-3 text-sm opacity-75">Lorem ipsum is placeholder text commonly used in the graphic, print, and publishing industries for previewing layouts and visual mockups</p>
        </div>
      </div>

      <div className="flex justify-center self-center z-10">
        <div className="p-12 bg-white mx-auto rounded-3xl w-96">
          <div className="mb-7">
            <h3 className="font-semibold text-2xl text-gray-800">Sign In</h3>
            <p className="text-gray-400">
              Don't have an account?
              <Link href="/auth/signup" className="text-sm text-purple-700 hover:text-purple-700 ml-1">Sign Up</Link>
            </p>
          </div>

          {message && (
            <Alert variant="default" className="mb-4 bg-blue-50 border-blue-200 text-blue-700">
              <Terminal className="h-4 w-4 !text-blue-700" />
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

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <input
                className="w-full text-sm px-4 py-3 bg-gray-200 focus:bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:border-purple-400"
                type="email"
                placeholder="Email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="relative">
              <input
                placeholder="Password"
                type="password"
                className="text-sm text-gray-700 px-4 py-3 rounded-lg w-full bg-gray-200 focus:bg-gray-100 border border-gray-200 focus:outline-none focus:border-purple-400"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="text-sm ml-auto">
              <Link href="#" className="text-purple-700 hover:text-purple-600">
                Forgot your password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center bg-purple-800 hover:bg-purple-700 text-gray-100 p-3 rounded-lg tracking-wide font-semibold cursor-pointer transition ease-in duration-500"
            >
              {loading ? "Ingresando..." : "Sign in"}
            </button>

            <div className="flex items-center justify-center space-x-2 my-5">
              <span className="h-px w-16 bg-gray-100"></span>
              <span className="text-gray-300 font-normal">or</span>
              <span className="h-px w-16 bg-gray-100"></span>
            </div>

            <div className="flex justify-center gap-5 w-full">
              <button
                type="button"
                className="w-full flex items-center justify-center border border-gray-300 hover:border-gray-900 hover:bg-gray-900 text-sm text-gray-500 p-3 rounded-lg tracking-wide font-medium cursor-pointer transition ease-in duration-500"
              >
                <span>Google</span>
              </button>
              <button
                type="button"
                className="w-full flex items-center justify-center border border-gray-300 hover:border-gray-900 hover:bg-gray-900 text-sm text-gray-500 p-3 rounded-lg tracking-wide font-medium cursor-pointer transition ease-in duration-500"
              >
                <span>Facebook</span>
              </button>
            </div>
          </form>

          <div className="mt-7 text-center text-gray-300 text-xs">
            <span>
              Copyright © 2021-2023
              <Link href="https://codepen.io/uidesignhub" target="_blank" className="text-purple-500 hover:text-purple-600 ml-1">AJI</Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
