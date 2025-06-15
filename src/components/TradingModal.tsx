import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { IndexToken } from '@/types/tokens'
import { MiniKit, tokenToDecimals, Tokens, PayCommandInput } from '@worldcoin/minikit-js'
import { useToast } from '@/hooks/use-toast'
import { useWorldVerification } from '@/hooks/useWorldVerification'
import { Sparkles, TrendingUp, Heart, Gift, Info, DollarSign, Coins, Shield } from 'lucide-react'

interface TradingModalProps {
  isOpen: boolean
  onClose: () => void
  token: IndexToken | null
  type: 'buy' | 'sell'
}

type PaymentToken = 'USDC' | 'WLD'

export const TradingModal = ({ isOpen, onClose, token, type }: TradingModalProps) => {
  const [amount, setAmount] = useState('')
  const [paymentToken, setPaymentToken] = useState<PaymentToken>('USDC')
  const [isProcessing, setIsProcessing] = useState(false)
  const { toast } = useToast()
  const { isVerified, nullifierHash } = useWorldVerification()

  if (!token) return null

  // Mock exchange rates (in a real app, these would come from an API)
  const wldToUsdRate = 2.45 // 1 WLD = $2.45 USD
  const usdcToUsdRate = 1.0  // 1 USDC = $1.00 USD

  const calculatePaymentAmount = () => {
    if (!amount) return 0
    const totalValue = parseFloat(amount) * token.currentPrice
    
    if (paymentToken === 'WLD') {
      return totalValue / wldToUsdRate
    }
    return totalValue / usdcToUsdRate
  }

  const handleTrade = async () => {
    // Extra security check
    if (!isVerified) {
      toast({
        title: "Verificación requerida 🔒",
        description: "Necesitas verificarte con World ID para realizar transacciones",
        variant: "destructive"
      })
      return
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "¡Oops! 😅",
        description: "Por favor ingresa una cantidad válida para empezar",
        variant: "destructive"
      })
      return
    }

    setIsProcessing(true)

    try {
      const paymentAmount = calculatePaymentAmount()

      if (type === 'buy') {
        const selectedToken = paymentToken === 'WLD' ? Tokens.WLD : Tokens.USDC
        
        const payload: PayCommandInput = {
          reference: `trade-${Date.now()}-${nullifierHash?.slice(0, 8)}`, // Include user verification in reference
          to: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
          tokens: [
            {
              symbol: selectedToken,
              token_amount: tokenToDecimals(paymentAmount, selectedToken).toString(),
            },
          ],
          description: `🎉 Comprar ${amount} tokens ${token.symbol} con ${paymentToken} (Usuario verificado)`,
        }

        if (MiniKit.isInstalled()) {
          const { finalPayload } = await MiniKit.commandsAsync.pay(payload)
          
          if (finalPayload.status === 'success') {
            toast({
              title: "¡Felicidades! 🎉",
              description: `¡Acabas de comprar ${amount} tokens ${token.symbol} con ${paymentToken}! Tu viaje de inversión ha comenzado 🚀`,
            })
            onClose()
          }
        }
      } else {
        toast({
          title: "¡Venta exitosa! 💰",
          description: `Has vendido ${amount} tokens ${token.symbol}. ¡Bien hecho!`,
        })
        onClose()
      }
    } catch (error) {
      toast({
        title: "Ups, algo salió mal 😔",
        description: "No te preocupes, inténtalo de nuevo en un momento",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const totalValue = amount ? (parseFloat(amount) * token.currentPrice).toFixed(2) : '0.00'
  const paymentAmount = calculatePaymentAmount()
  const potentialGrowth = amount ? (parseFloat(amount) * token.currentPrice * 1.08).toFixed(2) : '0.00'

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-white to-blue-50 border-2 border-blue-200">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            {type === 'buy' ? (
              <>
                <Gift className="w-6 h-6 text-green-600" />
                <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  ¡Comprar {token.symbol}!
                </span>
              </>
            ) : (
              <>
                <TrendingUp className="w-6 h-6 text-orange-600" />
                <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  Vender {token.symbol}
                </span>
              </>
            )}
            <div className="ml-auto flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
              <Shield className="w-3 h-3" />
              Verificado
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {type === 'buy' && (
            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border-2 border-green-200">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">¿Por qué es una buena idea? 💡</h4>
                  <p className="text-sm text-gray-700">
                    Estás invirtiendo en {token.name.split(' ')[2] || 'empresas'} establecidas. 
                    Históricamente, estos índices han crecido en promedio 8-10% anual. 
                    ¡Es como plantar una semilla para tu futuro! 🌱
                  </p>
                </div>
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="amount" className="text-base font-semibold text-gray-700">
              {type === 'buy' ? '💰 ¿Cuántos tokens quieres?' : '📦 ¿Cuántos tokens vendes?'}
            </Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Ej: 1, 2, 5..."
              className="mt-2 text-lg font-semibold border-2 border-blue-200 focus:border-blue-400 bg-white/70"
            />
          </div>

          {type === 'buy' && (
            <div>
              <Label className="text-base font-semibold text-gray-700 mb-3 block">
                💳 ¿Con qué token quieres pagar?
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant={paymentToken === 'USDC' ? 'default' : 'outline'}
                  onClick={() => setPaymentToken('USDC')}
                  className={`flex items-center gap-2 p-4 h-auto ${
                    paymentToken === 'USDC' 
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' 
                      : 'border-2 border-blue-200 hover:bg-blue-50'
                  }`}
                >
                  <DollarSign className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-semibold">USDC</div>
                    <div className="text-xs opacity-80">Moneda estable</div>
                  </div>
                </Button>
                <Button
                  variant={paymentToken === 'WLD' ? 'default' : 'outline'}
                  onClick={() => setPaymentToken('WLD')}
                  className={`flex items-center gap-2 p-4 h-auto ${
                    paymentToken === 'WLD' 
                      ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white' 
                      : 'border-2 border-purple-200 hover:bg-purple-50'
                  }`}
                >
                  <Coins className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-semibold">WLD</div>
                    <div className="text-xs opacity-80">Token de World</div>
                  </div>
                </Button>
              </div>
              <div className="mt-2 p-3 bg-gray-50 rounded-lg border">
                <p className="text-xs text-gray-600">
                  {paymentToken === 'USDC' 
                    ? 'USDC es una moneda estable equivalente al dólar. Ideal para mantener el valor.' 
                    : 'WLD es el token nativo de World. Úsalo para aprovechar tu ecosistema Worldcoin.'}
                </p>
              </div>
            </div>
          )}
          
          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border-2 border-blue-200 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">💵 Precio por token:</span>
              <span className="font-semibold text-gray-800">${token.currentPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">🧮 Valor total:</span>
              <span className="font-semibold text-gray-800">${totalValue}</span>
            </div>
            {type === 'buy' && amount && (
              <div className="flex justify-between text-base font-semibold border-t pt-2">
                <span className="text-gray-700">💳 Pagarás:</span>
                <span className="text-lg text-blue-600">
                  {paymentAmount.toFixed(paymentToken === 'WLD' ? 3 : 2)} {paymentToken}
                </span>
              </div>
            )}
            {type === 'buy' && amount && (
              <div className="flex justify-between text-sm bg-green-50 p-2 rounded-lg border border-green-200">
                <span className="text-gray-600 flex items-center gap-1">
                  <Sparkles className="w-4 h-4 text-yellow-500" />
                  Valor potencial en 1 año (8%):
                </span>
                <span className="font-semibold text-green-600">${potentialGrowth}</span>
              </div>
            )}
          </div>

          {type === 'buy' && (
            <div className="text-center p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
              <Heart className="w-8 h-8 text-red-500 mx-auto mb-2 animate-pulse" />
              <p className="text-sm font-medium text-gray-700">
                ¡Estás a un paso de tu primera inversión! 🎯
              </p>
            </div>
          )}
          
          <div className="flex gap-3 pt-2">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 border-2 border-gray-300 hover:bg-gray-50"
              disabled={isProcessing}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleTrade}
              className={`flex-1 font-semibold text-white transform hover:scale-105 transition-all duration-200 ${
                type === 'buy' 
                  ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-xl' 
                  : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-lg hover:shadow-xl'
              }`}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 animate-spin" />
                  Procesando...
                </div>
              ) : (
                `${type === 'buy' ? '🎉 ¡Comprar ahora!' : '💸 Vender ahora'}`
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
