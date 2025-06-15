
import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'

export const useDemoUser = () => {
  const [isCreatingDemoUser, setIsCreatingDemoUser] = useState(false)
  const [demoUserCreated, setDemoUserCreated] = useState(false)

  const createDemoUser = async () => {
    try {
      setIsCreatingDemoUser(true)
      console.log('🎭 Creando usuario demo...')

      // Try to sign up with a demo email
      const demoEmail = `demo_${Date.now()}@trustsave.demo`
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
        return false
      }

      console.log('✅ Usuario demo creado:', data.user?.id)
      setDemoUserCreated(true)
      return true
    } catch (error) {
      console.error('❌ Error en createDemoUser:', error)
      return false
    } finally {
      setIsCreatingDemoUser(false)
    }
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
        return false
      }

      console.log('✅ Cuenta demo creada con balances iniciales')
      return true
    } catch (error) {
      console.error('❌ Error en createDemoUserAccount:', error)
      return false
    }
  }

  return {
    createDemoUser,
    createDemoUserAccount,
    isCreatingDemoUser,
    demoUserCreated
  }
}
