-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create employees table
create table employees (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  full_name text not null,
  role text not null check (role in ('lead', 'interviewer', 'employee')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create resignations table
create table resignations (
  id uuid primary key default uuid_generate_v4(),
  employee_id uuid not null references employees(id) on delete cascade,
  status text not null check (status in ('pending', 'approved', 'scheduled', 'completed', 'declined')),
  last_working_day date not null,
  exit_interview_scheduled_at timestamp with time zone,
  exit_form_answers jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table employees enable row level security;
alter table resignations enable row level security;

-- Policies for employees
-- Allow users to view their own profile (based on email match with auth.uid() email - conceptual, since we use magic links)
-- efficient RLS would usually link to auth.users, but for this specific "The Floor" plan, we manage users in this table.
-- Policy: Lead and Interviewers can view all. Employees can view self.

create policy "Leads and Interviewers can view all employees"
  on employees for select
  using (
    auth.jwt() ->> 'email' in (
      select email from employees where role in ('lead', 'interviewer')
    )
  );

create policy "Employees can view own profile"
  on employees for select
  using (
    email = (auth.jwt() ->> 'email')
  );

-- Policies for resignations
-- Policy: Lead and Interviewers can view all. Employees can view own.

create policy "Leads and Interviewers can view all resignations"
  on resignations for select
  using (
    auth.jwt() ->> 'email' in (
      select email from employees where role in ('lead', 'interviewer')
    )
  );

create policy "Employees can view own resignation"
  on resignations for select
  using (
    employee_id in (
      select id from employees where email = (auth.jwt() ->> 'email')
    )
  );

-- Allow Insert/Update for Interviewers/Leads (Simplified for MVP)
create policy "Leads and Interviewers can insert/update employees"
  on employees for all
  using (
    auth.jwt() ->> 'email' in (
      select email from employees where role in ('lead', 'interviewer')
    )
  );

create policy "Leads and Interviewers can insert/update resignations"
  on resignations for all
  using (
    auth.jwt() ->> 'email' in (
      select email from employees where role in ('lead', 'interviewer')
    )
  );
