# Retention Intelligence Hub

> A high-fidelity, enterprise-grade system for capturing, verifying, and analyzing employee exit data in real time.

---

## 📋 Overview

The **Retention Intelligence Hub** transforms the legacy, paper-heavy employee exit process into a structured, digital intelligence pipeline. By routing departing employee feedback into a live command center, HR Leads gain instant visibility into turnover drivers — eliminating the "Month-End Delay" phenomenon where critical retention signals arrive too late to act upon.

**Before this system**, the HR team spent an estimated **28–38 hours per month** manually encoding exit forms and printing approximately **4,800 pages per year**. The Hub eliminates all of this.

---

## 🎯 Project Objectives

1. **Reduce Manual Work** — Automate repetitive data collection and encoding tasks, saving 28–38 hours of work per month.
2. **Eliminate Paper** — Replace physical forms with a secure online system to save ~4,800 pages of paper annually.
3. **Live Reporting** — Provide real-time dashboards showing turnover counts, reasons, and trends — no month-end wait.
4. **Improve Data Quality** — Smart branching forms with required fields prevent missing answers and eliminate handwriting errors.
5. **Keep Data Secure** — Multi-level access control, Row-Level Security, and audit logs protect all sensitive employee data.
6. **Standardized Metrics** — Consistent categories allow Leads to compare results by department, tenure, job role, and shift.
7. **Instant Data Access & Export** — Leads can access live reports or export raw table data (CSV) for detailed audits.
8. **System Reliability** — Cloud-hosted infrastructure with defined backup and data retention plans.

---

## 🏗️ Architecture

The Hub is built on a **Three-Tier Architecture** separating concerns for security, performance, and scalability.

```
┌─────────────────────────────────────┐
│        Presentation Layer           │
│   Next.js 16 + React 19 (UI)        │
│  Server-side rendering, routing     │
└──────────────────┬──────────────────┘
                   │
┌──────────────────▼──────────────────┐
│        Application Layer            │
│   Next.js Server Actions & APIs     │
│  Risk Index · Insights Engine       │
│  Role-Based Access Control (RBAC)   │
└──────────────────┬──────────────────┘
                   │
┌──────────────────▼──────────────────┐
│           Data Layer                │
│    Supabase PostgreSQL              │
│  RLS Policies · Audit Trails        │
│  Single Source of Truth             │
└─────────────────────────────────────┘
```

### Why Three Tiers?

- **Security Isolation** — The browser never speaks directly to the database. The Application Layer acts as a strict gatekeeper, sanitizing all inputs and verifying roles before any data write.
- **Data Integrity** — UI changes (layouts, colors) cannot affect the underlying database tables or historical resignation audit trails.
- **Performance** — Heavy computation (Risk Index, Insights Engine) runs on cloud servers, keeping the experience fast even on older office workstations.
- **Cost Efficiency** — Serverless architecture means resources are only consumed when the system is actively used.

---

## 🛡️ Security

| Layer | Mechanism | Purpose |
| :--- | :--- | :--- |
| **Data in Motion** | HTTPS / TLS 1.3 | Encrypts all browser-to-server traffic |
| **Data at Rest** | Row-Level Security (RLS) | Users can only access records they are authorized to see |
| **Session Integrity** | JWT (JSON Web Tokens) | Auto-expiring signed tokens prevent session hijacking |
| **Traceability** | Audit Logging | Every sensitive action is permanently recorded |
| **Access Control** | Middleware + RBAC | Non-authenticated or pending users are locked out of `/dashboard` |

---

## 👤 User Roles

The system enforces a strict three-role model via a custom `app_role` enum in the database.

### 🔑 Lead
The system administrator. Responsible for:
- Provisioning and managing user accounts via the **Master Roster**
- Approving `pending` users to `active` status
- Accessing the full analytics **Command Center** (`/dashboard`)
- Viewing the **Risk Index**, **Insights Engine**, and all turnover intelligence
- Exporting raw table data (CSV/JSON) for detailed administrative audits

### 📋 Interviewer
The HR professional or manager conducting exit interviews. Responsible for:
- Reviewing submitted exit forms (`/dashboard/interview`)
- Conducting the face-to-face verification (the **Hybrid Check**)
- Logging `corrected_answer` and `interviewer_note` when verbal clarification is provided
- Moving resignation records from `pending_interview` → `scheduled` → `completed`

### 🚪 Exiting Employee
The departing team member. Access is strictly limited to:
- `/exit-form` — A secure, multi-step digital exit survey
- Their own resignation record only
- No dashboard access; form is locked upon submission to prevent tampering

---

## 🔄 Core Workflow

```
1. Lead/Interviewer logs a new resignation
         ↓
2. Exiting Employee receives a secure email
   with a portal link and system-generated credentials
         ↓
3. Employee logs in and completes the digital exit survey
   (smart branching — only relevant questions are shown)
         ↓
4. Resignation status shifts to `pending_interview`
         ↓
5. Interviewer conducts the face-to-face verification (Hybrid Check)
   Clarifications are logged as corrected answers with notes
         ↓
6. Lead/Interviewer seals the record → status: `locked`
         ↓
7. Command Center dashboards update in real time
```

**Resignation Status Pipeline:**
`pending_exit_form` → `pending_interview` → `scheduled` → `completed` → `locked`

---

## 📊 Dashboard Modules

### Command Center (`/dashboard`)
The primary intelligence hub for the Lead. Features:

- **KPI Scorecard** — Turnover Rate, Top Exit Reason, Recommendation Score, Avg. Tenure
- **Insights Engine** — Automated diagnostics: Exit Interview Sentiment, Compensation Discrepancy detection, Engagement Survey Participation
- **Risk Index** — Departmental risk scores based on exit velocity and sentiment clustering
- **Operational & Trend Charts** — Resignations vs. Target, Turnover per Department, Destination of Exits
- **Raw Data Export** — One-click CSV export from all major tables for audit trails

### Team Management (`/dashboard/team`)
- View all provisioned accounts (Active Team table)
- Grant Interviewer access by searching the company directory (Provisioning Card)
- Approve or suspend user access

### Interview Operations (`/dashboard/interview/schedule`)
- **On Deck (Today)** — Highlights interviews scheduled for the current day with quick-launch buttons
- **Interviews Table** — Full list of past and upcoming verification sessions
- Tracks every exit record from self-reported form to finalized verified truth

---

## 🛠️ Tech Stack

| Category | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | Next.js 16 (App Router) | Server-side rendering, routing, Server Actions |
| **UI Library** | React 19 | Interactive component architecture |
| **Database / Auth** | Supabase Postgres | Secure data storage, RLS policies, authentication |
| **Styling** | Tailwind CSS 4 + Shadcn UI | Premium, consistent design system |
| **Email** | Resend + React Email | Secure portal links and HR notifications |
| **Animations** | Framer Motion | Fluid UI micro-interactions |
| **Icons** | Lucide React | Clean, professional iconography |
| **Language** | TypeScript | Type-safe frontend and backend code |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18+
- **Supabase** — Account and project provisioned
- **Resend** — API Key for email delivery

### Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

RESEND_API_KEY=your_resend_api_key

NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Run the development server
npm run dev
```

The application will be available at `http://localhost:3000`.

---

## 📁 Database Schema (Key Tables)

| Table | Description |
| :--- | :--- |
| `profiles` | Application users (Leads, Interviewers). Linked to `auth.users`. |
| `employees` | Company organizational chart (Master Roster). Separate from `profiles`. |
| `resignations` | Core pipeline table tracking every exit through its full status lifecycle. |
| `exit_questionnaires_result` | Maps specific exit interview questions to specific resignation records. |

**Data Integrity Note:** Correction columns (`original_answer`, `corrected_answer`, `is_corrected`, `interviewer_note`) maintain a full ledger of who changed what and why — ensuring absolute Ground Truth.

---

## 📐 Scope & Limitations

- **Data Source** — The system operates entirely on test/sample data. Real personal data may only be used after all privacy approvals are completed.
- **System Isolation** — Not connected to payroll, time and attendance, or ERP systems. Designed to operate alongside existing infrastructure.
- **Authentication** — Password-based authentication only. SSO and trusted device support are reserved for future releases.
- **Platform** — Responsive web application. Native mobile apps and offline mode are not included in the current scope.

---

## 📘 Documentation

For detailed technical references, see the [`/documentation`](./documentation) folder:

- [`analysis_results.md`](./documentation/analysis_results.md) — Architecture, security, and user flow analysis.
- [`01_introduction/`](./documentation/01_introduction/) — Problem statement, objectives, and scope.
- [`03_methodology/`](./documentation/03_methodology/) — Design, development, and testing documentation.
- [`powerpoint.md`](./documentation/powerpoint.md) — Presentation guide with speaker scripts.
