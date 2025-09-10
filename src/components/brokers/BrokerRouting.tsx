import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Phone, MessageCircle, Mail } from 'lucide-react';
import { toast } from 'sonner';

interface BrokerRoutingProps {
  propertyId: string;
  ownerId: string;
  brokerId?: string;
  onContact: () => void;
}

export const BrokerRouting: React.FC<BrokerRoutingProps> = ({
  propertyId,
  ownerId,
  brokerId,
  onContact
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    message: '',
    contact_phone: '',
    preferred_contact_time: '',
    is_site_visit_requested: false,
    visit_date: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please login to contact property owner');
      return;
    }

    setLoading(true);

    try {
      // Create enquiry
      const { data: enquiry, error: enquiryError } = await supabase
        .from('enquiries')
        .insert({
          property_id: propertyId,
          enquirer_id: user.id,
          owner_id: ownerId,
          message: formData.message,
          contact_phone: formData.contact_phone,
          preferred_contact_time: formData.preferred_contact_time,
          is_site_visit_requested: formData.is_site_visit_requested,
          visit_date: formData.visit_date || null
        })
        .select()
        .single();

      if (enquiryError) throw enquiryError;

      // If broker is assigned, send notification to broker
      if (brokerId) {
        await supabase
          .from('broker_notifications')
          .insert({
            broker_id: brokerId,
            property_id: propertyId,
            enquirer_id: user.id,
            notification_type: 'new_enquiry',
            message: `New enquiry for property: ${formData.message}`,
            contact_info: {
              phone: formData.contact_phone,
              preferred_time: formData.preferred_contact_time,
              site_visit: formData.is_site_visit_requested,
              visit_date: formData.visit_date
            }
          });

        // Call edge function to send notifications (will implement when secrets are added)
        try {
          await supabase.functions.invoke('send-broker-notifications', {
            body: {
              brokerId,
              propertyId,
              enquiryId: enquiry.id,
              enquirerInfo: {
                name: user.email,
                phone: formData.contact_phone,
                message: formData.message
              }
            }
          });
        } catch (notificationError) {
          console.log('Notification service not available yet');
        }
      }

      toast.success('Your enquiry has been sent successfully!');
      onContact();
      
      // Reset form
      setFormData({
        message: '',
        contact_phone: '',
        preferred_contact_time: '',
        is_site_visit_requested: false,
        visit_date: ''
      });
      
    } catch (error) {
      console.error('Error sending enquiry:', error);
      toast.error('Failed to send enquiry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact Property Owner</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="message">Message *</Label>
            <Textarea
              id="message"
              placeholder="Hi, I'm interested in this property. Please share more details."
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="contact_phone">Your Phone Number *</Label>
            <Input
              id="contact_phone"
              type="tel"
              placeholder="+91 98765 43210"
              value={formData.contact_phone}
              onChange={(e) => setFormData(prev => ({ ...prev, contact_phone: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="preferred_contact_time">Preferred Contact Time</Label>
            <Input
              id="preferred_contact_time"
              placeholder="e.g., 10 AM - 6 PM"
              value={formData.preferred_contact_time}
              onChange={(e) => setFormData(prev => ({ ...prev, preferred_contact_time: e.target.value }))}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="site_visit"
              checked={formData.is_site_visit_requested}
              onCheckedChange={(checked) => 
                setFormData(prev => ({ ...prev, is_site_visit_requested: !!checked }))
              }
            />
            <Label htmlFor="site_visit">I want to schedule a site visit</Label>
          </div>

          {formData.is_site_visit_requested && (
            <div>
              <Label htmlFor="visit_date">Preferred Visit Date</Label>
              <Input
                id="visit_date"
                type="datetime-local"
                value={formData.visit_date}
                onChange={(e) => setFormData(prev => ({ ...prev, visit_date: e.target.value }))}
              />
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={loading || !formData.message || !formData.contact_phone}>
              <MessageCircle className="h-4 w-4 mr-2" />
              {loading ? 'Sending...' : 'Send Enquiry'}
            </Button>
          </div>

          {brokerId && (
            <div className="text-sm text-muted-foreground p-3 bg-muted rounded-lg">
              <p className="font-medium">📞 Broker Assistance Available</p>
              <p>Your enquiry will be routed through a verified broker who will assist with your property needs and coordinate with the owner.</p>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
};