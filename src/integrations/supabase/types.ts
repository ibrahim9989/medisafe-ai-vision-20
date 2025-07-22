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
    PostgrestVersion: "12.2.3 (519615d)"
  }
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
      consultation_transcripts: {
        Row: {
          action_items: Json | null
          analysis_data: Json | null
          chief_complaint: string | null
          created_at: string
          diagnosis: string | null
          doctor_id: string | null
          follow_up_instructions: Json | null
          id: string
          lab_analysis: string | null
          patient_id: string | null
          recommended_tests: Json | null
          summary: string | null
          transcript: string
          underlying_conditions: string | null
          updated_at: string
        }
        Insert: {
          action_items?: Json | null
          analysis_data?: Json | null
          chief_complaint?: string | null
          created_at?: string
          diagnosis?: string | null
          doctor_id?: string | null
          follow_up_instructions?: Json | null
          id?: string
          lab_analysis?: string | null
          patient_id?: string | null
          recommended_tests?: Json | null
          summary?: string | null
          transcript: string
          underlying_conditions?: string | null
          updated_at?: string
        }
        Update: {
          action_items?: Json | null
          analysis_data?: Json | null
          chief_complaint?: string | null
          created_at?: string
          diagnosis?: string | null
          doctor_id?: string | null
          follow_up_instructions?: Json | null
          id?: string
          lab_analysis?: string | null
          patient_id?: string | null
          recommended_tests?: Json | null
          summary?: string | null
          transcript?: string
          underlying_conditions?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "consultation_transcripts_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctor_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultation_transcripts_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
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
      follow_up_prescriptions: {
        Row: {
          created_at: string
          follow_up_prescription_id: string
          id: string
          notes: string | null
          original_prescription_id: string
        }
        Insert: {
          created_at?: string
          follow_up_prescription_id: string
          id?: string
          notes?: string | null
          original_prescription_id: string
        }
        Update: {
          created_at?: string
          follow_up_prescription_id?: string
          id?: string
          notes?: string | null
          original_prescription_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "follow_up_prescriptions_follow_up_prescription_id_fkey"
            columns: ["follow_up_prescription_id"]
            isOneToOne: false
            referencedRelation: "prescriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follow_up_prescriptions_original_prescription_id_fkey"
            columns: ["original_prescription_id"]
            isOneToOne: false
            referencedRelation: "prescriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_visits: {
        Row: {
          consultation_notes: string | null
          created_at: string
          diagnosis: string | null
          doctor_id: string
          id: string
          is_follow_up: boolean | null
          lab_reports: Json | null
          notes: string | null
          original_visit_id: string | null
          patient_id: string
          prescription_id: string | null
          reason_for_visit: string | null
          recommended_tests: Json | null
          updated_at: string
          visit_date: string
        }
        Insert: {
          consultation_notes?: string | null
          created_at?: string
          diagnosis?: string | null
          doctor_id: string
          id?: string
          is_follow_up?: boolean | null
          lab_reports?: Json | null
          notes?: string | null
          original_visit_id?: string | null
          patient_id: string
          prescription_id?: string | null
          reason_for_visit?: string | null
          recommended_tests?: Json | null
          updated_at?: string
          visit_date?: string
        }
        Update: {
          consultation_notes?: string | null
          created_at?: string
          diagnosis?: string | null
          doctor_id?: string
          id?: string
          is_follow_up?: boolean | null
          lab_reports?: Json | null
          notes?: string | null
          original_visit_id?: string | null
          patient_id?: string
          prescription_id?: string | null
          reason_for_visit?: string | null
          recommended_tests?: Json | null
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
            foreignKeyName: "patient_visits_original_visit_id_fkey"
            columns: ["original_visit_id"]
            isOneToOne: false
            referencedRelation: "patient_visits"
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
          consultation_notes: string | null
          contact: string | null
          created_at: string
          diagnosis: string | null
          diagnosis_details: string | null
          doctor_name: string
          follow_up_date: string | null
          gender: string
          id: string
          lab_analysis: string | null
          lab_reports: Json | null
          medications: Json
          notes: string | null
          patient_name: string
          recommended_tests: Json | null
          temperature: number | null
          underlying_conditions: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          age: number
          bp?: string | null
          consultation_notes?: string | null
          contact?: string | null
          created_at?: string
          diagnosis?: string | null
          diagnosis_details?: string | null
          doctor_name: string
          follow_up_date?: string | null
          gender: string
          id?: string
          lab_analysis?: string | null
          lab_reports?: Json | null
          medications?: Json
          notes?: string | null
          patient_name: string
          recommended_tests?: Json | null
          temperature?: number | null
          underlying_conditions?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          age?: number
          bp?: string | null
          consultation_notes?: string | null
          contact?: string | null
          created_at?: string
          diagnosis?: string | null
          diagnosis_details?: string | null
          doctor_name?: string
          follow_up_date?: string | null
          gender?: string
          id?: string
          lab_analysis?: string | null
          lab_reports?: Json | null
          medications?: Json
          notes?: string | null
          patient_name?: string
          recommended_tests?: Json | null
          temperature?: number | null
          underlying_conditions?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string
          hospital_affiliation: string | null
          id: string
          is_verified: boolean
          license_number: string | null
          phone_number: string | null
          role: string
          specialization: string[] | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name: string
          hospital_affiliation?: string | null
          id: string
          is_verified?: boolean
          license_number?: string | null
          phone_number?: string | null
          role?: string
          specialization?: string[] | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string
          hospital_affiliation?: string | null
          id?: string
          is_verified?: boolean
          license_number?: string | null
          phone_number?: string | null
          role?: string
          specialization?: string[] | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      token_usage: {
        Row: {
          counter_type: string
          created_at: string
          feature_type: string
          id: string
          prescription_id: string | null
          session_id: string | null
          tokens_used: number
          updated_at: string
          user_id: string
        }
        Insert: {
          counter_type: string
          created_at?: string
          feature_type: string
          id?: string
          prescription_id?: string | null
          session_id?: string | null
          tokens_used?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          counter_type?: string
          created_at?: string
          feature_type?: string
          id?: string
          prescription_id?: string | null
          session_id?: string | null
          tokens_used?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "token_usage_prescription_id_fkey"
            columns: ["prescription_id"]
            isOneToOne: false
            referencedRelation: "prescriptions"
            referencedColumns: ["id"]
          },
        ]
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
      insert_ai_interpretation: {
        Args: {
          p_user_id: string
          p_image_url: string
          p_image_type: string
          p_interpretation: string
          p_patient_name?: string
          p_patient_age?: number
          p_clinical_context?: string
        }
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
