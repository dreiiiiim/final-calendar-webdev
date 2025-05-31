import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xcuvyqzduujbskpreffe.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjdXZ5cXpkdXVqYnNrcHJlZmZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2MTYwMTksImV4cCI6MjA2NDE5MjAxOX0.ZGNhJAWz-dV8gIOJalOewMU1pBkpfJjBDOv4S5XO98E'

export const supabase = createClient(supabaseUrl, supabaseKey)

// supabase.auth.signIn()