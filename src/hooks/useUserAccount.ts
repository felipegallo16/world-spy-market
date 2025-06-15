
import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { UserAccount } from '@/types/tokens'
import { useDemoUser } from './useDemoUser'

export const useUserAccount = () => {
  const [account, setAccount] = useState<UserAccount | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { createDemoUser, createDemoUserAccount } = useDemoUser()

  useEffect(() => {
    fetchUserAccount()
  }, [])

  const fetchUserAccount = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      console.log('🔍 Fetching user account...')
      
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        console.log('👤 No hay usuario autenticado, creando usuario demo...')
        
        // Create demo user for development
        const success = await createDemoUser()
        if (!success) {
          setError('No se pudo crear usuario demo')
          return
        }
        
        // Wait a bit for the user to be created and then try again
        setTimeout(() => {
          fetchUserAccount()
        }, 2000)
        return
      }

      console.log('👤 Usuario encontrado:', user.id)

      const { data, error } = await supabase
        .from('user_accounts')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // No account found, create one
          console.log('💳 No se encontró cuenta, creando una nueva...')
          const accountCreated = await createDemoUserAccount(user.id)
          if (accountCreated) {
            // Retry fetching the account
            setTimeout(() => {
              fetchUserAccount()
            }, 1000)
          } else {
            setError('No se pudo crear la cuenta')
          }
          return
        }
        throw error
      }

      console.log('✅ Cuenta cargada:', data)
      setAccount(data)
    } catch (err) {
      console.error('❌ Error fetching account:', err)
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
