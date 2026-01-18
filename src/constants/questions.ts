export type QuestionType =
  | "text"
  | "number"
  | "scale"
  | "select"
  | "multiselect";

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options?: string[]; // For select/multiselect
  min?: number; // For scale/number
  max?: number; // For scale/number
  required?: boolean;
}

export const EXIT_QUESTIONS: Question[] = [
  {
    id: "primary_reason",
    text: "What is the primary reason for your departure?",
    type: "select",
    options: [
      "Better Opportunity elsewhere",
      "Compensation & Benefits",
      "Work-Life Balance",
      "Management/Leadership",
      "Company Culture",
      "Career Growth/Development",
      "Personal Reasons",
      "Other",
    ],
    required: true,
  },
  {
    id: "satisfaction_role",
    text: "How satisfied were you with your role and responsibilities?",
    type: "scale",
    min: 1,
    max: 5,
    required: true,
  },
  {
    id: "satisfaction_management",
    text: "How satisfied were you with the management/leadership?",
    type: "scale",
    min: 1,
    max: 5,
    required: true,
  },
  {
    id: "satisfaction_culture",
    text: "How satisfied were you with the company culture?",
    type: "scale",
    min: 1,
    max: 5,
    required: true,
  },
  {
    id: "feedback_positive",
    text: "What did you enjoy most about working here?",
    type: "text",
    required: false,
  },
  {
    id: "feedback_improvement",
    text: "What areas do you think the company needs to improve?",
    type: "text",
    required: false,
  },
  {
    id: "would_return",
    text: "Would you consider working for us again in the future?",
    type: "select",
    options: ["Yes", "No", "Maybe"],
    required: true,
  },
];
