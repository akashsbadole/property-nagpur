-- Create enums for various types
CREATE TYPE public.user_role AS ENUM ('buyer', 'tenant', 'seller', 'owner', 'builder', 'agent', 'broker', 'admin', 'super_admin');
CREATE TYPE public.property_type AS ENUM ('residential', 'commercial', 'rental', 'pg', 'co_living');
CREATE TYPE public.property_subtype AS ENUM ('apartment', 'villa', 'plot', 'flat', 'office', 'warehouse', 'shop');
CREATE TYPE public.furnishing_status AS ENUM ('unfurnished', 'semi_furnished', 'fully_furnished');
CREATE TYPE public.possession_status AS ENUM ('ready_to_move', 'under_construction', 'new_launch');
CREATE TYPE public.verification_status AS ENUM ('pending', 'verified', 'rejected');
CREATE TYPE public.listing_status AS ENUM ('active', 'inactive', 'sold', 'rented');
CREATE TYPE public.message_type AS ENUM ('text', 'image', 'document', 'system');

-- User profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  bio TEXT,
  kyc_verified BOOLEAN DEFAULT false,
  kyc_documents JSONB DEFAULT '[]'::jsonb,
  aadhaar_verified BOOLEAN DEFAULT false,
  pan_verified BOOLEAN DEFAULT false,
  address JSONB,
  preferences JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role user_role NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Locations table
CREATE TABLE public.locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'India',
  pincode TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  locality_score JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Amenities master table
CREATE TABLE public.amenities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  category TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Properties table
CREATE TABLE public.properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  agent_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  property_type property_type NOT NULL,
  property_subtype property_subtype,
  price DECIMAL(15, 2) NOT NULL,
  price_per_sqft DECIMAL(10, 2),
  area_sqft INTEGER,
  area_sqm INTEGER,
  bhk INTEGER,
  bathrooms INTEGER,
  floors_total INTEGER,
  floor_number INTEGER,
  age_of_property INTEGER,
  furnishing_status furnishing_status DEFAULT 'unfurnished',
  possession_status possession_status DEFAULT 'ready_to_move',
  listing_status listing_status DEFAULT 'active',
  verification_status verification_status DEFAULT 'pending',
  is_featured BOOLEAN DEFAULT false,
  featured_until TIMESTAMPTZ,
  location_id UUID REFERENCES public.locations(id),
  address TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  images JSONB DEFAULT '[]'::jsonb,
  videos JSONB DEFAULT '[]'::jsonb,
  documents JSONB DEFAULT '[]'::jsonb,
  floor_plan_url TEXT,
  virtual_tour_url TEXT,
  contact_person TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  views_count INTEGER DEFAULT 0,
  enquiries_count INTEGER DEFAULT 0,
  is_negotiable BOOLEAN DEFAULT true,
  maintenance_charges DECIMAL(10, 2),
  security_deposit DECIMAL(10, 2),
  brokerage_percentage DECIMAL(5, 2),
  additional_details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Property amenities mapping
CREATE TABLE public.property_amenities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  amenity_id UUID REFERENCES public.amenities(id) ON DELETE CASCADE NOT NULL,
  UNIQUE(property_id, amenity_id)
);

-- Property images/videos table
CREATE TABLE public.property_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  caption TEXT,
  is_primary BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Messages/Chat table
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  message_type message_type DEFAULT 'text',
  content TEXT NOT NULL,
  attachment_url TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Property enquiries table
CREATE TABLE public.enquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  enquirer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  contact_phone TEXT,
  preferred_contact_time TEXT,
  is_site_visit_requested BOOLEAN DEFAULT false,
  visit_date TIMESTAMPTZ,
  status TEXT DEFAULT 'pending',
  response TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Saved searches table
CREATE TABLE public.saved_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  search_name TEXT NOT NULL,
  filters JSONB NOT NULL,
  alert_enabled BOOLEAN DEFAULT true,
  last_alert_sent TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Property views/analytics table
CREATE TABLE public.property_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  viewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Subscriptions table
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_name TEXT NOT NULL,
  plan_price DECIMAL(10, 2) NOT NULL,
  features JSONB NOT NULL,
  stripe_subscription_id TEXT,
  status TEXT DEFAULT 'active',
  starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ends_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Payments table
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  amount DECIMAL(15, 2) NOT NULL,
  currency TEXT DEFAULT 'INR',
  payment_type TEXT NOT NULL, -- 'featured_listing', 'subscription', 'token_amount', 'commission'
  payment_method TEXT,
  stripe_payment_id TEXT,
  razorpay_payment_id TEXT,
  status TEXT DEFAULT 'pending',
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Documents table for KYC and property verification
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL, -- 'aadhaar', 'pan', 'property_papers', 'noc', etc.
  file_url TEXT NOT NULL,
  verification_status verification_status DEFAULT 'pending',
  verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  verified_at TIMESTAMPTZ,
  remarks TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Create policies for user_roles
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT USING (user_id = auth.uid());

-- Create policies for properties
CREATE POLICY "Anyone can view active properties" ON public.properties
  FOR SELECT USING (listing_status = 'active' AND verification_status = 'verified');

CREATE POLICY "Property owners can manage their properties" ON public.properties
  FOR ALL USING (owner_id = auth.uid());

-- Create policies for messages
CREATE POLICY "Users can view their own messages" ON public.messages
  FOR SELECT USING (sender_id = auth.uid() OR recipient_id = auth.uid());

CREATE POLICY "Users can send messages" ON public.messages
  FOR INSERT WITH CHECK (sender_id = auth.uid());

-- Create policies for enquiries
CREATE POLICY "Users can view enquiries they sent or received" ON public.enquiries
  FOR SELECT USING (enquirer_id = auth.uid() OR owner_id = auth.uid());

CREATE POLICY "Users can create enquiries" ON public.enquiries
  FOR INSERT WITH CHECK (enquirer_id = auth.uid());

-- Create policies for saved searches
CREATE POLICY "Users can manage their saved searches" ON public.saved_searches
  FOR ALL USING (user_id = auth.uid());

-- Create policies for subscriptions
CREATE POLICY "Users can view their own subscriptions" ON public.subscriptions
  FOR SELECT USING (user_id = auth.uid());

-- Create policies for payments
CREATE POLICY "Users can view their own payments" ON public.payments
  FOR SELECT USING (user_id = auth.uid());

-- Create policies for documents
CREATE POLICY "Users can manage their own documents" ON public.documents
  FOR ALL USING (user_id = auth.uid());

-- Create trigger function for updating timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_enquiries_updated_at
  BEFORE UPDATE ON public.enquiries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON public.documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default amenities
INSERT INTO public.amenities (name, category, icon) VALUES
  ('Swimming Pool', 'Recreation', '🏊'),
  ('Gym', 'Fitness', '🏋️'),
  ('Parking', 'Convenience', '🚗'),
  ('Security', 'Safety', '🔒'),
  ('Lift', 'Convenience', '🛗'),
  ('Garden', 'Recreation', '🌿'),
  ('Playground', 'Recreation', '🏀'),
  ('Club House', 'Recreation', '🏢'),
  ('Power Backup', 'Utility', '⚡'),
  ('Water Supply', 'Utility', '💧'),
  ('Wifi', 'Connectivity', '📶'),
  ('CCTV', 'Safety', '📹'),
  ('Intercom', 'Communication', '📞'),
  ('Fire Safety', 'Safety', '🔥'),
  ('Garbage Disposal', 'Utility', '🗑️');

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', NEW.email)
  );
  
  -- Assign default role as buyer
  INSERT INTO public.user_roles (user_id, role, is_primary)
  VALUES (NEW.id, 'buyer', true);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for better performance
CREATE INDEX idx_properties_location ON public.properties(location_id);
CREATE INDEX idx_properties_type ON public.properties(property_type, property_subtype);
CREATE INDEX idx_properties_price ON public.properties(price);
CREATE INDEX idx_properties_owner ON public.properties(owner_id);
CREATE INDEX idx_properties_status ON public.properties(listing_status, verification_status);
CREATE INDEX idx_messages_participants ON public.messages(sender_id, recipient_id);
CREATE INDEX idx_enquiries_property ON public.enquiries(property_id);
CREATE INDEX idx_property_views_property ON public.property_views(property_id);
CREATE INDEX idx_user_roles_user ON public.user_roles(user_id);