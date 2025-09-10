-- Add broker functionality to properties table
ALTER TABLE public.properties 
ADD COLUMN broker_id UUID,
ADD COLUMN broker_commission DECIMAL(3,2) DEFAULT 0.05; -- 5% default commission

-- Create brokers table for broker profiles
CREATE TABLE public.brokers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  license_number TEXT,
  company_name TEXT,
  commission_rate DECIMAL(3,2) DEFAULT 0.05,
  verified BOOLEAN DEFAULT false,
  phone TEXT,
  email TEXT NOT NULL,
  address TEXT,
  specializations JSONB DEFAULT '[]'::jsonb,
  rating DECIMAL(3,2) DEFAULT 0.0,
  total_deals INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create document verification requests table
CREATE TABLE public.document_verification_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL, -- 'property_documents', 'owner_documents', 'legal_documents'
  documents JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'pending', -- 'pending', 'in_progress', 'verified', 'rejected'
  verification_fee DECIMAL(10,2) NOT NULL,
  payment_status TEXT DEFAULT 'pending', -- 'pending', 'paid', 'failed', 'refunded'
  stripe_payment_intent_id TEXT,
  verified_by UUID REFERENCES auth.users(id),
  verification_notes TEXT,
  submitted_at TIMESTAMPTZ DEFAULT now(),
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create broker notifications table
CREATE TABLE public.broker_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  broker_id UUID NOT NULL REFERENCES public.brokers(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  enquirer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL, -- 'interest', 'call_request', 'site_visit'
  message TEXT,
  contact_info JSONB, -- Store enquirer contact details
  status TEXT DEFAULT 'sent', -- 'sent', 'delivered', 'read'
  sent_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.brokers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_verification_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.broker_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for brokers table
CREATE POLICY "Brokers can view their own profile" ON public.brokers
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Brokers can update their own profile" ON public.brokers
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Anyone can view verified brokers" ON public.brokers
  FOR SELECT USING (verified = true);

CREATE POLICY "Users can create broker profile" ON public.brokers
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- RLS Policies for document verification requests
CREATE POLICY "Users can manage their verification requests" ON public.document_verification_requests
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all verification requests" ON public.document_verification_requests
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for broker notifications
CREATE POLICY "Brokers can view their notifications" ON public.broker_notifications
  FOR SELECT USING (
    broker_id IN (
      SELECT id FROM public.brokers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "System can create notifications" ON public.broker_notifications
  FOR INSERT WITH CHECK (true);

-- Update triggers for timestamp management
CREATE TRIGGER update_brokers_updated_at
  BEFORE UPDATE ON public.brokers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_document_verification_updated_at
  BEFORE UPDATE ON public.document_verification_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Add indexes for performance
CREATE INDEX idx_properties_broker_id ON public.properties(broker_id);
CREATE INDEX idx_brokers_user_id ON public.brokers(user_id);
CREATE INDEX idx_brokers_verified ON public.brokers(verified);
CREATE INDEX idx_document_verification_user_id ON public.document_verification_requests(user_id);
CREATE INDEX idx_document_verification_status ON public.document_verification_requests(status);
CREATE INDEX idx_broker_notifications_broker_id ON public.broker_notifications(broker_id);
CREATE INDEX idx_broker_notifications_status ON public.broker_notifications(status);