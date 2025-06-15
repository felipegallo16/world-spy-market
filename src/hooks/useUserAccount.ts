
import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { UserAccount } from '@/types/tokens'

export const useUserAccount = () => {
  const [account, setAccount] = useState<UserAccount | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchUserAccount()
  }, [])

  const fetchUserAccount = async () => {
    try {
      setIsLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setError('User not authenticated')
        return
      }

      const { data, error } = await supabase
        .from('user_accounts')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error) {
        throw error
      }

      setAccount(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch account')
    } finally {
      setIsLoading(false)
    }
  }

  return {
    account,
    isLoading,
    error,
    refetch: fetchUserAccount
  }
}
