import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  CreditCard, 
  Shield, 
  CheckCircle, 
  Loader2,
  IndianRupee,
  QrCode,
  Smartphone,
  Banknote
} from 'lucide-react';

interface RazorpayIntegrationProps {
  amount: number;
  description: string;
  propertyId?: string;
  onSuccess?: (paymentData: any) => void;
  onError?: (error: any) => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const RazorpayIntegration: React.FC<RazorpayIntegrationProps> = ({
  amount,
  description,
  propertyId,
  onSuccess,
  onError
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'netbanking' | 'upi' | 'wallet'>('card');

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const createRazorpayOrder = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('create-razorpay-order', {
        body: {
          amount: amount * 100, // Convert to paise
          currency: 'INR',
          description,
          propertyId,
          userId: user?.id
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      throw error;
    }
  };

  const handlePayment = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to proceed with payment.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Razorpay SDK failed to load');
      }

      // Create order
      const orderData = await createRazorpayOrder();

      // Razorpay options
      const options = {
        key: 'rzp_test_YOUR_KEY_ID', // Replace with actual key
        amount: orderData.amount,
        currency: 'INR',
        name: 'PropertyHub',
        description: description,
        order_id: orderData.id,
        prefill: {
          name: user.user_metadata?.full_name || user.email,
          email: user.email,
          contact: user.user_metadata?.phone || ''
        },
        theme: {
          color: '#2563eb' // Primary color
        },
        method: {
          card: paymentMethod === 'card',
          netbanking: paymentMethod === 'netbanking',
          upi: paymentMethod === 'upi',
          wallet: paymentMethod === 'wallet'
        },
        handler: async (response: any) => {
          try {
            // Verify payment
            const verificationData = await supabase.functions.invoke('verify-razorpay-payment', {
              body: {
                razorpayPaymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
                razorpaySignature: response.razorpay_signature,
                userId: user.id,
                propertyId
              }
            });

            if (verificationData.error) {
              throw new Error('Payment verification failed');
            }

            toast({
              title: "Payment Successful",
              description: "Your payment has been processed successfully.",
              variant: "default"
            });

            onSuccess?.(response);
          } catch (error) {
            console.error('Payment verification error:', error);
            toast({
              title: "Payment Verification Failed",
              description: "Please contact support for assistance.",
              variant: "destructive"
            });
            onError?.(error);
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            toast({
              title: "Payment Cancelled",
              description: "Payment was cancelled by user.",
              variant: "destructive"
            });
          }
        },
        retry: {
          enabled: true,
          max_count: 3
        },
        timeout: 300, // 5 minutes
        remember_customer: true
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Failed",
        description: "Unable to process payment. Please try again.",
        variant: "destructive"
      });
      onError?.(error);
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'card': return <CreditCard className="h-4 w-4" />;
      case 'netbanking': return <Banknote className="h-4 w-4" />;
      case 'upi': return <QrCode className="h-4 w-4" />;
      case 'wallet': return <Smartphone className="h-4 w-4" />;
      default: return <CreditCard className="h-4 w-4" />;
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IndianRupee className="h-5 w-5 text-primary" />
          Secure Payment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Payment Summary */}
        <div className="bg-muted/50 p-4 rounded-lg space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Amount</span>
            <span className="font-semibold text-lg">{formatAmount(amount)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Description</span>
            <span className="text-sm">{description}</span>
          </div>
        </div>

        {/* Payment Method Selection */}
        <div className="space-y-3">
          <Label>Select Payment Method</Label>
          <Select value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="card">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Credit/Debit Card
                </div>
              </SelectItem>
              <SelectItem value="netbanking">
                <div className="flex items-center gap-2">
                  <Banknote className="h-4 w-4" />
                  Net Banking
                </div>
              </SelectItem>
              <SelectItem value="upi">
                <div className="flex items-center gap-2">
                  <QrCode className="h-4 w-4" />
                  UPI
                </div>
              </SelectItem>
              <SelectItem value="wallet">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  Wallet
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Security Features */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Shield className="h-4 w-4 text-green-600" />
          <span>Secured by 256-bit SSL encryption</span>
        </div>

        {/* Payment Button */}
        <Button 
          onClick={handlePayment} 
          disabled={loading}
          className="w-full"
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              {getPaymentMethodIcon(paymentMethod)}
              <span className="ml-2">Pay {formatAmount(amount)}</span>
            </>
          )}
        </Button>

        {/* Features */}
        <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3 text-green-600" />
            Instant Processing
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3 text-green-600" />
            100% Secure
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3 text-green-600" />
            Money Back Guarantee
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3 text-green-600" />
            24/7 Support
          </div>
        </div>

        {/* Powered by Razorpay */}
        <div className="text-center">
          <Badge variant="outline" className="text-xs">
            Powered by Razorpay
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};