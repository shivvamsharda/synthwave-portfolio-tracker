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
    const url = new URL(req.url)
    const endpoint = url.searchParams.get('endpoint')
    const tokenAddress = url.searchParams.get('tokenAddress')
    const limit = url.searchParams.get('limit') || '100'
    const offset = url.searchParams.get('offset') || '0'
    const fromTime = url.searchParams.get('fromTime')
    const toTime = url.searchParams.get('toTime')

    if (!endpoint || !tokenAddress) {
      return new Response(
        JSON.stringify({ error: 'Missing endpoint or tokenAddress parameter' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    let solscanUrl = `https://api.solscan.io/token/${endpoint}?tokenAddress=${tokenAddress}&limit=${limit}&offset=${offset}`
    
    if (endpoint === 'transfer' && fromTime && toTime) {
      solscanUrl += `&fromTime=${fromTime}&toTime=${toTime}`
    }

    console.log('Proxying request to:', solscanUrl)

    const response = await fetch(solscanUrl, {
      headers: {
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      console.error('Solscan API error:', response.status, response.statusText)
      return new Response(
        JSON.stringify({ error: `Solscan API error: ${response.status}` }),
        { 
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const data = await response.json()
    console.log('Solscan response:', data)

    return new Response(
      JSON.stringify(data),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  } catch (error) {
    console.error('Error in Solscan proxy:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
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