"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useTransition, useState } from "react"
import { toast } from "sonner"
import { changeUserPassword } from "@/admin/settings/actions"

const passwordSchema = z
  .object({
    currentPassword: z.string().min(6, "La contraseña actual debe tener al menos 6 caracteres."),
    newPassword: z.string().min(6, "La nueva contraseña debe tener al menos 6 caracteres."),
    confirmPassword: z.string().min(6, "Confirmar contraseña debe tener al menos 6 caracteres."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las nuevas contraseñas no coinciden.",
    path: ["confirmPassword"],
  })

type PasswordFormValues = z.infer<typeof passwordSchema>

interface AccountSettingsFormProps {
  userEmail: string
}

export function AccountSettingsForm({ userEmail }: AccountSettingsFormProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  const onSubmitPassword = (values: PasswordFormValues) => {
    setError(null)
    startTransition(async () => {
      const result = await changeUserPassword(values.currentPassword, values.newPassword)
      if (result?.error) {
        setError(result.error)
        toast.error("Error al cambiar contraseña", {
          description: result.error,
        })
      } else {
        toast.success("Contraseña actualizada", {
          description: "Tu contraseña ha sido cambiada exitosamente.",
        })
        form.reset()
      }
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuración de Cuenta</CardTitle>
        <CardDescription>Administra los detalles de tu cuenta.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="space-y-2">
          <Label>Correo Electrónico</Label>
          <Input type="email" value={userEmail} disabled readOnly />
          <p className="text-sm text-muted-foreground">Para cambiar tu correo electrónico, contacta al soporte.</p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmitPassword)} className="space-y-6 border-t pt-6">
          <div>
            <h3 className="text-lg font-medium">Cambiar Contraseña</h3>
            <p className="text-sm text-muted-foreground">Asegúrate de que sea una contraseña segura.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Contraseña Actual</Label>
            <Input id="currentPassword" type="password" {...form.register("currentPassword")} />
            {form.formState.errors.currentPassword && (
              <p className="text-sm text-red-500">{form.formState.errors.currentPassword.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">Nueva Contraseña</Label>
            <Input id="newPassword" type="password" {...form.register("newPassword")} />
            {form.formState.errors.newPassword && (
              <p className="text-sm text-red-500">{form.formState.errors.newPassword.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña</Label>
            <Input id="confirmPassword" type="password" {...form.register("confirmPassword")} />
            {form.formState.errors.confirmPassword && (
              <p className="text-sm text-red-500">{form.formState.errors.confirmPassword.message}</p>
            )}
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" disabled={isPending}>
            {isPending ? "Cambiando..." : "Cambiar Contraseña"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
