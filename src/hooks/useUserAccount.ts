
import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { UserAccount } from '@/types/tokens'
import { useDemoUser } from './useDemoUser'

export const useUserAccount = () => {
  const [account, setAccount] = useState<UserAccount | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { createDemoUser, createDemoUserAccount, getDemoUser, getLocalAccount } = useDemoUser()

  useEffect(() => {
    fetchUserAccount()
  }, [])

  const fetchUserAccount = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      console.log('🔍 Fetching user account...')
      
      // First, check for local demo user
      const demoUser = getDemoUser()
      if (demoUser) {
        console.log('👤 Usuario demo local encontrado:', demoUser.userId)
        await handleDemoUserAccount(demoUser.userId)
        return
      }

      // Check for authenticated user in Supabase
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        console.log('👤 No hay usuario autenticado, creando usuario demo...')
        
        // Create demo user
        const result = await createDemoUser()
        if (!result || !result.userId) {
          setError('No se pudo crear usuario demo')
          return
        }
        
        // Handle the demo user account
        await handleDemoUserAccount(result.userId)
        return
      }

      console.log('👤 Usuario autenticado encontrado:', user.id)
      await handleAuthenticatedUserAccount(user.id)
      
    } catch (err) {
      console.error('❌ Error fetching account:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch account')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoUserAccount = async (userId: string) => {
    try {
      // First check if we have a local account
      const localAccount = getLocalAccount()
      if (localAccount && localAccount.user_id === userId) {
        console.log('✅ Usando cuenta demo local:', localAccount)
        setAccount(localAccount)
        return
      }

      // Try to fetch from database
      const { data, error } = await supabase
        .from('user_accounts')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // No account found, create one
          console.log('💳 No se encontró cuenta, creando una nueva...')
          const accountCreated = await createDemoUserAccount(userId)
          if (accountCreated) {
            // Retry fetching the account after a short delay
            setTimeout(() => {
              fetchUserAccount()
            }, 1000)
          } else {
            // Use local account as fallback
            const localAccount = getLocalAccount()
            if (localAccount) {
              setAccount(localAccount)
            } else {
              setError('No se pudo crear la cuenta')
            }
          }
          return
        }
        throw error
      }

      console.log('✅ Cuenta demo cargada desde base de datos:', data)
      setAccount(data)
    } catch (error) {
      console.error('❌ Error handling demo user account:', error)
      // Fallback to local account
      const localAccount = getLocalAccount()
      if (localAccount) {
        setAccount(localAccount)
      } else {
        setError('Error al cargar cuenta demo')
      }
    }
  }

  const handleAuthenticatedUserAccount = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_accounts')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // No account found, create one
          console.log('💳 No se encontró cuenta, creando una nueva...')
          const accountCreated = await createDemoUserAccount(userId)
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

      console.log('✅ Cuenta autenticada cargada:', data)
      setAccount(data)
    } catch (error) {
      console.error('❌ Error handling authenticated user account:', error)
      setError(error instanceof Error ? error.message : 'Error al cargar cuenta')
    }
  }

  return {
    account,
    isLoading,
    error,
    refetch: fetchUserAccount
  }
}
