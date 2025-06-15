
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface YahooFinanceResponse {
  chart: {
    result: Array<{
      meta: {
        regularMarketPrice: number
        chartPreviousClose: number
        symbol: string
      }
    }>
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get all index tokens from database
    const { data: tokens, error: tokensError } = await supabaseClient
      .from('index_tokens')
      .select('*')
      .eq('is_active', true)

    if (tokensError) {
      throw tokensError
    }

    // Yahoo Finance symbol mapping
    const symbolMapping: Record<string, string> = {
      'SP500': '^GSPC',    // S&P 500
      'NASDAQ': '^IXIC',   // NASDAQ Composite
      'DOW': '^DJI',       // Dow Jones
      'FTSE': '^FTSE',     // FTSE 100
      'NIKKEI': '^N225',   // Nikkei 225
      'DAX': '^GDAXI'      // DAX
    }

    const priceUpdates = []

    for (const token of tokens) {
      const yahooSymbol = symbolMapping[token.symbol]
      if (!yahooSymbol) continue

      try {
        // Fetch from Yahoo Finance API
        const response = await fetch(
          `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?interval=1d&range=2d`
        )
        
        if (!response.ok) {
          console.error(`Failed to fetch data for ${token.symbol}`)
          continue
        }

        const data: YahooFinanceResponse = await response.json()
        
        if (!data.chart?.result?.[0]?.meta) {
          console.error(`No data received for ${token.symbol}`)
          continue
        }

        const meta = data.chart.result[0].meta
        const currentPrice = meta.regularMarketPrice
        const previousClose = meta.chartPreviousClose
        const change24h = currentPrice - previousClose
        const changePercent24h = (change24h / previousClose) * 100

        // Scale prices to make them more reasonable for trading
        // Real index values are too high, so we scale them down
        const scaledPrice = currentPrice / 100

        priceUpdates.push({
          token_id: token.id,
          price_usd: scaledPrice,
          change_24h: change24h / 100,
          change_percent_24h: changePercent24h,
          market_cap: 45000000000000, // Placeholder
          volume_24h: 1000000000, // Placeholder
          updated_at: new Date().toISOString()
        })

      } catch (error) {
        console.error(`Error fetching data for ${token.symbol}:`, error)
      }
    }

    // Update token prices in database
    for (const update of priceUpdates) {
      const { error } = await supabaseClient
        .from('token_prices')
        .upsert(update, { onConflict: 'token_id' })

      if (error) {
        console.error('Error updating price:', error)
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        updated: priceUpdates.length,
        message: `Updated ${priceUpdates.length} token prices` 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error in update-token-prices function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
