
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
      
      console.log('🔍 Fetching tokens from database...')
      
      // First, let's try a simple query to get tokens
      const { data: tokensData, error: tokensError } = await supabase
        .from('index_tokens')
        .select('*')
        .eq('is_active', true)
        .order('symbol')

      if (tokensError) {
        console.error('❌ Error fetching tokens:', tokensError)
        throw tokensError
      }

      console.log('📊 Tokens fetched:', tokensData?.length || 0, tokensData)

      if (!tokensData || tokensData.length === 0) {
        console.log('⚠️ No tokens found in database')
        setTokens([])
        return
      }

      // Now get prices separately for each token
      const tokensWithPrices = await Promise.all(
        tokensData.map(async (token) => {
          const { data: priceData, error: priceError } = await supabase
            .from('token_prices')
            .select('*')
            .eq('token_id', token.id)
            .order('updated_at', { ascending: false })
            .limit(1)

          if (priceError) {
            console.error(`❌ Error fetching price for token ${token.symbol}:`, priceError)
            return {
              ...token,
              token_prices: []
            }
          }

          console.log(`💰 Price data for ${token.symbol}:`, priceData)
          
          return {
            ...token,
            token_prices: priceData || []
          }
        })
      )

      console.log('✅ Final tokens with prices:', tokensWithPrices)
      setTokens(tokensWithPrices)
    } catch (err) {
      console.error('❌ Error in fetchTokens:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch tokens')
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
