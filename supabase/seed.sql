-- Seed Data

-- Clear existing data if any (optional, be careful in prod)
truncate table resignations cascade;
truncate table employees cascade;

-- Insert Employees
insert into employees (email, full_name, role)
values
  ('ilagallainebenedict01380@gmail.com', 'Benedict Ilagalla', 'lead'),
  ('sungjinwoo1515@gmail.com', 'Sung Jinwoo', 'interviewer'),
  ('benjaminbrowning2001@gmail.com', 'Benjamin Browning', 'employee');

-- Insert a sample resignation for the employee
insert into resignations (employee_id, status, last_working_day)
select id, 'pending', '2024-02-01'
from employees
where email = 'benjaminbrowning2001@gmail.com';
