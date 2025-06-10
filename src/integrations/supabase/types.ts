export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      ai_analysis: {
        Row: {
          adverse_reactions: Json | null
          alternatives: Json | null
          created_at: string
          dosage_validation: Json | null
          drug_interactions: Json | null
          id: string
          medication_resolutions: Json | null
          overall_risk: string | null
          prescription_id: string
          recommendations: Json | null
        }
        Insert: {
          adverse_reactions?: Json | null
          alternatives?: Json | null
          created_at?: string
          dosage_validation?: Json | null
          drug_interactions?: Json | null
          id?: string
          medication_resolutions?: Json | null
          overall_risk?: string | null
          prescription_id: string
          recommendations?: Json | null
        }
        Update: {
          adverse_reactions?: Json | null
          alternatives?: Json | null
          created_at?: string
          dosage_validation?: Json | null
          drug_interactions?: Json | null
          id?: string
          medication_resolutions?: Json | null
          overall_risk?: string | null
          prescription_id?: string
          recommendations?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_analysis_prescription_id_fkey"
            columns: ["prescription_id"]
            isOneToOne: false
            referencedRelation: "prescriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      doctor_profiles: {
        Row: {
          age: number | null
          clinical_address: string | null
          country: string | null
          created_at: string
          full_name: string
          gender: string | null
          id: string
          is_profile_complete: boolean
          license_number: string | null
          phone_number: string | null
          pincode: string | null
          profile_picture_url: string | null
          public_profile: boolean
          regulatory_body: string | null
          specialization: string[] | null
          updated_at: string
          user_id: string
          years_of_experience: number | null
        }
        Insert: {
          age?: number | null
          clinical_address?: string | null
          country?: string | null
          created_at?: string
          full_name: string
          gender?: string | null
          id?: string
          is_profile_complete?: boolean
          license_number?: string | null
          phone_number?: string | null
          pincode?: string | null
          profile_picture_url?: string | null
          public_profile?: boolean
          regulatory_body?: string | null
          specialization?: string[] | null
          updated_at?: string
          user_id: string
          years_of_experience?: number | null
        }
        Update: {
          age?: number | null
          clinical_address?: string | null
          country?: string | null
          created_at?: string
          full_name?: string
          gender?: string | null
          id?: string
          is_profile_complete?: boolean
          license_number?: string | null
          phone_number?: string | null
          pincode?: string | null
          profile_picture_url?: string | null
          public_profile?: boolean
          regulatory_body?: string | null
          specialization?: string[] | null
          updated_at?: string
          user_id?: string
          years_of_experience?: number | null
        }
        Relationships: []
      }
      patient_visits: {
        Row: {
          created_at: string
          diagnosis: string | null
          doctor_id: string
          id: string
          notes: string | null
          patient_id: string
          prescription_id: string | null
          reason_for_visit: string | null
          updated_at: string
          visit_date: string
        }
        Insert: {
          created_at?: string
          diagnosis?: string | null
          doctor_id: string
          id?: string
          notes?: string | null
          patient_id: string
          prescription_id?: string | null
          reason_for_visit?: string | null
          updated_at?: string
          visit_date?: string
        }
        Update: {
          created_at?: string
          diagnosis?: string | null
          doctor_id?: string
          id?: string
          notes?: string | null
          patient_id?: string
          prescription_id?: string | null
          reason_for_visit?: string | null
          updated_at?: string
          visit_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_visits_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctor_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_visits_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_visits_prescription_id_fkey"
            columns: ["prescription_id"]
            isOneToOne: false
            referencedRelation: "prescriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          address: string | null
          age: number | null
          created_at: string
          doctor_id: string
          full_name: string
          gender: string | null
          id: string
          patient_id: string
          phone_number: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          age?: number | null
          created_at?: string
          doctor_id: string
          full_name: string
          gender?: string | null
          id?: string
          patient_id: string
          phone_number?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          age?: number | null
          created_at?: string
          doctor_id?: string
          full_name?: string
          gender?: string | null
          id?: string
          patient_id?: string
          phone_number?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "patients_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctor_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      prescriptions: {
        Row: {
          age: number
          bp: string | null
          contact: string | null
          created_at: string
          diagnosis: string | null
          doctor_name: string
          follow_up_date: string | null
          gender: string
          id: string
          medications: Json
          notes: string | null
          patient_name: string
          temperature: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          age: number
          bp?: string | null
          contact?: string | null
          created_at?: string
          diagnosis?: string | null
          doctor_name: string
          follow_up_date?: string | null
          gender: string
          id?: string
          medications?: Json
          notes?: string | null
          patient_name: string
          temperature?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          age?: number
          bp?: string | null
          contact?: string | null
          created_at?: string
          diagnosis?: string | null
          doctor_name?: string
          follow_up_date?: string | null
          gender?: string
          id?: string
          medications?: Json
          notes?: string | null
          patient_name?: string
          temperature?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_patient_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
