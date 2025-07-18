export type UserRole = 'patient' | 'guardian'
export type DiabetesType = 'type1' | 'type2' | 'prediabetes'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          user_id: string
          role: UserRole
          diabetes_type: DiabetesType | null
          full_name: string
          invitation_code: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          role: UserRole
          diabetes_type?: DiabetesType | null
          full_name: string
          invitation_code?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          role?: UserRole
          diabetes_type?: DiabetesType | null
          full_name?: string
          invitation_code?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      glucose_records: {
        Row: {
          id: string
          user_id: string
          glucose_level: number
          insulin_units: number | null
          hba1c: number | null
          note: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          glucose_level: number
          insulin_units?: number | null
          hba1c?: number | null
          note?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          glucose_level?: number
          insulin_units?: number | null
          hba1c?: number | null
          note?: string | null
          created_at?: string
        }
      }
      guardian_patient_links: {
        Row: {
          id: string
          guardian_id: string
          patient_id: string
          created_at: string
        }
        Insert: {
          id?: string
          guardian_id: string
          patient_id: string
          created_at?: string
        }
        Update: {
          id?: string
          guardian_id?: string
          patient_id?: string
          created_at?: string
        }
      }
    }
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type GlucoseRecord = Database['public']['Tables']['glucose_records']['Row']
export type GuardianPatientLink = Database['public']['Tables']['guardian_patient_links']['Row']