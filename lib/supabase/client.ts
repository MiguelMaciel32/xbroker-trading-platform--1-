import { createClient as createSupabaseClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

let supabaseInstance: ReturnType<typeof createSupabaseClient> | null = null

export function createClient() {
  if (!supabaseInstance) {
    supabaseInstance = createSupabaseClient(supabaseUrl, supabaseAnonKey)
  }
  return supabaseInstance
}

export const supabase = createClient()

export type PlatformConfig = {
  id: string
  key: string
  value: string
  description?: string
  created_at: string
  updated_at: string
}

export type AdminUser = {
  id: string
  user_id: string
  email: string
  is_super_admin: boolean
  created_at: string
  updated_at: string
}
