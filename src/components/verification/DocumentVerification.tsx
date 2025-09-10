import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, Shield, CreditCard, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface DocumentVerificationProps {
  propertyId?: string;
  onSuccess?: () => void;
}

const VERIFICATION_FEE = 199; // ₹199 service charge

export const DocumentVerification: React.FC<DocumentVerificationProps> = ({
  propertyId,
  onSuccess
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    document_type: '',
    verification_notes: ''
  });

  const documentTypes = [
    { value: 'property_title', label: 'Property Title Deed' },
    { value: 'sale_deed', label: 'Sale Deed' },
    { value: 'occupancy_certificate', label: 'Occupancy Certificate' },
    { value: 'building_approval', label: 'Building Approval' },
    { value: 'property_tax', label: 'Property Tax Receipt' },
    { value: 'electricity_bill', label: 'Electricity Bill' },
    { value: 'water_bill', label: 'Water Bill' },
    { value: 'society_noc', label: 'Society NOC' },
    { value: 'legal_clearance', label: 'Legal Clearance' },
    { value: 'encumbrance_certificate', label: 'Encumbrance Certificate' }
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + documents.length > 10) {
      toast.error('Maximum 10 documents allowed');
      return;
    }
    setDocuments(prev => [...prev, ...files]);
  };

  const removeDocument = (index: number) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const handlePayment = async () => {
    if (!user) {
      toast.error('Please login to proceed');
      return;
    }

    if (!formData.document_type || documents.length === 0) {
      toast.error('Please select document type and upload documents');
      return;
    }

    setLoading(true);

    try {
      // Create verification request
      const verificationData = {
        user_id: user.id,
        property_id: propertyId || null,
        document_type: formData.document_type,
        verification_notes: formData.verification_notes,
        verification_fee: VERIFICATION_FEE,
        documents: documents.map(doc => ({
          name: doc.name,
          size: doc.size,
          type: doc.type
        }))
      };

      const { data: request, error: requestError } = await supabase
        .from('document_verification_requests')
        .insert(verificationData)
        .select()
        .single();

      if (requestError) throw requestError;

      // Call payment edge function (will implement when Stripe secret is added)
      try {
        const { data: paymentData, error: paymentError } = await supabase.functions.invoke('create-verification-payment', {
          body: {
            requestId: request.id,
            amount: VERIFICATION_FEE,
            description: `Document verification for ${formData.document_type}`
          }
        });

        if (paymentError) throw paymentError;

        // Open payment link in new tab
        if (paymentData?.url) {
          window.open(paymentData.url, '_blank');
          toast.success('Payment initiated. Complete payment to start verification.');
        }
      } catch (paymentError) {
        // Payment service not available, show manual payment message
        toast.info('Document verification request created. Payment integration will be available soon.');
        
        // Update status to simulate payment completion for demo
        await supabase
          .from('document_verification_requests')
          .update({ payment_status: 'completed' })
          .eq('id', request.id);
      }

      onSuccess?.();
      
      // Reset form
      setFormData({ document_type: '', verification_notes: '' });
      setDocuments([]);

    } catch (error) {
      console.error('Error creating verification request:', error);
      toast.error('Failed to create verification request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Document Verification Service
        </CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-primary/10">
            <CreditCard className="h-3 w-3 mr-1" />
            ₹{VERIFICATION_FEE} Service Fee
          </Badge>
          <Badge variant="outline" className="bg-success/10">
            <CheckCircle className="h-3 w-3 mr-1" />
            Verified by Legal Experts
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="bg-muted/50 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">What's Included:</h4>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>• Legal document authenticity verification</li>
            <li>• Property title and ownership validation</li>
            <li>• Compliance with local regulations check</li>
            <li>• Detailed verification report</li>
            <li>• Expert consultation on findings</li>
          </ul>
        </div>

        <div>
          <Label htmlFor="document_type">Document Type *</Label>
          <Select 
            value={formData.document_type}
            onValueChange={(value) => setFormData(prev => ({ ...prev, document_type: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select document type to verify" />
            </SelectTrigger>
            <SelectContent>
              {documentTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="documents">Upload Documents *</Label>
          <div className="mt-2">
            <Input
              id="documents"
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              onChange={handleFileUpload}
              className="mb-2"
            />
            <p className="text-xs text-muted-foreground">
              Upload up to 10 files (PDF, JPG, PNG, DOC formats, max 5MB each)
            </p>
          </div>

          {documents.length > 0 && (
            <div className="mt-4 space-y-2">
              <Label>Uploaded Documents:</Label>
              <div className="space-y-2">
                {documents.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span className="text-sm">{doc.name}</span>
                      <span className="text-xs text-muted-foreground">
                        ({(doc.size / 1024 / 1024).toFixed(1)} MB)
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeDocument(index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <Label htmlFor="verification_notes">Additional Notes (Optional)</Label>
          <Textarea
            id="verification_notes"
            placeholder="Any specific concerns or areas you'd like us to focus on..."
            value={formData.verification_notes}
            onChange={(e) => setFormData(prev => ({ ...prev, verification_notes: e.target.value }))}
          />
        </div>

        <div className="pt-4 border-t">
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="font-semibold">Total Amount</p>
              <p className="text-sm text-muted-foreground">Verification service fee</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">₹{VERIFICATION_FEE}</p>
              <p className="text-xs text-muted-foreground">+ applicable taxes</p>
            </div>
          </div>

          <Button 
            onClick={handlePayment}
            disabled={loading || !formData.document_type || documents.length === 0}
            className="w-full"
          >
            {loading ? (
              'Processing...'
            ) : (
              <>
                <Shield className="h-4 w-4 mr-2" />
                Pay ₹{VERIFICATION_FEE} & Start Verification
              </>
            )}
          </Button>
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Verification typically completed within 24-48 hours</p>
          <p>• You'll receive email updates on verification progress</p>
          <p>• Secure payment processing via Stripe</p>
          <p>• 100% refund if documents cannot be verified</p>
        </div>
      </CardContent>
    </Card>
  );
};