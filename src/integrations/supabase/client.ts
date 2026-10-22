import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hvqzukrixbsmokspwgwo.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2cXp1a3JpeGJzbW9rc3B3Z3dvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4NjY1OTgsImV4cCI6MjA4NTQ0MjU5OH0.xL-MLssmHkMGnpLOoVaRioeBvHkLW4d2BDmbiujpJsU'

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Import the supabase client like this:
// For React:
// import { supabase } from "@/integrations/supabase/client";
// For React Native:
// import { supabase } from "@/src/integrations/supabase/client";
