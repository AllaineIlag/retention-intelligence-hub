# API Reference: Database & Security

This document outlines the core database layer and security protocols for the Retention Intelligence Hub.

## Supabase Row Level Security (RLS)

The system relies on strict RLS policies to govern data access.

### 1. `profiles`
- **Select**: Authenticated users can see their own profile. Leads can see all profiles.
- **Insert**: Handled via `public.handle_new_user()` trigger on auth registration.
- **Update**: Users can update their own `full_name` and `notification_preferences`. Leads can update any profile's `status` and `can_export_data`.

### 2. `resignations`
- **Employee Access**: Can only see and update their own resignation record when `status` is 'pending' or 'verified'.
- **Interviewer Access**: Can see all resignations. Can update `last_working_day`, `scheduled_interview_date`, and `status`.
- **Lead Access**: Full CRUD access.

### 3. `exit_responses`
- **Employee Access**: Can read/write their own responses only if the parent resignation is not 'locked' or 'completed'.
- **Interviewer Access**: Can read all responses. Can write to `corrected_answer`, `is_corrected`, and `interviewer_note`.
- **Lead Access**: Full CRUD access.

### 4. `questions`
- **Read**: All authenticated users (public read for active questions).
- **Write**: restricted to `lead` role.

## Core Schema Types

The application uses TypeScript types generated from the database schema, located at [database.types.ts](file:///C:/Users/sungj/Documents/Agents/League%20of%20Developer%20v2/retention-intelligence-hub/src/lib/database.types.ts).

### Enums
- `app_role`: `lead`, `interviewer`, `employee`
- `resignation_status`: `pending`, `verified`, `scheduled`, `locked`, `completed`, `declined`
- `question_category`: `culture`, `management`, `compensation`, `workload`, `growth`
