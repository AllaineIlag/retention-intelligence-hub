# SQL Seed & Delete Scripts

Paste these directly into the **Supabase SQL Editor**.

## ⚠️ Execution Order (FK-Safe)

### Deleting (children first → parents last)
1. `01_delete_responses.sql` — exit_responses + exit_questionnaire_results
2. `02_delete_resignations.sql` — resignations  
3. `03_delete_profiles.sql` — employee_details + profiles

### Seeding (parents first → children last)
4. `04_seed_profiles.sql` — profiles + employee_details
5. `05_seed_resignations.sql` — resignations
6. `06_seed_responses.sql` — exit_responses + exit_questionnaire_results

## 🔧 Configuration
Each seed script has a `CONFIGURABLE` section at the top where you can change the number of records.
