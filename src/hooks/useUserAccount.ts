
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
        console.log('👤 Demo user found:', demoUser.userId)
        await handleDemoUserAccount(demoUser.userId)
        return
      }

      // Check for authenticated user in Supabase
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError) {
        console.log('⚠️ Auth error, creating demo user:', authError.message)
        await createAndHandleDemoUser()
        return
      }
      
      if (!user) {
        console.log('👤 No authenticated user, creating demo user...')
        await createAndHandleDemoUser()
        return
      }

      console.log('👤 Authenticated user found:', user.id)
      await handleAuthenticatedUserAccount(user.id)
      
    } catch (err) {
      console.error('❌ Error fetching account:', err)
      // Try to use local account as fallback
      const localAccount = getLocalAccount()
      if (localAccount) {
        console.log('🔄 Using local account as fallback')
        setAccount(localAccount)
      } else {
        setError('No se pudo cargar la cuenta')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const createAndHandleDemoUser = async () => {
    try {
      const result = await createDemoUser()
      if (result && result.userId) {
        await handleDemoUserAccount(result.userId)
      } else {
        throw new Error('Failed to create demo user')
      }
    } catch (error) {
      console.error('❌ Error creating demo user:', error)
      // Use local account as final fallback
      const localAccount = getLocalAccount()
      if (localAccount) {
        setAccount(localAccount)
      } else {
        setError('No se pudo crear usuario demo')
      }
    }
  }

  const handleDemoUserAccount = async (userId: string) => {
    try {
      // First check local account
      const localAccount = getLocalAccount()
      if (localAccount && localAccount.user_id === userId) {
        console.log('✅ Using local demo account:', localAccount)
        setAccount(localAccount)
        return
      }

      // Try to fetch from database (this might fail due to UUID format)
      console.log('🔍 Trying to fetch account from database for:', userId)
      
      // Since demo user IDs are not valid UUIDs, this will likely fail
      // We'll rely on local storage for demo accounts
      const localFallback = getLocalAccount()
      if (localFallback) {
        console.log('✅ Using local account fallback')
        setAccount(localFallback)
      } else {
        // Create new local account
        console.log('💳 Creating new local demo account...')
        const created = await createDemoUserAccount(userId)
        if (created) {
          const newLocalAccount = getLocalAccount()
          if (newLocalAccount) {
            setAccount(newLocalAccount)
          }
        }
      }
    } catch (error) {
      console.error('❌ Error handling demo account:', error)
      // Always fall back to local account for demo users
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
          console.log('💳 Creating new account for authenticated user...')
          const accountCreated = await createDemoUserAccount(userId)
          if (accountCreated) {
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

      console.log('✅ Authenticated account loaded:', data)
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
