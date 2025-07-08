import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get API keys from Deno environment (Supabase secrets)
    const apiKeys = {
      helius: Deno.env.get('HELIUS_API_KEY'),
      birdeye: Deno.env.get('BIRDEYE_API_KEY'),
      coingecko: Deno.env.get('COINGECKO_API_KEY'),
      santiment: Deno.env.get('SANTIMENT_API_KEY'),
      lunarcrush: Deno.env.get('LUNARCRUSH_API_KEY'),
    }

    return new Response(
      JSON.stringify(apiKeys),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  } catch (error) {
    console.error('Error getting API keys:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to get API keys' }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})