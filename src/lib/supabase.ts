import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos para TypeScript
export interface Member {
  id?: number
  dni: string
  name: string
  phone?: string
  membership_type: string // Changed from literal union to string to allow dynamic types
  start_date: string
  expiry_date: string
  created_at?: string
  updated_at?: string
}

export interface Transaction {
  id?: number
  type: 'income' | 'expense'
  amount: number
  concept: string
  date: string
  time: string  // Mantener como string para compatibilidad
  created_at?: string
}

export interface CheckIn {
  id?: number
  member_dni: string
  member_name: string
  check_in_time: string
  membership_status: string
  created_at?: string
}

// Keep the default prices for backwards compatibility
// These can be used as fallbacks when admin data isn't available
export const membershipPrices = {
  mensual: 15000,
  trimestral: 40000,
  semestral: 75000,
  anual: 140000
} as const

// Export por defecto para asegurar que se reconozca como módulo
export default supabase