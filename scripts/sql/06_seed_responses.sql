-- ═══════════════════════════════════════════════════════════
-- 06: SEED EXIT RESPONSES + QUESTIONNAIRE RESULTS
-- Run AFTER 05_seed_resignations
-- ═══════════════════════════════════════════════════════════

DO $$
DECLARE
    sentiment_bias FLOAT := 0.65;  -- 65% positive responses

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
    
    -- Correct Option Sets (Matching Application Logic)
    career_positive TEXT[] := ARRAY['Very good chance', 'Good chances'];
    career_negative TEXT[] := ARRAY['Little chances', 'Very little', 'No chances'];
    pay_positive TEXT[] := ARRAY['High', 'Competitive', 'Good', 'Excellent'];
    pay_negative TEXT[] := ARRAY['Very low', 'Uncompetitive', 'Poor', 'Low'];
    benefits_positive TEXT[] := ARRAY['Very satisfied', 'Satisfied'];
    benefits_negative TEXT[] := ARRAY['Very dissatisfied', 'Dissatisfied'];
    workload_positive TEXT[] := ARRAY['Manageable', 'Light', 'Good'];
    workload_negative TEXT[] := ARRAY['Heavy', 'Very heavy', 'Unmanageable'];

    picked_reasons JSONB;
    is_abroad BOOLEAN;
    picked_country TEXT;
    total_responses INT := 0;
    total_results INT := 0;
BEGIN
    FOR rec IN 
        SELECT r.id AS resignation_id, r.created_at, cd.department
        FROM resignations r
        JOIN company_directory cd ON r.directory_id = cd.id
        WHERE (cd.email ILIKE '%@tdk.sim.com' OR cd.email LIKE 'michaeljohnsford2001+mock%@gmail.com')
          AND r.status IN ('completed', 'scheduled')
    LOOP
        is_positive := random() < sentiment_bias;

        -- ── EXIT RESPONSES (Qualitative) ──
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

        -- ── EXIT INTERVIEW RESULTS (KPIs) ──

        -- Reason for Leaving
        is_abroad := (random() < 0.25); 

        -- Apply Departmental Bias
        IF rec.department = 'Engineering' AND random() < 0.6 THEN
             reason_options := ARRAY['Career growth', 'Better opportunity', 'Higher pay'];
        ELSIF rec.department = 'Sales' AND random() < 0.6 THEN
             reason_options := ARRAY['Higher pay', 'Better opportunity'];
        ELSIF rec.department = 'Customer Success' AND random() < 0.6 THEN
             reason_options := ARRAY['Work-life balance', 'Management issues', 'Personal reasons'];
        ELSIF rec.department = 'Human Resources' AND random() < 0.6 THEN
             reason_options := ARRAY['Company culture', 'Management issues'];
        ELSE
             reason_options := ARRAY['Better opportunity', 'Higher pay', 'Career growth', 'Relocation', 'Work-life balance', 'Management issues', 'Company culture', 'Personal reasons'];
        END IF;

        -- Select 1-2 reasons
        SELECT jsonb_agg(val) INTO picked_reasons
        FROM (
            SELECT unnest(reason_options) AS val
            ORDER BY random()
            LIMIT (1 + floor(random() * 2)::int)
        ) sub;

        IF is_abroad THEN
            picked_reasons := picked_reasons || '"Another Job (Abroad)"'::jsonb;
            picked_country := countries[1 + floor(random() * array_length(countries, 1))::int];
            
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
        -- 70% chance to match global sentiment, 30% chance to deviate for chart variance
        IF (is_positive AND random() < 0.7) OR (NOT is_positive AND random() < 0.3) THEN
             INSERT INTO exit_interview_results (id, resignation_id, question_key, response_value, created_at)
             VALUES (gen_random_uuid(), rec.resignation_id, 'benefits',
                to_jsonb(benefits_positive[1 + floor(random() * array_length(benefits_positive, 1))::int]),
                rec.created_at);
        ELSE
             INSERT INTO exit_interview_results (id, resignation_id, question_key, response_value, created_at)
             VALUES (gen_random_uuid(), rec.resignation_id, 'benefits',
                to_jsonb(benefits_negative[1 + floor(random() * array_length(benefits_negative, 1))::int]),
                rec.created_at);
        END IF;
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
        IF (is_positive AND random() < 0.8) OR (NOT is_positive AND random() < 0.2) THEN
            resp_value := '"Yes"'::jsonb;
        ELSE
            resp_value := '"No"'::jsonb;
        END IF;

        INSERT INTO exit_interview_results (id, resignation_id, question_key, response_value, created_at)
        VALUES (gen_random_uuid(), rec.resignation_id, 'recommendation', resp_value, rec.created_at);
        total_results := total_results + 1;

    END LOOP;

    RAISE NOTICE 'Created % exit_responses + % questionnaire_results', total_responses, total_results;
END $$;
