"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useTransition, useState } from "react"
import { toast } from "sonner"
import { updateStoreSettings } from "@/admin/settings/actions"

const schema = z.object({
  name: z.string().min(3, "El nombre es obligatorio."),
  description: z.string().optional(),
})

type StoreProfileFormValues = {
  store_name: string
  description?: string
}

export function StoreProfileForm({
  defaultValues,
  userId,
}: {
  defaultValues: StoreProfileFormValues
  userId: string
}) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const form = useForm<StoreProfileFormValues>({
    resolver: zodResolver(
      z.object({
        store_name: z.string().min(3, "El nombre es obligatorio."),
        description: z.string().optional(),
      })
    ),
    defaultValues,
  })

  const onSubmit = (values: StoreProfileFormValues) => {
    setError(null)
    startTransition(async () => {
      const result = await updateStoreSettings({
        userId,
        ...values,
      })

      if (result?.error) {
        toast.error("Error al guardar", {
          description: result.error,
        })
      } else {
        toast.success("Tienda actualizada", {
          description: "Perfil de la tienda actualizado correctamente.",
        })
        form.reset(values)
      }
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Perfil de la Tienda</CardTitle>
        <CardDescription>Actualiza el nombre y descripción de tu tienda.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="store_name">Nombre de la tienda</Label>
            <Input id="store_name" {...form.register("store_name")} />
            {form.formState.errors.store_name && (
              <p className="text-sm text-red-500">{form.formState.errors.store_name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Input id="description" {...form.register("description")} />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button type="submit" disabled={isPending}>
            {isPending ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}