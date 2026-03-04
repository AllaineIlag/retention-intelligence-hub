// Removed static arrays since we are fetching from the database dynamically

export const EMAIL_CONFIG = {
    FROM_NAME: 'Retention Intelligence Hub',
    FROM_EMAIL: 'noreply@mail.retentionhub.cloud',
    get FROM() {
        return `${this.FROM_NAME} <${this.FROM_EMAIL}>`;
    }
} as const;

export type Department = string;
export type BusinessUnit = string;
export type IntermediateSupervisor = string;
export type Position = string;
