import csv
import os
from supabase import create_client, Client

# Configuration
URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
CSV_PATH = r'c:\Users\sungj\Documents\Agents\League of Developer v3\_MISSION_CONTROL\INTERVIEW FLOW.csv'

if not URL or not KEY:
    print("Error: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set.")
    exit(1)

supabase: Client = create_client(URL, KEY)

def generate_email(name):
    clean_name = name.strip().lower().replace(" ", ".")
    return f"{clean_name}@tdk.sim.com"

def import_csv():
    try:
        with open(CSV_PATH, mode='r', encoding='latin-1') as f:
            reader = csv.DictReader(f)
            count = 0
            batch = []
            
            for row in reader:
                full_name = row.get('Employee Name', '').strip()
                emp_no = row.get('Employee Number', '').strip()
                
                if not full_name or not emp_no:
                    continue
                
                # Dedupe check (extremely simple for now)
                email = generate_email(full_name)
                
                data = {
                    "payroll_no": emp_no,
                    "full_name": full_name,
                    "email": email,
                    "business_unit": row.get('BU', '').strip(),
                    "department": row.get('DEPT', '').strip(),
                    "immediate_superior": row.get('Immediate Superior', '').strip(),
                    "is_active": True
                }
                
                batch.append(data)
                
                if len(batch) >= 100:
                    supabase.table("company_directory").upsert(batch, on_conflict="email").execute()
                    count += len(batch)
                    print(f"Imported {count} records...")
                    batch = []
            
            if batch:
                supabase.table("company_directory").upsert(batch, on_conflict="email").execute()
                count += len(batch)
                
            print(f"SUCCESS: Imported {count} total records into company_directory.")
            
    except Exception as e:
        print(f"FAILED: {str(e)}")

if __name__ == "__main__":
    import_csv()
