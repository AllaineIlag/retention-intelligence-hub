-- Secure RPC to fetch all resignation data for CSV export
-- Bypasses RLS to allow the Lead Dashboard to download full reports
CREATE OR REPLACE FUNCTION get_export_data()
RETURNS TABLE (
  employee_name text,
  employee_email text,
  resignation_date timestamptz,
  status text,
  exit_form_answers jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.full_name as employee_name,
    e.email as employee_email,
    r.created_at as resignation_date,
    r.status,
    r.exit_form_answers
  FROM resignations r
  JOIN employees e ON r.employee_id = e.id
  ORDER BY r.created_at DESC;
END;
$$;
