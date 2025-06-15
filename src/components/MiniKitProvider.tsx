
'use client'

import { ReactNode, useEffect } from 'react'
import { MiniKit } from '@worldcoin/minikit-js'

export const MiniKitProvider = ({ children }: { children: ReactNode }) => {
  useEffect(() => {
    // Install MiniKit for World App integration
    MiniKit.install()
  }, [])

  return <>{children}</>
}
