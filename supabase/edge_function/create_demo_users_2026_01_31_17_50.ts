import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, X-Client-Info, apikey, Content-Type, X-Application-Name',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Demo users to create
    const users = [
      {
        email: 'akhilhegde0118@gmail.com',
        password: 'operator',
        user_metadata: {
          full_name: 'Akhil Hegde',
          role: 'operator',
          company_name: 'PathLogistics Pvt Ltd',
          phone: '+91-9876543210'
        }
      },
      {
        email: 'adi.ansh2006@gmail.com',
        password: 'driver',
        user_metadata: {
          full_name: 'Aditya Ansh',
          role: 'driver',
          company_name: 'PathLogistics Pvt Ltd',
          phone: '+91-9876543211'
        }
      },
      {
        email: 'kaustavashtikar2207@gmail.com',
        password: 'loadsupplier',
        user_metadata: {
          full_name: 'Kaustav Ashtikar',
          role: 'supplier',
          company_name: 'Mumbai Freight Solutions',
          phone: '+91-9876543212'
        }
      }
    ]

    const results = []
    
    for (const userData of users) {
      try {
        // Try to create the user
        const { data, error } = await supabaseClient.auth.admin.createUser({
          email: userData.email,
          password: userData.password,
          user_metadata: userData.user_metadata,
          email_confirm: true
        })
        
        if (error) {
          // User might already exist, try to update instead
          console.log(`User ${userData.email} creation failed, might already exist:`, error.message)
          
          // Try to get existing user and update metadata
          const { data: existingUsers } = await supabaseClient.auth.admin.listUsers()
          const existingUser = existingUsers.users?.find(u => u.email === userData.email)
          
          if (existingUser) {
            const { error: updateError } = await supabaseClient.auth.admin.updateUserById(
              existingUser.id,
              { user_metadata: userData.user_metadata }
            )
            
            if (!updateError) {
              results.push({ 
                email: userData.email, 
                status: 'updated',
                id: existingUser.id 
              })
            } else {
              results.push({ 
                email: userData.email, 
                status: 'error', 
                error: updateError.message 
              })
            }
          } else {
            results.push({ 
              email: userData.email, 
              status: 'error', 
              error: error.message 
            })
          }
        } else {
          results.push({ 
            email: userData.email, 
            status: 'created',
            id: data.user?.id 
          })
        }
      } catch (err) {
        console.log(`Error processing user ${userData.email}:`, err)
        results.push({ 
          email: userData.email, 
          status: 'error', 
          error: err.message 
        })
      }
    }

    // Also ensure user profiles exist
    for (const userData of users) {
      try {
        const { data: existingUsers } = await supabaseClient.auth.admin.listUsers()
        const user = existingUsers.users?.find(u => u.email === userData.email)
        
        if (user) {
          // Check if profile exists
          const { data: profile } = await supabaseClient
            .from('user_profiles')
            .select('id')
            .eq('id', user.id)
            .single()
          
          if (!profile) {
            // Create profile
            const { error: profileError } = await supabaseClient
              .from('user_profiles')
              .insert({
                id: user.id,
                email: userData.email,
                full_name: userData.user_metadata.full_name,
                phone: userData.user_metadata.phone,
                role: userData.user_metadata.role,
                company_name: userData.user_metadata.company_name,
                license_number: userData.user_metadata.role === 'operator' ? 'OP-2024-001' : 
                               userData.user_metadata.role === 'driver' ? 'DL-MH-12-2024-001' : 
                               'SP-2024-001'
              })
            
            if (profileError) {
              console.log(`Profile creation error for ${userData.email}:`, profileError.message)
            }
          }
        }
      } catch (err) {
        console.log(`Profile processing error for ${userData.email}:`, err)
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Demo users processed',
        results 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})