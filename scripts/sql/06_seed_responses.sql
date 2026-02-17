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
    sentiment_bias FLOAT := 0.65;  -- ◄── CHANGE THIS (0.0 to 1.0)

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
    pay_positive TEXT[] := ARRAY['Very compensating', 'Fair enough'];
    pay_negative TEXT[] := ARRAY['A bit low', 'Very low'];
    benefits_positive TEXT[] := ARRAY['Very satisfied', 'Satisfied'];
    benefits_negative TEXT[] := ARRAY['Dissatisfied', 'Very dissatisfied'];
    workload_positive TEXT[] := ARRAY['Very manageable', 'Manageable'];
    workload_negative TEXT[] := ARRAY['Heavy', 'Very heavy'];

    picked_reasons JSONB;
    is_abroad BOOLEAN;
    picked_country TEXT;
    total_responses INT := 0;
    total_results INT := 0;
BEGIN
    -- Loop through eligible mock resignations
    FOR rec IN 
        SELECT r.id AS resignation_id, r.created_at
        FROM resignations r
        JOIN profiles p ON r.employee_id = p.id
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
        is_abroad := (random() < 0.25); -- 25% chance of going abroad

        -- Select standard reasons first
        SELECT jsonb_agg(val) INTO picked_reasons
        FROM (
            SELECT unnest(reason_options) AS val
            ORDER BY random()
            LIMIT (1 + floor(random() * 2)::int) -- Reduce max random to allow space for forced reason
        ) sub;

        -- If going abroad, force add "Another Job (Abroad)" and ensure it's in the array
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

        -- career_growth
        INSERT INTO exit_interview_results (id, resignation_id, question_key, response_value, created_at)
        VALUES (gen_random_uuid(), rec.resignation_id, 'career_growth',
            CASE WHEN is_positive 
                THEN to_jsonb(career_positive[1 + floor(random() * array_length(career_positive, 1))::int])
                ELSE to_jsonb(career_negative[1 + floor(random() * array_length(career_negative, 1))::int])
            END,
            rec.created_at);
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
