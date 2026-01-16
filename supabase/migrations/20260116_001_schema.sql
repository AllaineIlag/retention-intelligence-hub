-- =============================================================
-- RETENTION INTELLIGENCE HUB - DATABASE SCHEMA
-- Author: Nasus (Database Engineer)
-- Date: 2026-01-16
-- =============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================
-- 1. PROFILES TABLE (Extends Supabase Auth)
-- =============================================================
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    role TEXT NOT NULL CHECK (role IN ('lead', 'interviewer', 'employee')) DEFAULT 'employee',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles RLS Policies
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Lead can view all profiles"
    ON public.profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'lead'
        )
    );

CREATE POLICY "Lead can update all profiles"
    ON public.profiles FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'lead'
        )
    );

-- =============================================================
-- 2. QUESTIONS TABLE (Static Configuration)
-- =============================================================
CREATE TABLE public.questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category TEXT NOT NULL,
    question_text TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('radio', 'checkbox', 'text', 'scale')),
    options JSONB, -- Array of options for radio/checkbox/scale
    display_order INT NOT NULL,
    depends_on_question_id UUID REFERENCES public.questions(id),
    condition_values JSONB, -- Array of accepted values from parent question
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

-- Questions are readable by all authenticated users
CREATE POLICY "Authenticated users can view active questions"
    ON public.questions FOR SELECT
    USING (auth.role() = 'authenticated' AND is_active = true);

CREATE POLICY "Lead can view all questions"
    ON public.questions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'lead'
        )
    );

-- =============================================================
-- 3. RESIGNATIONS TABLE (Core Record)
-- =============================================================
CREATE TABLE public.resignations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    interviewer_id UUID REFERENCES public.profiles(id),
    status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'declined', 'completed', 'cancelled')) DEFAULT 'pending',
    last_working_day DATE,
    scheduled_interview_date TIMESTAMPTZ,
    submitted_at TIMESTAMPTZ,
    locked_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.resignations ENABLE ROW LEVEL SECURITY;

-- Employee can view and edit own resignation
CREATE POLICY "Employee can view own resignation"
    ON public.resignations FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Employee can update own resignation before lock"
    ON public.resignations FOR UPDATE
    USING (auth.uid() = user_id AND locked_at IS NULL);

-- Interviewer can view assigned resignations
CREATE POLICY "Interviewer can view assigned resignations"
    ON public.resignations FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('interviewer', 'lead')
        )
    );

-- Lead/Interviewer can update resignations
CREATE POLICY "Staff can update resignations"
    ON public.resignations FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('interviewer', 'lead')
        )
    );

-- Lead/Interviewer can create resignations
CREATE POLICY "Staff can create resignations"
    ON public.resignations FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('interviewer', 'lead')
        )
    );

-- =============================================================
-- 4. EXIT ANSWERS TABLE (Stores Responses)
-- =============================================================
CREATE TABLE public.exit_answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resignation_id UUID NOT NULL REFERENCES public.resignations(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.questions(id),
    original_value JSONB, -- Employee's original answer
    verified_value JSONB, -- Interviewer's verified answer
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(resignation_id, question_id)
);

-- Enable RLS
ALTER TABLE public.exit_answers ENABLE ROW LEVEL SECURITY;

-- Employee can view own answers
CREATE POLICY "Employee can view own answers"
    ON public.exit_answers FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.resignations
            WHERE id = resignation_id AND user_id = auth.uid()
        )
    );

-- Employee can insert/update own answers before lock
CREATE POLICY "Employee can insert own answers"
    ON public.exit_answers FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.resignations
            WHERE id = resignation_id AND user_id = auth.uid() AND locked_at IS NULL
        )
    );

CREATE POLICY "Employee can update own answers before lock"
    ON public.exit_answers FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.resignations
            WHERE id = resignation_id AND user_id = auth.uid() AND locked_at IS NULL
        )
    );

-- Staff can view all answers
CREATE POLICY "Staff can view all answers"
    ON public.exit_answers FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('interviewer', 'lead')
        )
    );

-- Staff can update verified answers
CREATE POLICY "Staff can update verified answers"
    ON public.exit_answers FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('interviewer', 'lead')
        )
    );

-- =============================================================
-- 5. AUDIT LOG TABLE (System Activity Tracking)
-- =============================================================
CREATE TABLE public.audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID REFERENCES public.profiles(id),
    action TEXT NOT NULL,
    target_type TEXT, -- 'resignation', 'profile', 'answer', etc.
    target_id UUID,
    details JSONB,
    ip_address INET,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Only Lead can view audit logs
CREATE POLICY "Lead can view audit logs"
    ON public.audit_log FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'lead'
        )
    );

-- System can insert audit logs (via service role)
CREATE POLICY "Service can insert audit logs"
    ON public.audit_log FOR INSERT
    WITH CHECK (true);

-- =============================================================
-- 6. INDEXES FOR PERFORMANCE
-- =============================================================
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_resignations_user_id ON public.resignations(user_id);
CREATE INDEX idx_resignations_status ON public.resignations(status);
CREATE INDEX idx_exit_answers_resignation_id ON public.exit_answers(resignation_id);
CREATE INDEX idx_audit_log_actor_id ON public.audit_log(actor_id);
CREATE INDEX idx_audit_log_created_at ON public.audit_log(created_at);

-- =============================================================
-- 7. TRIGGERS FOR UPDATED_AT
-- =============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_questions_updated_at
    BEFORE UPDATE ON public.questions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resignations_updated_at
    BEFORE UPDATE ON public.resignations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exit_answers_updated_at
    BEFORE UPDATE ON public.exit_answers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
