import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { IndexToken } from '@/types/tokens'

export const useTokens = () => {
  const [tokens, setTokens] = useState<IndexToken[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchTokens()
  }, [])

  const fetchTokens = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      console.log('🔍 Fetching tokens with prices...')
      
      // Single query with JOIN to get tokens and their latest prices
      const { data: tokensData, error: tokensError } = await supabase
        .from('index_tokens')
        .select(`
          *,
          token_prices (
            id,
            price_usd,
            change_24h,
            change_percent_24h,
            market_cap,
            volume_24h,
            updated_at
          )
        `)
        .eq('is_active', true)
        .order('symbol')

      if (tokensError) {
        console.error('❌ Error fetching tokens:', tokensError)
        throw new Error(`Database error: ${tokensError.message}`)
      }

      console.log('📊 Raw tokens data:', tokensData)

      if (!tokensData || tokensData.length === 0) {
        console.log('⚠️ No active tokens found in database')
        setTokens([])
        return
      }

      // Process the data and get the latest price for each token
      const processedTokens = tokensData.map(token => {
        const prices = token.token_prices || []
        // Sort by updated_at to get the latest price
        const latestPrice = prices.sort((a, b) => 
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        )[0]

        console.log(`💰 Token ${token.symbol}:`, {
          totalPrices: prices.length,
          latestPrice: latestPrice ? {
            price: latestPrice.price_usd,
            updated: latestPrice.updated_at
          } : 'No price found'
        })

        return {
          ...token,
          token_prices: latestPrice ? [latestPrice] : []
        }
      })

      console.log('✅ Processed tokens:', processedTokens.length)
      setTokens(processedTokens)
    } catch (err) {
      console.error('❌ Error in fetchTokens:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch tokens'
      setError(errorMessage)
      
      // Don't leave empty array on error, keep previous data if any
      if (tokens.length === 0) {
        setTokens([])
      }
    } finally {
      setIsLoading(false)
    }
  }

  const updatePrices = async () => {
    try {
      console.log('🔄 Updating token prices...')
      const { data, error } = await supabase.functions.invoke('update-token-prices')
      
      if (error) {
        console.error('❌ Error updating prices:', error)
        throw error
      }

      console.log('✅ Prices updated successfully:', data)
      // Refetch tokens after price update
      await fetchTokens()
      
      return data
    } catch (err) {
      console.error('❌ Failed to update prices:', err)
      throw err
    }
  }

  return {
    tokens,
    isLoading,
    error,
    refetch: fetchTokens,
    updatePrices
  }
}
