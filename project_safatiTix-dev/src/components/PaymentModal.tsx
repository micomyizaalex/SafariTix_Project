import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent } from './ui/card';
import { CreditCard, Check, Smartphone, Phone, Receipt } from 'lucide-react';
import { Badge } from './ui/badge';

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  amount: number;
  onSuccess: () => void;
  title?: string;
  description?: string;
  busDetails?: {
    route?: string;
    date?: string;
    time?: string;
    company?: string;
    numTickets?: number;
  };
}

type PaymentMethod = 'mtn' | 'airtel' | 'card';

export function PaymentModal({ open, onClose, amount, onSuccess, title, description, busDetails }: PaymentModalProps) {
  const [step, setStep] = useState<'method' | 'details' | 'success'>('method');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mtn');
  const [processing, setProcessing] = useState(false);
  
  // Form fields
  const [phoneNumber, setPhoneNumber] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardName, setCardName] = useState('');
  
  // Transaction details
  const [transactionId, setTransactionId] = useState('');

  const handleMethodSelect = (method: PaymentMethod) => {
    setPaymentMethod(method);
    setStep('details');
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    
    // Generate transaction ID
    const txnId = `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;
    setTransactionId(txnId);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setProcessing(false);
    setStep('success');
    
    // Call success callback after showing success message
    setTimeout(() => {
      onSuccess();
      handleClose();
    }, 3000);
  };

  const handleClose = () => {
    setStep('method');
    setPaymentMethod('mtn');
    setPhoneNumber('');
    setCardNumber('');
    setExpiryDate('');
    setCvv('');
    setCardName('');
    setTransactionId('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        {step === 'method' && (
          <>
            <DialogHeader>
              <DialogTitle style={{ fontFamily: 'Montserrat, sans-serif' }}>
                {title || 'Choose Payment Method'}
              </DialogTitle>
              <DialogDescription>
                {description || 'Select how you want to pay'}
              </DialogDescription>
            </DialogHeader>
            
            <div className="bg-gradient-to-r from-[#0077B6] to-[#005a8c] text-white p-6 rounded-lg mb-4">
              <p className="text-sm opacity-90 mb-1">Total Amount</p>
              <p className="text-4xl font-bold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                RWF {amount.toLocaleString()}
              </p>
              {busDetails?.numTickets && (
                <p className="text-sm opacity-90 mt-2">
                  {busDetails.numTickets} ticket{busDetails.numTickets > 1 ? 's' : ''}
                </p>
              )}
            </div>

            <div className="space-y-3">
              <Card 
                className="cursor-pointer hover:border-[#0077B6] hover:shadow-md transition-all"
                onClick={() => handleMethodSelect('mtn')}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-yellow-400 text-black w-12 h-12 rounded-lg flex items-center justify-center">
                      <Phone className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        MTN Mobile Money
                      </h3>
                      <p className="text-sm text-muted-foreground">Pay with MTN MoMo</p>
                    </div>
                    <Badge className="bg-[#27AE60]">Popular</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card 
                className="cursor-pointer hover:border-[#0077B6] hover:shadow-md transition-all"
                onClick={() => handleMethodSelect('airtel')}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-red-600 text-white w-12 h-12 rounded-lg flex items-center justify-center">
                      <Smartphone className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        Airtel Money
                      </h3>
                      <p className="text-sm text-muted-foreground">Pay with Airtel Money</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card 
                className="cursor-pointer hover:border-[#0077B6] hover:shadow-md transition-all"
                onClick={() => handleMethodSelect('card')}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-[#0077B6] text-white w-12 h-12 rounded-lg flex items-center justify-center">
                      <CreditCard className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        Card Payment
                      </h3>
                      <p className="text-sm text-muted-foreground">Debit/Credit card</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {step === 'details' && paymentMethod !== 'card' && (
          <>
            <DialogHeader>
              <DialogTitle style={{ fontFamily: 'Montserrat, sans-serif' }}>
                {paymentMethod === 'mtn' ? 'MTN Mobile Money' : 'Airtel Money'}
              </DialogTitle>
              <DialogDescription>
                Enter your phone number to complete payment
              </DialogDescription>
            </DialogHeader>

            <div className="bg-[#F5F7FA] dark:bg-[#2B2D42] p-4 rounded-lg mb-4">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  paymentMethod === 'mtn' ? 'bg-yellow-400 text-black' : 'bg-red-600 text-white'
                }`}>
                  {paymentMethod === 'mtn' ? <Phone className="w-5 h-5" /> : <Smartphone className="w-5 h-5" />}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Amount to Pay</p>
                  <p className="text-2xl font-bold text-[#0077B6]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    RWF {amount.toLocaleString()}
                  </p>
                </div>
              </div>
              
              <div className="text-xs text-muted-foreground bg-white dark:bg-[#1a1a1a] p-3 rounded">
                <p className="mb-1">💡 <strong>Payment goes to:</strong></p>
                <p className="font-mono">SafariTix Account: 0788 XXX XXX</p>
                <p className="text-xs opacity-75 mt-1">(Placeholder account for demo)</p>
              </div>
            </div>

            <form onSubmit={handlePayment} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="078XXXXXXX"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                  maxLength={10}
                />
                <p className="text-xs text-muted-foreground">
                  You will receive a prompt on your phone to confirm payment
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep('method')}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-[#0077B6] hover:bg-[#005a8c]"
                  disabled={processing}
                >
                  {processing ? 'Processing...' : `Pay RWF ${amount.toLocaleString()}`}
                </Button>
              </div>
            </form>
          </>
        )}

        {step === 'details' && paymentMethod === 'card' && (
          <>
            <DialogHeader>
              <DialogTitle style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Card Payment
              </DialogTitle>
              <DialogDescription>
                Enter your card details to complete payment
              </DialogDescription>
            </DialogHeader>
            
            <div className="bg-gradient-to-r from-[#0077B6] to-[#005a8c] text-white p-4 rounded-lg mb-4">
              <p className="text-sm opacity-90">Amount to Pay</p>
              <p className="text-3xl font-bold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                RWF {amount.toLocaleString()}
              </p>
            </div>

            <form onSubmit={handlePayment} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cardName">Cardholder Name</Label>
                <Input
                  id="cardName"
                  placeholder="John Doe"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input
                  id="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  maxLength={19}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiry">Expiry Date</Label>
                  <Input
                    id="expiry"
                    placeholder="MM/YY"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    maxLength={5}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    type="password"
                    placeholder="123"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    maxLength={3}
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep('method')}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-[#0077B6] hover:bg-[#005a8c]"
                  disabled={processing}
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  {processing ? 'Processing...' : `Pay RWF ${amount.toLocaleString()}`}
                </Button>
              </div>
            </form>
          </>
        )}

        {step === 'success' && (
          <div className="text-center py-8">
            <div className="bg-[#27AE60] text-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
              <Check className="w-10 h-10" />
            </div>
            <h3 className="text-3xl font-bold mb-3 text-[#27AE60]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Ticket booked successfully 🎉
            </h3>
            <p className="text-muted-foreground mb-6">
              Your payment has been confirmed
            </p>

            <Card className="bg-[#F5F7FA] dark:bg-[#2B2D42] border-0">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Receipt className="w-5 h-5 text-[#0077B6]" />
                  <h4 className="font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    Payment Confirmation
                  </h4>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount Paid:</span>
                    <span className="font-bold text-[#27AE60]">RWF {amount.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Transaction ID:</span>
                    <span className="font-mono text-xs">{transactionId}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment Method:</span>
                    <span className="capitalize">
                      {paymentMethod === 'mtn' ? 'MTN MoMo' : paymentMethod === 'airtel' ? 'Airtel Money' : 'Card'}
                    </span>
                  </div>

                  {busDetails && (
                    <>
                      <div className="border-t border-border pt-3 mt-3">
                        <p className="text-xs text-muted-foreground mb-2">Bus Details</p>
                      </div>
                      
                      {busDetails.company && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Company:</span>
                          <span className="font-semibold">{busDetails.company}</span>
                        </div>
                      )}

                      {busDetails.route && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Route:</span>
                          <span className="font-semibold">{busDetails.route}</span>
                        </div>
                      )}

                      {busDetails.date && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Date:</span>
                          <span>{busDetails.date}</span>
                        </div>
                      )}

                      {busDetails.time && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Time:</span>
                          <span>{busDetails.time}</span>
                        </div>
                      )}

                      {busDetails.numTickets && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Tickets:</span>
                          <span>{busDetails.numTickets}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className="bg-white dark:bg-[#1a1a1a] p-3 rounded text-xs text-muted-foreground mt-4">
                  <p>✓ Payment sent to SafariTix account</p>
                  <p>✓ Ticket confirmation sent to your account</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
