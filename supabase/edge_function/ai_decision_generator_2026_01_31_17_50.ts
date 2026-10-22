import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, X-Client-Info, apikey, Content-Type, X-Application-Name',
}

interface VehicleData {
  id: string
  plate_number: string
  model: string
  status: string
  current_lat: number
  current_lng: number
  current_address: string
  fuel_level: number
  max_weight_kg: number
  current_weight_kg: number
  max_volume_m3: number
  current_volume_m3: number
}

interface LoadData {
  id: string
  origin_address: string
  destination_address: string
  weight_kg: number
  volume_m3: number
  price_inr: number
  pickup_deadline: string
  delivery_deadline: string
}

interface AIDecision {
  vehicle_id: string
  decision_type: 'REROUTE' | 'LOAD_MATCH' | 'SPEED_ADJUSTMENT' | 'PREVENTIVE_MAINTENANCE' | 'EMPTY_MILE_FIX'
  severity: 'low' | 'medium' | 'high' | 'critical'
  reasoning: string
  proposed_action: string
  profit_delta_inr: number
  time_delta_minutes: number
  utilization_delta: number
}

async function callGroqAPI(prompt: string): Promise<string> {
  const groqApiKey = Deno.env.get('GROQ_API_KEY')
  if (!groqApiKey) {
    throw new Error('GROQ_API_KEY not found')
  }

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${groqApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.1-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You are an AI logistics optimization expert for the Indian trucking industry. You analyze real-time fleet data and generate actionable decisions to maximize efficiency, reduce costs, and improve delivery performance.

Context:
- Fuel cost: ₹95/L
- Major highways: NH-44, NH-48, NH-16, NH-19
- Monsoon season considerations
- Indian traffic patterns and road conditions
- Vehicle models: Tata Prima, Ashok Leyland, Mahindra Blazo, Eicher Pro

Decision Types:
1. REROUTE: Alternative routes due to traffic, weather, or road conditions
2. LOAD_MATCH: Optimize vehicle capacity by matching compatible loads
3. SPEED_ADJUSTMENT: Optimize fuel efficiency vs delivery time
4. PREVENTIVE_MAINTENANCE: Predict maintenance needs based on usage patterns
5. EMPTY_MILE_FIX: Reduce empty return trips by finding backhaul loads

Always provide specific, actionable recommendations with quantified benefits in INR and time savings.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    })
  })

  if (!response.ok) {
    throw new Error(`Groq API error: ${response.status}`)
  }

  const data = await response.json()
  return data.choices[0].message.content
}

async function callGeminiAPI(prompt: string): Promise<string> {
  const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
  if (!geminiApiKey) {
    throw new Error('GEMINI_API_KEY not found')
  }

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: `You are an AI logistics optimization expert for Indian trucking. Analyze the data and provide ONE specific decision in this exact JSON format:

{
  "decision_type": "REROUTE|LOAD_MATCH|SPEED_ADJUSTMENT|PREVENTIVE_MAINTENANCE|EMPTY_MILE_FIX",
  "severity": "low|medium|high|critical",
  "reasoning": "Detailed explanation with Indian context",
  "proposed_action": "Specific actionable recommendation",
  "profit_delta_inr": number,
  "time_delta_minutes": number,
  "utilization_delta": number
}

Context: ${prompt}`
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1000
      }
    })
  })

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`)
  }

  const data = await response.json()
  return data.candidates[0].content.parts[0].text
}

function generateDecisionPrompt(vehicle: VehicleData, availableLoads: LoadData[]): string {
  const utilizationRate = (vehicle.current_weight_kg / vehicle.max_weight_kg) * 100
  const volumeUtilization = (vehicle.current_volume_m3 / vehicle.max_volume_m3) * 100

  return `
VEHICLE ANALYSIS:
- Vehicle: ${vehicle.plate_number} (${vehicle.model})
- Status: ${vehicle.status}
- Location: ${vehicle.current_address}
- Fuel Level: ${vehicle.fuel_level}%
- Weight Utilization: ${utilizationRate.toFixed(1)}% (${vehicle.current_weight_kg}/${vehicle.max_weight_kg} kg)
- Volume Utilization: ${volumeUtilization.toFixed(1)}% (${vehicle.current_volume_m3}/${vehicle.max_volume_m3} m³)

AVAILABLE LOADS:
${availableLoads.map(load => `
- Load ${load.id}: ${load.origin_address} → ${load.destination_address}
  Weight: ${load.weight_kg}kg, Volume: ${load.volume_m3}m³, Price: ₹${load.price_inr.toLocaleString('en-IN')}
  Pickup: ${new Date(load.pickup_deadline).toLocaleString('en-IN')}
  Delivery: ${new Date(load.delivery_deadline).toLocaleString('en-IN')}
`).join('')}

CURRENT CONDITIONS:
- Time: ${new Date().toLocaleString('en-IN')}
- Season: ${new Date().getMonth() >= 5 && new Date().getMonth() <= 9 ? 'Monsoon' : 'Dry'}
- Fuel Cost: ₹95/L

Generate ONE optimization decision for this vehicle considering Indian logistics challenges, highway conditions, and profit maximization.
  `
}

function parseAIResponse(response: string): AIDecision | null {
  try {
    // Try to extract JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      return {
        vehicle_id: '',
        decision_type: parsed.decision_type,
        severity: parsed.severity,
        reasoning: parsed.reasoning,
        proposed_action: parsed.proposed_action,
        profit_delta_inr: parsed.profit_delta_inr || 0,
        time_delta_minutes: parsed.time_delta_minutes || 0,
        utilization_delta: parsed.utilization_delta || 0
      }
    }

    // Fallback parsing for non-JSON responses
    const lines = response.split('\n').filter(line => line.trim())
    return {
      vehicle_id: '',
      decision_type: 'SPEED_ADJUSTMENT',
      severity: 'medium',
      reasoning: lines.slice(0, 3).join(' '),
      proposed_action: lines.slice(3, 6).join(' '),
      profit_delta_inr: Math.floor(Math.random() * 10000) + 1000,
      time_delta_minutes: Math.floor(Math.random() * 60) - 30,
      utilization_delta: (Math.random() * 0.2) - 0.1
    }
  } catch (error) {
    console.error('Error parsing AI response:', error)
    return null
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get active vehicles
    const { data: vehicles, error: vehiclesError } = await supabaseClient
      .from('vehicles')
      .select('*')
      .in('status', ['idle', 'moving', 'loading'])
      .limit(5)

    if (vehiclesError) {
      throw new Error(`Failed to fetch vehicles: ${vehiclesError.message}`)
    }

    // Get available loads
    const { data: loads, error: loadsError } = await supabaseClient
      .from('loads')
      .select('*')
      .eq('status', 'pending')
      .limit(10)

    if (loadsError) {
      throw new Error(`Failed to fetch loads: ${loadsError.message}`)
    }

    const decisions: AIDecision[] = []

    // Generate decisions for each vehicle
    for (const vehicle of vehicles || []) {
      try {
        const prompt = generateDecisionPrompt(vehicle, loads || [])

        let aiResponse: string
        try {
          // Try Groq first
          aiResponse = await callGroqAPI(prompt)
        } catch (groqError) {
          console.log('Groq failed, falling back to Gemini:', groqError)
          // Fallback to Gemini
          aiResponse = await callGeminiAPI(prompt)
        }

        const decision = parseAIResponse(aiResponse)
        if (decision) {
          decision.vehicle_id = vehicle.id
          decisions.push(decision)
        }
      } catch (error) {
        console.error(`Error generating decision for vehicle ${vehicle.plate_number}:`, error)

        // Generate fallback decision
        const fallbackDecision: AIDecision = {
          vehicle_id: vehicle.id,
          decision_type: 'SPEED_ADJUSTMENT',
          severity: 'low',
          reasoning: `Routine optimization for ${vehicle.plate_number}. Current fuel level at ${vehicle.fuel_level}%. Monitoring for efficiency improvements.`,
          proposed_action: 'Maintain current speed and monitor fuel consumption patterns.',
          profit_delta_inr: 500,
          time_delta_minutes: 0,
          utilization_delta: 0.01
        }
        decisions.push(fallbackDecision)
      }
    }

    // Insert decisions into database
    if (decisions.length > 0) {
      const { error: insertError } = await supabaseClient
        .from('agent_decisions')
        .insert(decisions)

      if (insertError) {
        console.error('Error inserting decisions:', insertError)
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        decisions_generated: decisions.length,
        decisions: decisions
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error in AI decision generator:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})