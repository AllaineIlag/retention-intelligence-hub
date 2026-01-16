export interface Question {
  id: string;
  category: string;
  question_text: string;
  type: 'radio' | 'checkbox' | 'text' | 'scale';
  options: string[] | null;
  display_order: number;
  depends_on_question_id: string | null;
  condition_values: string[] | null;
  is_active: boolean;
}

export interface Answer {
  question_id: string;
  value: string | string[];
}

export interface Resignation {
  id: string;
  user_id: string;
  status: 'pending' | 'approved' | 'declined' | 'completed' | 'cancelled';
  last_working_day: string | null;
  scheduled_interview_date: string | null;
  submitted_at: string | null;
  locked_at: string | null;
  exit_answers: {
    question_id: string;
    original_value: string | string[];
  }[];
}
