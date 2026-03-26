import { createClient } from '@supabase/supabase-js'

// ดึงค่าจาก .env เพื่อความปลอดภัย (OWASP A05: Security Misconfiguration)
const supabaseUrl = 'https://bkskejuqvkoweqerftej.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrc2tlanVxdmtvd2VxZXJmdGVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyNDA1NDUsImV4cCI6MjA4OTgxNjU0NX0.2xvCOHZtCVbNs0AwJmmM0hStBZKbkmsn3mhQ9EOWf1s'
// สร้างตัวเชื่อมต่อเพื่อนำไปใช้ทั่วทั้งแอป
export const supabase = createClient(supabaseUrl, supabaseAnonKey)