
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
    const storedNullifier = localStorage.getItem('world_id_nullifier')
    if (storedNullifier) {
      setState(prev => ({
        ...prev,
        isVerified: true,
        nullifierHash: storedNullifier
      }))
    }
  }, [])

  const startVerification = async () => {
    if (!MiniKit.isInstalled()) {
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
      const { finalPayload } = await MiniKit.commandsAsync.verify({
        action: 'trust-save',
        verification_level: VerificationLevel.Orb
      })

      if (finalPayload.status === 'success') {
        const result = finalPayload as ISuccessResult
        // Store verification in localStorage for persistence
        localStorage.setItem('world_id_nullifier', result.nullifier_hash)
        
        setState(prev => ({
          ...prev,
          isVerified: true,
          isVerifying: false,
          nullifierHash: result.nullifier_hash
        }))
      } else {
        setState(prev => ({
          ...prev,
          isVerifying: false,
          error: 'Verificación cancelada o falló. Inténtalo de nuevo.'
        }))
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isVerifying: false,
        error: 'Error durante la verificación. Por favor, inténtalo de nuevo.'
      }))
    }
  }

  const resetVerification = () => {
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
