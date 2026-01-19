-- Create audit_logs table
create table audit_logs (
  id uuid primary key default uuid_generate_v4(),
  user_email text not null,
  action text not null,
  resource text not null,
  details jsonb,
  ip_address text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table audit_logs enable row level security;

-- Policy: Only Leads can view all logs
create policy "Leads can view all audit logs"
  on audit_logs for select
  using (
    auth.jwt() ->> 'email' in (
      select email from employees where role = 'lead'
    )
  );

-- Policy: Authenticated users can insert logs (for tracking their own actions)
create policy "Authenticated users can insert audit logs"
  on audit_logs for insert
  with check (
    auth.role() = 'authenticated'
  );
