# Retention Intelligence Hub (v6)

A high-fidelity retention management system for capturing and analyzing employee exit data.

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18+ 
- **Supabase**: Account and Project
- **Resend**: API Key for email notifications

### Environment Variables
Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key (optional, for admin tasks)

RESEND_API_KEY=your_resend_api_key

NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

## 📘 Documentation

For detailed technical references, see the [docs](./docs) folder:
- [API Reference](./docs/api-reference.md): Database RLS and Schema.
- [Architecture](./docs/architecture.md): Lifecycle flows and Cron jobs.

## 🛠️ Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Database/Auth**: Supabase
- **UI**: Shadcn UI + Tailwind CSS
- **Email**: Resend + React Email
- **State/Animations**: Radix UI + Framer Motion
