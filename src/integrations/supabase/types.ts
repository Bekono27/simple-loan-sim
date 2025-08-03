export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      admin_audit_log: {
        Row: {
          action: string
          admin_user_id: string
          created_at: string | null
          details: Json | null
          id: string
          target_id: string | null
          target_table: string | null
        }
        Insert: {
          action: string
          admin_user_id: string
          created_at?: string | null
          details?: Json | null
          id?: string
          target_id?: string | null
          target_table?: string | null
        }
        Update: {
          action?: string
          admin_user_id?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          target_id?: string | null
          target_table?: string | null
        }
        Relationships: []
      }
      loan_applications: {
        Row: {
          amount: number
          bank_statement_filename: string | null
          bank_statement_url: string | null
          created_at: string
          eligibility_result: string | null
          id: string
          interest_rate: number | null
          max_loan_amount: number | null
          payment_status: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          bank_statement_filename?: string | null
          bank_statement_url?: string | null
          created_at?: string
          eligibility_result?: string | null
          id?: string
          interest_rate?: number | null
          max_loan_amount?: number | null
          payment_status?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          bank_statement_filename?: string | null
          bank_statement_url?: string | null
          created_at?: string
          eligibility_result?: string | null
          id?: string
          interest_rate?: number | null
          max_loan_amount?: number | null
          payment_status?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      p2p_loans: {
        Row: {
          amount: number
          borrower_id: string | null
          created_at: string
          description: string | null
          duration_months: number
          id: string
          interest_rate: number
          lender_id: string
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          borrower_id?: string | null
          created_at?: string
          description?: string | null
          duration_months: number
          id?: string
          interest_rate: number
          lender_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          borrower_id?: string | null
          created_at?: string
          description?: string | null
          duration_months?: number
          id?: string
          interest_rate?: number
          lender_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      payment_verifications: {
        Row: {
          admin_notes: string | null
          amount: number
          created_at: string | null
          id: string
          loan_application_id: string | null
          payment_date: string | null
          payment_method: string
          reference_number: string
          status: string | null
          updated_at: string | null
          user_id: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          admin_notes?: string | null
          amount: number
          created_at?: string | null
          id?: string
          loan_application_id?: string | null
          payment_date?: string | null
          payment_method: string
          reference_number: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          admin_notes?: string | null
          amount?: number
          created_at?: string | null
          id?: string
          loan_application_id?: string | null
          payment_date?: string | null
          payment_method?: string
          reference_number?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_verifications_loan_application_id_fkey"
            columns: ["loan_application_id"]
            isOneToOne: false
            referencedRelation: "loan_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          birth_date: string | null
          created_at: string
          credit_score: number | null
          email: string | null
          full_name: string
          id: string
          phone_number: string | null
          register_number: string | null
          role: Database["public"]["Enums"]["app_role"]
          score_updated_at: string | null
          score_updated_by: string | null
          updated_at: string
          user_id: string
          username: string
        }
        Insert: {
          birth_date?: string | null
          created_at?: string
          credit_score?: number | null
          email?: string | null
          full_name: string
          id?: string
          phone_number?: string | null
          register_number?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          score_updated_at?: string | null
          score_updated_by?: string | null
          updated_at?: string
          user_id: string
          username: string
        }
        Update: {
          birth_date?: string | null
          created_at?: string
          credit_score?: number | null
          email?: string | null
          full_name?: string
          id?: string
          phone_number?: string | null
          register_number?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          score_updated_at?: string | null
          score_updated_by?: string | null
          updated_at?: string
          user_id?: string
          username?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["app_role"]
      }
      is_admin: {
        Args: { user_id?: string }
        Returns: boolean
      }
      log_admin_action: {
        Args: {
          action_type: string
          table_name?: string
          record_id?: string
          action_details?: Json
        }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "user" | "admin"
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
      app_role: ["user", "admin"],
    },
  },
} as const
