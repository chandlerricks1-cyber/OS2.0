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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      business_metrics: {
        Row: {
          business_type: string | null
          cac: number | null
          cac_payback_months: number | null
          cash_collected_first_30_days: number | null
          close_rate: number | null
          company_name: string | null
          cro_blockers: Json | null
          extraction_confidence: Json | null
          gross_profit_first_30_days: number | null
          gross_profit_per_customer: number | null
          id: string
          industry: string | null
          lifetime_gross_profit_per_customer: number | null
          ltv: number | null
          ltv_cac_ratio: number | null
          monthly_new_customers: number | null
          monthly_revenue: number | null
          primary_offers: Json | null
          raw_extraction: Json | null
          required_30_day_revenue: number | null
          revenue_goal_1yr: number | null
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          business_type?: string | null
          cac?: number | null
          cac_payback_months?: number | null
          cash_collected_first_30_days?: number | null
          close_rate?: number | null
          company_name?: string | null
          cro_blockers?: Json | null
          extraction_confidence?: Json | null
          gross_profit_first_30_days?: number | null
          gross_profit_per_customer?: number | null
          id?: string
          industry?: string | null
          lifetime_gross_profit_per_customer?: number | null
          ltv?: number | null
          ltv_cac_ratio?: number | null
          monthly_new_customers?: number | null
          monthly_revenue?: number | null
          primary_offers?: Json | null
          raw_extraction?: Json | null
          required_30_day_revenue?: number | null
          revenue_goal_1yr?: number | null
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          business_type?: string | null
          cac?: number | null
          cac_payback_months?: number | null
          cash_collected_first_30_days?: number | null
          close_rate?: number | null
          company_name?: string | null
          cro_blockers?: Json | null
          extraction_confidence?: Json | null
          gross_profit_first_30_days?: number | null
          gross_profit_per_customer?: number | null
          id?: string
          industry?: string | null
          lifetime_gross_profit_per_customer?: number | null
          ltv?: number | null
          ltv_cac_ratio?: number | null
          monthly_new_customers?: number | null
          monthly_revenue?: number | null
          primary_offers?: Json | null
          raw_extraction?: Json | null
          required_30_day_revenue?: number | null
          revenue_goal_1yr?: number | null
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_metrics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      client_tags: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          tag: string
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          tag: string
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          tag?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_tags_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_tags_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      intake_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          session_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          session_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "intake_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "intake_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      intake_sessions: {
        Row: {
          completed_at: string | null
          id: string
          started_at: string
          status: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          id?: string
          started_at?: string
          status?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          id?: string
          started_at?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "intake_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      podcast_intake: {
        Row: {
          anything_else: string | null
          average_transaction_value: string | null
          biggest_constraint: string | null
          business_description: string | null
          business_name: string | null
          business_type: string | null
          close_rate: string | null
          created_at: string
          customer_count: string | null
          differentiator: string | null
          estimated_cac: string | null
          goal_next_90_days: string | null
          id: string
          industry: string | null
          lead_id: string
          monthly_ad_spend: string | null
          monthly_revenue: string | null
          pricing_structure: string | null
          primary_acquisition_channels: string | null
          primary_offer: string | null
          revenue_model: string | null
          sales_process: string | null
          secondary_offers: string | null
          tried_and_failed: string | null
          years_in_business: string | null
        }
        Insert: {
          anything_else?: string | null
          average_transaction_value?: string | null
          biggest_constraint?: string | null
          business_description?: string | null
          business_name?: string | null
          business_type?: string | null
          close_rate?: string | null
          created_at?: string
          customer_count?: string | null
          differentiator?: string | null
          estimated_cac?: string | null
          goal_next_90_days?: string | null
          id?: string
          industry?: string | null
          lead_id: string
          monthly_ad_spend?: string | null
          monthly_revenue?: string | null
          pricing_structure?: string | null
          primary_acquisition_channels?: string | null
          primary_offer?: string | null
          revenue_model?: string | null
          sales_process?: string | null
          secondary_offers?: string | null
          tried_and_failed?: string | null
          years_in_business?: string | null
        }
        Update: {
          anything_else?: string | null
          average_transaction_value?: string | null
          biggest_constraint?: string | null
          business_description?: string | null
          business_name?: string | null
          business_type?: string | null
          close_rate?: string | null
          created_at?: string
          customer_count?: string | null
          differentiator?: string | null
          estimated_cac?: string | null
          goal_next_90_days?: string | null
          id?: string
          industry?: string | null
          lead_id?: string
          monthly_ad_spend?: string | null
          monthly_revenue?: string | null
          pricing_structure?: string | null
          primary_acquisition_channels?: string | null
          primary_offer?: string | null
          revenue_model?: string | null
          sales_process?: string | null
          secondary_offers?: string | null
          tried_and_failed?: string | null
          years_in_business?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "podcast_intake_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "podcast_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      podcast_lead_tags: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          lead_id: string
          tag: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          lead_id: string
          tag: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          lead_id?: string
          tag?: string
        }
        Relationships: [
          {
            foreignKeyName: "podcast_lead_tags_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "podcast_lead_tags_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "podcast_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      podcast_leads: {
        Row: {
          created_at: string
          email: string
          full_name: string
          ghl_contact_id: string | null
          ghl_opportunity_id: string | null
          id: string
          phone: string
          preferred_date: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          ghl_contact_id?: string | null
          ghl_opportunity_id?: string | null
          id?: string
          phone: string
          preferred_date: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          ghl_contact_id?: string | null
          ghl_opportunity_id?: string | null
          id?: string
          phone?: string
          preferred_date?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          crucible_pro_granted_at: string | null
          crucible_pro_status: string | null
          email: string
          full_name: string | null
          id: string
          ghl_contact_id: string | null
          role: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          crucible_pro_granted_at?: string | null
          crucible_pro_status?: string | null
          email: string
          full_name?: string | null
          ghl_contact_id?: string | null
          id: string
          role?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          crucible_pro_granted_at?: string | null
          crucible_pro_status?: string | null
          email?: string
          full_name?: string | null
          ghl_contact_id?: string | null
          id?: string
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          content: string
          generated_at: string
          id: string
          model_version: string | null
          user_id: string
        }
        Insert: {
          content: string
          generated_at?: string
          id?: string
          model_version?: string | null
          user_id: string
        }
        Update: {
          content?: string
          generated_at?: string
          id?: string
          model_version?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          client_agreement_url: string | null
          created_at: string
          current_period_end: string | null
          id: string
          monthly_consulting_fee: number | null
          next_billing_date: string | null
          plan_type: string | null
          status: string
          stripe_customer_id: string | null
          stripe_price_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          client_agreement_url?: string | null
          created_at?: string
          current_period_end?: string | null
          id?: string
          monthly_consulting_fee?: number | null
          next_billing_date?: string | null
          plan_type?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          client_agreement_url?: string | null
          created_at?: string
          current_period_end?: string | null
          id?: string
          monthly_consulting_fee?: number | null
          next_billing_date?: string | null
          plan_type?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          user_id: string
          email_reports: boolean
          email_updates: boolean
          timezone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          email_reports?: boolean
          email_updates?: boolean
          timezone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          email_reports?: boolean
          email_updates?: boolean
          timezone?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      offers: {
        Row: {
          id: string
          user_id: string
          name: string
          offer_type: string
          price: string | null
          what_customer_gets: string | null
          why_do_it: string | null
          when_offered: string | null
          trigger: string | null
          sales_pitch: string | null
          thumbnail_url: string | null
          short_description: string | null
          video_url: string | null
          classroom_body: string | null
          sort_order: number
          is_active: boolean
          source: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          offer_type: string
          price?: string | null
          what_customer_gets?: string | null
          why_do_it?: string | null
          when_offered?: string | null
          trigger?: string | null
          sales_pitch?: string | null
          thumbnail_url?: string | null
          short_description?: string | null
          video_url?: string | null
          classroom_body?: string | null
          sort_order?: number
          is_active?: boolean
          source?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          offer_type?: string
          price?: string | null
          what_customer_gets?: string | null
          why_do_it?: string | null
          when_offered?: string | null
          trigger?: string | null
          sales_pitch?: string | null
          thumbnail_url?: string | null
          short_description?: string | null
          video_url?: string | null
          classroom_body?: string | null
          sort_order?: number
          is_active?: boolean
          source?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "offers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      milestones: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "milestones_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      milestone_offers: {
        Row: {
          milestone_id: string
          offer_id: string
          sequence: number
          created_at: string
        }
        Insert: {
          milestone_id: string
          offer_id: string
          sequence?: number
          created_at?: string
        }
        Update: {
          milestone_id?: string
          offer_id?: string
          sequence?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "milestone_offers_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "milestones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "milestone_offers_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "offers"
            referencedColumns: ["id"]
          },
        ]
      }
      crucible_team_members: {
        Row: {
          id: string
          user_id: string
          name: string
          position: string | null
          phone: string | null
          email: string | null
          accountabilities: string[]
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          position?: string | null
          phone?: string | null
          email?: string | null
          accountabilities?: string[]
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          position?: string | null
          phone?: string | null
          email?: string | null
          accountabilities?: string[]
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crucible_team_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      crucible_appointments: {
        Row: {
          id: string
          user_id: string
          ghl_event_id: string | null
          title: string
          starts_at: string
          ends_at: string | null
          guests: string[]
          meeting_link: string | null
          notes: string | null
          last_synced_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          ghl_event_id?: string | null
          title: string
          starts_at: string
          ends_at?: string | null
          guests?: string[]
          meeting_link?: string | null
          notes?: string | null
          last_synced_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          ghl_event_id?: string | null
          title?: string
          starts_at?: string
          ends_at?: string | null
          guests?: string[]
          meeting_link?: string | null
          notes?: string | null
          last_synced_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crucible_appointments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      crucible_call_recordings: {
        Row: {
          id: string
          user_id: string
          appointment_id: string | null
          title: string
          call_date: string
          zoom_recording_url: string | null
          transcript_raw: string | null
          transcript_segments: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          appointment_id?: string | null
          title: string
          call_date: string
          zoom_recording_url?: string | null
          transcript_raw?: string | null
          transcript_segments?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          appointment_id?: string | null
          title?: string
          call_date?: string
          zoom_recording_url?: string | null
          transcript_raw?: string | null
          transcript_segments?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crucible_call_recordings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crucible_call_recordings_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "crucible_appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      crucible_tasks: {
        Row: {
          id: string
          user_id: string
          title: string
          accountable_team_member_id: string | null
          accountable_name: string | null
          call_recording_id: string | null
          status: string
          sort_order: number
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          accountable_team_member_id?: string | null
          accountable_name?: string | null
          call_recording_id?: string | null
          status?: string
          sort_order?: number
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          accountable_team_member_id?: string | null
          accountable_name?: string | null
          call_recording_id?: string | null
          status?: string
          sort_order?: number
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crucible_tasks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crucible_tasks_accountable_team_member_id_fkey"
            columns: ["accountable_team_member_id"]
            isOneToOne: false
            referencedRelation: "crucible_team_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crucible_tasks_call_recording_id_fkey"
            columns: ["call_recording_id"]
            isOneToOne: false
            referencedRelation: "crucible_call_recordings"
            referencedColumns: ["id"]
          },
        ]
      }
      crucible_rocks: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          target_date: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          target_date?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          target_date?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crucible_rocks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
