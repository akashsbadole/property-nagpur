export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      amenities: {
        Row: {
          category: string | null
          created_at: string
          icon: string | null
          id: string
          name: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          name: string
        }
        Update: {
          category?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      broker_notifications: {
        Row: {
          broker_id: string
          contact_info: Json | null
          created_at: string | null
          enquirer_id: string
          id: string
          message: string | null
          notification_type: string
          property_id: string
          sent_at: string | null
          status: string | null
        }
        Insert: {
          broker_id: string
          contact_info?: Json | null
          created_at?: string | null
          enquirer_id: string
          id?: string
          message?: string | null
          notification_type: string
          property_id: string
          sent_at?: string | null
          status?: string | null
        }
        Update: {
          broker_id?: string
          contact_info?: Json | null
          created_at?: string | null
          enquirer_id?: string
          id?: string
          message?: string | null
          notification_type?: string
          property_id?: string
          sent_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "broker_notifications_broker_id_fkey"
            columns: ["broker_id"]
            isOneToOne: false
            referencedRelation: "brokers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "broker_notifications_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      brokers: {
        Row: {
          address: string | null
          commission_rate: number | null
          company_name: string | null
          created_at: string | null
          email: string
          id: string
          license_number: string | null
          phone: string | null
          rating: number | null
          specializations: Json | null
          total_deals: number | null
          updated_at: string | null
          user_id: string
          verified: boolean | null
        }
        Insert: {
          address?: string | null
          commission_rate?: number | null
          company_name?: string | null
          created_at?: string | null
          email: string
          id?: string
          license_number?: string | null
          phone?: string | null
          rating?: number | null
          specializations?: Json | null
          total_deals?: number | null
          updated_at?: string | null
          user_id: string
          verified?: boolean | null
        }
        Update: {
          address?: string | null
          commission_rate?: number | null
          company_name?: string | null
          created_at?: string | null
          email?: string
          id?: string
          license_number?: string | null
          phone?: string | null
          rating?: number | null
          specializations?: Json | null
          total_deals?: number | null
          updated_at?: string | null
          user_id?: string
          verified?: boolean | null
        }
        Relationships: []
      }
      document_verification_requests: {
        Row: {
          created_at: string | null
          document_type: string
          documents: Json
          id: string
          payment_status: string | null
          property_id: string | null
          status: string | null
          stripe_payment_intent_id: string | null
          submitted_at: string | null
          updated_at: string | null
          user_id: string
          verification_fee: number
          verification_notes: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          created_at?: string | null
          document_type: string
          documents?: Json
          id?: string
          payment_status?: string | null
          property_id?: string | null
          status?: string | null
          stripe_payment_intent_id?: string | null
          submitted_at?: string | null
          updated_at?: string | null
          user_id: string
          verification_fee: number
          verification_notes?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          created_at?: string | null
          document_type?: string
          documents?: Json
          id?: string
          payment_status?: string | null
          property_id?: string | null
          status?: string | null
          stripe_payment_intent_id?: string | null
          submitted_at?: string | null
          updated_at?: string | null
          user_id?: string
          verification_fee?: number
          verification_notes?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_verification_requests_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          created_at: string
          document_type: string
          file_url: string
          id: string
          property_id: string | null
          remarks: string | null
          updated_at: string
          user_id: string | null
          verification_status:
            | Database["public"]["Enums"]["verification_status"]
            | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          created_at?: string
          document_type: string
          file_url: string
          id?: string
          property_id?: string | null
          remarks?: string | null
          updated_at?: string
          user_id?: string | null
          verification_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          created_at?: string
          document_type?: string
          file_url?: string
          id?: string
          property_id?: string | null
          remarks?: string | null
          updated_at?: string
          user_id?: string | null
          verification_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      enquiries: {
        Row: {
          contact_phone: string | null
          created_at: string
          enquirer_id: string
          id: string
          is_site_visit_requested: boolean | null
          message: string
          owner_id: string
          preferred_contact_time: string | null
          property_id: string
          response: string | null
          status: string | null
          updated_at: string
          visit_date: string | null
        }
        Insert: {
          contact_phone?: string | null
          created_at?: string
          enquirer_id: string
          id?: string
          is_site_visit_requested?: boolean | null
          message: string
          owner_id: string
          preferred_contact_time?: string | null
          property_id: string
          response?: string | null
          status?: string | null
          updated_at?: string
          visit_date?: string | null
        }
        Update: {
          contact_phone?: string | null
          created_at?: string
          enquirer_id?: string
          id?: string
          is_site_visit_requested?: boolean | null
          message?: string
          owner_id?: string
          preferred_contact_time?: string | null
          property_id?: string
          response?: string | null
          status?: string | null
          updated_at?: string
          visit_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "enquiries_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      locations: {
        Row: {
          city: string
          country: string
          created_at: string
          id: string
          latitude: number | null
          locality_score: Json | null
          longitude: number | null
          name: string
          pincode: string | null
          state: string
        }
        Insert: {
          city: string
          country?: string
          created_at?: string
          id?: string
          latitude?: number | null
          locality_score?: Json | null
          longitude?: number | null
          name: string
          pincode?: string | null
          state: string
        }
        Update: {
          city?: string
          country?: string
          created_at?: string
          id?: string
          latitude?: number | null
          locality_score?: Json | null
          longitude?: number | null
          name?: string
          pincode?: string | null
          state?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          attachment_url: string | null
          content: string
          created_at: string
          id: string
          is_read: boolean | null
          message_type: Database["public"]["Enums"]["message_type"] | null
          property_id: string | null
          recipient_id: string
          sender_id: string
        }
        Insert: {
          attachment_url?: string | null
          content: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          message_type?: Database["public"]["Enums"]["message_type"] | null
          property_id?: string | null
          recipient_id: string
          sender_id: string
        }
        Update: {
          attachment_url?: string | null
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          message_type?: Database["public"]["Enums"]["message_type"] | null
          property_id?: string | null
          recipient_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          currency: string | null
          description: string | null
          id: string
          payment_method: string | null
          payment_type: string
          property_id: string | null
          razorpay_payment_id: string | null
          status: string | null
          stripe_payment_id: string | null
          subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string | null
          description?: string | null
          id?: string
          payment_method?: string | null
          payment_type: string
          property_id?: string | null
          razorpay_payment_id?: string | null
          status?: string | null
          stripe_payment_id?: string | null
          subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string | null
          description?: string | null
          id?: string
          payment_method?: string | null
          payment_type?: string
          property_id?: string | null
          razorpay_payment_id?: string | null
          status?: string | null
          stripe_payment_id?: string | null
          subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          aadhaar_verified: boolean | null
          address: Json | null
          avatar_url: string | null
          bio: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          is_active: boolean | null
          kyc_documents: Json | null
          kyc_verified: boolean | null
          pan_verified: boolean | null
          phone: string | null
          preferences: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          aadhaar_verified?: boolean | null
          address?: Json | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          kyc_documents?: Json | null
          kyc_verified?: boolean | null
          pan_verified?: boolean | null
          phone?: string | null
          preferences?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          aadhaar_verified?: boolean | null
          address?: Json | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          kyc_documents?: Json | null
          kyc_verified?: boolean | null
          pan_verified?: boolean | null
          phone?: string | null
          preferences?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      properties: {
        Row: {
          additional_details: Json | null
          address: string
          age_of_property: number | null
          agent_id: string | null
          area_sqft: number | null
          area_sqm: number | null
          bathrooms: number | null
          bhk: number | null
          broker_commission: number | null
          broker_id: string | null
          brokerage_percentage: number | null
          contact_email: string | null
          contact_person: string | null
          contact_phone: string | null
          created_at: string
          description: string | null
          documents: Json | null
          enquiries_count: number | null
          featured_until: string | null
          floor_number: number | null
          floor_plan_url: string | null
          floors_total: number | null
          furnishing_status:
            | Database["public"]["Enums"]["furnishing_status"]
            | null
          id: string
          images: Json | null
          is_featured: boolean | null
          is_negotiable: boolean | null
          latitude: number | null
          listing_status: Database["public"]["Enums"]["listing_status"] | null
          location_id: string | null
          longitude: number | null
          maintenance_charges: number | null
          owner_id: string
          possession_status:
            | Database["public"]["Enums"]["possession_status"]
            | null
          price: number
          price_per_sqft: number | null
          property_subtype:
            | Database["public"]["Enums"]["property_subtype"]
            | null
          property_type: Database["public"]["Enums"]["property_type"]
          security_deposit: number | null
          title: string
          updated_at: string
          verification_status:
            | Database["public"]["Enums"]["verification_status"]
            | null
          videos: Json | null
          views_count: number | null
          virtual_tour_url: string | null
        }
        Insert: {
          additional_details?: Json | null
          address: string
          age_of_property?: number | null
          agent_id?: string | null
          area_sqft?: number | null
          area_sqm?: number | null
          bathrooms?: number | null
          bhk?: number | null
          broker_commission?: number | null
          broker_id?: string | null
          brokerage_percentage?: number | null
          contact_email?: string | null
          contact_person?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          documents?: Json | null
          enquiries_count?: number | null
          featured_until?: string | null
          floor_number?: number | null
          floor_plan_url?: string | null
          floors_total?: number | null
          furnishing_status?:
            | Database["public"]["Enums"]["furnishing_status"]
            | null
          id?: string
          images?: Json | null
          is_featured?: boolean | null
          is_negotiable?: boolean | null
          latitude?: number | null
          listing_status?: Database["public"]["Enums"]["listing_status"] | null
          location_id?: string | null
          longitude?: number | null
          maintenance_charges?: number | null
          owner_id: string
          possession_status?:
            | Database["public"]["Enums"]["possession_status"]
            | null
          price: number
          price_per_sqft?: number | null
          property_subtype?:
            | Database["public"]["Enums"]["property_subtype"]
            | null
          property_type: Database["public"]["Enums"]["property_type"]
          security_deposit?: number | null
          title: string
          updated_at?: string
          verification_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
          videos?: Json | null
          views_count?: number | null
          virtual_tour_url?: string | null
        }
        Update: {
          additional_details?: Json | null
          address?: string
          age_of_property?: number | null
          agent_id?: string | null
          area_sqft?: number | null
          area_sqm?: number | null
          bathrooms?: number | null
          bhk?: number | null
          broker_commission?: number | null
          broker_id?: string | null
          brokerage_percentage?: number | null
          contact_email?: string | null
          contact_person?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          documents?: Json | null
          enquiries_count?: number | null
          featured_until?: string | null
          floor_number?: number | null
          floor_plan_url?: string | null
          floors_total?: number | null
          furnishing_status?:
            | Database["public"]["Enums"]["furnishing_status"]
            | null
          id?: string
          images?: Json | null
          is_featured?: boolean | null
          is_negotiable?: boolean | null
          latitude?: number | null
          listing_status?: Database["public"]["Enums"]["listing_status"] | null
          location_id?: string | null
          longitude?: number | null
          maintenance_charges?: number | null
          owner_id?: string
          possession_status?:
            | Database["public"]["Enums"]["possession_status"]
            | null
          price?: number
          price_per_sqft?: number | null
          property_subtype?:
            | Database["public"]["Enums"]["property_subtype"]
            | null
          property_type?: Database["public"]["Enums"]["property_type"]
          security_deposit?: number | null
          title?: string
          updated_at?: string
          verification_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
          videos?: Json | null
          views_count?: number | null
          virtual_tour_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "properties_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      property_amenities: {
        Row: {
          amenity_id: string
          id: string
          property_id: string
        }
        Insert: {
          amenity_id: string
          id?: string
          property_id: string
        }
        Update: {
          amenity_id?: string
          id?: string
          property_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_amenities_amenity_id_fkey"
            columns: ["amenity_id"]
            isOneToOne: false
            referencedRelation: "amenities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_amenities_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_media: {
        Row: {
          caption: string | null
          created_at: string
          file_type: string
          file_url: string
          id: string
          is_primary: boolean | null
          order_index: number | null
          property_id: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          file_type: string
          file_url: string
          id?: string
          is_primary?: boolean | null
          order_index?: number | null
          property_id: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          file_type?: string
          file_url?: string
          id?: string
          is_primary?: boolean | null
          order_index?: number | null
          property_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_media_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_views: {
        Row: {
          id: string
          ip_address: unknown | null
          property_id: string
          referrer: string | null
          user_agent: string | null
          viewed_at: string
          viewer_id: string | null
        }
        Insert: {
          id?: string
          ip_address?: unknown | null
          property_id: string
          referrer?: string | null
          user_agent?: string | null
          viewed_at?: string
          viewer_id?: string | null
        }
        Update: {
          id?: string
          ip_address?: unknown | null
          property_id?: string
          referrer?: string | null
          user_agent?: string | null
          viewed_at?: string
          viewer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_views_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_searches: {
        Row: {
          alert_enabled: boolean | null
          created_at: string
          filters: Json
          id: string
          last_alert_sent: string | null
          search_name: string
          user_id: string
        }
        Insert: {
          alert_enabled?: boolean | null
          created_at?: string
          filters: Json
          id?: string
          last_alert_sent?: string | null
          search_name: string
          user_id: string
        }
        Update: {
          alert_enabled?: boolean | null
          created_at?: string
          filters?: Json
          id?: string
          last_alert_sent?: string | null
          search_name?: string
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          ends_at: string
          features: Json
          id: string
          plan_name: string
          plan_price: number
          starts_at: string
          status: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          ends_at: string
          features: Json
          id?: string
          plan_name: string
          plan_price: number
          starts_at?: string
          status?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          ends_at?: string
          features?: Json
          id?: string
          plan_name?: string
          plan_price?: number
          starts_at?: string
          status?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          is_primary: boolean | null
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_primary?: boolean | null
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_primary?: boolean | null
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      furnishing_status: "unfurnished" | "semi_furnished" | "fully_furnished"
      listing_status: "active" | "inactive" | "sold" | "rented"
      message_type: "text" | "image" | "document" | "system"
      possession_status: "ready_to_move" | "under_construction" | "new_launch"
      property_subtype:
        | "apartment"
        | "villa"
        | "plot"
        | "flat"
        | "office"
        | "warehouse"
        | "shop"
      property_type:
        | "residential"
        | "commercial"
        | "rental"
        | "pg"
        | "co_living"
      user_role:
        | "buyer"
        | "tenant"
        | "seller"
        | "owner"
        | "builder"
        | "agent"
        | "broker"
        | "admin"
        | "super_admin"
      verification_status: "pending" | "verified" | "rejected"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      furnishing_status: ["unfurnished", "semi_furnished", "fully_furnished"],
      listing_status: ["active", "inactive", "sold", "rented"],
      message_type: ["text", "image", "document", "system"],
      possession_status: ["ready_to_move", "under_construction", "new_launch"],
      property_subtype: [
        "apartment",
        "villa",
        "plot",
        "flat",
        "office",
        "warehouse",
        "shop",
      ],
      property_type: ["residential", "commercial", "rental", "pg", "co_living"],
      user_role: [
        "buyer",
        "tenant",
        "seller",
        "owner",
        "builder",
        "agent",
        "broker",
        "admin",
        "super_admin",
      ],
      verification_status: ["pending", "verified", "rejected"],
    },
  },
} as const
