import csv

CSV_PATH = r'c:\Users\sungj\Documents\Agents\League of Developer v3\_MISSION_CONTROL\INTERVIEW FLOW.csv'
SQL_OUT = r'c:\Users\sungj\Documents\Agents\League of Developer v3\retention-intelligence-hub\scripts\sql\08_seed_directory_from_csv.sql'

def generate_email(name):
    # Extremely simple mock email generator
    parts = name.strip().lower().split()
    if len(parts) >= 2:
        username = f"{parts[0]}.{parts[-1]}"
    else:
        username = parts[0]
    return f"{username}@tdk.sim.com"

def escape_sql(val):
    if val is None:
        return 'NULL'
    return "'" + val.replace("'", "''") + "'"

def convert():
    try:
        with open(CSV_PATH, mode='r', encoding='latin-1') as f:
            reader = csv.DictReader(f)
            sql_lines = [
                "-- Generated Seeding for company_directory",
                "BEGIN;",
                "TRUNCATE public.company_directory CASCADE; -- Fresh start for Phase 1",
                ""
            ]
            
            count = 0
            for row in reader:
                full_name = row.get('Employee Name', '').strip()
                emp_no = row.get('Employee Number', '').strip()
                
                if not full_name or not emp_no:
                    continue
                
                email = generate_email(full_name)
                bu = row.get('BU', '').strip()
                dept = row.get('DEPT', '').strip()
                superior = row.get('Immediate Superior', '').strip()
                
                # Dedupe emails in the seed script itself for safety
                sql = f"INSERT INTO public.company_directory (payroll_no, full_name, email, business_unit, department, immediate_superior) "
                sql += f"VALUES ({escape_sql(emp_no)}, {escape_sql(full_name)}, {escape_sql(email)}, {escape_sql(bu)}, {escape_sql(dept)}, {escape_sql(superior)}) "
                sql += "ON CONFLICT (email) DO NOTHING;"
                
                sql_lines.append(sql)
                count += 1
            
            sql_lines.append("")
            sql_lines.append("COMMIT;")
            
            with open(SQL_OUT, 'w', encoding='utf-8') as out:
                out.write("\n".join(sql_lines))
                
            print(f"SUCCESS: Generated SQL for {count} records in {SQL_OUT}")
            
    except Exception as e:
        print(f"FAILED: {str(e)}")

if __name__ == "__main__":
    convert()
