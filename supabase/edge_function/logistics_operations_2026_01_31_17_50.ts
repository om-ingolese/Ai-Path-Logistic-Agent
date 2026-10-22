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

    const { action, data } = await req.json()

    switch (action) {
      case 'create_demo_users':
        return await createDemoUsers(supabaseClient)
      
      case 'assign_load':
        return await assignLoad(supabaseClient, data)
      
      case 'execute_ai_decision':
        return await executeAIDecision(supabaseClient, data)
      
      case 'dismiss_ai_decision':
        return await dismissAIDecision(supabaseClient, data)
      
      case 'create_support_ticket':
        return await createSupportTicket(supabaseClient, data)
      
      case 'update_vehicle_location':
        return await updateVehicleLocation(supabaseClient, data)
      
      case 'generate_ai_insights':
        return await generateAIInsights(supabaseClient)
      
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
    }
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

async function createDemoUsers(supabase: any) {
  const users = [
    {
      email: 'akhilhegde0118@gmail.com',
      password: 'operator',
      user_metadata: {
        full_name: 'Akhil Hegde',
        role: 'operator'
      }
    },
    {
      email: 'adi.ansh2006@gmail.com',
      password: 'driver',
      user_metadata: {
        full_name: 'Aditya Ansh',
        role: 'driver'
      }
    },
    {
      email: 'kaustavashtikar2207@gmail.com',
      password: 'loadsupplier',
      user_metadata: {
        full_name: 'Kaustav Ashtikar',
        role: 'supplier'
      }
    }
  ]

  const results = []
  for (const userData of users) {
    try {
      const { data, error } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        user_metadata: userData.user_metadata,
        email_confirm: true
      })
      
      if (error) {
        console.log(`User ${userData.email} might already exist:`, error.message)
      } else {
        results.push({ email: userData.email, created: true })
      }
    } catch (err) {
      console.log(`Error creating user ${userData.email}:`, err)
    }
  }

  return new Response(
    JSON.stringify({ success: true, results }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function assignLoad(supabase: any, data: any) {
  const { loadId, vehicleId } = data

  // Update load status and assign vehicle
  const { error: loadError } = await supabase
    .from('loads')
    .update({ 
      status: 'assigned',
      assigned_vehicle_id: vehicleId,
      updated_at: new Date().toISOString()
    })
    .eq('id', loadId)

  if (loadError) throw loadError

  // Update vehicle status
  const { error: vehicleError } = await supabase
    .from('vehicles')
    .update({ 
      status: 'loading',
      updated_at: new Date().toISOString()
    })
    .eq('id', vehicleId)

  if (vehicleError) throw vehicleError

  return new Response(
    JSON.stringify({ success: true, message: 'Load assigned successfully' }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function executeAIDecision(supabase: any, data: any) {
  const { decisionId } = data

  const { error } = await supabase
    .from('agent_decisions')
    .update({ 
      status: 'executed',
      executed_at: new Date().toISOString()
    })
    .eq('id', decisionId)

  if (error) throw error

  return new Response(
    JSON.stringify({ success: true, message: 'AI decision executed' }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function dismissAIDecision(supabase: any, data: any) {
  const { decisionId } = data

  const { error } = await supabase
    .from('agent_decisions')
    .update({ 
      status: 'dismissed',
      dismissed_at: new Date().toISOString()
    })
    .eq('id', decisionId)

  if (error) throw error

  return new Response(
    JSON.stringify({ success: true, message: 'AI decision dismissed' }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function createSupportTicket(supabase: any, data: any) {
  const { 
    driverId, 
    ticketType, 
    severity, 
    title, 
    description, 
    locationLat, 
    locationLng, 
    locationAddress 
  } = data

  // Generate ticket number
  const ticketNumber = `TKT-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`

  const { error } = await supabase
    .from('support_tickets')
    .insert({
      ticket_number: ticketNumber,
      driver_id: driverId,
      ticket_type: ticketType,
      severity: severity,
      title: title,
      description: description,
      location_lat: locationLat,
      location_lng: locationLng,
      location_address: locationAddress,
      status: 'open'
    })

  if (error) throw error

  return new Response(
    JSON.stringify({ 
      success: true, 
      message: 'Support ticket created',
      ticketNumber 
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function updateVehicleLocation(supabase: any, data: any) {
  const { vehicleId, lat, lng, address, fuelLevel } = data

  const { error } = await supabase
    .from('vehicles')
    .update({
      current_lat: lat,
      current_lng: lng,
      current_address: address,
      fuel_level: fuelLevel,
      updated_at: new Date().toISOString()
    })
    .eq('id', vehicleId)

  if (error) throw error

  return new Response(
    JSON.stringify({ success: true, message: 'Vehicle location updated' }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function generateAIInsights(supabase: any) {
  // Generate sample AI decisions for demonstration
  const vehicles = await supabase
    .from('vehicles')
    .select('id, plate_number, status')
    .in('status', ['moving', 'idle', 'loading'])
    .limit(3)

  if (vehicles.error) throw vehicles.error

  const decisionTypes = ['REROUTE', 'LOAD_MATCH', 'SPEED_ADJUSTMENT', 'PREVENTIVE_MAINTENANCE', 'EMPTY_MILE_FIX']
  const severityLevels = ['low', 'medium', 'high', 'critical']
  
  const insights = []
  
  for (const vehicle of vehicles.data || []) {
    const decisionType = decisionTypes[Math.floor(Math.random() * decisionTypes.length)]
    const severity = severityLevels[Math.floor(Math.random() * severityLevels.length)]
    
    const reasoning = getReasoningForDecision(decisionType, vehicle.plate_number)
    const action = getActionForDecision(decisionType)
    
    const { error } = await supabase
      .from('agent_decisions')
      .insert({
        vehicle_id: vehicle.id,
        decision_type: decisionType,
        severity: severity,
        reasoning: reasoning,
        proposed_action: action,
        profit_delta_inr: Math.floor(Math.random() * 25000) + 1000,
        time_delta_minutes: Math.floor(Math.random() * 120) - 60,
        utilization_delta: (Math.random() * 0.3) - 0.15,
        status: 'pending'
      })

    if (!error) {
      insights.push({
        vehicle: vehicle.plate_number,
        type: decisionType,
        severity: severity
      })
    }
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      message: `Generated ${insights.length} AI insights`,
      insights 
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

function getReasoningForDecision(type: string, plateNumber: string): string {
  const reasonings = {
    'REROUTE': `Traffic congestion detected on primary route for ${plateNumber}. Alternative route analysis shows 15% time savings via NH-48 bypass.`,
    'LOAD_MATCH': `Vehicle ${plateNumber} has 40% remaining capacity. Compatible load identified on return route with 85% route overlap.`,
    'SPEED_ADJUSTMENT': `Current fuel consumption for ${plateNumber} is 18% above optimal. Speed optimization can improve efficiency by 12%.`,
    'PREVENTIVE_MAINTENANCE': `Vehicle ${plateNumber} approaching maintenance threshold. Predictive analysis indicates brake system attention needed within 500km.`,
    'EMPTY_MILE_FIX': `${plateNumber} scheduled for empty return trip. Backhaul opportunity identified reducing empty miles by 65%.`
  }
  
  return reasonings[type] || `AI analysis recommendation for vehicle ${plateNumber}.`
}

function getActionForDecision(type: string): string {
  const actions = {
    'REROUTE': 'Redirect via NH-48 bypass to avoid congestion and reduce delivery time by 25 minutes.',
    'LOAD_MATCH': 'Accept compatible load for ₹18,500 to maximize vehicle utilization and revenue.',
    'SPEED_ADJUSTMENT': 'Reduce speed to 65 kmph for optimal fuel efficiency on remaining 180km route.',
    'PREVENTIVE_MAINTENANCE': 'Schedule brake inspection at nearest authorized service center within 48 hours.',
    'EMPTY_MILE_FIX': 'Accept backhaul load from Chennai to Bangalore for ₹22,000 to eliminate empty return.'
  }
  
  return actions[type] || 'Implement AI-recommended optimization strategy.'
}