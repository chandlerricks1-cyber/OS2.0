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
      brand_scripts: {
        Row: {
          authority: string | null
          brand_script: string | null
          created_at: string
          email: string
          empathy: string | null
          external_problem: string | null
          full_name: string
          hero: string | null
          id: string
          internal_problem: string | null
          matched_ghl_contact_id: string | null
          matched_podcast_lead_id: string | null
          phone: string
          plan_step_1: string | null
          plan_step_2: string | null
          plan_step_3: string | null
          the_win: string | null
          whats_at_stake: string | null
        }
        Insert: {
          authority?: string | null
          brand_script?: string | null
          created_at?: string
          email: string
          empathy?: string | null
          external_problem?: string | null
          full_name: string
          hero?: string | null
          id?: string
          internal_problem?: string | null
          matched_ghl_contact_id?: string | null
          matched_podcast_lead_id?: string | null
          phone: string
          plan_step_1?: string | null
          plan_step_2?: string | null
          plan_step_3?: string | null
          the_win?: string | null
          whats_at_stake?: string | null
        }
        Update: {
          authority?: string | null
          brand_script?: string | null
          created_at?: string
          email?: string
          empathy?: string | null
          external_problem?: string | null
          full_name?: string
          hero?: string | null
          id?: string
          internal_problem?: string | null
          matched_ghl_contact_id?: string | null
          matched_podcast_lead_id?: string | null
          phone?: string
          plan_step_1?: string | null
          plan_step_2?: string | null
          plan_step_3?: string | null
          the_win?: string | null
          whats_at_stake?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brand_scripts_matched_ghl_contact_id_fkey"
            columns: ["matched_ghl_contact_id"]
            isOneToOne: false
            referencedRelation: "ghl_contacts"
            referencedColumns: ["ghl_id"]
          },
          {
            foreignKeyName: "brand_scripts_matched_podcast_lead_id_fkey"
            columns: ["matched_podcast_lead_id"]
            isOneToOne: false
            referencedRelation: "podcast_leads"
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
      crucible_appointments: {
        Row: {
          created_at: string
          ends_at: string | null
          ghl_event_id: string | null
          guests: string[]
          id: string
          last_synced_at: string | null
          meeting_link: string | null
          notes: string | null
          starts_at: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          ends_at?: string | null
          ghl_event_id?: string | null
          guests?: string[]
          id?: string
          last_synced_at?: string | null
          meeting_link?: string | null
          notes?: string | null
          starts_at: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          ends_at?: string | null
          ghl_event_id?: string | null
          guests?: string[]
          id?: string
          last_synced_at?: string | null
          meeting_link?: string | null
          notes?: string | null
          starts_at?: string
          title?: string
          updated_at?: string
          user_id?: string
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
          appointment_id: string | null
          call_date: string
          created_at: string
          id: string
          title: string
          transcript_raw: string | null
          transcript_segments: Json | null
          updated_at: string
          user_id: string
          zoom_recording_url: string | null
        }
        Insert: {
          appointment_id?: string | null
          call_date: string
          created_at?: string
          id?: string
          title: string
          transcript_raw?: string | null
          transcript_segments?: Json | null
          updated_at?: string
          user_id: string
          zoom_recording_url?: string | null
        }
        Update: {
          appointment_id?: string | null
          call_date?: string
          created_at?: string
          id?: string
          title?: string
          transcript_raw?: string | null
          transcript_segments?: Json | null
          updated_at?: string
          user_id?: string
          zoom_recording_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crucible_call_recordings_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "crucible_appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crucible_call_recordings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      crucible_pro_invoices: {
        Row: {
          amount_cents: number
          created_at: string
          currency: string
          description: string | null
          due_date: string | null
          finalized_at: string | null
          hosted_invoice_url: string | null
          id: string
          invoice_pdf_url: string | null
          invoice_type: string
          metadata: Json
          number: string | null
          paid_at: string | null
          sent_at: string | null
          status: string
          stripe_customer_id: string | null
          stripe_invoice_id: string
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
          voided_at: string | null
        }
        Insert: {
          amount_cents: number
          created_at?: string
          currency?: string
          description?: string | null
          due_date?: string | null
          finalized_at?: string | null
          hosted_invoice_url?: string | null
          id?: string
          invoice_pdf_url?: string | null
          invoice_type: string
          metadata?: Json
          number?: string | null
          paid_at?: string | null
          sent_at?: string | null
          status: string
          stripe_customer_id?: string | null
          stripe_invoice_id: string
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
          voided_at?: string | null
        }
        Update: {
          amount_cents?: number
          created_at?: string
          currency?: string
          description?: string | null
          due_date?: string | null
          finalized_at?: string | null
          hosted_invoice_url?: string | null
          id?: string
          invoice_pdf_url?: string | null
          invoice_type?: string
          metadata?: Json
          number?: string | null
          paid_at?: string | null
          sent_at?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_invoice_id?: string
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
          voided_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crucible_pro_invoices_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      crucible_rocks: {
        Row: {
          created_at: string
          description: string | null
          id: string
          status: string
          target_date: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          status?: string
          target_date?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          status?: string
          target_date?: string | null
          title?: string
          updated_at?: string
          user_id?: string
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
      crucible_tasks: {
        Row: {
          accountable_name: string | null
          accountable_team_member_id: string | null
          call_recording_id: string | null
          completed_at: string | null
          created_at: string
          id: string
          sort_order: number
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          accountable_name?: string | null
          accountable_team_member_id?: string | null
          call_recording_id?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          sort_order?: number
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          accountable_name?: string | null
          accountable_team_member_id?: string | null
          call_recording_id?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          sort_order?: number
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
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
          {
            foreignKeyName: "crucible_tasks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      crucible_team_members: {
        Row: {
          accountabilities: string[]
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string | null
          position: string | null
          sort_order: number
          updated_at: string
          user_id: string
        }
        Insert: {
          accountabilities?: string[]
          created_at?: string
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          position?: string | null
          sort_order?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          accountabilities?: string[]
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          position?: string | null
          sort_order?: number
          updated_at?: string
          user_id?: string
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
      ghl_appointments: {
        Row: {
          address: string | null
          appointment_status: string | null
          assigned_user_id: string | null
          calendar_id: string | null
          contact_id: string | null
          deleted_at: string | null
          end_time: string | null
          ghl_id: string
          meeting_location_type: string | null
          notes: string | null
          raw: Json | null
          start_time: string | null
          synced_at: string
          title: string | null
        }
        Insert: {
          address?: string | null
          appointment_status?: string | null
          assigned_user_id?: string | null
          calendar_id?: string | null
          contact_id?: string | null
          deleted_at?: string | null
          end_time?: string | null
          ghl_id: string
          meeting_location_type?: string | null
          notes?: string | null
          raw?: Json | null
          start_time?: string | null
          synced_at?: string
          title?: string | null
        }
        Update: {
          address?: string | null
          appointment_status?: string | null
          assigned_user_id?: string | null
          calendar_id?: string | null
          contact_id?: string | null
          deleted_at?: string | null
          end_time?: string | null
          ghl_id?: string
          meeting_location_type?: string | null
          notes?: string | null
          raw?: Json | null
          start_time?: string | null
          synced_at?: string
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ghl_appointments_calendar_id_fkey"
            columns: ["calendar_id"]
            isOneToOne: false
            referencedRelation: "ghl_calendars"
            referencedColumns: ["ghl_id"]
          },
          {
            foreignKeyName: "ghl_appointments_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "ghl_contacts"
            referencedColumns: ["ghl_id"]
          },
        ]
      }
      ghl_calendars: {
        Row: {
          description: string | null
          ghl_id: string
          is_active: boolean
          name: string
          raw: Json | null
          slot_duration: number | null
          slot_interval: number | null
          synced_at: string
          team_members: Json
          timezone: string | null
        }
        Insert: {
          description?: string | null
          ghl_id: string
          is_active?: boolean
          name: string
          raw?: Json | null
          slot_duration?: number | null
          slot_interval?: number | null
          synced_at?: string
          team_members?: Json
          timezone?: string | null
        }
        Update: {
          description?: string | null
          ghl_id?: string
          is_active?: boolean
          name?: string
          raw?: Json | null
          slot_duration?: number | null
          slot_interval?: number | null
          synced_at?: string
          team_members?: Json
          timezone?: string | null
        }
        Relationships: []
      }
      ghl_contacts: {
        Row: {
          assigned_user_id: string | null
          country: string | null
          custom_fields: Json
          date_added: string | null
          deleted_at: string | null
          dnd: boolean
          email: string | null
          first_name: string | null
          full_name: string | null
          ghl_id: string
          last_name: string | null
          location_id: string | null
          phone: string | null
          raw: Json | null
          source: string | null
          synced_at: string
          tags: string[]
          timezone: string | null
        }
        Insert: {
          assigned_user_id?: string | null
          country?: string | null
          custom_fields?: Json
          date_added?: string | null
          deleted_at?: string | null
          dnd?: boolean
          email?: string | null
          first_name?: string | null
          full_name?: string | null
          ghl_id: string
          last_name?: string | null
          location_id?: string | null
          phone?: string | null
          raw?: Json | null
          source?: string | null
          synced_at?: string
          tags?: string[]
          timezone?: string | null
        }
        Update: {
          assigned_user_id?: string | null
          country?: string | null
          custom_fields?: Json
          date_added?: string | null
          deleted_at?: string | null
          dnd?: boolean
          email?: string | null
          first_name?: string | null
          full_name?: string | null
          ghl_id?: string
          last_name?: string | null
          location_id?: string | null
          phone?: string | null
          raw?: Json | null
          source?: string | null
          synced_at?: string
          tags?: string[]
          timezone?: string | null
        }
        Relationships: []
      }
      ghl_conversations: {
        Row: {
          assigned_to: string | null
          contact_id: string | null
          ghl_id: string
          inbox_status: string | null
          last_message_at: string | null
          last_message_body: string | null
          last_message_type: string | null
          raw: Json | null
          synced_at: string
          unread_count: number
        }
        Insert: {
          assigned_to?: string | null
          contact_id?: string | null
          ghl_id: string
          inbox_status?: string | null
          last_message_at?: string | null
          last_message_body?: string | null
          last_message_type?: string | null
          raw?: Json | null
          synced_at?: string
          unread_count?: number
        }
        Update: {
          assigned_to?: string | null
          contact_id?: string | null
          ghl_id?: string
          inbox_status?: string | null
          last_message_at?: string | null
          last_message_body?: string | null
          last_message_type?: string | null
          raw?: Json | null
          synced_at?: string
          unread_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "ghl_conversations_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "ghl_contacts"
            referencedColumns: ["ghl_id"]
          },
        ]
      }
      ghl_messages: {
        Row: {
          attachments: Json
          body: string | null
          contact_id: string | null
          conversation_id: string
          direction: string
          from_addr: string | null
          ghl_id: string
          message_at: string
          message_type: string | null
          meta: Json | null
          status: string | null
          synced_at: string
          to_addr: string | null
        }
        Insert: {
          attachments?: Json
          body?: string | null
          contact_id?: string | null
          conversation_id: string
          direction: string
          from_addr?: string | null
          ghl_id: string
          message_at: string
          message_type?: string | null
          meta?: Json | null
          status?: string | null
          synced_at?: string
          to_addr?: string | null
        }
        Update: {
          attachments?: Json
          body?: string | null
          contact_id?: string | null
          conversation_id?: string
          direction?: string
          from_addr?: string | null
          ghl_id?: string
          message_at?: string
          message_type?: string | null
          meta?: Json | null
          status?: string | null
          synced_at?: string
          to_addr?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ghl_messages_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "ghl_contacts"
            referencedColumns: ["ghl_id"]
          },
          {
            foreignKeyName: "ghl_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "ghl_conversations"
            referencedColumns: ["ghl_id"]
          },
        ]
      }
      ghl_opportunities: {
        Row: {
          assigned_to: string | null
          contact_id: string | null
          custom_fields: Json
          date_created: string | null
          date_updated: string | null
          deleted_at: string | null
          ghl_id: string
          monetary_value: number | null
          name: string | null
          pipeline_id: string | null
          raw: Json | null
          source: string | null
          stage_id: string | null
          status: string | null
          synced_at: string
        }
        Insert: {
          assigned_to?: string | null
          contact_id?: string | null
          custom_fields?: Json
          date_created?: string | null
          date_updated?: string | null
          deleted_at?: string | null
          ghl_id: string
          monetary_value?: number | null
          name?: string | null
          pipeline_id?: string | null
          raw?: Json | null
          source?: string | null
          stage_id?: string | null
          status?: string | null
          synced_at?: string
        }
        Update: {
          assigned_to?: string | null
          contact_id?: string | null
          custom_fields?: Json
          date_created?: string | null
          date_updated?: string | null
          deleted_at?: string | null
          ghl_id?: string
          monetary_value?: number | null
          name?: string | null
          pipeline_id?: string | null
          raw?: Json | null
          source?: string | null
          stage_id?: string | null
          status?: string | null
          synced_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ghl_opportunities_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "ghl_contacts"
            referencedColumns: ["ghl_id"]
          },
          {
            foreignKeyName: "ghl_opportunities_pipeline_id_fkey"
            columns: ["pipeline_id"]
            isOneToOne: false
            referencedRelation: "ghl_pipelines"
            referencedColumns: ["ghl_id"]
          },
          {
            foreignKeyName: "ghl_opportunities_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "ghl_pipeline_stages"
            referencedColumns: ["ghl_id"]
          },
        ]
      }
      ghl_outbound_sends: {
        Row: {
          client_dedupe_key: string
          completed_at: string | null
          conversation_id: string | null
          created_at: string
          error: string | null
          ghl_message_id: string | null
          id: string
          status: string
        }
        Insert: {
          client_dedupe_key: string
          completed_at?: string | null
          conversation_id?: string | null
          created_at?: string
          error?: string | null
          ghl_message_id?: string | null
          id?: string
          status?: string
        }
        Update: {
          client_dedupe_key?: string
          completed_at?: string | null
          conversation_id?: string | null
          created_at?: string
          error?: string | null
          ghl_message_id?: string | null
          id?: string
          status?: string
        }
        Relationships: []
      }
      ghl_pipeline_stages: {
        Row: {
          ghl_id: string
          name: string
          pipeline_id: string
          position: number
          synced_at: string
        }
        Insert: {
          ghl_id: string
          name: string
          pipeline_id: string
          position?: number
          synced_at?: string
        }
        Update: {
          ghl_id?: string
          name?: string
          pipeline_id?: string
          position?: number
          synced_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ghl_pipeline_stages_pipeline_id_fkey"
            columns: ["pipeline_id"]
            isOneToOne: false
            referencedRelation: "ghl_pipelines"
            referencedColumns: ["ghl_id"]
          },
        ]
      }
      ghl_pipelines: {
        Row: {
          ghl_id: string
          name: string
          position: number
          raw: Json | null
          synced_at: string
        }
        Insert: {
          ghl_id: string
          name: string
          position?: number
          raw?: Json | null
          synced_at?: string
        }
        Update: {
          ghl_id?: string
          name?: string
          position?: number
          raw?: Json | null
          synced_at?: string
        }
        Relationships: []
      }
      ghl_sync_state: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      ghl_webhook_events: {
        Row: {
          error: string | null
          event_id: string
          event_type: string
          id: string
          payload: Json
          processed_at: string | null
          received_at: string
        }
        Insert: {
          error?: string | null
          event_id: string
          event_type: string
          id?: string
          payload: Json
          processed_at?: string | null
          received_at?: string
        }
        Update: {
          error?: string | null
          event_id?: string
          event_type?: string
          id?: string
          payload?: Json
          processed_at?: string | null
          received_at?: string
        }
        Relationships: []
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
      milestone_offers: {
        Row: {
          created_at: string
          milestone_id: string
          offer_id: string
          sequence: number
        }
        Insert: {
          created_at?: string
          milestone_id: string
          offer_id: string
          sequence?: number
        }
        Update: {
          created_at?: string
          milestone_id?: string
          offer_id?: string
          sequence?: number
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
      milestones: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          sort_order: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          sort_order?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          sort_order?: number
          updated_at?: string
          user_id?: string
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
      offers: {
        Row: {
          classroom_body: string | null
          created_at: string
          id: string
          is_active: boolean
          name: string
          offer_type: string
          price: string | null
          sales_pitch: string | null
          short_description: string | null
          sort_order: number
          source: string
          thumbnail_url: string | null
          trigger: string | null
          updated_at: string
          user_id: string
          video_url: string | null
          what_customer_gets: string | null
          when_offered: string | null
          why_do_it: string | null
        }
        Insert: {
          classroom_body?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          offer_type: string
          price?: string | null
          sales_pitch?: string | null
          short_description?: string | null
          sort_order?: number
          source?: string
          thumbnail_url?: string | null
          trigger?: string | null
          updated_at?: string
          user_id: string
          video_url?: string | null
          what_customer_gets?: string | null
          when_offered?: string | null
          why_do_it?: string | null
        }
        Update: {
          classroom_body?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          offer_type?: string
          price?: string | null
          sales_pitch?: string | null
          short_description?: string | null
          sort_order?: number
          source?: string
          thumbnail_url?: string | null
          trigger?: string | null
          updated_at?: string
          user_id?: string
          video_url?: string | null
          what_customer_gets?: string | null
          when_offered?: string | null
          why_do_it?: string | null
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
      podcast_guest_prep: {
        Row: {
          authority: string | null
          brand_script: string | null
          created_at: string
          empathy: string | null
          external_problem: string | null
          hero: string | null
          id: string
          internal_problem: string | null
          lead_id: string
          plan_step_1: string | null
          plan_step_2: string | null
          plan_step_3: string | null
          the_win: string | null
          whats_at_stake: string | null
        }
        Insert: {
          authority?: string | null
          brand_script?: string | null
          created_at?: string
          empathy?: string | null
          external_problem?: string | null
          hero?: string | null
          id?: string
          internal_problem?: string | null
          lead_id: string
          plan_step_1?: string | null
          plan_step_2?: string | null
          plan_step_3?: string | null
          the_win?: string | null
          whats_at_stake?: string | null
        }
        Update: {
          authority?: string | null
          brand_script?: string | null
          created_at?: string
          empathy?: string | null
          external_problem?: string | null
          hero?: string | null
          id?: string
          internal_problem?: string | null
          lead_id?: string
          plan_step_1?: string | null
          plan_step_2?: string | null
          plan_step_3?: string | null
          the_win?: string | null
          whats_at_stake?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "podcast_guest_prep_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "podcast_leads"
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
          ghl_contact_id: string | null
          id: string
          phone: string | null
          public_share_enabled: boolean
          public_share_slug: string | null
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
          phone?: string | null
          public_share_enabled?: boolean
          public_share_slug?: string | null
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
          phone?: string | null
          public_share_enabled?: boolean
          public_share_slug?: string | null
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
          stripe_product_id: string | null
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
          stripe_product_id?: string | null
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
          stripe_product_id?: string | null
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
          created_at: string
          email_reports: boolean
          email_updates: boolean
          timezone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email_reports?: boolean
          email_updates?: boolean
          timezone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email_reports?: boolean
          email_updates?: boolean
          timezone?: string | null
          updated_at?: string
          user_id?: string
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
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
