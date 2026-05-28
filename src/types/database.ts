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
          price: number;
          cover: string | null;
          category_sort: string | null;
          active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          price: number;
          cover?: string | null;
          category_sort?: string | null;
          active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          price?: number;
          cover?: string | null;
          category_sort?: string | null;
          active?: boolean;
          created_at?: string;
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
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
