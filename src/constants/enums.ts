export const DEPARTMENTS = [
    'Engineering',
    'Product Management',
    'Design',
    'Sales',
    'Marketing',
    'Customer Success',
    'Human Resources',
    'Finance',
    'Legal',
    'Operations',
    'IT',
    'Data Science'
] as const;

export const BUSINESS_UNITS = [
    'BU1',
    'BU2',
    'BU3',
    'BU4',
    'BU5'
] as const;

export const INTERMEDIATE_SUPERVISORS = [
    'Alex Chen',
    'Sarah Connor',
    'Mike Ross',
    'Jessica Pearson',
    'Harvey Specter',
    'Louis Litt',
    'Rachel Zane',
    'Donna Paulsen'
] as const;

export const POSITIONS = [
    "Software Engineer",
    "Senior Software Engineer",
    "Tech Lead",
    "Product Manager",
    "UI/UX Designer",
    "QA Engineer",
    "Marketing Manager",
    "HR Representative",
    "Operations Specialist"
] as const;

export const EMAIL_CONFIG = {
    FROM_NAME: 'Retention Intelligence Hub',
    FROM_EMAIL: 'noreply@mail.retentionhub.cloud',
    get FROM() {
        return `${this.FROM_NAME} <${this.FROM_EMAIL}>`;
    }
} as const;

export type Department = typeof DEPARTMENTS[number];
export type BusinessUnit = typeof BUSINESS_UNITS[number];
export type IntermediateSupervisor = typeof INTERMEDIATE_SUPERVISORS[number];
export type Position = typeof POSITIONS[number];
