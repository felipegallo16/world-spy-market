
'use client'

import { ReactNode, useEffect, useState } from 'react'
import { MiniKit } from '@worldcoin/minikit-js'
import { useWorldVerification } from '@/hooks/useWorldVerification'
import { WorldVerificationScreen } from '@/components/WorldVerificationScreen'
import { Button } from '@/components/ui/button'
import { Eye, EyeOff, Bug } from 'lucide-react'

// Función global para debugging desde la consola
declare global {
  interface Window {
    toggleWorldIdBypass: () => void;
    checkWorldIdStatus: () => void;
  }
}

export const MiniKitProvider = ({ children }: { children: ReactNode }) => {
  const { isVerified } = useWorldVerification()
  
  // Detección mejorada del entorno de desarrollo
  const isDevelopment = (() => {
    const hostname = window.location.hostname
    const port = window.location.port
    const protocol = window.location.protocol
    
    // Hostnames de desarrollo
    const devHostnames = ['localhost', '127.0.0.1', '0.0.0.0']
    
    // Puertos comunes de desarrollo
    const devPorts = ['3000', '5173', '8080', '4000', '8000', '5000', '3001']
    
    // Es desarrollo si:
    // 1. Hostname es de desarrollo
    // 2. O si usa un puerto de desarrollo
    // 3. O si el protocolo no es https (excepto para producción real)
    const isDevHostname = devHostnames.includes(hostname)
    const isDevPort = devPorts.includes(port)
    const isDevProtocol = protocol === 'http:' && !hostname.includes('.com')
    
    const isDev = isDevHostname || isDevPort || isDevProtocol
    
    console.log('🔍 Detección de entorno de desarrollo:', {
      hostname,
      port,
      protocol,
      isDevHostname,
      isDevPort,
      isDevProtocol,
      finalResult: isDev
    })
    
    return isDev
  })()
  
  // Estado para el modo bypass de desarrollo
  const [devBypassMode, setDevBypassMode] = useState(() => {
    if (!isDevelopment) return false
    const stored = localStorage.getItem('dev_bypass_world_id') === 'true'
    console.log('🔧 Estado inicial del bypass:', stored)
    return stored
  })

  // Configurar funciones globales para debugging
  useEffect(() => {
    if (isDevelopment) {
      window.toggleWorldIdBypass = () => {
        const newState = !devBypassMode
        setDevBypassMode(newState)
        localStorage.setItem('dev_bypass_world_id', newState.toString())
        console.log(`🔄 Bypass toggled via console: ${newState}`)
      }
      
      window.checkWorldIdStatus = () => {
        console.log('🔍 Estado actual de World ID:', {
          isDevelopment,
          devBypassMode,
          isVerified,
          shouldShowApp: isVerified || (isDevelopment && devBypassMode),
          localStorage: localStorage.getItem('dev_bypass_world_id')
        })
      }
      
      console.log('🎛️ Comandos de desarrollo disponibles:')
      console.log('   - window.toggleWorldIdBypass() - Alternar bypass')
      console.log('   - window.checkWorldIdStatus() - Ver estado actual')
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        delete window.toggleWorldIdBypass
        delete window.checkWorldIdStatus
      }
    }
  }, [devBypassMode, isVerified, isDevelopment])

  useEffect(() => {
    console.log('MiniKitProvider - Installing MiniKit')
    // Install MiniKit for World App integration with the provided app_id
    MiniKit.install('app_45ecc6de80e49604d8cdb05211e9df82')
  }, [])

  useEffect(() => {
    console.log('📊 Estado de MiniKitProvider:', {
      isVerified,
      isDevelopment,
      devBypassMode,
      shouldShowApp: isVerified || (isDevelopment && devBypassMode)
    })
  }, [isVerified, devBypassMode, isDevelopment])

  // Función para alternar el modo bypass
  const toggleDevBypass = () => {
    const newBypassMode = !devBypassMode
    setDevBypassMode(newBypassMode)
    localStorage.setItem('dev_bypass_world_id', newBypassMode.toString())
    console.log(`🔄 Bypass toggled: ${newBypassMode}`)
  }

  // Si estamos en desarrollo y el bypass está activado, o si el usuario está verificado, mostrar la app
  const shouldShowApp = isVerified || (isDevelopment && devBypassMode)

  if (!shouldShowApp) {
    console.log('📋 MiniKitProvider - Showing verification screen')
    return (
      <div>
        {/* Panel de desarrollo mejorado */}
        {isDevelopment && (
          <div className="fixed top-4 right-4 z-50 bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 shadow-xl max-w-xs">
            <div className="flex items-center gap-2 mb-3">
              <Bug className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-bold text-yellow-800">MODO DESARROLLO</span>
            </div>
            
            <div className="text-xs text-yellow-700 mb-3 space-y-1">
              <div>Host: {window.location.hostname}</div>
              <div>Puerto: {window.location.port || 'default'}</div>
              <div>Bypass: {devBypassMode ? 'ACTIVO' : 'INACTIVO'}</div>
            </div>
            
            <Button
              onClick={toggleDevBypass}
              variant={devBypassMode ? "destructive" : "default"}
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
            
            <div className="text-xs text-yellow-600 mt-2 text-center">
              Console: toggleWorldIdBypass()
            </div>
          </div>
        )}
        <WorldVerificationScreen />
      </div>
    )
  }

  // Show main app only if verified or in dev bypass mode
  console.log('✅ MiniKitProvider - Showing main app')
  return (
    <div>
      {/* Indicador de modo bypass en desarrollo - siempre visible en desarrollo */}
      {isDevelopment && (
        <div className={`fixed top-4 right-4 z-50 rounded-lg p-3 shadow-lg border-2 ${
          devBypassMode 
            ? 'bg-green-50 border-green-300' 
            : 'bg-blue-50 border-blue-300'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-2 h-2 rounded-full ${
              devBypassMode ? 'bg-green-500' : 'bg-blue-500'
            }`}></div>
            <span className={`text-xs font-semibold ${
              devBypassMode ? 'text-green-800' : 'text-blue-800'
            }`}>
              {devBypassMode ? 'BYPASS ACTIVO' : 'WORLD ID ACTIVO'}
            </span>
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
      {children}
    </div>
  )
}
