-- Function to calculate dashboard stats securely
create or replace function get_dashboard_stats()
returns json
language plpgsql
security definer
as $$
declare
  total_employees int;
  resignation_data json;
  result json;
begin
  -- 1. Get total active employees (Just count all for MVP)
  select count(*) into total_employees from employees;

  -- 2. Get resignation data
  select json_agg(
    json_build_object(
      'id', id,
      'status', status,
      'exit_form_answers', exit_form_answers
    )
  ) into resignation_data
  from resignations;

  -- 3. Construct Result
  select json_build_object(
    'total_employees', total_employees,
    'resignations', coalesce(resignation_data, '[]'::json)
  ) into result;
  
  return result;
end;
$$;
