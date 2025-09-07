-- Fix security issues by adding missing RLS policies

-- Add missing policies for locations (public read access)
CREATE POLICY "Anyone can view locations" ON public.locations
  FOR SELECT USING (true);

-- Add missing policies for amenities (public read access)
CREATE POLICY "Anyone can view amenities" ON public.amenities
  FOR SELECT USING (true);

-- Add missing policies for property_amenities (follows property access)
CREATE POLICY "Anyone can view property amenities for active properties" ON public.property_amenities
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.properties p 
      WHERE p.id = property_id 
      AND p.listing_status = 'active' 
      AND p.verification_status = 'verified'
    )
  );

CREATE POLICY "Property owners can manage property amenities" ON public.property_amenities
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.properties p 
      WHERE p.id = property_id 
      AND p.owner_id = auth.uid()
    )
  );

-- Add missing policies for property_media (follows property access)
CREATE POLICY "Anyone can view property media for active properties" ON public.property_media
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.properties p 
      WHERE p.id = property_id 
      AND p.listing_status = 'active' 
      AND p.verification_status = 'verified'
    )
  );

CREATE POLICY "Property owners can manage property media" ON public.property_media
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.properties p 
      WHERE p.id = property_id 
      AND p.owner_id = auth.uid()
    )
  );

-- Add missing policies for property_views (insert only for tracking)
CREATE POLICY "Anyone can record property views" ON public.property_views
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their own property views" ON public.property_views
  FOR SELECT USING (viewer_id = auth.uid());

-- Fix function search paths
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;