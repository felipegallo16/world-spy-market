
'use client'

import { ReactNode, useEffect, useState } from 'react'
import { MiniKit } from '@worldcoin/minikit-js'
import { useWorldVerification } from '@/hooks/useWorldVerification'
import { WorldVerificationScreen } from '@/components/WorldVerificationScreen'
import { Button } from '@/components/ui/button'
import { Eye, EyeOff } from 'lucide-react'

export const MiniKitProvider = ({ children }: { children: ReactNode }) => {
  const { isVerified } = useWorldVerification()
  
  // Detectar si estamos en desarrollo local
  const isDevelopment = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1' ||
                       window.location.port === '8080'
  
  // Estado para el modo bypass de desarrollo
  const [devBypassMode, setDevBypassMode] = useState(() => {
    if (!isDevelopment) return false
    return localStorage.getItem('dev_bypass_world_id') === 'true'
  })

  useEffect(() => {
    console.log('MiniKitProvider - Installing MiniKit')
    // Install MiniKit for World App integration with the provided app_id
    MiniKit.install('app_45ecc6de80e49604d8cdb05211e9df82')
  }, [])

  useEffect(() => {
    console.log('MiniKitProvider - isVerified changed:', isVerified)
    console.log('MiniKitProvider - isDevelopment:', isDevelopment)
    console.log('MiniKitProvider - devBypassMode:', devBypassMode)
  }, [isVerified, devBypassMode])

  // Función para alternar el modo bypass
  const toggleDevBypass = () => {
    const newBypassMode = !devBypassMode
    setDevBypassMode(newBypassMode)
    localStorage.setItem('dev_bypass_world_id', newBypassMode.toString())
  }

  // Si estamos en desarrollo y el bypass está activado, o si el usuario está verificado, mostrar la app
  const shouldShowApp = isVerified || (isDevelopment && devBypassMode)

  if (!shouldShowApp) {
    console.log('MiniKitProvider - Showing verification screen')
    return (
      <div>
        {/* Toggle de desarrollo solo en localhost */}
        {isDevelopment && (
          <div className="fixed top-4 right-4 z-50 bg-yellow-100 border-2 border-yellow-400 rounded-lg p-3 shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-semibold text-yellow-800">MODO DESARROLLO</span>
            </div>
            <Button
              onClick={toggleDevBypass}
              variant="outline"
              size="sm"
              className="w-full text-xs"
            >
              {devBypassMode ? (
                <>
                  <EyeOff className="w-3 h-3 mr-1" />
                  Activar World ID
                </>
              ) : (
                <>
                  <Eye className="w-3 h-3 mr-1" />
                  Omitir World ID
                </>
              )}
            </Button>
          </div>
        )}
        <WorldVerificationScreen />
      </div>
    )
  }

  // Show main app only if verified or in dev bypass mode
  console.log('MiniKitProvider - Showing main app')
  return (
    <div>
      {/* Indicador de modo bypass en desarrollo */}
      {isDevelopment && devBypassMode && (
        <div className="fixed top-4 right-4 z-50 bg-green-100 border-2 border-green-400 rounded-lg p-3 shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-xs font-semibold text-green-800">BYPASS ACTIVO</span>
          </div>
          <Button
            onClick={toggleDevBypass}
            variant="outline"
            size="sm"
            className="w-full text-xs"
          >
            <EyeOff className="w-3 h-3 mr-1" />
            Activar World ID
          </Button>
        </div>
      )}
      {children}
    </div>
  )
}
