"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { ThemeToggle } from "@/components/admin/theme-toggle" // Reutilizamos el toggle

export function AppearanceSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Apariencia</CardTitle>
        <CardDescription>Personaliza la apariencia de la aplicación.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div>
            <Label htmlFor="theme-toggle-button" className="font-semibold">
              Tema de la Aplicación
            </Label>
            <p className="text-sm text-muted-foreground">
              Selecciona entre el tema claro, oscuro o el predeterminado del sistema.
            </p>
          </div>
          <ThemeToggle />
        </div>
        {/* Aquí podrías añadir más opciones de apariencia en el futuro, como colores de acento */}
      </CardContent>
    </Card>
  )
}
