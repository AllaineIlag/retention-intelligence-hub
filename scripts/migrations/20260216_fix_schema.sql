-- Ensure exit_questionnaire_results table exists
CREATE TABLE IF NOT EXISTS exit_questionnaire_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resignation_id UUID REFERENCES resignations(id) ON DELETE CASCADE,
    question_key TEXT NOT NULL,
    response_value JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE exit_questionnaire_results ENABLE ROW LEVEL SECURITY;

-- Add policies if they don't exist (using DO block to avoid error if exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'exit_questionnaire_results' AND policyname = 'Enable read access for all users'
    ) THEN
        CREATE POLICY "Enable read access for all users" ON exit_questionnaire_results FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'exit_questionnaire_results' AND policyname = 'Enable insert for authenticated users only'
    ) THEN
        CREATE POLICY "Enable insert for authenticated users only" ON exit_questionnaire_results FOR INSERT WITH CHECK (auth.role() = 'authenticated');
    END IF;
END
$$;
