-- Generated Seeding for company_directory
BEGIN;
TRUNCATE public.company_directory CASCADE; -- Fresh start for Phase 1

INSERT INTO public.company_directory (payroll_no, full_name, email, business_unit, department, immediate_superior) VALUES ('Emp no 1', 'Name 1', 'name.1@tdk.sim.com', 'BU1', 'CMAQA', 'Julio Bravo') ON CONFLICT (email) DO NOTHING;
INSERT INTO public.company_directory (payroll_no, full_name, email, business_unit, department, immediate_superior) VALUES ('Emp no 2', 'Name 2', 'name.2@tdk.sim.com', 'BU1', 'INDPRODDEPT', 'Julio Bravo') ON CONFLICT (email) DO NOTHING;
INSERT INTO public.company_directory (payroll_no, full_name, email, business_unit, department, immediate_superior) VALUES ('Emp no 3', 'Name 3', 'name.3@tdk.sim.com', 'BU1', 'INDPRODDEPT', 'Julio Bravo') ON CONFLICT (email) DO NOTHING;
INSERT INTO public.company_directory (payroll_no, full_name, email, business_unit, department, immediate_superior) VALUES ('Emp no 4', 'Name 4', 'name.4@tdk.sim.com', 'BU1', 'INDPRODDEPT', 'Beatriz Santiago') ON CONFLICT (email) DO NOTHING;
INSERT INTO public.company_directory (payroll_no, full_name, email, business_unit, department, immediate_superior) VALUES ('Emp no 5', 'Name 5', 'name.5@tdk.sim.com', 'BU2', 'HRD', 'Rafael Ibañez') ON CONFLICT (email) DO NOTHING;
INSERT INTO public.company_directory (payroll_no, full_name, email, business_unit, department, immediate_superior) VALUES ('Emp no 6', 'Name 6', 'name.6@tdk.sim.com', 'BU3', 'CMACOM', 'María Castro') ON CONFLICT (email) DO NOTHING;
INSERT INTO public.company_directory (payroll_no, full_name, email, business_unit, department, immediate_superior) VALUES ('Emp no 7', 'Name 7', 'name.7@tdk.sim.com', 'BU3', 'CMAPRODDEPT', 'María Castro') ON CONFLICT (email) DO NOTHING;
INSERT INTO public.company_directory (payroll_no, full_name, email, business_unit, department, immediate_superior) VALUES ('Emp no 8', 'Name 8', 'name.8@tdk.sim.com', 'BU3', 'CMAPRODDEPT', 'María Castro') ON CONFLICT (email) DO NOTHING;
INSERT INTO public.company_directory (payroll_no, full_name, email, business_unit, department, immediate_superior) VALUES ('Emp no 9', 'Name 9', 'name.9@tdk.sim.com', 'BU3', 'CMAPRODDEPT', 'Felix DiezI') ON CONFLICT (email) DO NOTHING;
INSERT INTO public.company_directory (payroll_no, full_name, email, business_unit, department, immediate_superior) VALUES ('Emp no 10', 'Name 10', 'name.10@tdk.sim.com', 'BU3', 'CMAQA', 'Felix DiezI') ON CONFLICT (email) DO NOTHING;
INSERT INTO public.company_directory (payroll_no, full_name, email, business_unit, department, immediate_superior) VALUES ('Emp no 11', 'Name 11', 'name.11@tdk.sim.com', 'BU3', 'CMAQA', 'Esther Benitez') ON CONFLICT (email) DO NOTHING;
INSERT INTO public.company_directory (payroll_no, full_name, email, business_unit, department, immediate_superior) VALUES ('Emp no 12', 'Name 12', 'name.12@tdk.sim.com', 'BU2', 'SAFETYSECURITY', 'Lucas Reyes') ON CONFLICT (email) DO NOTHING;
INSERT INTO public.company_directory (payroll_no, full_name, email, business_unit, department, immediate_superior) VALUES ('Emp no 13', 'Name 13', 'name.13@tdk.sim.com', 'BU4', 'CORPENGDEPT', 'Emilia Soler') ON CONFLICT (email) DO NOTHING;
INSERT INTO public.company_directory (payroll_no, full_name, email, business_unit, department, immediate_superior) VALUES ('Emp no 14', 'Name 14', 'name.14@tdk.sim.com', 'BU4', 'EDLCPROD', 'Patricia Dominguez') ON CONFLICT (email) DO NOTHING;
INSERT INTO public.company_directory (payroll_no, full_name, email, business_unit, department, immediate_superior) VALUES ('Emp no 15', 'Name 15', 'name.15@tdk.sim.com', 'BU1', 'INDEQPTDEPT', 'Maria Teresa Gallego') ON CONFLICT (email) DO NOTHING;
INSERT INTO public.company_directory (payroll_no, full_name, email, business_unit, department, immediate_superior) VALUES ('Emp no 16', 'Name 16', 'name.16@tdk.sim.com', 'BU1', 'INDIEDEPT', 'Pedro Santos') ON CONFLICT (email) DO NOTHING;
INSERT INTO public.company_directory (payroll_no, full_name, email, business_unit, department, immediate_superior) VALUES ('Emp no 17', 'Name 17', 'name.17@tdk.sim.com', 'BU3', 'EDLCQACOM', 'Maria Teresa Gallego') ON CONFLICT (email) DO NOTHING;
INSERT INTO public.company_directory (payroll_no, full_name, email, business_unit, department, immediate_superior) VALUES ('Emp no 18', 'Name 18', 'name.18@tdk.sim.com', 'BU1', 'INDIEDEPT', 'Maria Teresa Gallego') ON CONFLICT (email) DO NOTHING;
INSERT INTO public.company_directory (payroll_no, full_name, email, business_unit, department, immediate_superior) VALUES ('Emp no 19', 'Name 19', 'name.19@tdk.sim.com', 'BU1', 'INDIEDEPT', 'Julio Lozano') ON CONFLICT (email) DO NOTHING;
INSERT INTO public.company_directory (payroll_no, full_name, email, business_unit, department, immediate_superior) VALUES ('Emp no 20', 'Name 20', 'name.20@tdk.sim.com', 'BU2', 'TESTENGDEPT', '') ON CONFLICT (email) DO NOTHING;

COMMIT;