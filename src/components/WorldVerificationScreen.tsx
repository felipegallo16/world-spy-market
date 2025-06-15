
import { Button } from '@/components/ui/button'
import { useWorldVerification } from '@/hooks/useWorldVerification'
import { Shield, Sparkles, Users, Lock, CheckCircle, AlertCircle } from 'lucide-react'
import { useEffect } from 'react'

export const WorldVerificationScreen = () => {
  const { startVerification, isVerifying, error, isVerified } = useWorldVerification()

  // Debug logs para diagnosticar el problema
  useEffect(() => {
    console.log('WorldVerificationScreen - Estado actual:', {
      isVerified,
      isVerifying,
      error,
      localStorage: localStorage.getItem('world_id_nullifier')
    })
  }, [isVerified, isVerifying, error])

  // Si el usuario ya está verificado, este componente no debería renderizarse
  // pero agregamos este log para debugging
  if (isVerified) {
    console.log('Usuario verificado, pero WorldVerificationScreen aún se está renderizando')
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            ¡Bienvenido a Ahorro Inteligente!
          </h1>
          <p className="text-gray-600 mt-2 font-medium">
            Tu plataforma de inversión segura y confiable
          </p>
        </div>

        {/* Why verification card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-blue-200 p-6 space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-6 h-6 text-yellow-500" />
            <h2 className="text-xl font-semibold text-gray-800">¿Por qué verificarte?</h2>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-blue-600 mt-1" />
              <div>
                <p className="font-semibold text-gray-800">Solo humanos reales</p>
                <p className="text-sm text-gray-600">Protegemos la plataforma de bots y cuentas falsas</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-green-600 mt-1" />
              <div>
                <p className="font-semibold text-gray-800">Máxima seguridad</p>
                <p className="text-sm text-gray-600">Tu identidad permanece privada y anónima</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-purple-600 mt-1" />
              <div>
                <p className="font-semibold text-gray-800">Confianza total</p>
                <p className="text-sm text-gray-600">Cada usuario es único y verificado por World ID</p>
              </div>
            </div>
          </div>
        </div>

        {/* Verification process */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl border-2 border-green-200 p-6">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-600" />
            Proceso súper fácil:
          </h3>
          <ol className="text-sm text-gray-700 space-y-2">
            <li className="flex items-center gap-2">
              <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">1</span>
              Haz clic en "Verificarme con World ID"
            </li>
            <li className="flex items-center gap-2">
              <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">2</span>
              Escanea el código QR con World App
            </li>
            <li className="flex items-center gap-2">
              <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">3</span>
              ¡Listo! Ya puedes invertir de forma segura
            </li>
          </ol>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <p className="font-semibold text-red-800">Error de verificación</p>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
        )}

        {/* Verification button */}
        <Button
          onClick={startVerification}
          disabled={isVerifying}
          className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          {isVerifying ? (
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 animate-spin" />
              Verificando...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              ✨ Verificarme con World ID
            </div>
          )}
        </Button>

        {/* Privacy note */}
        <div className="text-center text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
          🔒 Tu privacidad está protegida. World ID verifica que eres humano sin revelar tu identidad.
        </div>
      </div>
    </div>
  )
}
