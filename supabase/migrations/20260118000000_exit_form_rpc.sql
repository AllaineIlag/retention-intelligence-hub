-- Function to fetch exit form data by token (securely)
create or replace function get_exit_form_data(token_id uuid)
returns json
language plpgsql
security definer
as $$
declare
  result json;
begin
  select json_build_object(
    'id', r.id,
    'status', r.status,
    'employee_name', e.full_name
  ) into result
  from resignations r
  join employees e on r.employee_id = e.id
  where r.id = token_id;
  
  return result;
end;
$$;

-- Function to submit exit form answers
create or replace function submit_exit_form(token_id uuid, answers jsonb)
returns void
language plpgsql
security definer
as $$
begin
  update resignations
  set 
    exit_form_answers = answers,
    status = 'completed'
  where id = token_id;
end;
$$;
