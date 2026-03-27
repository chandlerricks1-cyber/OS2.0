export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: 'admin' | 'client'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          role?: 'admin' | 'client'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          role?: 'admin' | 'client'
          created_at?: string
          updated_at?: string
        }
      }
      intake_sessions: {
        Row: {
          id: string
          user_id: string
          status: 'in_progress' | 'completed' | 'abandoned'
          started_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          status?: 'in_progress' | 'completed' | 'abandoned'
          started_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          status?: 'in_progress' | 'completed' | 'abandoned'
          started_at?: string
          completed_at?: string | null
        }
      }
      intake_messages: {
        Row: {
          id: string
          session_id: string
          role: 'user' | 'assistant'
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          role: 'user' | 'assistant'
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          role?: 'user' | 'assistant'
          content?: string
          created_at?: string
        }
      }
      business_metrics: {
        Row: {
          id: string
          user_id: string
          cac: number | null
          ltv: number | null
          ltv_cac_ratio: number | null
          gross_profit_per_customer: number | null
          cash_collected_first_30_days: number | null
          monthly_revenue: number | null
          monthly_new_customers: number | null
          close_rate: number | null
          cac_payback_months: number | null
          required_30_day_revenue: number | null
          extraction_confidence: Json | null
          raw_extraction: Json | null
          business_type: string | null
          industry: string | null
          primary_offers: Json | null
          cro_blockers: Json | null
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          cac?: number | null
          ltv?: number | null
          ltv_cac_ratio?: number | null
          gross_profit_per_customer?: number | null
          cash_collected_first_30_days?: number | null
          monthly_revenue?: number | null
          monthly_new_customers?: number | null
          close_rate?: number | null
          cac_payback_months?: number | null
          required_30_day_revenue?: number | null
          extraction_confidence?: Json | null
          raw_extraction?: Json | null
          business_type?: string | null
          industry?: string | null
          primary_offers?: Json | null
          cro_blockers?: Json | null
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          cac?: number | null
          ltv?: number | null
          ltv_cac_ratio?: number | null
          gross_profit_per_customer?: number | null
          cash_collected_first_30_days?: number | null
          monthly_revenue?: number | null
          monthly_new_customers?: number | null
          close_rate?: number | null
          cac_payback_months?: number | null
          required_30_day_revenue?: number | null
          extraction_confidence?: Json | null
          raw_extraction?: Json | null
          business_type?: string | null
          industry?: string | null
          primary_offers?: Json | null
          cro_blockers?: Json | null
          updated_at?: string
        }
      }
      reports: {
        Row: {
          id: string
          user_id: string
          content: string
          generated_at: string
          model_version: string | null
        }
        Insert: {
          id?: string
          user_id: string
          content: string
          generated_at?: string
          model_version?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          content?: string
          generated_at?: string
          model_version?: string | null
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          stripe_price_id: string | null
          status: 'active' | 'inactive' | 'past_due' | 'canceled' | 'trialing'
          plan_type: 'monthly' | 'one_time' | null
          current_period_end: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          stripe_price_id?: string | null
          status?: 'active' | 'inactive' | 'past_due' | 'canceled' | 'trialing'
          plan_type?: 'monthly' | 'one_time' | null
          current_period_end?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          stripe_price_id?: string | null
          status?: 'active' | 'inactive' | 'past_due' | 'canceled' | 'trialing'
          plan_type?: 'monthly' | 'one_time' | null
          current_period_end?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      client_tags: {
        Row: {
          id: string
          user_id: string
          tag: string
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          tag: string
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          tag?: string
          created_by?: string | null
          created_at?: string
        }
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
  }
}
