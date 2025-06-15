
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mrqdudcfuopilyzcewoh.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ycWR1ZGNmdW9waWx5emNld29oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwMDExOTgsImV4cCI6MjA2NTU3NzE5OH0.2DfBDCOGih8BFkTZDDQBAjSsNiC1EJUloUlCw0ds2AE'

export const supabase = createClient(supabaseUrl, supabaseKey)
