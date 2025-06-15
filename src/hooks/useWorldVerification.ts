
import { useState, useEffect } from 'react'
import { MiniKit, VerificationLevel, ISuccessResult } from '@worldcoin/minikit-js'

export interface WorldVerificationState {
  isVerified: boolean
  isVerifying: boolean
  error: string | null
  nullifierHash: string | null
}

export const useWorldVerification = () => {
  const [state, setState] = useState<WorldVerificationState>({
    isVerified: false,
    isVerifying: false,
    error: null,
    nullifierHash: null
  })

  // Check if user was previously verified (stored in localStorage)
  useEffect(() => {
    console.log('useWorldVerification - Checking localStorage for previous verification')
    const storedNullifier = localStorage.getItem('world_id_nullifier')
    console.log('useWorldVerification - Stored nullifier:', storedNullifier)
    
    if (storedNullifier) {
      console.log('useWorldVerification - Setting user as verified from localStorage')
      setState(prev => ({
        ...prev,
        isVerified: true,
        nullifierHash: storedNullifier
      }))
    } else {
      console.log('useWorldVerification - No previous verification found')
    }
  }, [])

  // Debug log when state changes
  useEffect(() => {
    console.log('useWorldVerification - State changed:', state)
  }, [state])

  const startVerification = async () => {
    console.log('useWorldVerification - Starting verification process')
    
    if (!MiniKit.isInstalled()) {
      console.log('useWorldVerification - MiniKit not installed')
      setState(prev => ({
        ...prev,
        error: 'World App no está instalada. Por favor, instala World App para continuar.'
      }))
      return
    }

    setState(prev => ({
      ...prev,
      isVerifying: true,
      error: null
    }))

    try {
      console.log('useWorldVerification - Calling MiniKit.commandsAsync.verify')
      const { finalPayload } = await MiniKit.commandsAsync.verify({
        action: 'trust-save',
        verification_level: VerificationLevel.Device
      })

      console.log('useWorldVerification - Verification response:', finalPayload)

      if (finalPayload.status === 'success') {
        const result = finalPayload as ISuccessResult
        console.log('useWorldVerification - Verification successful, storing in localStorage')
        
        // Store verification in localStorage for persistence
        localStorage.setItem('world_id_nullifier', result.nullifier_hash)
        
        setState(prev => ({
          ...prev,
          isVerified: true,
          isVerifying: false,
          nullifierHash: result.nullifier_hash
        }))
        
        console.log('useWorldVerification - State updated to verified')
      } else {
        console.log('useWorldVerification - Verification failed or cancelled')
        setState(prev => ({
          ...prev,
          isVerifying: false,
          error: 'Verificación cancelada o falló. Inténtalo de nuevo.'
        }))
      }
    } catch (error) {
      console.error('useWorldVerification - Error during verification:', error)
      setState(prev => ({
        ...prev,
        isVerifying: false,
        error: 'Error durante la verificación. Por favor, inténtalo de nuevo.'
      }))
    }
  }

  const resetVerification = () => {
    console.log('useWorldVerification - Resetting verification')
    localStorage.removeItem('world_id_nullifier')
    setState({
      isVerified: false,
      isVerifying: false,
      error: null,
      nullifierHash: null
    })
  }

  return {
    ...state,
    startVerification,
    resetVerification
  }
}
