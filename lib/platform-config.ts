import { supabase } from "./supabase/client"
import { createClient } from "./supabase/server"

// Client-side function to get platform config
export async function getPlatformConfig(): Promise<Record<string, string>> {
  const { data, error } = await supabase.from("platform_config").select("key, value")

  if (error) {
    console.error("Error fetching platform config:", error)
    return getDefaultConfig()
  }

  const config: Record<string, string> = {}
  data?.forEach((item) => {
    config[item.key] = item.value
  })

  return { ...getDefaultConfig(), ...config }
}

// Server-side function to get platform config
export async function getPlatformConfigServer(): Promise<Record<string, string>> {
  const supabase = createClient()
  const { data, error } = await supabase.from("platform_config").select("key, value")

  if (error) {
    console.error("Error fetching platform config:", error)
    return getDefaultConfig()
  }

  const config: Record<string, string> = {}
  data?.forEach((item) => {
    config[item.key] = item.value
  })

  return { ...getDefaultConfig(), ...config }
}

// Update platform config (admin only)
export async function updatePlatformConfig(key: string, value: string): Promise<boolean> {
  const { error } = await supabase.from("platform_config").upsert({ key, value }, { onConflict: "key" })

  if (error) {
    console.error("Error updating platform config:", error)
    return false
  }

  return true
}

// Default configuration fallback
function getDefaultConfig(): Record<string, string> {
  return {
    platform_name: "XBroker",
    community_name: "COMUNIDADE XBROKER",
    support_link: "https://wa.me/5511999999999",
    support_text: "SUPORTE",
    logo_url: "/logo.png",
    primary_color: "#248f32",
    secondary_color: "#d1281f",
  }
}

// Check if user is admin
export async function isUserAdmin(userId: string): Promise<boolean> {
  const { data, error } = await supabase.from("admin_users").select("id").eq("user_id", userId).single()

  return !error && !!data
}
