export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      admins: {
        Row: {
          id: string;
          email: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      users: {
        Row: {
          id: string;
          email: string;
          phone: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          phone?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          phone?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          name_en: string | null;
          name_zh: string | null;
          description_en: string | null;
          description_zh: string | null;
          price: number;
          cover: string | null;
          category_sort: string | null;
          category_id: string | null;
          active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          name_en?: string | null;
          name_zh?: string | null;
          description_en?: string | null;
          description_zh?: string | null;
          price: number;
          cover?: string | null;
          category_sort?: string | null;
          category_id?: string | null;
          active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          name_en?: string | null;
          name_zh?: string | null;
          description_en?: string | null;
          description_zh?: string | null;
          price?: number;
          cover?: string | null;
          category_sort?: string | null;
          category_id?: string | null;
          active?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          slug: string;
          name_en: string;
          name_zh: string | null;
          icon_url: string | null;
          sort_order: number;
          active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name_en: string;
          name_zh?: string | null;
          icon_url?: string | null;
          sort_order?: number;
          active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          name_en?: string;
          name_zh?: string | null;
          icon_url?: string | null;
          sort_order?: number;
          active?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      platform_downloads: {
        Row: {
          id: string;
          category_id: string | null;
          name_en: string;
          name_zh: string | null;
          logo_url: string | null;
          android_url: string | null;
          ios_url: string | null;
          cloud_url: string | null;
          download_page: string | null;
          sort_order: number;
          active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          category_id?: string | null;
          name_en: string;
          name_zh?: string | null;
          logo_url?: string | null;
          android_url?: string | null;
          ios_url?: string | null;
          cloud_url?: string | null;
          download_page?: string | null;
          sort_order?: number;
          active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          category_id?: string | null;
          name_en?: string;
          name_zh?: string | null;
          logo_url?: string | null;
          android_url?: string | null;
          ios_url?: string | null;
          cloud_url?: string | null;
          download_page?: string | null;
          sort_order?: number;
          active?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      payment_channels: {
        Row: {
          id: string;
          provider: "cryptomus" | "stripe" | "paypal";
          label_en: string;
          label_zh: string | null;
          enabled: boolean;
          config: Json;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          provider: "cryptomus" | "stripe" | "paypal";
          label_en: string;
          label_zh?: string | null;
          enabled?: boolean;
          config?: Json;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          provider?: "cryptomus" | "stripe" | "paypal";
          label_en?: string;
          label_zh?: string | null;
          enabled?: boolean;
          config?: Json;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      payments: {
        Row: {
          id: string;
          order_id: string | null;
          provider: string;
          provider_payment_id: string | null;
          status: "pending" | "paid" | "failed" | "expired" | "cancelled";
          amount: number;
          currency: string;
          raw: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_id?: string | null;
          provider: string;
          provider_payment_id?: string | null;
          status?: "pending" | "paid" | "failed" | "expired" | "cancelled";
          amount: number;
          currency?: string;
          raw?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string | null;
          provider?: string;
          provider_payment_id?: string | null;
          status?: "pending" | "paid" | "failed" | "expired" | "cancelled";
          amount?: number;
          currency?: string;
          raw?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      customers: {
        Row: {
          id: string;
          email: string | null;
          phone: string | null;
          order_count: number;
          total_spent: number;
          first_seen: string;
          last_order_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          email?: string | null;
          phone?: string | null;
          order_count?: number;
          total_spent?: number;
          first_seen?: string;
          last_order_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          phone?: string | null;
          order_count?: number;
          total_spent?: number;
          first_seen?: string;
          last_order_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      quick_links: {
        Row: {
          id: string;
          label_en: string;
          label_zh: string | null;
          url: string;
          is_external: boolean;
          sort_order: number;
          active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          label_en: string;
          label_zh?: string | null;
          url: string;
          is_external?: boolean;
          sort_order?: number;
          active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          label_en?: string;
          label_zh?: string | null;
          url?: string;
          is_external?: boolean;
          sort_order?: number;
          active?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      faqs: {
        Row: {
          id: string;
          question_en: string;
          question_zh: string | null;
          answer_en: string;
          answer_zh: string | null;
          sort_order: number;
          active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          question_en: string;
          question_zh?: string | null;
          answer_en: string;
          answer_zh?: string | null;
          sort_order?: number;
          active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          question_en?: string;
          question_zh?: string | null;
          answer_en?: string;
          answer_zh?: string | null;
          sort_order?: number;
          active?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      site_settings: {
        Row: {
          key: string;
          value: Json;
          updated_at: string;
        };
        Insert: {
          key: string;
          value: Json;
          updated_at?: string;
        };
        Update: {
          key?: string;
          value?: Json;
          updated_at?: string;
        };
        Relationships: [];
      };
      orders: {
        Row: {
          id: string;
          user_id: string | null;
          product_id: string;
          amount: number;
          status: "pending" | "paid" | "cancelled";
          contact_email: string | null;
          contact_phone: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          product_id: string;
          amount: number;
          status?: "pending" | "paid" | "cancelled";
          contact_email?: string | null;
          contact_phone?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          product_id?: string;
          amount?: number;
          status?: "pending" | "paid" | "cancelled";
          contact_email?: string | null;
          contact_phone?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      cards: {
        Row: {
          id: string;
          product_id: string;
          code: string;
          used: boolean;
          used_order_id: string | null;
          used_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          code: string;
          used?: boolean;
          used_order_id?: string | null;
          used_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          code?: string;
          used?: boolean;
          used_order_id?: string | null;
          used_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      payment_channels_public: {
        Row: {
          id: string;
          provider: "cryptomus" | "stripe" | "paypal";
          label_en: string;
          label_zh: string | null;
          enabled: boolean;
          sort_order: number;
        };
        Relationships: [];
      };
    };
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
