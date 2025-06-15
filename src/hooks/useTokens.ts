
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
      
      const { data, error } = await supabase
        .from('index_tokens')
        .select(`
          *,
          token_prices (
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

      if (error) {
        throw error
      }

      setTokens(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tokens')
    } finally {
      setIsLoading(false)
    }
  }

  const updatePrices = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('update-token-prices')
      
      if (error) {
        throw error
      }

      // Refetch tokens after price update
      await fetchTokens()
      
      return data
    } catch (err) {
      console.error('Failed to update prices:', err)
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
