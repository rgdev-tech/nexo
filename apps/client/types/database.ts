/**
 * Tipos de la base de datos de Supabase para el cliente.
 *
 * IMPORTANTE: Debe mantenerse sincronizado con apps/api/src/shared/types/database.ts.
 * Regenerar con: bun run db:types (y copiar aquí)
 *
 * TODO: Mover a un paquete compartido (packages/shared-types) para evitar duplicación.
 */

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
      profiles: {
        Row: {
          id: string;
          email: string | null;
          first_name: string | null;
          last_name: string | null;
          avatar_url: string | null;
          preferences: Json | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id: string;
          email?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          avatar_url?: string | null;
          preferences?: Json | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          email?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          avatar_url?: string | null;
          preferences?: Json | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      ves_history: {
        Row: {
          datetime: string;
          oficial: number | null;
          paralelo: number | null;
          usd_eur: number | null;
        };
        Insert: {
          datetime: string;
          oficial?: number | null;
          paralelo?: number | null;
          usd_eur?: number | null;
        };
        Update: {
          datetime?: string;
          oficial?: number | null;
          paralelo?: number | null;
          usd_eur?: number | null;
        };
        Relationships: [];
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          amount: number;
          currency: string;
          tag: string;
          label: string;
          date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          amount: number;
          currency?: string;
          tag: string;
          label?: string;
          date?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: string;
          amount?: number;
          currency?: string;
          tag?: string;
          label?: string;
          date?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_balances: {
        Row: {
          user_id: string;
          initial_balance: number;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          initial_balance?: number;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          initial_balance?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
