# Privacy Policy: Data Protection & Usage

This document outlines how the Retention Intelligence Hub collects, processes, and secures employee data.

## 1. Data Collection Purpose
The primary purpose of data collection is to analyze employee turnover and improve organizational retention strategies. Data is collected through:
- **Employee Exit Questionnaire**: Personal perceptions and feedback regarding company culture, management, and compensation.
- **Interviewer Verified Data**: Corrections and notes made during the "Live Correction" session (Phase 3).

## 2. Collected Information
- **PII (Personally Identifiable Information)**: Name, Email, Position, Department, Supervisor.
- **Perception Data**: Subjective ratings and text responses to exit questions.
- **System Metadata**: Creation dates, status timestamps, and modification logs.

## 3. Data Processing & Anonymization
To protect employee privacy, the system implements the following:
- **Phase 4 Finalization**: Once an interview is finalized ("The Final Seal"), the record is marked as `completed`.
- **Role-Based Masking**:
    - **General View (Interviewers)**: PII is masked (e.g., "Employee #105") to reduce bias in aggregate reporting.
    - **Restricted View (Leads)**: Maintain full access to PII for historical integrity and necessary administrative follow-up.

## 4. Security Measures
- **Magic Link Authentication**: No passwords are stored; access is strictly tied to a unique, time-limited token sent via email.
- **Row Level Security (RLS)**: Data access is strictly enforced at the database layer based on authenticated roles.
