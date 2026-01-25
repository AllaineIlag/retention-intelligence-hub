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
            exit_responses: {
                Row: {
                    additional_comments: Json | null
                    consent_given: boolean | null
                    created_at: string
                    current_position: string | null
                    date_hired: string | null
                    date_of_resignation: string | null
                    department_supervisor: string | null
                    employee_details: Json | null
                    employee_name: string | null
                    employee_number: string | null
                    id: string
                    position_when_hired: string | null
                    questionnaire_responses: Json | null
                    resignation_id: string | null
                    submitted_at: string | null
                    updated_at: string
                }
                Insert: {
                    additional_comments?: Json | null
                    consent_given?: boolean | null
                    created_at?: string
                    current_position?: string | null
                    date_hired?: string | null
                    date_of_resignation?: string | null
                    department_supervisor?: string | null
                    employee_details?: Json | null
                    employee_name?: string | null
                    employee_number?: string | null
                    id?: string
                    position_when_hired?: string | null
                    questionnaire_responses?: Json | null
                    resignation_id?: string | null
                    submitted_at?: string | null
                    updated_at?: string
                }
                Update: {
                    additional_comments?: Json | null
                    consent_given?: boolean | null
                    created_at?: string
                    current_position?: string | null
                    date_hired?: string | null
                    date_of_resignation?: string | null
                    department_supervisor?: string | null
                    employee_details?: Json | null
                    employee_name?: string | null
                    employee_number?: string | null
                    id?: string
                    position_when_hired?: string | null
                    questionnaire_responses?: Json | null
                    resignation_id?: string | null
                    submitted_at?: string | null
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "exit_responses_resignation_id_fkey"
                        columns: ["resignation_id"]
                        isOneToOne: true
                        referencedRelation: "resignations"
                        referencedColumns: ["id"]
                    },
                ]
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
