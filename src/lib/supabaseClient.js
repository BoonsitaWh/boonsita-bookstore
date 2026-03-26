import { createClient } from '@supabase/supabase-js'

// ดึงค่าจาก .env เพื่อความปลอดภัย (OWASP A05: Security Misconfiguration)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
// สร้างตัวเชื่อมต่อเพื่อนำไปใช้ทั่วทั้งแอป
export const supabase = createClient(supabaseUrl, supabaseAnonKey)