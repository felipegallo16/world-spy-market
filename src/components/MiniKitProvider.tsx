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
    forceDevMode: () => void;
  }
}

export const MiniKitProvider = ({ children }: { children: ReactNode }) => {
  const { isVerified } = useWorldVerification()
  
  // Detección mejorada del entorno de desarrollo incluyendo Lovable
  const isDevelopment = (() => {
    const hostname = window.location.hostname
    const port = window.location.port
    const protocol = window.location.protocol
    const fullUrl = window.location.href
    
    // Hostnames de desarrollo
    const devHostnames = ['localhost', '127.0.0.1', '0.0.0.0']
    
    // Puertos comunes de desarrollo
    const devPorts = ['3000', '5173', '8080', '4000', '8000', '5000', '3001']
    
    // Dominios de Lovable (entornos de preview)
    const lovableDomains = [
      '.lovableproject.com',
      '.lovable.app',
      'lovable.dev',
      'preview-',
      'staging-'
    ]
    
    // Verificar si es un dominio de Lovable
    const isLovableDomain = lovableDomains.some(domain => 
      hostname.includes(domain) || fullUrl.includes(domain)
    )
    
    // Es desarrollo si:
    // 1. Hostname es de desarrollo tradicional
    // 2. O si usa un puerto de desarrollo
    // 3. O si el protocolo no es https (excepto para producción real)
    // 4. O si es un dominio de Lovable
    // 5. O si está forzado por localStorage
    const isDevHostname = devHostnames.includes(hostname)
    const isDevPort = devPorts.includes(port)
    const isDevProtocol = protocol === 'http:' && !hostname.includes('.com')
    const isForcedDev = localStorage.getItem('force_dev_mode') === 'true'
    
    const isDev = isDevHostname || isDevPort || isDevProtocol || isLovableDomain || isForcedDev
    
    console.log('🔍 DETECCIÓN DE ENTORNO DE DESARROLLO (EXPANDIDA):', {
      hostname,
      port,
      protocol,
      fullUrl,
      isDevHostname,
      isDevPort,
      isDevProtocol,
      isLovableDomain,
      isForcedDev,
      finalResult: isDev,
      detectedAs: isDev ? 'DEVELOPMENT' : 'PRODUCTION'
    })
    
    if (isLovableDomain) {
      console.log('🎯 DOMINIO DE LOVABLE DETECTADO - Activando modo desarrollo automáticamente')
    }
    
    return isDev
  })()
  
  // En desarrollo, activar bypass automáticamente
  const [devBypassMode, setDevBypassMode] = useState(() => {
    if (!isDevelopment) return false
    
    // Auto-activar bypass en desarrollo
    const autoBypass = true
    if (autoBypass) {
      localStorage.setItem('dev_bypass_world_id', 'true')
      console.log('🚀 MODO DESARROLLO: Auto-activando bypass de World ID')
    }
    
    return autoBypass
  })

  // Configurar funciones globales para debugging mejoradas
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.toggleWorldIdBypass = () => {
        const newState = !devBypassMode
        setDevBypassMode(newState)
        localStorage.setItem('dev_bypass_world_id', newState.toString())
        console.log(`🔄 Bypass toggled via console: ${newState}`)
        console.log('ℹ️ Refresca la página si no ves los cambios inmediatamente')
      }
      
      window.checkWorldIdStatus = () => {
        console.log('🔍 ESTADO COMPLETO DE WORLD ID:', {
          currentUrl: window.location.href,
          hostname: window.location.hostname,
          isDevelopment,
          devBypassMode,
          isVerified,
          shouldShowApp: isVerified || (isDevelopment && devBypassMode),
          localStorage: {
            dev_bypass_world_id: localStorage.getItem('dev_bypass_world_id'),
            world_id_nullifier: localStorage.getItem('world_id_nullifier'),
            force_dev_mode: localStorage.getItem('force_dev_mode')
          }
        })
      }
      
      window.forceDevMode = () => {
        localStorage.setItem('force_dev_mode', 'true')
        localStorage.setItem('dev_bypass_world_id', 'true')
        console.log('🚀 MODO DESARROLLO FORZADO - Refresca la página')
        window.location.reload()
      }
      
      console.log('🎛️ COMANDOS DE DESARROLLO DISPONIBLES:')
      console.log('   - window.toggleWorldIdBypass() - Alternar bypass')
      console.log('   - window.checkWorldIdStatus() - Ver estado completo')
      console.log('   - window.forceDevMode() - Forzar modo desarrollo y bypass')
      console.log('')
      console.log('🔧 BYPASS MANUAL DE EMERGENCIA:')
      console.log('   localStorage.setItem("dev_bypass_world_id", "true")')
      console.log('   window.location.reload()')
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        delete window.toggleWorldIdBypass
        delete window.checkWorldIdStatus
        delete window.forceDevMode
      }
    }
  }, [devBypassMode, isVerified, isDevelopment])

  useEffect(() => {
    console.log('MiniKitProvider - Installing MiniKit')
    // Install MiniKit for World App integration with the provided app_id
    MiniKit.install('app_45ecc6de80e49604d8cdb05211e9df82')
  }, [])

  useEffect(() => {
    console.log('📊 ESTADO ACTUAL DE MiniKitProvider:', {
      isVerified,
      isDevelopment,
      devBypassMode,
      shouldShowApp: isVerified || (isDevelopment && devBypassMode),
      url: window.location.href
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
    console.log('📋 MiniKitProvider - Mostrando pantalla de verificación')
    return (
      <div>
        {/* Panel de desarrollo solo en modo no-bypass */}
        {isDevelopment && (
          <div className="fixed top-4 right-4 z-50 bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 shadow-xl max-w-xs">
            <div className="flex items-center gap-2 mb-3">
              <Bug className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-bold text-yellow-800">MODO DESARROLLO</span>
            </div>
            
            <div className="text-xs text-yellow-700 mb-3 space-y-1">
              <div>Host: {window.location.hostname}</div>
              <div>Puerto: {window.location.port || 'default'}</div>
              <div>Bypass: {devBypassMode ? '✅ ACTIVO' : '❌ INACTIVO'}</div>
              <div>Verificado: {isVerified ? '✅ SÍ' : '❌ NO'}</div>
            </div>
            
            <Button
              onClick={toggleDevBypass}
              variant="default"
              size="sm"
              className="w-full text-xs mb-2"
            >
              <Eye className="w-3 h-3 mr-1" />
              Saltar World ID
            </Button>
            
            <div className="text-xs text-yellow-600 text-center">
              <div>🚀 Auto-bypass activado en desarrollo</div>
            </div>
          </div>
        )}
        <WorldVerificationScreen />
      </div>
    )
  }

  // Show main app only if verified or in dev bypass mode
  console.log('✅ MiniKitProvider - Mostrando aplicación principal')
  return (
    <div>
      {/* Indicador de estado en desarrollo - menos prominente */}
      {isDevelopment && (
        <div className="fixed top-4 right-4 z-50 bg-green-50 border-2 border-green-300 rounded-lg p-3 shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-xs font-semibold text-green-800">
              MODO DESARROLLO
            </span>
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
