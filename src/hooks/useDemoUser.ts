
import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'

export const useDemoUser = () => {
  const [isCreatingDemoUser, setIsCreatingDemoUser] = useState(false)
  const [demoUserCreated, setDemoUserCreated] = useState(false)

  // Check if we're in development mode
  const isDevelopment = () => {
    const hostname = window.location.hostname
    const isDev = hostname === 'localhost' || 
                  hostname === '127.0.0.1' || 
                  hostname.includes('lovable') ||
                  hostname.includes('preview-') ||
                  window.location.port !== ''
    
    console.log('🔍 Environment check:', { hostname, isDev })
    return isDev
  }

  const createDemoUser = async () => {
    try {
      setIsCreatingDemoUser(true)
      console.log('🎭 Iniciando creación de usuario demo...')

      // In development, create a local demo session
      if (isDevelopment()) {
        console.log('🚀 Modo desarrollo detectado - usando sesión local')
        
        // Create a fake user session in localStorage
        const demoUserId = `demo_user_${Date.now()}`
        const demoSession = {
          user: {
            id: demoUserId,
            email: `demo_${Date.now()}@example.com`,
            is_demo: true,
            created_at: new Date().toISOString()
          },
          access_token: 'demo_token',
          expires_at: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
        }

        localStorage.setItem('demo_session', JSON.stringify(demoSession))
        localStorage.setItem('demo_user_id', demoUserId)
        
        console.log('✅ Sesión demo creada localmente:', demoUserId)
        setDemoUserCreated(true)
        return { userId: demoUserId, session: demoSession }
      }

      // Fallback: try with a valid email domain for production
      const demoEmail = `demo_${Date.now()}@example.com`
      const demoPassword = 'demo123456789'

      const { data, error } = await supabase.auth.signUp({
        email: demoEmail,
        password: demoPassword,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            is_demo: true
          }
        }
      })

      if (error) {
        console.error('❌ Error creating demo user:', error)
        // If Supabase fails, fall back to localStorage approach
        return await createLocalDemoUser()
      }

      console.log('✅ Usuario demo creado en Supabase:', data.user?.id)
      setDemoUserCreated(true)
      return { userId: data.user?.id, session: data.session }
    } catch (error) {
      console.error('❌ Error en createDemoUser:', error)
      // Fallback to local demo user
      return await createLocalDemoUser()
    } finally {
      setIsCreatingDemoUser(false)
    }
  }

  const createLocalDemoUser = async () => {
    console.log('🔄 Fallback: Creando usuario demo local...')
    
    const demoUserId = `demo_user_${Date.now()}`
    const demoSession = {
      user: {
        id: demoUserId,
        email: `demo_${Date.now()}@example.com`,
        is_demo: true,
        created_at: new Date().toISOString()
      },
      access_token: 'demo_token',
      expires_at: Date.now() + (24 * 60 * 60 * 1000)
    }

    localStorage.setItem('demo_session', JSON.stringify(demoSession))
    localStorage.setItem('demo_user_id', demoUserId)
    
    setDemoUserCreated(true)
    return { userId: demoUserId, session: demoSession }
  }

  const getDemoUser = () => {
    const demoSession = localStorage.getItem('demo_session')
    const demoUserId = localStorage.getItem('demo_user_id')
    
    if (demoSession && demoUserId) {
      try {
        const session = JSON.parse(demoSession)
        if (session.expires_at > Date.now()) {
          return { userId: demoUserId, session }
        }
      } catch (error) {
        console.error('Error parsing demo session:', error)
      }
    }
    
    return null
  }

  const createDemoUserAccount = async (userId: string) => {
    try {
      console.log('💰 Creando cuenta demo con balances iniciales...')
      
      // Create user account with initial balances
      const { error } = await supabase
        .from('user_accounts')
        .upsert({
          user_id: userId,
          wld_balance: 100.0,
          usdc_balance: 1000.0,
          total_deposited_wld: 100.0,
          total_deposited_usdc: 1000.0,
          total_withdrawn_wld: 0.0,
          total_withdrawn_usdc: 0.0
        })

      if (error) {
        console.error('❌ Error creating demo account:', error)
        
        // If database fails, store account in localStorage
        const localAccount = {
          user_id: userId,
          wld_balance: 100.0,
          usdc_balance: 1000.0,
          total_deposited_wld: 100.0,
          total_deposited_usdc: 1000.0,
          total_withdrawn_wld: 0.0,
          total_withdrawn_usdc: 0.0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        
        localStorage.setItem('demo_account', JSON.stringify(localAccount))
        console.log('✅ Cuenta demo guardada localmente')
        return true
      }

      console.log('✅ Cuenta demo creada en base de datos')
      return true
    } catch (error) {
      console.error('❌ Error en createDemoUserAccount:', error)
      return false
    }
  }

  const getLocalAccount = () => {
    const localAccount = localStorage.getItem('demo_account')
    if (localAccount) {
      try {
        return JSON.parse(localAccount)
      } catch (error) {
        console.error('Error parsing local account:', error)
      }
    }
    return null
  }

  return {
    createDemoUser,
    createDemoUserAccount,
    getDemoUser,
    getLocalAccount,
    isCreatingDemoUser,
    demoUserCreated
  }
}
