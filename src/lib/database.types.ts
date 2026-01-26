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
      employees: {
        Row: {
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"] | null
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          role?: Database["public"]["Enums"]["app_role"] | null
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"] | null
        }
        Relationships: []
      }
      exit_responses: {
        Row: {
          created_at: string
          id: string
          question_id: string
          rating: number | null
          resignation_id: string
          response_text: string | null
          selected_options: string[] | null
          original_answer: string | null
          corrected_answer: string | null
          is_corrected: boolean
          interviewer_note: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          question_id: string
          rating?: number | null
          resignation_id: string
          response_text?: string | null
          selected_options?: string[] | null
          original_answer?: string | null
          corrected_answer?: string | null
          is_corrected?: boolean
          interviewer_note?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          question_id?: string
          rating?: number | null
          resignation_id?: string
          response_text?: string | null
          selected_options?: string[] | null
          original_answer?: string | null
          corrected_answer?: string | null
          is_corrected?: boolean
          interviewer_note?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exit_responses_question_id_fkey"
            columns: ["question_id"]
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exit_responses_resignation_id_fkey"
            columns: ["resignation_id"]
            referencedRelation: "resignations"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          role: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          role?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          role?: string | null
        }
        Relationships: []
      }
      questions: {
        Row: {
          category: string
          created_at: string | null
          id: string
          is_active: boolean | null
          text: string
        }
        Insert: {
          category: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          text: string
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          text?: string
        }
        Relationships: []
      }
      resignations: {
        Row: {
          created_at: string | null
          employee_id: string
          exit_date: string | null
          id: string
          reason: string | null
          status: Database["public"]["Enums"]["resignation_status"] | null
        }
        Insert: {
          created_at?: string | null
          employee_id: string
          exit_date?: string | null
          id?: string
          reason?: string | null
          status?: Database["public"]["Enums"]["resignation_status"] | null
        }
        Update: {
          created_at?: string | null
          employee_id?: string
          exit_date?: string | null
          id?: string
          reason?: string | null
          status?: Database["public"]["Enums"]["resignation_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "resignations_employee_id_fkey"
            columns: ["employee_id"]
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
      get_user_role: {
        Args: {
          user_id: string
        }
        Returns: string
      }
    }
    Enums: {
      app_role: "lead" | "interviewer" | "employee"
      question_category:
      | "culture"
      | "management"
      | "compensation"
      | "workload"
      | "growth"
      resignation_status: "pending" | "scheduled" | "completed" | "cancelled"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
