
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { IndexToken } from '@/types/tokens'
import { MiniKit, tokenToDecimals, Tokens, PayCommandInput } from '@worldcoin/minikit-js'
import { useToast } from '@/hooks/use-toast'

interface TradingModalProps {
  isOpen: boolean
  onClose: () => void
  token: IndexToken | null
  type: 'buy' | 'sell'
}

export const TradingModal = ({ isOpen, onClose, token, type }: TradingModalProps) => {
  const [amount, setAmount] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const { toast } = useToast()

  if (!token) return null

  const handleTrade = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount",
        variant: "destructive"
      })
      return
    }

    setIsProcessing(true)

    try {
      const totalValue = parseFloat(amount) * token.currentPrice

      if (type === 'buy') {
        // Initiate payment using MiniKit Pay command
        const payload: PayCommandInput = {
          reference: `trade-${Date.now()}`,
          to: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', // Replace with your contract address
          tokens: [
            {
              symbol: Tokens.USDCE,
              token_amount: tokenToDecimals(totalValue, Tokens.USDCE).toString(),
            },
          ],
          description: `Buy ${amount} ${token.symbol} tokens`,
        }

        if (MiniKit.isInstalled()) {
          const { finalPayload } = await MiniKit.commandsAsync.pay(payload)
          
          if (finalPayload.status === 'success') {
            toast({
              title: "Purchase Successful!",
              description: `Successfully bought ${amount} ${token.symbol} tokens`,
            })
            onClose()
          }
        }
      } else {
        // Handle sell logic here
        toast({
          title: "Sell Order Placed",
          description: `Successfully sold ${amount} ${token.symbol} tokens`,
        })
        onClose()
      }
    } catch (error) {
      toast({
        title: "Transaction Failed",
        description: "Please try again",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const totalValue = amount ? (parseFloat(amount) * token.currentPrice).toFixed(2) : '0.00'

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {type === 'buy' ? 'Buy' : 'Sell'} {token.symbol}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="amount">Amount of tokens</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.0"
            />
          </div>
          
          <div className="bg-muted p-3 rounded-lg">
            <div className="flex justify-between text-sm">
              <span>Price per token:</span>
              <span>${token.currentPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-semibold">
              <span>Total:</span>
              <span>${totalValue}</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleTrade}
              className={`flex-1 ${
                type === 'buy' 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-red-600 hover:bg-red-700'
              }`}
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : `${type === 'buy' ? 'Buy' : 'Sell'} Now`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
