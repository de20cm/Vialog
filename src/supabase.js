import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://qefhplgdqyjcrkaqbhte.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlZmhwbGdkcXlqY3JrYXFiaHRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzNTkxMTEsImV4cCI6MjA5NTkzNTExMX0.Y_W1yTPpMAEr84_xp0bvBLin0zDYN2I0glIjfVIvuWQ'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)