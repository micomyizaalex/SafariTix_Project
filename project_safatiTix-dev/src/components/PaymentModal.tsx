import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent } from './ui/card';
import { CreditCard, Check, Smartphone, Phone, Receipt, ArrowLeft, Loader2 } from 'lucide-react';
import { Badge } from './ui/badge';
import { useAuth } from './AuthContext';
import { API_URL } from '../utils/supabase-client';

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  amount: number;
  scheduleId: string;
  numTickets: number;
  onSuccess: () => void;
  title?: string;
  description?: string;
  busDetails?: {
    route?: string;
    date?: string;
    time?: string;
    company?: string;
  };
}

type PaymentMethod = 'mobile_money' | 'airtel_money' | 'card_payment';

export function PaymentModal({ 
  open, 
  onClose, 
  amount, 
  scheduleId,
  numTickets,
  onSuccess, 
  title, 
  description, 
  busDetails 
}: PaymentModalProps) {
  const { accessToken } = useAuth();
  const [step, setStep] = useState<'method' | 'details' | 'ussd' | 'success'>('method');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mobile_money');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form fields
  const [phoneNumber, setPhoneNumber] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardName, setCardName] = useState('');
  
  // Payment state
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [transactionRef, setTransactionRef] = useState<string | null>(null);
  const [ussdCode, setUssdCode] = useState<string>('');

  const handleMethodSelect = (method: PaymentMethod) => {
    setPaymentMethod(method);
    setStep('details');
    setError(null);
  };

  // Step 1: Initiate payment
  const handleInitiatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setError(null);

    try {
      const phoneOrCard = paymentMethod === 'card_payment' ? cardNumber : phoneNumber;

      if (!phoneOrCard) {
        setError('Please enter phone number or card number');
        setProcessing(false);
        return;
      }

      const response = await fetch(`${API_URL}/payments/initiate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          scheduleId,
          paymentMethod,
          phoneOrCard,
          numTickets
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to initiate payment');
      }

      setPaymentId(data.payment.id);
      setTransactionRef(data.payment.transaction_ref);

      // Generate USSD code based on payment method
      const ussdCodes = {
        'mobile_money': '*182*1#',
        'airtel_money': '*185*1#',
        'card_payment': ''
      };
      setUssdCode(ussdCodes[paymentMethod] || '');

      // Move to USSD step for mobile money, directly confirm for card
      if (paymentMethod === 'card_payment') {
        // For card, skip USSD and go directly to confirmation
        await handleConfirmPayment(true);
      } else {
        setStep('ussd');
      }

    } catch (err: any) {
      setError(err.message || 'Failed to initiate payment. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  // Step 2: Confirm payment (after USSD or Pay Anyway)
  const handleConfirmPayment = async (payAnyway: boolean = false) => {
    if (!paymentId) {
      setError('Payment ID is missing');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/payments/confirm`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          paymentId,
          ussdWorked: !payAnyway
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to confirm payment');
      }

      // Step 3: Book ticket
      await handleBookTicket();

    } catch (err: any) {
      setError(err.message || 'Failed to confirm payment. Please try again.');
      setProcessing(false);
    }
  };

  // Step 3: Book ticket after payment confirmation
  const handleBookTicket = async () => {
    if (!paymentId) {
      setError('Payment ID is missing');
      setProcessing(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/payments/book`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          paymentId,
          numTickets
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to book ticket');
      }

      // Success!
      setStep('success');
      setProcessing(false);

      // Call success callback after showing success message
      setTimeout(() => {
        onSuccess();
        handleClose();
      }, 3000);

    } catch (err: any) {
      setError(err.message || 'Failed to book ticket. Please try again.');
      setProcessing(false);
    }
  };

  const handleClose = () => {
    setStep('method');
    setPaymentMethod('mobile_money');
    setPhoneNumber('');
    setCardNumber('');
    setExpiryDate('');
    setCvv('');
    setCardName('');
    setPaymentId(null);
    setTransactionRef(null);
    setUssdCode('');
    setError(null);
    onClose();
  };

  const getPaymentMethodName = (method: PaymentMethod) => {
    const names = {
      'mobile_money': 'MTN Mobile Money',
      'airtel_money': 'Airtel Money',
      'card_payment': 'Card Payment'
    };
    return names[method];
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
              {numTickets > 0 && (
                <p className="text-sm opacity-90 mt-2">
                  {numTickets} ticket{numTickets > 1 ? 's' : ''}
                </p>
              )}
            </div>

            <div className="space-y-3">
              <Card 
                className="cursor-pointer hover:border-[#0077B6] hover:shadow-md transition-all"
                onClick={() => handleMethodSelect('mobile_money')}
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
                onClick={() => handleMethodSelect('airtel_money')}
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
                onClick={() => handleMethodSelect('card_payment')}
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

        {step === 'details' && paymentMethod !== 'card_payment' && (
          <>
            <DialogHeader>
              <DialogTitle style={{ fontFamily: 'Montserrat, sans-serif' }}>
                {paymentMethod === 'mobile_money' ? 'MTN Mobile Money' : 'Airtel Money'}
              </DialogTitle>
              <DialogDescription>
                Enter your phone number to complete payment
              </DialogDescription>
            </DialogHeader>

            {error && (
              <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-md px-3 py-2 text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="bg-[#F5F7FA] dark:bg-[#2B2D42] p-4 rounded-lg mb-4">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  paymentMethod === 'mobile_money' ? 'bg-yellow-400 text-black' : 'bg-red-600 text-white'
                }`}>
                  {paymentMethod === 'mobile_money' ? <Phone className="w-5 h-5" /> : <Smartphone className="w-5 h-5" />}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Amount to Pay</p>
                  <p className="text-2xl font-bold text-[#0077B6]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    RWF {amount.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleInitiatePayment} className="space-y-4">
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
                  disabled={processing}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-[#0077B6] hover:bg-[#005a8c]"
                  disabled={processing}
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    `Pay RWF ${amount.toLocaleString()}`
                  )}
                </Button>
              </div>
            </form>
          </>
        )}

        {step === 'details' && paymentMethod === 'card_payment' && (
          <>
            <DialogHeader>
              <DialogTitle style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Card Payment
              </DialogTitle>
              <DialogDescription>
                Enter your card details to complete payment
              </DialogDescription>
            </DialogHeader>

            {error && (
              <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-md px-3 py-2 text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="bg-gradient-to-r from-[#0077B6] to-[#005a8c] text-white p-4 rounded-lg mb-4">
              <p className="text-sm opacity-90">Amount to Pay</p>
              <p className="text-3xl font-bold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                RWF {amount.toLocaleString()}
              </p>
            </div>

            <form onSubmit={handleInitiatePayment} className="space-y-4">
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
                  disabled={processing}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-[#0077B6] hover:bg-[#005a8c]"
                  disabled={processing}
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Pay RWF {amount.toLocaleString()}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </>
        )}

        {step === 'ussd' && (
          <>
            <DialogHeader>
              <DialogTitle style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Complete Payment via USSD
              </DialogTitle>
              <DialogDescription>
                Follow the instructions below to complete your payment
              </DialogDescription>
            </DialogHeader>

            {error && (
              <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-md px-3 py-2 text-sm text-red-600 mb-4">
                {error}
              </div>
            )}

            <div className="bg-gradient-to-r from-[#0077B6] to-[#005a8c] text-white p-6 rounded-lg mb-4">
              <p className="text-sm opacity-90 mb-2">Amount to Pay</p>
              <p className="text-3xl font-bold mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                RWF {amount.toLocaleString()}
              </p>
              
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
                <p className="text-sm font-semibold mb-2">📱 USSD Instructions:</p>
                <div className="bg-white/20 p-3 rounded font-mono text-lg text-center mb-2">
                  Dial {ussdCode}
                </div>
                <p className="text-xs opacity-90">
                  Enter your PIN when prompted to confirm payment of RWF {amount.toLocaleString()}
                </p>
              </div>
            </div>

            <Card className="bg-[#F5F7FA] dark:bg-[#2B2D42] border-0 mb-4">
              <CardContent className="p-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Transaction Ref:</span>
                    <span className="font-mono text-xs">{transactionRef}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment Method:</span>
                    <span>{getPaymentMethodName(paymentMethod)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-2">
              <Button
                onClick={() => handleConfirmPayment(false)}
                className="w-full bg-[#27AE60] hover:bg-[#1e8c4d]"
                disabled={processing}
              >
                {processing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Confirm Payment
                  </>
                )}
              </Button>
              
              <Button
                onClick={() => handleConfirmPayment(true)}
                variant="outline"
                className="w-full"
                disabled={processing}
              >
                Pay Anyway
              </Button>
            </div>
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
              Your payment has been confirmed and tickets have been booked
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
                  
                  {transactionRef && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Transaction Ref:</span>
                      <span className="font-mono text-xs">{transactionRef}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment Method:</span>
                    <span>{getPaymentMethodName(paymentMethod)}</span>
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

                      {numTickets > 0 && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Tickets:</span>
                          <span>{numTickets}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className="bg-white dark:bg-[#1a1a1a] p-3 rounded text-xs text-muted-foreground mt-4">
                  <p>✓ Payment confirmed</p>
                  <p>✓ Tickets booked successfully</p>
                  <p>✓ Redirecting to My Tickets...</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
