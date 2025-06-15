
import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { UserPortfolio } from '@/types/tokens'

export const usePortfolio = () => {
  const [portfolio, setPortfolio] = useState<UserPortfolio[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPortfolio()
  }, [])

  const fetchPortfolio = async () => {
    try {
      setIsLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setError('User not authenticated')
        return
      }

      const { data, error } = await supabase
        .from('user_portfolios')
        .select(`
          *,
          index_tokens (
            symbol,
            name,
            description,
            index_type
          ),
          token_prices:index_tokens!inner (
            token_prices (
              price_usd,
              change_24h,
              change_percent_24h
            )
          )
        `)
        .eq('user_id', user.id)
        .gt('quantity', 0)

      if (error) {
        throw error
      }

      setPortfolio(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch portfolio')
    } finally {
      setIsLoading(false)
    }
  }

  return {
    portfolio,
    isLoading,
    error,
    refetch: fetchPortfolio
  }
}
