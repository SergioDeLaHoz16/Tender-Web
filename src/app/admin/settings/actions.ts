"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
// import type { Database } from "@/lib/database.types"
export type StoreSettingsUpdate = {
  userId: string
  store_name: string
  description?: string
}

// ✅ Función para actualizar o crear store_settings
export async function updateStoreSettings(payload: StoreSettingsUpdate) {
  const supabase = createClient(cookies())
  const { userId, ...data } = payload

  const { error } = await supabase
    .from("store_settings")
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/admin/settings")
  return { success: true }
}

export async function changeUserPassword(currentPassword: string, newPassword: string) {
  const supabase = createClient(cookies())

  const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
  if (sessionError || !sessionData.session) {
    return { error: "Sesión inválida o expirada." }
  }

  const { user } = sessionData.session

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email!,
    password: currentPassword,
  })

  if (signInError) {
    return { error: "La contraseña actual es incorrecta." }
  }

  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
  })

  if (updateError) {
    return { error: "No se pudo actualizar la contraseña. Intenta nuevamente." }
  }

  return { success: true }
}
