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
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            app_role: ["lead", "interviewer", "employee"]
            question_category: [
                "culture",
                "management",
                "compensation",
                "workload",
                "growth",
            ]
            resignation_status: ["pending", "scheduled", "completed", "cancelled"]
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}
