
'use client'

import { ReactNode, useEffect } from 'react'
import { MiniKit } from '@worldcoin/minikit-js'
import { useWorldVerification } from '@/hooks/useWorldVerification'
import { WorldVerificationScreen } from '@/components/WorldVerificationScreen'

export const MiniKitProvider = ({ children }: { children: ReactNode }) => {
  const { isVerified } = useWorldVerification()

  useEffect(() => {
    // Install MiniKit for World App integration
    MiniKit.install()
  }, [])

  // Show verification screen if user is not verified
  if (!isVerified) {
    return <WorldVerificationScreen />
  }

  // Show main app only if verified
  return <>{children}</>
}
