# SQL Seed & Delete Scripts

Paste these directly into the **Supabase SQL Editor**.

---

## ⚠️ Execution Order (FK-Safe)

### 🗑 Delete (children first → parents last)

| # | File | What it clears |
|---|---|---|
| 1 | `01_delete_responses.sql` | `exit_interview_results`, `exit_questionnaires_result` |
| 2 | `02_delete_resignations.sql` | `resignations` |
| 3 | `03_delete_company_directory.sql` | mock `company_directory` rows (`@tdk.sim.com` only) |

### 🛡 One-Time Setup (moved to `scripts/migrations/`)

These are handled as standard migrations (numbered 13 and 14):
- `13_seed_questions.sql`: Exit interview questions (skip on reseed).
- `14_seed_demo_personas.sql`: 4 real demo accounts (idempotent).

### 🌱 Dummy Data Seed (run every time you reseed)

**Standard sequence:**

| # | File | What it seeds |
|---|---|---|
| 4 | `04_seed_company_directory.sql` | mock employee roster |
| 5 | `05_seed_resignations.sql` | mock resignations + dynamic profiles + **email redirect** |
| 6 | `06_seed_responses.sql` | mock exit interview results + questionnaire results |

> ⚠️ Always run the **Delete** scripts (01 → 03) before reseeding to avoid duplicates.

---

## ⚙️ Configuration

`04_seed_company_directory.sql` — set before running:
- `PROFILES_TO_SEED` → how many resigned employees you plan to seed
- Directory auto-seeds at **1.5×** that count (active + resigned pool)
- `HIRE_YEAR_MIN` / `HIRE_YEAR_MAX` → date_hired range (weighted: more hires in earlier years)

`05_seed_resignations.sql` and `06_seed_responses.sql` each have a configurable record count at the top.

### 📧 Test Email Redirect
The scripts now support the user directive: *"Send all emails for employees to michaeljohnsford2001@gmail.com"*.
- Mock Resignees will have their email transformed to `michaeljohnsford2001+mockN@gmail.com`.
- This allows all mock account notifications to land in a single, real inbox.
- All delete scripts catch both `@tdk.sim.com` and `michaeljohnsford2001+mock%` patterns.

---

## 🛡 Safety Rules & Demo Credentials

- Delete scripts only target `@tdk.sim.com` and `+mock%@gmail.com` emails.
- Demo accounts (`@tdk.com`) are **never touched** by any delete script.
- `14_seed_demo_personas.sql` is idempotent — safe to re-run anytime.

**Demo Login Credentials**
| Role | Email | Password |
|---|---|---|
| Lead | `lead@tdk.com` | `Demo2026!` |
| Interviewer | `interviewer@tdk.com` | `Demo2026!` |
| Employee | `employee@tdk.com` | `Demo2026!` |

*(Note: While you log in with `@tdk.com`, any emails sent by the system to these accounts will automatically fail gracefully via Resend. For testing actual email delivery, use the mock employee accounts which funnel to `michaeljohnsford2001+mockN@gmail.com` via their `personal_email` field.)*

