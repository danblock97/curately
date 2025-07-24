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
      pages: {
        Row: {
          id: string
          user_id: string
          username: string
          page_title: string
          page_description: string | null
          background_color: string
          is_primary: boolean
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          username: string
          page_title: string
          page_description?: string | null
          background_color?: string
          is_primary?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          username?: string
          page_title?: string
          page_description?: string | null
          background_color?: string
          is_primary?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          display_name: string | null
          bio: string | null
          avatar_url: string | null
          tier: 'free' | 'pro'
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_status: 'active' | 'canceled' | 'past_due' | 'incomplete' | 'trialing' | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          display_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          tier?: 'free' | 'pro'
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: 'active' | 'canceled' | 'past_due' | 'incomplete' | 'trialing' | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          display_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          tier?: 'free' | 'pro'
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: 'active' | 'canceled' | 'past_due' | 'incomplete' | 'trialing' | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      links: {
        Row: {
          id: string
          user_id: string
          page_id: string | null
          title: string
          url: string
          order: number
          is_active: boolean
          clicks: number
          link_type: 'link_in_bio' | 'deeplink' | 'qr_code'
          short_code: string | null
          qr_code_url: string | null
          deeplink_config: Json | null
          is_short_link: boolean
          size: string
          platform: string | null
          username: string | null
          display_name: string | null
          profile_image_url: string | null
          widget_type: string
          content: string | null
          caption: string | null
          price: string | null
          app_store_url: string | null
          play_store_url: string | null
          file_url: string | null
          widget_position: Json | null
          web_position: Json | null
          mobile_position: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          page_id?: string | null
          title: string
          url: string
          order: number
          is_active?: boolean
          clicks?: number
          link_type?: 'link_in_bio' | 'deeplink' | 'qr_code'
          short_code?: string | null
          qr_code_url?: string | null
          deeplink_config?: Json | null
          is_short_link?: boolean
          size?: string
          platform?: string | null
          username?: string | null
          display_name?: string | null
          profile_image_url?: string | null
          widget_type?: string
          content?: string | null
          caption?: string | null
          price?: string | null
          app_store_url?: string | null
          play_store_url?: string | null
          file_url?: string | null
          widget_position?: Json | null
          web_position?: Json | null
          mobile_position?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          page_id?: string | null
          title?: string
          url?: string
          order?: number
          is_active?: boolean
          clicks?: number
          link_type?: 'link_in_bio' | 'deeplink' | 'qr_code'
          short_code?: string | null
          qr_code_url?: string | null
          deeplink_config?: Json | null
          is_short_link?: boolean
          size?: string
          platform?: string | null
          username?: string | null
          display_name?: string | null
          profile_image_url?: string | null
          widget_type?: string
          content?: string | null
          caption?: string | null
          price?: string | null
          app_store_url?: string | null
          play_store_url?: string | null
          file_url?: string | null
          widget_position?: Json | null
          web_position?: Json | null
          mobile_position?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "links_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      deeplinks: {
        Row: {
          id: string
          link_id: string
          original_url: string
          ios_url: string | null
          android_url: string | null
          desktop_url: string | null
          fallback_url: string | null
          user_agent_rules: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          link_id: string
          original_url: string
          ios_url?: string | null
          android_url?: string | null
          desktop_url?: string | null
          fallback_url?: string | null
          user_agent_rules?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          link_id?: string
          original_url?: string
          ios_url?: string | null
          android_url?: string | null
          desktop_url?: string | null
          fallback_url?: string | null
          user_agent_rules?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "deeplinks_link_id_fkey"
            columns: ["link_id"]
            isOneToOne: true
            referencedRelation: "links"
            referencedColumns: ["id"]
          }
        ]
      }
      qr_codes: {
        Row: {
          id: string
          link_id: string
          qr_code_data: string
          format: string
          size: number
          error_correction: string
          foreground_color: string
          background_color: string
          logo_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          link_id: string
          qr_code_data: string
          format?: string
          size?: number
          error_correction?: string
          foreground_color?: string
          background_color?: string
          logo_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          link_id?: string
          qr_code_data?: string
          format?: string
          size?: number
          error_correction?: string
          foreground_color?: string
          background_color?: string
          logo_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "qr_codes_link_id_fkey"
            columns: ["link_id"]
            isOneToOne: true
            referencedRelation: "links"
            referencedColumns: ["id"]
          }
        ]
      }
      short_links: {
        Row: {
          id: string
          user_id: string
          short_code: string
          original_url: string
          link_type: 'link_in_bio' | 'deeplink' | 'qr_code'
          clicks: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          short_code: string
          original_url: string
          link_type?: 'link_in_bio' | 'deeplink' | 'qr_code'
          clicks?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          short_code?: string
          original_url?: string
          link_type?: 'link_in_bio' | 'deeplink' | 'qr_code'
          clicks?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "short_links_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      plan_features: {
        Row: {
          id: string
          tier: 'free' | 'pro'
          max_links: number
          max_pages: number
          max_qr_codes: number
          analytics_retention_days: number
          unlimited_clicks: boolean
          advanced_analytics: boolean
          advanced_qr_customization: boolean
          priority_support: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tier: 'free' | 'pro'
          max_links: number
          max_pages: number
          max_qr_codes: number
          analytics_retention_days: number
          unlimited_clicks?: boolean
          advanced_analytics?: boolean
          advanced_qr_customization?: boolean
          priority_support?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tier?: 'free' | 'pro'
          max_links?: number
          max_pages?: number
          max_qr_codes?: number
          analytics_retention_days?: number
          unlimited_clicks?: boolean
          advanced_analytics?: boolean
          advanced_qr_customization?: boolean
          priority_support?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      social_media_links: {
        Row: {
          id: string
          user_id: string
          platform: 'twitter' | 'instagram' | 'linkedin' | 'youtube' | 'tiktok' | 'facebook' | 'github' | 'website'
          url: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          platform: 'twitter' | 'instagram' | 'linkedin' | 'youtube' | 'tiktok' | 'facebook' | 'github' | 'website'
          url: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          platform?: 'twitter' | 'instagram' | 'linkedin' | 'youtube' | 'tiktok' | 'facebook' | 'github' | 'website'
          url?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_media_links_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
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
      social_media_platform: 'twitter' | 'instagram' | 'linkedin' | 'youtube' | 'tiktok' | 'facebook' | 'github' | 'website'
      link_type: 'link_in_bio' | 'deeplink' | 'qr_code'
      user_tier: 'free' | 'pro'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}