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
            audit_logs: {
                Row: {
                    action: string
                    created_at: string
                    details: Json | null
                    entity_id: string
                    entity_table: string
                    id: string
                    ip_address: string | null
                    user_id: string | null
                }
                Insert: {
                    action: string
                    created_at?: string
                    details?: Json | null
                    entity_id: string
                    entity_table: string
                    id?: string
                    ip_address?: string | null
                    user_id?: string | null
                }
                Update: {
                    action?: string
                    created_at?: string
                    details?: Json | null
                    entity_id?: string
                    entity_table?: string
                    id?: string
                    ip_address?: string | null
                    user_id?: string | null
                }
                Relationships: []
            }
            exit_questionnaire_results: {
                Row: {
                    comment: string | null
                    created_at: string | null
                    id: string
                    question_key: string
                    resignation_id: string | null
                    response_value: Json | null
                    updated_at: string | null
                }
                Insert: {
                    comment?: string | null
                    created_at?: string | null
                    id?: string
                    question_key: string
                    resignation_id?: string | null
                    response_value?: Json | null
                    updated_at?: string | null
                }
                Update: {
                    comment?: string | null
                    created_at?: string | null
                    id?: string
                    question_key?: string
                    resignation_id?: string | null
                    response_value?: Json | null
                    updated_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "exit_questionnaire_results_resignation_id_fkey"
                        columns: ["resignation_id"]
                        isOneToOne: false
                        referencedRelation: "resignations"
                        referencedColumns: ["id"]
                    },
                ]
            }
            exit_responses: {
                Row: {
                    corrected_answer: string | null
                    created_at: string
                    id: string
                    interviewer_note: string | null
                    is_corrected: boolean | null
                    original_answer: string | null
                    question_id: string
                    rating: number | null
                    resignation_id: string
                    response_text: string | null
                    selected_options: string[] | null
                    updated_at: string
                }
                Insert: {
                    corrected_answer?: string | null
                    created_at?: string
                    id?: string
                    interviewer_note?: string | null
                    is_corrected?: boolean | null
                    original_answer?: string | null
                    question_id: string
                    rating?: number | null
                    resignation_id: string
                    response_text?: string | null
                    selected_options?: string[] | null
                    updated_at?: string
                }
                Update: {
                    corrected_answer?: string | null
                    created_at?: string
                    id?: string
                    interviewer_note?: string | null
                    is_corrected?: boolean | null
                    original_answer?: string | null
                    question_id?: string
                    rating?: number | null
                    resignation_id?: string
                    response_text?: string | null
                    selected_options?: string[] | null
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "exit_responses_question_id_fkey"
                        columns: ["question_id"]
                        isOneToOne: false
                        referencedRelation: "questions"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "exit_responses_resignation_id_fkey"
                        columns: ["resignation_id"]
                        isOneToOne: false
                        referencedRelation: "resignations"
                        referencedColumns: ["id"]
                    },
                ]
            }
            profiles: {
                Row: {
                    can_export_data: boolean | null
                    created_at: string
                    email: string
                    email_notifications: boolean | null
                    full_name: string | null
                    id: string
                    notification_frequency: string | null
                    role: Database["public"]["Enums"]["app_role"]
                    status: string | null
                    updated_at: string
                }
                Insert: {
                    can_export_data?: boolean | null
                    created_at?: string
                    email: string
                    email_notifications?: boolean | null
                    full_name?: string | null
                    id: string
                    notification_frequency?: string | null
                    role?: Database["public"]["Enums"]["app_role"]
                    status?: string | null
                    updated_at?: string
                }
                Update: {
                    can_export_data?: boolean | null
                    created_at?: string
                    email?: string
                    email_notifications?: boolean | null
                    full_name?: string | null
                    id?: string
                    notification_frequency?: string | null
                    role?: Database["public"]["Enums"]["app_role"]
                    status?: string | null
                    updated_at?: string
                }
                Relationships: []
            }
            questions: {
                Row: {
                    category: Database["public"]["Enums"]["question_category"]
                    created_at: string
                    id: string
                    is_active: boolean
                    options: Json | null
                    text: string
                    type: string
                    updated_at: string
                }
                Insert: {
                    category: Database["public"]["Enums"]["question_category"]
                    created_at?: string
                    id?: string
                    is_active?: boolean
                    options?: Json | null
                    text: string
                    type: string
                    updated_at?: string
                }
                Update: {
                    category?: Database["public"]["Enums"]["question_category"]
                    created_at?: string
                    id?: string
                    is_active?: boolean
                    options?: Json | null
                    text?: string
                    type?: string
                    updated_at?: string
                }
                Relationships: []
            }
            resignations: {
                Row: {
                    created_at: string
                    department: string | null
                    employee_id: string
                    id: string
                    last_working_day: string | null
                    manager_id: string | null
                    position: string | null
                    reason: string | null
                    scheduled_interview_date: string | null
                    status: Database["public"]["Enums"]["resignation_status"]
                    updated_at: string
                }
                Insert: {
                    created_at?: string
                    department?: string | null
                    employee_id: string
                    id?: string
                    last_working_day?: string | null
                    manager_id?: string | null
                    position?: string | null
                    reason?: string | null
                    scheduled_interview_date?: string | null
                    status?: Database["public"]["Enums"]["resignation_status"]
                    updated_at?: string
                }
                Update: {
                    created_at?: string
                    department?: string | null
                    employee_id?: string
                    id?: string
                    last_working_day?: string | null
                    manager_id?: string | null
                    position?: string | null
                    reason?: string | null
                    scheduled_interview_date?: string | null
                    status?: Database["public"]["Enums"]["resignation_status"]
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "resignations_employee_id_fkey"
                        columns: ["employee_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "resignations_manager_id_fkey"
                        columns: ["manager_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
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
                "growth"
            ]
            resignation_status: [
                "pending",
                "scheduled",
                "completed",
                "cancelled",
                "verified",
                "approved",
                "declined"
            ]
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}
