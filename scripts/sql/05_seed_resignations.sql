-- ═══════════════════════════════════════════════════════════
-- 05: SEED RESIGNATIONS (Run AFTER 04_seed_company_directory)
-- ═══════════════════════════════════════════════════════════
-- DYNAMIC: Creates auth.users + public.profiles for each mock resignee.
-- SAFE   : Only targets @tdk.sim.com.
-- ═══════════════════════════════════════════════════════════

DO $$
DECLARE
    -- ┌──────────────────────────────────────────────────────────────┐
    -- │  SCENARIO CONFIG: Define your retention scenario here      │
    -- └──────────────────────────────────────────────────────────────┘
    months_back INT := 12;          -- History window
    total_employees INT := 5000;     -- Total Workforce
    annual_attrition_pct FLOAT := 0.24; -- 24% annual turnover (~2% monthly)
    variance_pct FLOAT := 0.1;     -- +/- 10% variance per month
    
    -- Calculations
    avg_exits_per_month FLOAT := total_employees * (annual_attrition_pct / 12);
    
    completion_rate FLOAT := 0.9; -- 90% completed
    cancel_rate FLOAT := 0.05;     -- 5% cancelled
    
    statuses TEXT[] := ARRAY['completed', 'cancelled', 'pending', 'scheduled'];
    
    directory_ids UUID[];
    dir_id UUID;
    m INT;
    i INT;
    month_date TIMESTAMP;
    resign_date TIMESTAMP;
    status_val resignation_status;
    rand_val FLOAT;
    idx INT := 0;
    
    -- Dynamic variance variables
    current_month_target INT;
    variance_factor FLOAT;

    -- Dynamic Auth vars
    emp_auth_id UUID;
    emp_email TEXT;
    emp_name TEXT;
    hashed_pw TEXT := crypt('Demo2026!', gen_salt('bf', 10));


    
BEGIN
    SET search_path = public;



    -- Get all active employees from company_directory (mock subset)
    SELECT array_agg(id) INTO directory_ids
    FROM company_directory
    WHERE (email ILIKE '%@tdk.sim.com' OR email LIKE 'michaeljohnsford2001+mock%@gmail.com')
    AND is_active = true;

    IF directory_ids IS NULL OR array_length(directory_ids, 1) = 0 THEN
        RAISE EXCEPTION 'No simulation profiles found in company_directory. Run 04_seed_company_directory.sql first.';
    END IF;

    -- Shuffle the array
    SELECT array_agg(id ORDER BY random()) INTO directory_ids
    FROM unnest(directory_ids) AS id;

    FOR m IN 0..(months_back - 1) LOOP
        month_date := date_trunc('month', CURRENT_TIMESTAMP - (m || ' months')::interval);

        -- CALCULATE DYNAMIC TARGET FOR THIS MONTH
        variance_factor := (random() * (variance_pct * 2)) - variance_pct;
        current_month_target := ceil(avg_exits_per_month * (1 + variance_factor));
        
        IF current_month_target < 1 THEN current_month_target := 1; END IF;

        FOR i IN 1..current_month_target LOOP
            idx := idx + 1;
            IF idx > array_length(directory_ids, 1) THEN
                RAISE NOTICE 'Ran out of employees at % resignations', idx - 1;
                EXIT;
            END IF;

            dir_id := directory_ids[idx];

            -- Get info from directory
            SELECT email, full_name INTO emp_email, emp_name FROM company_directory WHERE id = dir_id;

            -- ── DYNAMIC AUTH CREATION ──
            emp_auth_id := gen_random_uuid();
            
            -- If the domain is @tdk.sim.com, we can redirect to michaeljohnsford2001+mockN@gmail.com for testing
            -- This adheres to user request: "send all emails for employee to his email michaeljohnsford2001@gmail.com"
            IF emp_email LIKE '%@tdk.sim.com' THEN
               emp_email := 'michaeljohnsford2001+mock' || idx || '@gmail.com';
            END IF;
            
            -- 1. Create Auth User
            INSERT INTO auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
            VALUES (emp_auth_id, 'authenticated', 'authenticated', emp_email, hashed_pw, NOW(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('full_name', emp_name, 'role', 'employee'), NOW(), NOW());

            -- 2. Create Identity
            INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
            VALUES (gen_random_uuid(), emp_auth_id, jsonb_build_object('sub', emp_auth_id::text, 'email', emp_email), 'email', emp_auth_id::text, NOW(), NOW(), NOW());

            -- 3. Create Profile (role is employee)
            -- We use ON CONFLICT because Supabase likely has an auth trigger that inserts a blank profile
            INSERT INTO public.profiles (id, email, role, status, full_name)
            VALUES (emp_auth_id, emp_email, 'employee', 'active', emp_name)
            ON CONFLICT (id) DO UPDATE 
            SET email = EXCLUDED.email, 
                role = EXCLUDED.role, 
                status = EXCLUDED.status, 
                full_name = EXCLUDED.full_name;

            -- ── RESIGNATION RECORD ──
            resign_date := month_date + (floor(random() * 28) || ' days')::interval 
                         + (floor(random() * 24) || ' hours')::interval;

            rand_val := random();
            IF rand_val < completion_rate THEN
                status_val := 'completed';
            ELSIF rand_val < completion_rate + cancel_rate THEN
                status_val := 'cancelled';
            ELSIF random() > 0.5 THEN
                status_val := 'scheduled';
            ELSE
                status_val := 'pending_exit_form';
            END IF;

            INSERT INTO resignations (id, directory_id, status, created_at, last_working_day)
            VALUES (
                gen_random_uuid(),
                dir_id,
                status_val::resignation_status,
                resign_date,
                (resign_date + interval '14 days')
            );
            
            -- Set to inactive in company_directory and UPDATE email to the redirect version
            UPDATE company_directory
            SET is_active = false,
                email = emp_email
            WHERE id = dir_id;
        END LOOP;
    END LOOP;

    RAISE NOTICE 'Created % resignations + profiles (Utilization: % of % seeded profiles)', idx, round((idx::numeric / array_length(directory_ids, 1)::numeric) * 100, 1), array_length(directory_ids, 1);
END $$;

-- Verify
SELECT r.status, COUNT(*) 
FROM resignations r
JOIN company_directory cd ON r.directory_id = cd.id
WHERE cd.email ILIKE '%@tdk.sim.com'
   OR cd.email LIKE 'michaeljohnsford2001+mock%@gmail.com'
GROUP BY r.status 
ORDER BY COUNT(*) DESC;
