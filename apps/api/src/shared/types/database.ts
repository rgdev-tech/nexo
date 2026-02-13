/**
 * Tipos de la base de datos de Supabase.
 *
 * IMPORTANTE: Este archivo debe regenerarse con:
 *   npx supabase gen types typescript --local > apps/api/src/shared/types/database.ts
 *
 * La versión actual fue generada manualmente a partir del esquema SQL versionado
 * en supabase/migrations/. Regenerar una vez que Supabase local esté corriendo.
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
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
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
        Relationships: [
          {
            foreignKeyName: "transactions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
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
        Relationships: [
          {
            foreignKeyName: "user_balances_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
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

/** Alias útiles para acceder a tipos de filas */
export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
export type VesHistoryRow = Database["public"]["Tables"]["ves_history"]["Row"];
export type TransactionRow = Database["public"]["Tables"]["transactions"]["Row"];
export type UserBalanceRow = Database["public"]["Tables"]["user_balances"]["Row"];
