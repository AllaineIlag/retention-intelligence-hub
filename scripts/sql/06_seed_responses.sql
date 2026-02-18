-- ═══════════════════════════════════════════════════════════
-- 06: SEED EXIT RESPONSES + QUESTIONNAIRE RESULTS
-- Run AFTER 05_seed_resignations
-- ═══════════════════════════════════════════════════════════

-- ┌──────────────────────────────────────────────────────┐
-- │  CONFIGURABLE: Sentiment bias (0.0 = negative,      │
-- │  1.0 = positive). 0.65 = 65% positive responses     │
-- └──────────────────────────────────────────────────────┘
DO $$
DECLARE
    sentiment_bias FLOAT := 0.9;  -- ◄── CHANGE THIS (0.0 to 1.0)

    rec RECORD;
    q RECORD;
    is_positive BOOLEAN;
    resp_value JSONB;
    response_texts TEXT[] := ARRAY[
        'The work environment was generally good.',
        'I felt there was limited opportunity for advancement.',
        'Management was supportive but sometimes disconnected.',
        'My workload was manageable most of the time.',
        'Compensation was below market rate for my role.',
        'The team culture was healthy and collaborative.',
        'I would have stayed with better growth prospects.',
        'Benefits package was adequate.',
        'Work-life balance needed improvement.',
        'Overall a positive experience despite leaving.'
    ];
    reason_options TEXT[] := ARRAY['Better opportunity', 'Higher pay', 'Career growth', 'Relocation', 'Work-life balance', 'Management issues', 'Company culture', 'Personal reasons'];
    
    countries TEXT[] := ARRAY['United States', 'Canada', 'Australia', 'United Kingdom', 'Singapore', 'New Zealand', 'Japan', 'Germany', 'United Arab Emirates'];
    
    desirable_options TEXT[] := ARRAY['Better compensation', 'More growth', 'Better management', 'Flexible hours', 'Remote work', 'Better benefits'];
    career_positive TEXT[] := ARRAY['Very good chance', 'Good chances'];
    career_negative TEXT[] := ARRAY['Little chances', 'Very little', 'No chances'];
    pay_positive TEXT[] := ARRAY['High', 'Competitive', 'Good', 'Excellent'];
    pay_negative TEXT[] := ARRAY['Very low', 'Uncompetitive', 'Poor', 'Low'];
    benefits_positive TEXT[] := ARRAY['High', 'Competitive', 'Good', 'Excellent'];
    benefits_negative TEXT[] := ARRAY['Very low', 'Uncompetitive', 'None', 'Poor'];
    workload_positive TEXT[] := ARRAY['Manageable', 'Light', 'Good'];
    workload_negative TEXT[] := ARRAY['Heavy', 'Very heavy', 'Unmanageable'];

    picked_reasons JSONB;
    is_abroad BOOLEAN;
    picked_country TEXT;
    total_responses INT := 0;
    total_results INT := 0;
BEGIN
    -- Loop through eligible mock resignations
    FOR rec IN 
        SELECT r.id AS resignation_id, r.created_at, ed.department
        FROM resignations r
        JOIN profiles p ON r.employee_id = p.id
        JOIN employee_details ed ON p.id = ed.id
        WHERE p.email ILIKE '%@sim.retention.com'
          AND r.status IN ('completed', 'scheduled')
    LOOP
        is_positive := random() < sentiment_bias;

        -- ── EXIT RESPONSES (one per question) ──
        FOR q IN SELECT id, category FROM questions WHERE is_active = true LOOP
            INSERT INTO exit_questionnaires_result (id, resignation_id, question_id, response_text, created_at)
            VALUES (
                gen_random_uuid(),
                rec.resignation_id,
                q.id,
                response_texts[1 + floor(random() * array_length(response_texts, 1))::int],
                rec.created_at
            );
            total_responses := total_responses + 1;
        END LOOP;

        -- ── EXIT QUESTIONNAIRE RESULTS (KPI-level) ──

        -- reason_for_leaving (array of 1-3 reasons)
        -- TWEAK: Departmental Bias for Cluster Analysis
        is_abroad := (random() < 0.25); 

        -- Reset base options
        reason_options := ARRAY['Better opportunity', 'Higher pay', 'Career growth', 'Relocation', 'Work-life balance', 'Management issues', 'Company culture', 'Personal reasons'];

        -- Apply Bias
        IF rec.department = 'Engineering' AND random() < 0.6 THEN
             reason_options := ARRAY['Career growth', 'Better opportunity', 'Higher pay']; -- Techies leave for growth/pay
        ELSIF rec.department = 'Sales' AND random() < 0.6 THEN
             reason_options := ARRAY['Higher pay', 'Better opportunity']; -- Sales leaves for money
        ELSIF rec.department = 'Customer Success' AND random() < 0.6 THEN
             reason_options := ARRAY['Work-life balance', 'Management issues', 'Personal reasons']; -- CS burns out
        ELSIF rec.department = 'Human Resources' AND random() < 0.6 THEN
             reason_options := ARRAY['Company culture', 'Management issues']; -- HR leaves for culture
        END IF;

        -- Select standard reasons first
        SELECT jsonb_agg(val) INTO picked_reasons
        FROM (
            SELECT unnest(reason_options) AS val
            ORDER BY random()
            LIMIT (1 + floor(random() * 2)::int) -- 1 to 2 reasons
        ) sub;

        -- If going abroad, force add "Another Job (Abroad)"
        IF is_abroad THEN
            picked_reasons := picked_reasons || '"Another Job (Abroad)"'::jsonb;
            
            -- Pick random country
            picked_country := countries[1 + floor(random() * array_length(countries, 1))::int];
            
            -- Insert Country Details
            INSERT INTO exit_interview_results (id, resignation_id, question_key, response_value, created_at)
            VALUES (gen_random_uuid(), rec.resignation_id, 'reason_for_leaving_country', to_jsonb(picked_country), rec.created_at);
            total_results := total_results + 1;
        END IF;

        INSERT INTO exit_interview_results (id, resignation_id, question_key, response_value, created_at)
        VALUES (gen_random_uuid(), rec.resignation_id, 'reason_for_leaving', picked_reasons, rec.created_at);
        total_results := total_results + 1;

        -- why_more_desirable
        INSERT INTO exit_interview_results (id, resignation_id, question_key, response_value, created_at)
        VALUES (gen_random_uuid(), rec.resignation_id, 'why_more_desirable', 
            to_jsonb(desirable_options[1 + floor(random() * array_length(desirable_options, 1))::int]),
            rec.created_at);
        total_results := total_results + 1;

        -- career_growth (Correlate with Department?)
        -- Engineering = Low Growth chance (stagnation)
        IF rec.department = 'Engineering' AND random() < 0.5 THEN
            INSERT INTO exit_interview_results (id, resignation_id, question_key, response_value, created_at)
            VALUES (gen_random_uuid(), rec.resignation_id, 'career_growth', to_jsonb('No chances'::text), rec.created_at);
        ELSE 
             INSERT INTO exit_interview_results (id, resignation_id, question_key, response_value, created_at)
            VALUES (gen_random_uuid(), rec.resignation_id, 'career_growth',
                CASE WHEN is_positive 
                    THEN to_jsonb(career_positive[1 + floor(random() * array_length(career_positive, 1))::int])
                    ELSE to_jsonb(career_negative[1 + floor(random() * array_length(career_negative, 1))::int])
                END,
                rec.created_at);
        END IF;
        total_results := total_results + 1;

        -- rate_of_pay
        INSERT INTO exit_interview_results (id, resignation_id, question_key, response_value, created_at)
        VALUES (gen_random_uuid(), rec.resignation_id, 'rate_of_pay',
            CASE WHEN is_positive 
                THEN to_jsonb(pay_positive[1 + floor(random() * array_length(pay_positive, 1))::int])
                ELSE to_jsonb(pay_negative[1 + floor(random() * array_length(pay_negative, 1))::int])
            END,
            rec.created_at);
        total_results := total_results + 1;

        -- benefits
        INSERT INTO exit_interview_results (id, resignation_id, question_key, response_value, created_at)
        VALUES (gen_random_uuid(), rec.resignation_id, 'benefits',
            CASE WHEN is_positive 
                THEN to_jsonb(benefits_positive[1 + floor(random() * array_length(benefits_positive, 1))::int])
                ELSE to_jsonb(benefits_negative[1 + floor(random() * array_length(benefits_negative, 1))::int])
            END,
            rec.created_at);
        total_results := total_results + 1;

        -- workload
        INSERT INTO exit_interview_results (id, resignation_id, question_key, response_value, created_at)
        VALUES (gen_random_uuid(), rec.resignation_id, 'workload',
            CASE WHEN is_positive 
                THEN to_jsonb(workload_positive[1 + floor(random() * array_length(workload_positive, 1))::int])
                ELSE to_jsonb(workload_negative[1 + floor(random() * array_length(workload_negative, 1))::int])
            END,
            rec.created_at);
        total_results := total_results + 1;

        -- recommendation
        INSERT INTO exit_interview_results (id, resignation_id, question_key, response_value, created_at)
        VALUES (gen_random_uuid(), rec.resignation_id, 'recommendation',
            CASE WHEN is_positive THEN '"Yes"'::jsonb ELSE '"No"'::jsonb END,
            rec.created_at);
        total_results := total_results + 1;

    END LOOP;

    RAISE NOTICE 'Created % exit_responses + % questionnaire_results', total_responses, total_results;
END $$;

-- Verify
SELECT 
    'exit_questionnaires_result' AS table_name,
    COUNT(*) AS mock_rows
FROM exit_questionnaires_result er
JOIN resignations r ON er.resignation_id = r.id
JOIN profiles p ON r.employee_id = p.id
WHERE p.email ILIKE '%@sim.retention.com'
UNION ALL
SELECT 
    'exit_interview_results',
    COUNT(*)
FROM exit_interview_results eqr
JOIN resignations r ON eqr.resignation_id = r.id
JOIN profiles p ON r.employee_id = p.id
WHERE p.email ILIKE '%@sim.retention.com';
