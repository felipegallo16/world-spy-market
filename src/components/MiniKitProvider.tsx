
'use client'

import { ReactNode, useEffect } from 'react'
import { MiniKit } from '@worldcoin/minikit-js'
import { useWorldVerification } from '@/hooks/useWorldVerification'
import { WorldVerificationScreen } from '@/components/WorldVerificationScreen'

export const MiniKitProvider = ({ children }: { children: ReactNode }) => {
  const { isVerified } = useWorldVerification()

  useEffect(() => {
    console.log('MiniKitProvider - Installing MiniKit')
    // Install MiniKit for World App integration with the provided app_id
    MiniKit.install('app_45ecc6de80e49604d8cdb05211e9df82')
  }, [])

  useEffect(() => {
    console.log('MiniKitProvider - isVerified changed:', isVerified)
  }, [isVerified])

  // Show verification screen if user is not verified
  if (!isVerified) {
    console.log('MiniKitProvider - Showing verification screen')
    return <WorldVerificationScreen />
  }

  // Show main app only if verified
  console.log('MiniKitProvider - Showing main app')
  return <>{children}</>
}
